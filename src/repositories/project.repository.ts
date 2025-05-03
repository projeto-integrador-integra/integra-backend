import { AppError } from '@/errors/AppErro'
import { Project } from '@/models/domain/project'
import { User } from '@/models/domain/user'
import { ProjectsListQueryType } from '@/models/dto/project/list.dto'
import { projectParticipants } from '@/models/schema/project-participants'
import { projects } from '@/models/schema/projects'
import { users } from '@/models/schema/user'
import { and, count, eq, ilike, isNotNull, isNull, ne, or } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/node-postgres'

interface RowType {
  projects: typeof projects.$inferSelect
  project_participants: typeof projectParticipants.$inferSelect | null
  users: typeof users.$inferSelect | null
}

export interface ProjectRepository {
  create(project: Project): Promise<Project>
  update(project: Project): Promise<Project>
  getById(id: string): Promise<Project | null>
  listProjects(
    params?: ProjectsListQueryType
  ): Promise<{ projects: Project[]; total: number; page: number; limit: number }>
  listExplorable(params: {
    userId: string
    params?: ProjectsListQueryType
  }): Promise<{ projects: Project[]; total: number; page: number; limit: number }>
  listMyProjects(params: {
    userId: string
    params?: ProjectsListQueryType
  }): Promise<{ projects: Project[]; total: number; page: number; limit: number }>
  findSimilarProject(params: { userId: string; title: string }): Promise<Project[]>
  applyToProject(params: {
    userId: string
    projectId: string
    message: string
  }): Promise<{ success: boolean; message: string }>
}

export class DrizzleProjectRepository implements ProjectRepository {
  constructor(private readonly db: ReturnType<typeof drizzle>) {}

  async create(project: Project): Promise<Project> {
    await this.db.insert(projects).values(project.toObject())
    return project
  }

  async update(project: Project): Promise<Project> {
    await this.db.update(projects).set(project.toObject()).where(eq(projects.id, project.id))
    return project
  }

  async getById(id: string): Promise<Project | null> {
    const result = await this.db
      .select()
      .from(projects)
      .leftJoin(projectParticipants, eq(projects.id, projectParticipants.projectId))
      .leftJoin(users, eq(projectParticipants.userId, users.id))
      .where(eq(projects.id, id))
    if (!result) return null
    const project = Project.fromObject(result[0].projects)

    result.forEach((row) => {
      if (row.users) {
        const user = User.fromObject(row.users)
        project.addMember(user)
      }
    })
    return project
  }

  async listProjects({
    page = 1,
    limit = 10,
    status,
    title,
    createdBy,
    approvalStatus,
  }: ProjectsListQueryType) {
    const offset = (page - 1) * limit

    const query = []
    if (status) query.push(eq(projects.status, status))
    if (title) query.push(ilike(projects.name, `%${title.trim()}%`))
    if (createdBy) query.push(eq(projects.creatorId, createdBy))
    if (approvalStatus) query.push(eq(projects.approvalStatus, approvalStatus))

    const listAll = await this.db
      .select()
      .from(projects)
      .leftJoin(projectParticipants, eq(projects.id, projectParticipants.projectId))
      .leftJoin(users, eq(projectParticipants.userId, users.id))
      .where(and(...query))
      .limit(limit)
      .offset(offset)

    const [total] = await this.db
      .select({ count: count() })
      .from(projects)
      .where(and(...query))

    const projectList = this.groupProjectsWithEntities(listAll)

    return {
      projects: projectList,
      total: total.count,
      page,
      limit,
    }
  }

  private groupProjectsWithEntities(rows: RowType[]): Project[] {
    const map = new Map<string, Project>()

    for (const row of rows) {
      const id = row.projects.id
      if (!map.has(id)) {
        map.set(id, Project.fromObject(row.projects))
      }
      if (row.users) {
        const user = User.fromObject(row.users)
        map.get(id)!.addMember(user)
      }
    }
    return Array.from(map.values())
  }

  async listExplorable({
    userId,
    params: { page = 1, limit = 10, title, createdBy, approvalStatus },
  }: {
    userId: string
    params: ProjectsListQueryType
  }) {
    const offset = (page - 1) * limit
    const query = [
      or(isNull(projectParticipants.userId), ne(projectParticipants.userId, userId)),
      eq(projects.status, 'active'),
    ]
    if (title) query.push(ilike(projects.name, `%${title.trim()}%`))
    if (createdBy) query.push(eq(projects.creatorId, createdBy))
    if (approvalStatus) query.push(eq(projects.approvalStatus, approvalStatus))

    const [total] = await this.db
      .select({ count: count() })
      .from(projects)
      .leftJoin(projectParticipants, eq(projects.id, projectParticipants.projectId))
      .where(and(...query))

    const listAll = await this.db
      .select()
      .from(projects)
      .leftJoin(projectParticipants, eq(projects.id, projectParticipants.projectId))
      .leftJoin(users, eq(projectParticipants.userId, users.id))
      .where(and(...query))
      .limit(limit)
      .offset(offset)

    const projectList = this.groupProjectsWithEntities(listAll)

    return { projects: projectList, page, limit, total: total.count }
  }

  async listMyProjects({
    userId,
    params: { page = 1, limit = 10, approvalStatus, createdBy, status, title },
  }: {
    userId: string
    params: ProjectsListQueryType
  }) {
    const offset = (page - 1) * limit
    const query = [isNotNull(projectParticipants.userId), eq(projectParticipants.userId, userId)]
    if (approvalStatus) query.push(eq(projects.approvalStatus, approvalStatus))
    if (createdBy) query.push(eq(projects.creatorId, createdBy))
    if (status) query.push(eq(projects.status, status))
    if (title) query.push(ilike(projects.name, `%${title.trim()}%`))

    const [total] = await this.db
      .select({ count: count() })
      .from(projects)
      .innerJoin(projectParticipants, eq(projects.id, projectParticipants.projectId))
      .where(and(...query))

    const listAll = await this.db
      .select()
      .from(projects)
      .innerJoin(projectParticipants, eq(projects.id, projectParticipants.projectId))
      .innerJoin(users, eq(projectParticipants.userId, users.id))
      .where(and(...query))
      .limit(limit)
      .offset(offset)

    const projectList = this.groupProjectsWithEntities(listAll)

    return { projects: projectList, page, limit, total: total.count }
  }

  async findSimilarProject({ userId, title }: { userId: string; title: string }) {
    const projectList = await this.db
      .select()
      .from(projects)
      .where(and(eq(projects.creatorId, userId), ilike(projects.name, `%${title.trim()}%`)))

    return projectList.map((project) => Project.fromObject(project))
  }

  async applyToProject({
    userId,
    projectId,
    message,
  }: {
    userId: string
    projectId: string
    message: string
  }): Promise<{ success: boolean; message: string }> {
    const applications = await this.db.insert(projectParticipants).values({
      userId,
      projectId,
      message,
    })

    if (applications.rowCount === 0)
      throw new AppError('Failed to apply', 500, 'APPLICATION_FAILED')
    return { success: true, message: 'Applied successfully' }
  }
}
