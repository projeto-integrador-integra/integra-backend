import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'
import { UserSchema } from './user.dto'

extendZodWithOpenApi(z)

export const UserCreationSchema = UserSchema.partial().omit({
  id: true,
  sub: true,
  email: true,
  createdAt: true,
  updatedAt: true,
  approvalStatus: true,
})
export type UserCreationType = z.infer<typeof UserCreationSchema>
