import { ProjectParticipant } from '@/models/schema/project-participants'
import { ProjectParticipantRepository } from './project-participant.repository'

export class FakeProjectParticipantRepository implements ProjectParticipantRepository {
  private db: ProjectParticipant[]

  constructor() {
    this.db = []
  }

  async create(application: ProjectParticipant): Promise<ProjectParticipant> {
    await this.db.push(application)
    return application
  }

  async getByProjectId(id: string): Promise<ProjectParticipant[] | null> {
    const applications = this.db.filter((application) => application.projectId === id)
    return applications
  }
}
