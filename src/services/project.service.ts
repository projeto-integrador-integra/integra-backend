import { MAX_PROJECTS_PER_USER } from '@/constants/user'
import { AppError } from '@/errors/AppErro'
import { Project } from '@/models/domain/project'
import { User } from '@/models/domain/user'
import { ProjectsListQueryType } from '@/models/dto/project/list.dto'
import { ProjectUpdateType } from '@/models/dto/project/update.dto'
import { ProjectRepository } from '@/repositories/project.repository'
import { EmailService } from './email/email.service'

export class ProjectService {
  constructor(
    private readonly projectRepository: ProjectRepository,
    private readonly emailService: EmailService
  ) {}

  async register(data: Project): Promise<Project> {
    const existingProject = await this.projectRepository.findSimilarProject({
      userId: data.creatorId,
      title: data.name,
    })
    if (existingProject.length > 0)
      throw new AppError('Projeto já existe', 409, 'PROJECT_ALREADY_EXISTS')

    const userProjects = await this.projectRepository.listProjects({
      createdBy: data.creatorId,
      status: 'active',
    })
    if (userProjects.total >= MAX_PROJECTS_PER_USER)
      throw new AppError(
        `Só pode ser criado ${MAX_PROJECTS_PER_USER} projetos por usuário`,
        409,
        'USER_PROJECT_LIMIT_REACHED'
      )

    const newProject = await this.projectRepository.create(data)
    return newProject
  }

  async update(id: string, user: User, data: ProjectUpdateType): Promise<Project> {
    const project = await this.projectRepository.getById(id)
    if (!project) throw new AppError('Projeto não encontrado', 404, 'PROJECT_NOT_FOUND')
    if (project.creatorId !== user.id && user.role !== 'admin')
      throw new AppError('Você não tem permissão para editar este projeto', 403, 'FORBIDDEN')

    if (user.role === 'mentor') delete data.approvalStatus

    const updatedProject = Project.fromObject(
      {
        ...project.toObject(),
        ...data,
      },
      project.members
    )

    await this.projectRepository.update(updatedProject)
    return updatedProject
  }

  async list(data?: ProjectsListQueryType) {
    const result = await this.projectRepository.listProjects(data)

    return result
  }

  async listExplorable({ user, params }: { user: User; params: ProjectsListQueryType }) {
    const result = await this.projectRepository.listExplorable({
      userId: user.id,
      params: {
        ...params,
        approvalStatus: 'approved',
        status: 'active',
        needsMentors: user.role === 'mentor',
        needsDevs: user.role === 'dev',
      },
    })

    return result
  }

  async listMyProjects({ userId, params }: { userId: string; params: ProjectsListQueryType }) {
    const result = await this.projectRepository.listMyProjects({
      userId,
      params,
    })

    return result
  }

  async applyToProject({
    projectId,
    message,
    user,
  }: {
    user: User
    projectId: string
    message: string
  }) {
    const project = await this.projectRepository.getById(projectId)
    if (!project) throw new AppError('Projeto não encontrado', 404, 'PROJECT_NOT_FOUND')
    if (project.approvalStatus !== 'approved')
      throw new AppError(
        'Projeto não está disponível para participação',
        409,
        'PROJECT_NOT_AVAILABLE'
      )
    if (project.status !== 'active')
      throw new AppError('Projeto não está ativo', 409, 'PROJECT_NOT_ACTIVE')

    if (project.members.some((participant) => participant.id === user.id))
      throw new AppError('Você já está participando deste projeto', 409, 'ALREADY_PARTICIPATING')

    const isMentorBlocked = !project.needsMentors && user.role === 'mentor'
    const isDevBlocked = !project.needsDevs && user.role === 'dev'
    if (isMentorBlocked)
      throw new AppError(
        'Este projeto não precisa de mentores',
        409,
        'PROJECT_DOES_NOT_NEED_MENTORS'
      )
    if (isDevBlocked)
      throw new AppError(
        'Este projeto não precisa de desenvolvedores',
        409,
        'PROJECT_DOES_NOT_NEED_DEVS'
      )

    const userProjects = await this.projectRepository.listMyProjects({
      userId: user.id,
      params: {},
    })
    if (userProjects.total >= MAX_PROJECTS_PER_USER)
      throw new AppError(
        `Só pode participar de ${MAX_PROJECTS_PER_USER} projetos por usuário`,
        409,
        'USER_PROJECT_LIMIT_REACHED'
      )

    if (user.role === 'mentor') project.needsMentors = false
    const devs = project.members.filter((m) => m.role === 'dev')
    if (user.role === 'dev' && project.maxParticipants === devs.length + 1)
      project.needsDevs = false

    const response = await this.projectRepository.applyToProject({
      userId: user.id,
      projectId,
      message,
    })
    project.addMember(user)

    if (!response.success)
      throw new AppError('Erro ao se inscrever no projeto', 500, 'PROJECT_APPLICATION_ERROR')

    if (!project.needsMentors || !project.needsDevs) {
      const updatedProject = await this.projectRepository.update(project)
      if (!updatedProject)
        throw new AppError('Erro ao atualizar o projeto', 500, 'PROJECT_UPDATE_ERROR')
    }

    if (!project.needsDevs && !project.needsMentors)
      await Promise.all(
        project.members.map((member) =>
          this.emailService.sendCompletedGroupEmail({
            to: member.email,
            name: member.name,
            projectName: project.name,
          })
        )
      )

    return project
  }

  async submitFeedback({
    projectId,
    userId,
    comment,
    link = '',
    rating,
  }: {
    projectId: string
    userId: string
    comment: string
    link?: string
    rating: number
  }) {
    const project = await this.projectRepository.getById(projectId)
    if (!project) throw new AppError('Projeto não encontrado', 404, 'PROJECT_NOT_FOUND')

    if (!project.members.some((participant) => participant.id === userId))
      throw new AppError('Você não está participando deste projeto', 409, 'NOT_PARTICIPATING')

    const { result } = await this.projectRepository.submitFeedback({
      projectId,
      userId,
      comment,
      link,
      rating,
    })

    if (!result) throw new AppError('Erro ao enviar feedback', 500, 'FEEDBACK_SUBMIT_ERROR')

    if (project.status !== 'closed') {
      project.status = 'closed'
      await this.projectRepository.update(project)
    }

    return result
  }

  async getProjectFeedbacks({ projectId }: { projectId: string }) {
    const project = await this.projectRepository.getById(projectId)
    if (!project) throw new AppError('Projeto não encontrado', 404, 'PROJECT_NOT_FOUND')

    const feedbacks = await this.projectRepository.getProjectFeedbacks({ projectId })

    return feedbacks
  }

  async userSummary(user: User) {
    const projects = await this.projectRepository.userSummary(user.id)
    if (!['admin', 'company'].includes(user.role)) delete projects.pending
    return projects
  }

  async leaveProject({ projectId, user }: { projectId: string; user: User }) {
    const project = await this.projectRepository.getById(projectId)
    if (!project) throw new AppError('Projeto não encontrado', 404, 'PROJECT_NOT_FOUND')
    if (!project.members.some((participant) => participant.id === user.id))
      throw new AppError('Você não está participando deste projeto', 409, 'NOT_PARTICIPATING')

    await this.projectRepository.leaveProject({
      projectId,
      userId: user.id,
    })

    return Project.fromObject({
      ...project.toObject(),
      members: project.members.filter((member) => member.id !== user.id),
    })
  }
}
