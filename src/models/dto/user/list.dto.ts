import { z } from 'zod'

export const ListUsersQuerySchema = z.object({
  role: z.enum(['admin', 'mentor', 'dev', 'company']).optional(),
  approvalStatus: z.enum(['pending', 'approved', 'rejected']).optional(),
  name: z.string().min(1).optional(), // busca parcial por nome
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('10'),
})

export type ListUsersQuery = z.infer<typeof ListUsersQuerySchema>
