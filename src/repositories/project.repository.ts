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
    params?: ProjectsListQueryType & { needsDevs?: boolean; needsMentors?: boolean }
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
  userSummary(user: string): Promise<{ pending?: number; approved: number; closed: number }>
  leaveProject({
    projectId,
    userId,
  }: {
    projectId: string
    userId: string
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
      .where(and(eq(projects.id, id), isNull(projectParticipants.deletedAt)))

    if (!result || result.length === 0) return null
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

    const query = [isNull(projectParticipants.deletedAt)]
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
      .leftJoin(projectParticipants, eq(projects.id, projectParticipants.projectId))
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
    params: { page = 1, limit = 10, title, createdBy, approvalStatus, needsDevs, needsMentors },
  }: {
    userId: string
    params: ProjectsListQueryType & { needsDevs?: boolean; needsMentors?: boolean }
  }) {
    const offset = (page - 1) * limit
    const query = [
      or(isNull(projectParticipants.userId), ne(projectParticipants.userId, userId)),
      eq(projects.status, 'active'),
      isNull(projectParticipants.deletedAt),
    ]
    if (title) query.push(ilike(projects.name, `%${title.trim()}%`))
    if (createdBy) query.push(eq(projects.creatorId, createdBy))
    if (approvalStatus) query.push(eq(projects.approvalStatus, approvalStatus))
    if (needsDevs) query.push(eq(projects.needsDevs, needsDevs))
    if (needsMentors) query.push(eq(projects.needsMentors, needsMentors))

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
    const query = [
      isNotNull(projectParticipants.userId),
      eq(projectParticipants.userId, userId),
      isNull(projectParticipants.deletedAt),
    ]
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

  async userSummary(userId: string) {
    const baseWhere = and(
      or(eq(projects.creatorId, userId), eq(projectParticipants.userId, userId)),
      isNull(projectParticipants.deletedAt)
    )

    const [pendingCount, approvedCount, closedCount] = await Promise.all([
      this.db
        .select({ count: count() })
        .from(projects)
        .leftJoin(projectParticipants, eq(projects.id, projectParticipants.projectId))
        .where(and(baseWhere, eq(projects.approvalStatus, 'pending')))
        .then(([res]) => res?.count ?? 0),

      this.db
        .select({ count: count() })
        .from(projects)
        .leftJoin(projectParticipants, eq(projects.id, projectParticipants.projectId))
        .where(
          and(baseWhere, eq(projects.status, 'active'), eq(projects.approvalStatus, 'approved'))
        )
        .then(([res]) => res?.count ?? 0),

      this.db
        .select({ count: count() })
        .from(projects)
        .leftJoin(projectParticipants, eq(projects.id, projectParticipants.projectId))
        .where(and(baseWhere, eq(projects.status, 'closed')))
        .then(([res]) => res?.count ?? 0),
    ])

    return {
      pending: pendingCount,
      approved: approvedCount,
      closed: closedCount,
    }
  }

  async leaveProject({ projectId, userId }: { projectId: string; userId: string }) {
    const result = await this.db
      .update(projectParticipants)
      .set({ deletedAt: new Date() })
      .where(
        and(
          eq(projectParticipants.projectId, projectId),
          eq(projectParticipants.userId, userId),
          isNull(projectParticipants.deletedAt)
        )
      )
      .returning()

    if (result.length === 0)
      throw new AppError('Failed to leave project', 500, 'LEAVE_PROJECT_FAILED')

    return { success: true, message: 'Left project successfully' }
  }
}
