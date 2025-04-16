import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'
import { ProjectsListQuerySchema } from './list.dto'

extendZodWithOpenApi(z)

export const ProjectsListOwnQuerySchema = ProjectsListQuerySchema.partial().omit({
  createdBy: true,
})
export type ProjectListOwnType = z.infer<typeof ProjectsListOwnQuerySchema>
