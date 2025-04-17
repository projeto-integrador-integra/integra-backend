import { AppError } from '@/errors/AppErro'
import { SignInSchema } from '@/models/dto/auth/signin.dto'
import { SignUpSchema } from '@/models/dto/auth/signup.dto'
import { AuthService } from '@/services/auth.service'
import { Request, Response } from 'express'

export interface AuthController {
  signUp: (req: Request, res: Response) => Promise<void>
  signIn: (req: Request, res: Response) => Promise<void>
}

export function makeAuthController(authService: AuthService): AuthController {
  return {
    async signUp(req: Request, res: Response) {
      const { email, password } = SignUpSchema.parse(req.body)

      try {
        await authService.signUp({ email, password })
        const tokens = await authService.signIn({ email, password })

        res
          .cookie('idToken', tokens.idToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 1000 * 60 * 60,
          })
          .cookie('accessToken', tokens.accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 1000 * 60 * 60,
          })
          .status(201)
          .json({ message: 'Usuário criado e logado com sucesso.' })
      } catch (err: unknown) {
        const message =
          typeof err === 'object' && err !== null && 'message' in err
            ? String(err.message)
            : 'Erro ao criar usuário.'
        throw new AppError(message, 400, 'SIGNUP_FAILED')
      }
    },

    async signIn(req: Request, res: Response) {
      const { email, password } = SignInSchema.parse(req.body)

      try {
        const tokens = await authService.signIn({ email, password })

        res
          .cookie('accessToken', tokens.accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 1000 * 60 * 60,
          })
          .cookie('idToken', tokens.idToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 1000 * 60 * 60,
          })
          .json({ message: 'Login realizado com sucesso.' })
      } catch (err: unknown) {
        const message =
          typeof err === 'object' && err !== null && 'message' in err
            ? String(err.message)
            : 'Erro ao fazer login.'
        throw new AppError(message, 401, 'SIGNIN_FAILED')
      }
    },
  }
}
