import type { UserController } from '@/controllers/user.controller'
import { registerProjectDocs } from '@/docs/project.openapi'
import validate from '@/middleware/validate'
import { UserCreationSchema } from '@/models/dto/user/create.dto'
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import { Router } from 'express'
import { z } from 'zod'

extendZodWithOpenApi(z)

export function createProjectRoutes(controller: UserController): Router {
  const router = Router()

  registerProjectDocs()
  router.post('/', validate(UserCreationSchema), controller.createUser)

  return router
}
