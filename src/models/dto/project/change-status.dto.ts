import { z } from 'zod'
import { PROJECT_STATUS } from '@/constants/project'

export const ProjectChageStatusSchema = z.object({
  status: z.enum(PROJECT_STATUS),
})
