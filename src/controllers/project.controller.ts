import { Request, Response } from 'express'

import { AppError } from '@/errors/AppErro'
import { Project } from '@/models/domain/project'
import { ProjectCreationSchema } from '@/models/dto/project/create.dto'
import { ProjectsListQuerySchema } from '@/models/dto/project/list.dto'
import { ProjectService } from '@/services/project.service'
import { UserService } from '@/services/user.service'

export interface ProjectController {
  createProject: (req: Request, res: Response) => Promise<void>
  listProjects: (req: Request, res: Response) => Promise<void>
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
      if (!success) res.status(422).json({ errors: error.flatten() })
      const project = Project.fromObject({ ...data, creatorId: creator.id })
      await projectService.register(project)
      res.status(201).json(project.toObject())
    },
    async listProjects(req: Request, res: Response) {
      const { success, error, data } = ProjectsListQuerySchema.safeParse(req.query)
      if (!success) res.status(422).json({ errors: error.flatten() })
      const filters = { ...data }

      if (req.user.role === 'company') {
        const user = await userService.getBySub(req.user.sub)
        if (!user) throw new AppError('User not found', 404, 'NOT_FOUND')
        filters.createdBy = user.id
      } else if (req.user.role !== 'admin') {
        filters.status = 'active'
        filters.approvalStatus = 'approved'
      }

      const projects = await projectService.list(filters)
      res.status(200).json(projects)
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
      // TODO verificar se o projeto existe
      // TODO verificar se o projeto está aprovado pelos admins
      // TODO verificar se o usuário já aplicou para outro projeto e está em andamento/análise
      // TODO verificar se o usuário já está no projeto
      // TODO se for mentor verificar se já existe um mentor no projeto
      // TODO se for dev, verificar se já atingiu o número máximo de devs
      // TODO se for o ultimo dev, enviar email para todos os devs/mentores do projeto

      const id = req.params?.id

      res.status(201).json({
        id,
        name: 'depereo eum ab',
        description: 'Aegrus aliqua textor vetus attero nihil.',
        creatorId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        tags: ['tags'],
        needsMentors: true,
        needsDevs: true,
        maxParticipants: 3,
        status: 'active',
        approvalStatus: 'approved',
        createdAt: new Date(),
        updatedAt: new Date(),
        members: [
          {
            id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
            sub: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
            role: 'admin',
            name: 'Eum ab',
            description: 'Aliqua textor vetus attero nihil.',
            email: 'user@example.com',
            createdAt: new Date(),
            updatedAt: new Date(),
            approvalStatus: 'approved',
          },
        ],
      })
    },
    async getUserProjects(req: Request, res: Response) {
      // TODO buscar projetos do usuário

      res.status(200).json({
        projects: [
          {
            id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
            name: 'depereo eum ab',
            description: 'Aegrus aliqua textor vetus attero nihil.',
            creatorId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
            tags: ['tags'],
            needsMentors: true,
            needsDevs: true,
            maxParticipants: 3,
            status: 'active',
            approvalStatus: 'approved',
            createdAt: new Date(),
            updatedAt: new Date(),
            members: [
              {
                id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
                sub: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
                role: 'admin',
                name: 'Eum ab',
                description: 'Aliqua textor vetus attero nihil.',
                email: 'user@example.com',
                createdAt: new Date(),
                updatedAt: new Date(),
                approvalStatus: 'approved',
              },
            ],
          },
        ],
        total: 1,
        page: 1,
        limit: 1,
      })
    },
    async submitFeedback(req: Request, res: Response) {
      // TODO validar o body
      // TODO verificar se o projeto existe
      // TODO verificar se o usuário já está no projeto
      // TODO verificar se o usuário já enviou feedback para o projeto

      const id = req.params?.id

      res.status(201).json({
        id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        projectId: id,
        comment: 'stringstri',
        link: 'string',
        rating: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
        user: {
          id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
          name: 'string',
          role: 'admin',
        },
      })
    },
    async getProjectFeedbacks(req: Request, res: Response) {
      // TODO buscar no banco de dados os feedbacks do projeto

      res.status(200).json({
        feedbacks: [
          {
            id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
            comment: 'stringstri',
            link: 'string',
            rating: 5,
            createdAt: new Date(),
            updatedAt: new Date(),
            user: {
              id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
              name: 'string',
              role: 'admin',
            },
          },
        ],
      })
    },
  }
}
