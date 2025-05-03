import { AppError } from '@/errors/AppErro'
import { Project } from '@/models/domain/project'
import { User } from '@/models/domain/user'
import { ProjectsListQueryType } from '@/models/dto/project/list.dto'
import { Feedback, feedbacks } from '@/models/schema/feedbacks'
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
  submitFeedback(params: {
    userId: string
    projectId: string
    comment: string
    link: string
    rating: number
  }): Promise<{ result: Feedback }>
  getProjectFeedbacks(params: { projectId: string }): Promise<{ feedbacks: Feedback[] }>
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

  async submitFeedback({
    userId,
    projectId,
    comment,
    link,
    rating,
  }: {
    userId: string
    projectId: string
    comment: string
    link: string
    rating: number
  }) {
    try {
      const [result] = await this.db
        .insert(feedbacks)
        .values({
          userId,
          projectId,
          comment,
          link,
          rating,
        })
        .returning()

      return { result }
    } catch (error) {
      if (error instanceof Error && error.message.includes('duplicate key')) {
        throw new AppError(
          'Você já enviou feedback para esse projeto',
          409,
          'FEEDBACK_ALREADY_SUBMITTED'
        )
      }
      throw new AppError('Erro ao salvar feedback', 500, 'FEEDBACK_SUBMISSION_FAILED')
    }
  }

  async getProjectFeedbacks({ projectId }: { projectId: string }) {
    const result = await this.db
      .select()
      .from(feedbacks)
      .innerJoin(users, eq(feedbacks.userId, users.id))
      .where(eq(feedbacks.projectId, projectId))

    const feedbacksList = result.map((row) => ({
      ...row.feedbacks,
      user: {
        id: row.users.id,
        name: row.users.name,
        email: row.users.email,
        role: row.users.role,
      },
    }))

    return { feedbacks: feedbacksList }
  }
}
