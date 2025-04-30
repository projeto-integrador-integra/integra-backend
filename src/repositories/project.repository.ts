import { Project } from '@/models/domain/project'
import { ProjectsListQueryType } from '@/models/dto/project/list.dto'
import { projects } from '@/models/schema/projects'
import { and, count, eq, ilike } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/node-postgres'

export interface ProjectRepository {
  create(project: Project): Promise<Project>
  getById(id: string): Promise<Project | null>
  listProjects(params: ProjectsListQueryType): Promise<{ projects: Project[]; total: number }>
  findSimilarProject(params: { userId: string; title: string }): Promise<Project[]>
}

export class DrizzleProjectRepository implements ProjectRepository {
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

  async listProjects({
    page = 1,
    limit = 10,
    status,
    title,
    createdBy,
  }: ProjectsListQueryType): Promise<{ projects: Project[]; total: number }> {
    const offset = (page - 1) * limit

    const query = []
    if (status) query.push(eq(projects.status, status))
    if (title) query.push(ilike(projects.name, `%${title.trim()}%`))
    if (createdBy) query.push(eq(projects.creatorId, createdBy))

    const list = await this.db
      .select()
      .from(projects)
      .where(and(...query))
      .limit(limit)
      .offset(offset)

    const [total] = await this.db
      .select({ count: count() })
      .from(projects)
      .where(and(...query))

    return {
      projects: list.map((project) => Project.fromObject(project)),
      total: total.count,
    }
  }

  async findSimilarProject({ userId, title }: { userId: string; title: string }) {
    const projectList = await this.db
      .select()
      .from(projects)
      .where(and(eq(projects.creatorId, userId), ilike(projects.name, `%${title.trim()}%`)))

    return projectList.map((project) => Project.fromObject(project))
  }
}
