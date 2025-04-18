import { AuthController } from '@/controllers/auth.controller'
import validate from '@/middleware/validate'
import { SignInSchema } from '@/models/dto/auth/signin.dto'
import { SignUpSchema } from '@/models/dto/auth/signup.dto'
import { Router } from 'express'

export function createAuthRouter(authController: AuthController): Router {
  const router = Router()

  router.post('/signup', validate(SignUpSchema), authController.signUp)
  router.post('/login', validate(SignInSchema), authController.signIn)
  router.post('/logout', authController.signOut)
  router.post('/refresh', authController.refreshTokens)

  return router
}
