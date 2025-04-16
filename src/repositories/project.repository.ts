import { Project } from '@/models/domain/project'
import { projects } from '@/models/schema/projects'
import { eq } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/node-postgres'

export class ProjectRepository {
  constructor(private readonly db: ReturnType<typeof drizzle>) {}

  async create(project: Project): Promise<Project> {
    await this.db.insert(projects).values(project.toObject())
    return project
  }

  async getById(id: string): Promise<Project | null> {
    const [project] = await this.db.select().from(projects).where(eq(projects.id, id))

    if (!project) return null

    return Project.fromObject(project)
  }
}
