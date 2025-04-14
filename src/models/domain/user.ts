import { randomUUID } from 'node:crypto'
import { UserCreationSchema, UserCreationType } from '../dto/user/create.dto.js'
import { Serializable } from './types.js'

export class User implements Serializable {
  readonly id: string
  name: UserCreationType['name']
  role: UserCreationType['role']
  email: string
  sub: string
  description: UserCreationType['description']
  createdAt: Date
  updatedAt: Date
  approvalStatus: UserCreationType['approvalStatus']

  constructor(data: UserCreationType) {
    const parsed = UserCreationSchema.parse(data)
    if (!parsed.email) throw new Error('Email is required')
    if (!parsed.sub) throw new Error('Sub is required')

    this.id = parsed.id ?? randomUUID()
    this.name = parsed.name
    this.role = parsed.role
    this.email = parsed.email
    this.sub = parsed.sub
    this.description = parsed.description
    this.createdAt = parsed.createdAt ?? new Date()
    this.updatedAt = parsed.updatedAt ?? new Date()
    this.approvalStatus = parsed.approvalStatus ?? 'pending'
  }

  static fromObject(data: Record<string, unknown>) {
    const parsed = UserCreationSchema.parse(data)
    return new User(parsed)
  }

  toObject() {
    return {
      id: this.id,
      name: this.name,
      role: this.role,
      email: this.email,
      sub: this.sub,
      description: this.description,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      approvalStatus: this.approvalStatus,
    }
  }

  toJSON() {
    return JSON.stringify(this.toObject())
  }
}
