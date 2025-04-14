import { randomUUID } from 'node:crypto'
import { ProjectCreationSchema, ProjectCreationType } from '../dto/project/create.dto.js'
import { Serializable } from './types.js'
import { User } from './user.js'

export class Project implements Serializable {
  readonly id: string
  name: ProjectCreationType['name']
  description: ProjectCreationType['description']
  creatorId: ProjectCreationType['creatorId']
  tags: ProjectCreationType['tags']
  needsMentors: ProjectCreationType['needsMentors']
  needsDevs: ProjectCreationType['needsDevs']
  maxParticipants: ProjectCreationType['maxParticipants']
  status: ProjectCreationType['status']
  approvalStatus: ProjectCreationType['approvalStatus']
  createdAt: ProjectCreationType['createdAt']
  updatedAt: ProjectCreationType['updatedAt']
  members: User[]

  constructor(data: ProjectCreationType, members: User[] = []) {
    const parsed = ProjectCreationSchema.parse(data)

    this.id = parsed.id ?? randomUUID()
    this.name = parsed.name
    this.description = parsed.description
    this.creatorId = parsed.creatorId
    this.tags = parsed.tags
    this.needsMentors = parsed.needsMentors
    this.needsDevs = parsed.needsDevs
    this.maxParticipants = parsed.maxParticipants
    this.status = parsed.status
    this.approvalStatus = parsed.approvalStatus
    this.createdAt = parsed.createdAt ?? new Date()
    this.updatedAt = parsed.updatedAt ?? new Date()
    this.members = members
  }

  static fromObject(data: Record<string, unknown>) {
    const parsed = ProjectCreationSchema.parse(data)
    return new Project(parsed)
  }

  toObject() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      creatorId: this.creatorId,
      tags: this.tags,
      needsMentors: this.needsMentors,
      needsDevs: this.needsDevs,
      maxParticipants: this.maxParticipants,
      status: this.status,
      approvalStatus: this.approvalStatus,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      members: this.members.map((members) => members.toObject()),
    }
  }

  toJSON() {
    return JSON.stringify(this.toObject())
  }
}
