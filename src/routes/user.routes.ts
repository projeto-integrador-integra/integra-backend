import { Router } from 'express'
import type { UserController } from '../controllers/user.controller'
import validate from '../middleware/validate'
import { UserCreationSchema, UserUpdateSchema } from '../models/domain/user'
import { registry } from '../config/openapi'

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
