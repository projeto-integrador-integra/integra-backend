import { z } from 'zod'
import { PROJECT_APPROVAL_STATUSES } from '@/constants/project'

export const ProjectApproveSchema = z.object({
  status: z.enum(PROJECT_APPROVAL_STATUSES),
})
