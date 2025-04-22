import type { UserController } from '@/controllers/user.controller'
import { registerUserDocs } from '@/docs/user.openapi'
import { requireAccess } from '@/middleware/requireAccess'
import validate from '@/middleware/validate'
import { UserCreationSchema } from '@/models/dto/user/create.dto'
import { UserUpdateSchema } from '@/models/dto/user/update.dto'
import { UserService } from '@/services/user.service'
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import { Router } from 'express'
import { z } from 'zod'

extendZodWithOpenApi(z)

export function createUserRoutes(userService: UserService, controller: UserController): Router {
  const router = Router()

  registerUserDocs()
  router.post('/', validate(UserCreationSchema), controller.createUser)
  router.get('/', requireAccess(userService, ['admin']), controller.listUsers)
  router.get('/me', controller.getCurrentUser)
  router.get('/:id', requireAccess(userService, ['admin']), controller.getUserById)
  router.patch(
    '/:id',
    validate(UserUpdateSchema),
    requireAccess(userService, ['admin']),
    controller.updateUserById
  )

  return router
}
