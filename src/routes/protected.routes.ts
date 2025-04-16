import { attachUserRole } from '@/middleware/attachRole'
import { injectUser } from '@/middleware/injectUser'
import { UserService } from '@/services/user.service'
import { Router } from 'express'

export function protectedRoute(userService: UserService): Router {
  const router = Router()

  router.use(injectUser())
  router.use(attachUserRole(userService))

  return router
}
