import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'
import { UserSchema } from './user.dto'

extendZodWithOpenApi(z)

export const UserUpdateSchema = UserSchema.partial().omit({
  id: true,
  sub: true,
  email: true,
  createdAt: true,
  updatedAt: true,
})
export type UserUpdateType = z.infer<typeof UserUpdateSchema>
