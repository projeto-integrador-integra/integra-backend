import { Project } from '@/models/domain/project'
import { ProjectRepository } from './project.repository'

export class FakeProjectRepository implements ProjectRepository {
  private db: Project[]

  constructor() {
    this.db = []
  }

  async create(project: Project): Promise<Project> {
    await this.db.push(project)
    return project
  }

  async getById(id: string): Promise<Project | null> {
    const project = this.db.find((project) => project.id === id)
    if (!project) return null
    return new Project(project)
  }

  async listProjects({
    page = 1,
    limit = 10,
    status,
    title,
    createdBy,
  }: {
    page?: number
    limit?: number
    status?: string
    title?: string
    createdBy?: string
  }): Promise<{ projects: Project[]; total: number }> {
    const offset = (page - 1) * limit

    const list = this.db.filter((project) => {
      if (status && project.status !== status) return false
      if (title && !project.name.toLowerCase().includes(title.toLowerCase())) return false
      if (createdBy && project.creatorId !== createdBy) return false
      return true
    })

    return {
      projects: list.slice(offset, offset + limit).map((project) => new Project(project)),
      total: list.length,
    }
  }

  async findSimilarProject({
    userId,
    title,
  }: {
    userId: string
    title: string
  }): Promise<Project[]> {
    const projectList = this.db.filter(
      (project) =>
        project.creatorId === userId && project.name.toLowerCase().includes(title.toLowerCase())
    )
    return projectList.map((project) => new Project(project))
  }

  clear(): void {
    this.db = []
  }
}
