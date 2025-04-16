import { z } from 'zod'

export const ProjectApplySchema = z.object({
  message: z.string().min(5).max(300).optional(),
})

export type ProjectApplyDTO = z.infer<typeof ProjectApplySchema>
