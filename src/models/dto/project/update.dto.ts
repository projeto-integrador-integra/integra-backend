import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'
import { ProjectCreationSchema } from './create.dto'

extendZodWithOpenApi(z)

export const ProjectUpdateSchema = ProjectCreationSchema.partial().omit({
  id: true,
  creatorId: true,
  createdAt: true,
  updatedAt: true,
  needsMentors: true,
  needsDevs: true,
})
export type UserUpdateType = z.infer<typeof ProjectUpdateSchema>
