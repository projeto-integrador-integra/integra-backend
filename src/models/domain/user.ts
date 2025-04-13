import { randomUUID } from 'node:crypto'
import { z } from 'zod'
import { Serializable } from './types.js'
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'

extendZodWithOpenApi(z)

export const UserCreationSchema = z.object({
  id: z.string().uuid().optional().openapi({ description: 'User ID' }),
  sub: z.string().uuid(),
  role: z.enum(['admin', 'mentor', 'dev', 'company']),
  name: z.string().min(1).max(50),
  email: z.string().email(),
  description: z.string().optional().nullable(),
  createdAt: z.date().optional(),
  approvalStatus: z.enum(['pending', 'approved', 'rejected', 'suspended']).optional(),
})

export type UserCreationType = z.infer<typeof UserCreationSchema>

export const UserUpdateSchema = UserCreationSchema.partial().omit({
  id: true,
  sub: true,
  createdAt: true,
  email: true,
})
export type UserUpdateType = z.infer<typeof UserUpdateSchema>

export class User implements Serializable {
  readonly id: string
  name: UserCreationType['name']
  role: UserCreationType['role']
  email: UserCreationType['email']
  sub: UserCreationType['sub']
  description: UserCreationType['description']
  createdAt: Date
  approvalStatus: UserCreationType['approvalStatus']

  constructor(data: UserCreationType) {
    const parsed = UserCreationSchema.parse(data)
    this.name = parsed.name
    this.role = parsed.role
    this.email = parsed.email
    this.sub = parsed.sub
    this.description = parsed.description
    this.createdAt = parsed.createdAt ?? new Date()
    this.id = parsed.id ?? randomUUID()
    this.approvalStatus = parsed.approvalStatus ?? 'pending'
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
      approvalStatus: this.approvalStatus,
    }
  }

  toJSON() {
    return JSON.stringify(this.toObject())
  }
}
