import { randomUUID } from 'node:crypto'
import { ProjectSchema, ProjectType } from '../dto/project/project.dto.js'
import { Serializable } from './types.js'
import { User } from './user.js'

export class Project implements Serializable {
  readonly id: string
  name: ProjectType['name']
  description: ProjectType['description']
  creatorId: ProjectType['creatorId']
  tags: ProjectType['tags']
  needsMentors: ProjectType['needsMentors']
  needsDevs: ProjectType['needsDevs']
  maxParticipants: ProjectType['maxParticipants']
  status: ProjectType['status']
  approvalStatus: ProjectType['approvalStatus']
  createdAt: ProjectType['createdAt']
  updatedAt: ProjectType['updatedAt']
  members: User[]

  constructor(data: ProjectType, members: User[] = []) {
    const parsed = ProjectSchema.parse(data)

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

  static fromObject(data: Record<string, unknown>, members: User[] = []): Project {
    const parsed = ProjectSchema.parse(data)
    return new Project(parsed, members)
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
