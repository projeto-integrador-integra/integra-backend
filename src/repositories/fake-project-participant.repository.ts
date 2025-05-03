import { ProjectParticipant } from '@/models/schema/project-participants'
import { FakeDatabase } from './fake-user.repository'
import { ProjectParticipantRepository } from './project-participant.repository'

export class FakeProjectParticipantRepository implements ProjectParticipantRepository {
  constructor(private readonly db: FakeDatabase) {}

  async create(application: ProjectParticipant): Promise<ProjectParticipant> {
    await this.db.participants.push(application)
    return application
  }

  async getByProjectId(id: string): Promise<ProjectParticipant[] | null> {
    const applications = this.db.participants.filter((application) => application.projectId === id)
    return applications
  }
}
