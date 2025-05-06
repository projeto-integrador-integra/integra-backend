import { Request, Response } from 'express'

import { getCookieOptions } from '@/config/cookie'
import { AppError } from '@/errors/AppErro'
import { SignInSchema } from '@/models/dto/auth/signin.dto'
import { SignUpSchema } from '@/models/dto/auth/signup.dto'
import { AuthService } from '@/services/auth/auth.service'

export interface AuthController {
  signUp: (req: Request, res: Response) => Promise<void>
  signIn: (req: Request, res: Response) => Promise<void>
  signOut: (req: Request, res: Response) => Promise<void>
  refreshTokens: (req: Request, res: Response) => Promise<void>
}

export function makeAuthController(authService: AuthService): AuthController {
  return {
    async signUp(req: Request, res: Response) {
      const { email, password } = SignUpSchema.parse(req.body)
      console.log('Signup', email, password)

      try {
        await authService.signUp({ email, password })
        const tokens = await authService.signIn({ email, password })

        res
          .cookie('idToken', tokens.idToken, getCookieOptions(req))
          .cookie('accessToken', tokens.accessToken, getCookieOptions(req))
          .cookie('refreshToken', tokens.refreshToken, getCookieOptions(req))
          .status(201)
          .json({ message: 'Usuário criado e logado com sucesso.' })
      } catch (err: unknown) {
        const message = err instanceof AppError ? String(err.message) : 'Erro ao criar usuário.'
        throw new AppError(message, 400, 'SIGNUP_FAILED')
      }
    },

    async signIn(req: Request, res: Response) {
      const { email, password } = SignInSchema.parse(req.body)

      try {
        const tokens = await authService.signIn({ email, password })
        console.log('Tokens:', tokens)

        res
          .cookie('accessToken', tokens.accessToken, getCookieOptions(req))
          .cookie('idToken', tokens.idToken, getCookieOptions(req))
          .cookie('refreshToken', tokens.refreshToken, getCookieOptions(req))
          .json({ message: 'Login realizado com sucesso.' })
      } catch (err: unknown) {
        const message = err instanceof AppError ? String(err.message) : 'Erro ao fazer login.'
        throw new AppError(message, 401, 'SIGNIN_FAILED')
      }
    },

    async signOut(req: Request, res: Response) {
      try {
        const token = req.cookies.accessToken || req.headers.authorization?.split(' ')[1]
        await authService.signOut(token)

        res
          .clearCookie('accessToken')
          .clearCookie('idToken')
          .clearCookie('refreshToken')
          .json({ message: 'Logout realizado com sucesso.' })
      } catch (err: unknown) {
        const message = err instanceof AppError ? String(err.message) : 'Erro ao fazer logout.'
        throw new AppError(message, 500, 'SIGNOUT_FAILED')
      }
    },

    async refreshTokens(req: Request, res: Response) {
      const refreshToken = req.cookies.refreshToken || req.headers.authorization?.split(' ')[1]
      console.log('Refresh tokens', refreshToken)

      try {
        const tokens = await authService.refreshTokens(refreshToken)

        res
          .cookie('accessToken', tokens.accessToken, getCookieOptions(req))
          .cookie('idToken', tokens.idToken, getCookieOptions(req))
          .cookie('refreshToken', tokens.refreshToken, getCookieOptions(req))
          .json({ message: 'Tokens atualizados com sucesso.' })
      } catch (err: unknown) {
        const message =
          err instanceof AppError ? String(err.message) : 'Erro ao atualizar os tokens.'
        throw new AppError(message, 401, 'REFRESH_TOKEN_FAILED')
      }
    },
  }
}
