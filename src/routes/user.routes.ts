import type { UserController } from '@/controllers/user.controller'
import { registerUserDocs } from '@/docs/user.openapi'
import { requiredRole } from '@/middleware/requireRole'
import validate from '@/middleware/validate'
import { UserCreationSchema } from '@/models/dto/user/create.dto'
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import { Router } from 'express'
import { z } from 'zod'

extendZodWithOpenApi(z)

export function createUserRoutes(controller: UserController): Router {
  const router = Router()

  registerUserDocs()
  router.post('/', validate(UserCreationSchema), controller.createUser)
  router.get('/', requiredRole(['admin']), controller.listUsers)
  router.get('/:id', requiredRole(['admin']), controller.getUserById)

  return router
}
