import { Project } from '@/models/domain/project'
import { ProjectsListQueryType } from '@/models/dto/project/list.dto'
import { randomUUID } from 'node:crypto'
import { FakeDatabase } from './fake-user.repository'
import { ProjectRepository } from './project.repository'
import { Feedback } from '@/models/schema/feedbacks'

export class FakeProjectRepository implements ProjectRepository {
  constructor(private readonly db: FakeDatabase) {}

  async create(project: Project): Promise<Project> {
    await this.db.projects.push(project)
    return project
  }

  async getById(id: string): Promise<Project | null> {
    const project = this.db.projects.find((project) => project.id === id)
    if (!project) return null
    return new Project(project)
  }

  async listProjects({
    page = 1,
    limit = 10,
    status,
    title,
    createdBy,
    approvalStatus,
  }: ProjectsListQueryType): Promise<{
    projects: Project[]
    total: number
    page: number
    limit: number
  }> {
    const offset = (page - 1) * limit

    const filtered = this.db.projects.filter((project) => {
      if (status && project.status !== status) return false
      if (title && !project.name.toLowerCase().includes(title.toLowerCase())) return false
      if (createdBy && project.creatorId !== createdBy) return false
      if (approvalStatus && project.approvalStatus !== approvalStatus) return false
      return true
    })

    return {
      projects: filtered.slice(offset, offset + limit).map((p) => new Project(p)),
      total: filtered.length,
      page,
      limit,
    }
  }

  async listExplorable({
    userId,
    params,
  }: {
    userId: string
    params: ProjectsListQueryType
  }): Promise<{ projects: Project[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 10, status, title, approvalStatus } = params
    const offset = (page - 1) * limit

    const filtered = this.db.projects.filter((project) => {
      const isParticipant = this.db.participants.some(
        (p) => p.projectId === project.id && p.userId === userId
      )
      const isCreator = project.creatorId === userId

      if (isCreator || isParticipant) return false
      if (status && project.status !== status) return false
      if (title && !project.name.toLowerCase().includes(title.toLowerCase())) return false
      if (approvalStatus && project.approvalStatus !== approvalStatus) return false
      return true
    })

    return {
      projects: filtered.slice(offset, offset + limit).map((p) => new Project(p)),
      total: filtered.length,
      page,
      limit,
    }
  }

  async listMyProjects({
    userId,
    params,
  }: {
    userId: string
    params: ProjectsListQueryType
  }): Promise<{ projects: Project[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 10, status, title } = params
    const offset = (page - 1) * limit

    const myProject = this.db.participants.find((p) => p.userId === userId)
    if (!myProject) return { projects: [], total: 0, page, limit }

    const filtered = this.db.projects.filter((project) => {
      if (status && project.status !== status) return false
      if (title && !project.name.toLowerCase().includes(title.toLowerCase())) return false
      if (project.id === myProject?.id) return false
      return true
    })

    return {
      projects: filtered.slice(offset, offset + limit).map((p) => new Project(p)),
      total: filtered.length,
      page,
      limit,
    }
  }

  async findSimilarProject({
    userId,
    title,
  }: {
    userId: string
    title: string
  }): Promise<Project[]> {
    const projectList = this.db.projects.filter(
      (project) =>
        project.creatorId === userId && project.name.toLowerCase().includes(title.toLowerCase())
    )
    return projectList.map((project) => new Project(project))
  }

  async update(project: Project): Promise<Project> {
    const index = this.db.projects.findIndex((p) => p.id === project.id)
    if (index === -1) throw new Error('Project not found')

    this.db.projects[index] = project
    return project
  }

  async applyToProject(params: {
    userId: string
    projectId: string
    message: string
  }): Promise<{ success: boolean; message: string }> {
    const { userId, projectId, message } = params
    const project = this.db.projects.find((p) => p.id === projectId)
    if (!project) return { success: false, message: 'Project not found' }

    const participant = this.db.participants.find(
      (p) => p.userId === userId && p.projectId === projectId
    )
    if (participant) return { success: false, message: 'Already applied to this project' }

    this.db.participants.push({
      id: randomUUID(),
      userId,
      projectId,
      message,
      joinedAt: new Date(),
    })
    return { success: true, message: 'Applied successfully' }
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
    const feedback = {
      id: randomUUID(),
      projectId,
      userId,
      comment,
      link,
      rating,
      createdAt: new Date(),
    }
    this.db.feedbacks.push(feedback)
    return { result: feedback }
  }

  async getProjectFeedbacks({
    projectId,
  }: {
    projectId: string
  }): Promise<{ feedbacks: Feedback[] }> {
    const feedbacks = this.db.feedbacks.filter((feedback) => feedback.projectId === projectId)

    return { feedbacks }
  }

  clear(): void {
    this.db.projects = []
  }
}
