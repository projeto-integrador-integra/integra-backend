import { ProjectController } from '@/controllers/project.controller'
import { registerProjectDocs } from '@/docs/project.openapi'
import { requireAccess } from '@/middleware/requireAccess'
import validate from '@/middleware/validate'
import { ProjectApplySchema } from '@/models/dto/project/apply.dto'
import { ProjectCreationSchema } from '@/models/dto/project/create.dto'
import { ProjectUpdateSchema } from '@/models/dto/project/update.dto'
import { UserService } from '@/services/user.service'
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import { Router } from 'express'
import { z } from 'zod'

extendZodWithOpenApi(z)

export function createProjectRoutes(
  userService: UserService,
  controller: ProjectController
): Router {
  const router = Router()

  registerProjectDocs()
  router.post(
    '/',
    requireAccess(userService, ['admin', 'company']),
    validate(ProjectCreationSchema),
    controller.createProject
  )
  router.get('/', controller.listProjects)
  router.get('/explore', controller.listExplorableProjects)

  router.get('/mine', requireAccess(userService, ['dev', 'mentor']), controller.getUserProjects)

  router.get('/summary', controller.getProjectSummary)

  router.get('/:id', controller.getProjectById)
  router.patch(
    '/:id',
    requireAccess(userService, ['admin', 'company']),
    validate(ProjectUpdateSchema),
    controller.updateProjectById
  )
  router.post(
    '/:id/apply',
    requireAccess(userService, ['dev', 'mentor']),
    validate(ProjectApplySchema),
    controller.applyToProject
  )

  router.post(
    '/:id/feedback',
    requireAccess(userService, ['dev', 'mentor']),
    controller.submitFeedback
  )
  router.get(
    '/:id/feedbacks',
    requireAccess(userService, ['dev', 'mentor']),
    controller.getProjectFeedbacks
  )
  return router
}
