import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'

import { USER_ROLES } from '@/constants/user'

extendZodWithOpenApi(z)

export const FeedbackUserSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  role: z.enum(USER_ROLES),
})

export const FeedbackSchema = z.object({
  id: z.string().uuid(),
  projectId: z.string().uuid(),
  comment: z.string().min(10).max(1000),
  link: z.string().url().optional(),
  rating: z.number().int().min(1).max(10).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  user: FeedbackUserSchema,
})
