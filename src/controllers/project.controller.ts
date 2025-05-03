import { Request, Response } from 'express'

import { AppError } from '@/errors/AppErro'
import { Project } from '@/models/domain/project'
import { ProjectCreationSchema } from '@/models/dto/project/create.dto'
import { ProjectsListQuerySchema } from '@/models/dto/project/list.dto'
import { ProjectService } from '@/services/project.service'
import { UserService } from '@/services/user.service'
import { ProjectApplySchema } from '@/models/dto/project/apply.dto'
import { User } from '@/models/domain/user'
import { FeedbackCreateSchema } from '@/models/dto/feedback/create.dto'

export interface ProjectController {
  createProject: (req: Request, res: Response) => Promise<void>
  listProjects: (req: Request, res: Response) => Promise<void>
  listExplorableProjects: (req: Request, res: Response) => Promise<void>
  getProjectById: (req: Request, res: Response) => Promise<void>
  updateProjectById: (req: Request, res: Response) => Promise<void>
  applyToProject: (req: Request, res: Response) => Promise<void>
  getUserProjects: (req: Request, res: Response) => Promise<void>
  submitFeedback: (req: Request, res: Response) => Promise<void>
  getProjectFeedbacks: (req: Request, res: Response) => Promise<void>
}

export function makeProjectController(
  projectService: ProjectService,
  userService: UserService
): ProjectController {
  return {
    async createProject(req: Request, res: Response) {
      const creator = await userService.getBySub(req.user.sub)
      if (!creator) throw new AppError('User not found', 404)
      const { success, error, data } = ProjectCreationSchema.safeParse(req.body)
      if (!success) {
        res.status(422).json({ errors: error.flatten() })
        return
      }
      const project = Project.fromObject({ ...data, creatorId: creator.id })
      await projectService.register(project)
      res.status(201).json(project.toObject())
    },
    async listProjects(req: Request, res: Response) {
      const { success, error, data } = ProjectsListQuerySchema.safeParse(req.query ?? {})
      if (!success) {
        res.status(422).json({ errors: error.flatten() })
        return
      }
      const filters = { ...data }

      if (req.user.role === 'company') {
        const user = await userService.getBySub(req.user.sub)
        if (!user) throw new AppError('User not found', 404, 'NOT_FOUND')
        filters.createdBy = user.id
      } else if (req.user.role !== 'admin') {
        filters.approvalStatus = 'approved'
      }

      const projects = await projectService.list(filters)
      res.status(200).json({
        projects: projects.projects.map((project) => project.toObject()),
        total: projects.total,
        page: projects.page,
        limit: projects.limit,
      })
    },

    async listExplorableProjects(req: Request, res: Response) {
      const userId = req.user.id
      if (!userId) throw new AppError('User not found', 404)
      const { success, error, data } = ProjectsListQuerySchema.safeParse(req.query ?? {})
      if (!success) {
        res.status(422).json({ errors: error.flatten() })
        return
      }

      const projects = await projectService.listExplorable({
        userId,
        params: data,
      })

      res.status(200).json({
        projects: projects.projects.map((project) => project.toObject()),
        total: projects.total,
        page: projects.page,
        limit: projects.limit,
      })
    },

    async getProjectById(req: Request, res: Response) {
      const id = req.params?.id

      // TODO verificar se o projeto existe
      // TODO retornar projeto com os membros
      res.status(200).json({
        id,
        name: 'depereo eum ab',
        description: 'Aegrus aliqua textor vetus attero nihil.',
        creatorId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        tags: ['tags'],
        needsMentors: true,
        needsDevs: true,
        maxParticipants: 3,
        status: 'active',
        approvalStatus: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
        members: [],
      })
    },
    async updateProjectById(req: Request, res: Response) {
      // TODO: Validar o body
      // TODO: Verificar se o projeto existe
      // TODO: Se for company verificar se o usuário é o dono do projeto
      // TODO Update o projeto no banco de dados

      const id = req.params?.id

      res.status(200).json({
        id,
        name: 'depereo eum ab',
        description: 'Aegrus aliqua textor vetus attero nihil.',
        creatorId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        tags: ['tags'],
        needsMentors: true,
        needsDevs: true,
        maxParticipants: 3,
        status: 'active',
        approvalStatus: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
        members: [],
      })
    },
    async applyToProject(req: Request, res: Response) {
      const id = req.params?.id
      const userId = req.user.id
      const role = req.user.role
      if (!userId || !role) throw new AppError('User not found', 404)

      const { success, data, error } = ProjectApplySchema.safeParse(req.body)
      if (!success) {
        res.status(422).json({ errors: error.flatten() })
        return
      }

      const applyToProject = await projectService.applyToProject({
        projectId: id,
        message: data.message ?? '',
        user: User.fromObject(req.user),
      })

      res.status(201).json(applyToProject.toObject())
    },
    async getUserProjects(req: Request, res: Response) {
      const userId = req.user.id
      if (!userId) throw new AppError('User not found', 404)
      const { success, error, data } = ProjectsListQuerySchema.safeParse(req.query ?? {})
      if (!success) {
        res.status(422).json({ errors: error.flatten() })
        return
      }

      const projects = await projectService.listMyProjects({ userId, params: data })
      res.status(200).json({
        projects: projects.projects.map((project) => project.toObject()),
        total: projects.total,
        page: projects.page,
        limit: projects.limit,
      })
    },
    async submitFeedback(req: Request, res: Response) {
      const { success, data, error } = FeedbackCreateSchema.safeParse(req.body)
      if (!success) {
        res.status(422).json({ errors: error.flatten() })
        return
      }
      const userId = req.user.id
      const role = req.user.role
      if (!userId || !role) throw new AppError('User not found', 404)

      const result = await projectService.submitFeedback({
        projectId: req.params.id,
        userId,
        comment: data.comment ?? '',
        link: data.link,
        rating: data.rating ?? 0,
      })

      res.status(201).json({
        ...result,
        user: {
          id: req.user.id,
          name: req.user.name,
          role: req.user.role,
        },
      })
    },
    async getProjectFeedbacks(req: Request, res: Response) {
      const id = req.params?.id
      if (!id) throw new AppError('Project not found', 404)

      const feedbacks = await projectService.getProjectFeedbacks({
        projectId: id,
      })

      res.status(200).json(feedbacks)
    },
  }
}
