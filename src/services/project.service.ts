import { MAX_PROJECTS_PER_USER } from '@/constants/user'
import { AppError } from '@/errors/AppErro'
import { Project } from '@/models/domain/project'
import { User } from '@/models/domain/user'
import { ProjectsListQueryType } from '@/models/dto/project/list.dto'
import { ProjectParticipantRepository } from '@/repositories/project-participant.repository'
import { ProjectRepository } from '@/repositories/project.repository'
import { UserRepository } from '@/repositories/user.repository'

export class ProjectService {
  constructor(
    private readonly projectRepository: ProjectRepository,
    private readonly participantsRepository: ProjectParticipantRepository,
    private readonly userRepository: UserRepository
  ) {}

  async register(data: Project): Promise<Project> {
    const existingProject = await this.projectRepository.findSimilarProject({
      userId: data.creatorId,
      title: data.name,
    })
    if (existingProject.length > 0)
      throw new AppError('Projeto já existe', 409, 'PROJECT_ALREADY_EXISTS')

    const userProjects = await this.projectRepository.listProjects({ createdBy: data.creatorId })
    if (userProjects.total >= MAX_PROJECTS_PER_USER)
      throw new AppError(
        `Só pode ser criado ${MAX_PROJECTS_PER_USER} projetos por usuário`,
        409,
        'USER_PROJECT_LIMIT_REACHED'
      )

    const newProject = await this.projectRepository.create(data)
    return newProject
  }

  async list(data?: ProjectsListQueryType) {
    const { projects, ...pagination } = await this.projectRepository.listProjects(data)

    const participantsByProject = await Promise.all(
      projects.map(async (project) => {
        const participants = await this.participantsRepository.getByProjectId(project.id)
        return [project.id, participants ?? []] as const
      })
    )

    const userIds = new Set<string>()
    for (const [, participants] of participantsByProject) {
      participants.forEach((p) => userIds.add(p.userId))
    }

    const users = await Promise.all(
      Array.from(userIds).map((id) => this.userRepository.getById(id))
    )
    const userMap = new Map(users.filter(Boolean).map((u) => [u!.id, u!]))

    const participantsMap = new Map<string, { user?: User }[]>()
    for (const [projectId, participants] of participantsByProject) {
      const members = participants
        .map((p) => ({
          ...p,
          user: userMap.get(p.userId),
        }))
        .filter((p) => p.user)
      participantsMap.set(projectId, members)
    }

    for (const project of projects) {
      const members = participantsMap.get(project.id) || []
      members.forEach((p) => project.addMember(p.user))
    }

    return {
      ...pagination,
      projects,
    }
  }
}
