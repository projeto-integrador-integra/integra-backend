import { PROJECT_APPROVAL_STATUSES, PROJECT_STATUS } from '@/constants/project'
import { z } from 'zod'

export const ProjectStatusEnum = z.enum(PROJECT_STATUS)
export const ProjectApprovalStatusEnum = z.enum(PROJECT_APPROVAL_STATUSES)

export const ProjectsListQuerySchema = z
  .object({
    status: ProjectStatusEnum.optional(),
    title: z.string().optional(),
    createdBy: z.string().uuid().optional(),
    page: z.string().default('1').transform(Number),
    limit: z.string().default('10').transform(Number),
    approvalStatus: ProjectApprovalStatusEnum.optional(),
  })
  .partial()

export type ProjectsListQueryType = z.infer<typeof ProjectsListQuerySchema>
