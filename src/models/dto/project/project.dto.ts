import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'

import { PROJECT_APPROVAL_STATUSES, PROJECT_STATUS } from '@/constants/project'
import { UserSchema } from '../user/user.dto'

extendZodWithOpenApi(z)

export const ProjectSchema = z.object({
  id: z.string().uuid({ message: 'ID inválido' }).optional(),

  name: z
    .string({ message: 'O nome do projeto deve ter no mínimo 3 caracteres' })
    .min(3, { message: 'O nome do projeto deve ter no mínimo 3 caracteres' })
    .max(50, { message: 'O nome do projeto deve ter no máximo 50 caracteres' }),

  description: z
    .string({ message: 'A descrição deve ter no mínimo 10 caracteres' })
    .min(10, { message: 'A descrição deve ter no mínimo 10 caracteres' })
    .max(300, { message: 'A descrição deve ter no máximo 300 caracteres' }),

  creatorId: z
    .string()
    .uuid({ message: 'ID do criador inválido' })
    .nonempty({ message: 'O ID do criador é obrigatório' }),

  tags: z.array(z.string().min(1, { message: 'Tags não podem estar vazias' })).optional(),

  needsMentors: z.boolean().default(true),
  needsDevs: z.boolean().default(true),

  maxParticipants: z
    .number()
    .min(1, { message: 'É necessário pelo menos 1 participante' })
    .max(5, { message: 'O máximo de participantes permitido é 5' })
    .default(3),

  status: z.enum(PROJECT_STATUS, { message: 'Status inválido' }).default('active'),

  approvalStatus: z
    .enum(PROJECT_APPROVAL_STATUSES, { message: 'Status de aprovação inválido' })
    .default('pending'),

  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),

  members: z.array(UserSchema).optional(),
})

export type ProjectType = z.infer<typeof ProjectSchema>
