import { z } from 'zod'
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import { PROJECT_APPROVAL_STATUSES, PROJECT_STATUS } from '@/constants/project'

extendZodWithOpenApi(z)

export const ProjectSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(50),
  description: z.string().max(300),
  creatorId: z.string().uuid().nonempty(),
  tags: z.string().array().optional(),
  needsMentors: z.boolean().default(true),
  needsDevs: z.boolean().default(true),
  maxParticipants: z.number().min(1).max(5).default(3),
  status: z.enum(PROJECT_STATUS).default('active'),
  approvalStatus: z.enum(PROJECT_APPROVAL_STATUSES).default('pending'),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
})

export type ProjectType = z.infer<typeof ProjectSchema>
