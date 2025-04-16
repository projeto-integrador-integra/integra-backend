import { ProjectService } from '@/services/project.service'
import { Request, Response } from 'express'

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

export function makeProjectController(projectService: ProjectService): ProjectController {
  return {
    async createProject(req: Request, res: Response) {
      console.log('Creating project', projectService)
      // TODO
      res.status(200).json({
        id: '123',
        message: 'Project created successfully',
      })
    },
    async listProjects(req: Request, res: Response) {
      // TODO

      res.status(200).json({
        projects: [
          {
            id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
            name: 'string',
            description: 'string',
            creatorId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
            tags: ['string'],
            needsMentors: true,
            needsDevs: true,
            maxParticipants: 3,
            status: 'active',
            approvalStatus: 'pending',
            createdAt: 'string',
            updatedAt: 'string',
          },
        ],
        page: 1,
        limit: 1,
        total: 1,
      })
    },
    async getProjectById(req: Request, res: Response) {
      // TODO
      res.status(200).json({
        id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        name: 'string',
        description: 'string',
        creatorId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        tags: ['string'],
        needsMentors: true,
        needsDevs: true,
        maxParticipants: 3,
        status: 'active',
        approvalStatus: 'pending',
        createdAt: 'string',
        updatedAt: 'string',
      })
    },
    async updateProjectById(req: Request, res: Response) {
      // TODO: Verificar se o projeto existe
      // TODO: Se for company verificar se o usuário é o dono do projeto

      res.status(200).json({
        id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        name: 'string',
        description: 'string',
        creatorId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        tags: ['string'],
        needsMentors: true,
        needsDevs: true,
        maxParticipants: 3,
        status: 'active',
        approvalStatus: 'pending',
        createdAt: 'string',
        updatedAt: 'string',
      })
    },
    async applyToProject(req: Request, res: Response) {
      // TODO
      res.status(201).json({
        message: 'Applied to project successfully',
      })
    },
    async getUserProjects(req: Request, res: Response) {
      // TODO
      res.status(200).json({
        projects: [
          {
            id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
            name: 'string',
            description: 'string',
            creatorId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
            tags: ['string'],
            needsMentors: true,
            needsDevs: true,
            maxParticipants: 3,
            status: 'active',
            approvalStatus: 'pending',
            createdAt: 'string',
            updatedAt: 'string',
          },
        ],
        total: 0,
        page: 0,
        limit: 0,
      })
    },
    async submitFeedback(req: Request, res: Response) {
      // TODO
      res.status(201).json({
        message: 'Feedback submitted successfully',
      })
    },
    async getProjectFeedbacks(req: Request, res: Response) {
      // TODO
      res.status(200).json({
        feedbacks: [
          {
            id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
            projectId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
            userId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
            rating: 5,
            comment: 'string',
            createdAt: 'string',
          },
        ],
      })
    },
  }
}
