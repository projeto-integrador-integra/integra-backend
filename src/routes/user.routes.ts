import { Router } from 'express'
import { registry } from '@/config/openapi'
import type { UserController } from '@/controllers/user.controller'
import validate from '@/middleware/validate'
import { UserCreationSchema } from '@/models/dto/user/create.dto'
import { UserUpdateSchema } from '@/models/dto/user/update.dto'

export function createUserRoutes(controller: UserController): Router {
  const router = Router()

  registry.register('UserCreation', UserCreationSchema)
  registry.register('UserUpdate', UserUpdateSchema)
  registry.registerPath({
    method: 'post',
    path: '/users',
    summary: 'Create a user',
    responses: {
      200: {
        description: 'Object with user data.',
      },
    },
  })
  router.post('/', validate(UserCreationSchema), controller.createUser)
  router.get('/:id', controller.getUser)

  return router
}
