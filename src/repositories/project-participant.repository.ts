import { ProjectParticipant, projectParticipants } from '@/models/schema/project-participants'
import { eq } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/node-postgres'

export interface ProjectParticipantRepository {
  create(project: ProjectParticipant): Promise<ProjectParticipant>
  getByProjectId(id: string): Promise<ProjectParticipant[] | null>
}

export class DrizzleProjectParticipantRepository implements ProjectParticipantRepository {
  constructor(private readonly db: ReturnType<typeof drizzle>) {}

  async create(application: ProjectParticipant): Promise<ProjectParticipant> {
    await this.db.insert(projectParticipants).values(application)
    return application
  }

  async getByProjectId(id: string): Promise<ProjectParticipant[] | null> {
    const applications = await this.db
      .select()
      .from(projectParticipants)
      .where(eq(projectParticipants.projectId, id))
    if (!applications) return null
    return applications
  }
}
