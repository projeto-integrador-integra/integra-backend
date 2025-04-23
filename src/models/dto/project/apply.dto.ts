import { z } from 'zod'

export const ProjectApplySchema = z.object({
  message: z
    .string()
    .max(300, 'Mensagem pode ter no máximo 300 caracteres')
    .optional()
    .transform((val) => (val?.trim() === '' ? undefined : val)),
})

export type ProjectApplyType = z.infer<typeof ProjectApplySchema>
