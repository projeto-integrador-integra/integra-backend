import { z } from 'zod'

export const SignInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(20),
})
export type SignInType = z.infer<typeof SignInSchema>
