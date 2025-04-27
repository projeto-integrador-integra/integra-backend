import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'
import { FeedbackSchema } from './feedback.dto'

extendZodWithOpenApi(z)

export const FeedbackCreateSchema = FeedbackSchema.partial().omit({
  projectId: true,
  user: true,
  createdAt: true,
  updatedAt: true,
  id: true,
})
