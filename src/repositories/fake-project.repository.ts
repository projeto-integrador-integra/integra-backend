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

  clear(): void {
    this.db = []
  }
}
