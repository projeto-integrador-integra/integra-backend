import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'
import { ProjectSchema } from './project.dto'

extendZodWithOpenApi(z)

export const ProjectCreationSchema = ProjectSchema.partial().omit({
  id: true,
  creatorId: true,
  createdAt: true,
  updatedAt: true,
  needsMentors: true,
  needsDevs: true,
  approvalStatus: true,
})
export type ProjectCreationType = z.infer<typeof ProjectCreationSchema>
