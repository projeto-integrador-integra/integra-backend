import { z } from 'zod'
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import { USER_APPROVAL_STATUSES, USER_ROLES } from '@/constants/user'

extendZodWithOpenApi(z)

export const UserSchema = z
  .object({
    id: z.string().uuid().optional().openapi({ description: 'User ID' }),
    sub: z.string().uuid().optional().openapi({
      description: 'User ID provided by the Amazon Cognito service',
    }),
    role: z.enum(USER_ROLES),
    name: z.string().min(1).max(50),
    email: z.string().email().optional(),
    description: z.string().max(300).optional().nullable(),
    createdAt: z.date().optional(),
    updatedAt: z.date().optional(),
    approvalStatus: z.enum(USER_APPROVAL_STATUSES).optional().default('pending'),
  })
  .openapi('User')

export type UserType = z.infer<typeof UserSchema>
