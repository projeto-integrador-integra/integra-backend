import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'

extendZodWithOpenApi(z)

export const FeedbackUserSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  role: z.enum(['admin', 'mentor', 'dev', 'company']), // opcional se quiser mostrar
})

export const FeedbackSchema = z.object({
  id: z.string().uuid(),
  projectId: z.string().uuid(),
  comment: z.string().min(10).max(1000),
  link: z.string().url().optional(),
  rating: z.number().int().min(1).max(5).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  user: FeedbackUserSchema,
})
