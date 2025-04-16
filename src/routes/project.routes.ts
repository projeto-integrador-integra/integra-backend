import { ProjectController } from '@/controllers/project.controller'
import { registerProjectDocs } from '@/docs/project.openapi'
import { requiredRole } from '@/middleware/requireRole'
import validate from '@/middleware/validate'
import { ProjectApplySchema } from '@/models/dto/project/apply.dto'
import { ProjectCreationSchema } from '@/models/dto/project/create.dto'
import { ProjectUpdateSchema } from '@/models/dto/project/update.dto'
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import { Router } from 'express'
import { z } from 'zod'

extendZodWithOpenApi(z)

export function createProjectRoutes(controller: ProjectController): Router {
  const router = Router()

  registerProjectDocs()
  router.post(
    '/',
    requiredRole(['admin', 'company']),
    validate(ProjectCreationSchema),
    controller.createProject
  )
  router.get('/', controller.listProjects)

  router.get('/mine', controller.getUserProjects)

  router.get('/:id', controller.getProjectById)
  router.patch(
    '/:id',
    requiredRole(['admin', 'company']),
    validate(ProjectUpdateSchema),
    controller.updateProjectById
  )
  router.post(
    '/:id/apply',
    requiredRole(['dev', 'mentor']),
    validate(ProjectApplySchema),
    controller.applyToProject
  )

  router.post('/:id/feedback', requiredRole(['dev', 'mentor']), controller.submitFeedback)
  router.get('/:id/feedbacks', requiredRole(['dev', 'mentor']), controller.getProjectFeedbacks)

  return router
}
