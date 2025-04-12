import { Router } from 'express'
import validate from '../middleware/validate'
import { UserCreationSchema } from '../models/domain/user'
import type { UserController } from '../controllers/user.controller'

export function createUserRoutes(controller: UserController): Router {
  const router = Router()

  router.post('/', validate(UserCreationSchema), controller.createUser)
  router.get('/:id', controller.getUser)

  return router
}
