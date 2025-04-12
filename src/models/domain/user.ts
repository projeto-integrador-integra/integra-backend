import { z } from 'zod'
import { Serializable } from './types.js'
import { randomUUID } from 'node:crypto'

export const UserCreationSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(50),
  role: z.enum(['admin', 'mentor', 'dev']),
  email: z.string().email(),
  sub: z.string().uuid(),
  createdAt: z.date().optional(),
  description: z.string().optional().nullable(),
})

export type UserCreationType = z.infer<typeof UserCreationSchema>

export const UserUpdateSchema = UserCreationSchema.partial().omit({ id: true, sub: true })
export type UserUpdateType = z.infer<typeof UserUpdateSchema>

export class User implements Serializable {
  readonly id: string
  name: UserCreationType['name']
  role: UserCreationType['role']
  email: UserCreationType['email']
  sub: UserCreationType['sub']
  description: UserCreationType['description']
  createdAt: Date

  constructor(data: UserCreationType) {
    const parsed = UserCreationSchema.parse(data)
    this.name = parsed.name
    this.role = parsed.role
    this.email = parsed.email
    this.sub = parsed.sub
    this.description = parsed.description
    this.createdAt = parsed.createdAt ?? new Date()
    this.id = parsed.id ?? randomUUID()
  }

  static fromObject(data: Record<string, unknown>) {
    const parsed = UserCreationSchema.parse(data)
    return new User(parsed)
  }

  toObject() {
    return {
      name: this.name,
      role: this.role,
      email: this.email,
      sub: this.sub,
      id: this.id,
      description: this.description,
      createdAt: this.createdAt,
    }
  }

  toJSON() {
    return JSON.stringify(this.toObject())
  }
}
