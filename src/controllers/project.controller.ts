import { Request, Response } from 'express'

import { AppError } from '@/errors/AppErro'
import { Project } from '@/models/domain/project'
import { ProjectCreationSchema } from '@/models/dto/project/create.dto'
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
      // TODO

      const creator = await userService.getBySub(req.user.sub)
      if (!creator) throw new AppError('User not found', 404)
      const body = ProjectCreationSchema.parse(req.body)
      const project = Project.fromObject({ ...body, creatorId: creator.id })

      res.status(201).json(project.toObject())
    },
    async listProjects(req: Request, res: Response) {
      // TODO

      res.status(200).json({
        projects: [
          {
            id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
            name: 'capto sto cotidie',
            description: 'Auctor quo arcesso aurum socius sub mollitia copiose.',
            creatorId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
            tags: ['vir'],
            needsMentors: true,
            needsDevs: true,
            maxParticipants: 3,
            status: 'active',
            approvalStatus: 'pending',
            createdAt: new Date(),
            updatedAt: new Date(),
            members: [],
          },
        ],
        page: 1,
        limit: 1,
        total: 1,
      })
    },
    async getProjectById(req: Request, res: Response) {
      // TODO
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
    async updateProjectById(req: Request, res: Response) {
      // TODO: Verificar se o projeto existe
      // TODO: Se for company verificar se o usuário é o dono do projeto
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
      // TODO
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
      // TODO
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
      // TODO
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
      // TODO
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
