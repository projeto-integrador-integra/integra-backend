import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'
import { ProjectSchema } from './project.dto'

extendZodWithOpenApi(z)

export const ProjectUpdateSchema = ProjectSchema.partial().omit({
  id: true,
  creatorId: true,
  createdAt: true,
  updatedAt: true,
  needsMentors: true,
  needsDevs: true,
})
export type ProjectUpdateType = z.infer<typeof ProjectUpdateSchema>
