import { Project } from '@/models/domain/project'
import { ProjectsListQueryType } from '@/models/dto/project/list.dto'
import { FakeDatabase } from './fake-user.repository'
import { ProjectRepository } from './project.repository'

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

  clear(): void {
    this.db.projects = []
  }
}
