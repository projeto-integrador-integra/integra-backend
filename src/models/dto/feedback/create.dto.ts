import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'

extendZodWithOpenApi(z)

export const CreateFeedbackDTO = z.object({
  projectId: z.string().uuid(),
  comment: z.string().min(10).max(1000),
  link: z.string().url().optional(),
  rating: z.number().int().min(1).max(5).optional(),
})
