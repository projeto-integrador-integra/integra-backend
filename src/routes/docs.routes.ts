import { OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi'
import { Router } from 'express'
import swaggerUi from 'swagger-ui-express'
import { registry } from '../config/openapi'

export function createDocsRoutes(): Router {
  const router = Router()

  const genarator = new OpenApiGeneratorV3(registry.definitions)
  const document = genarator.generateDocument({
    openapi: '3.0.0',
    info: {
      version: '1.0.0',
      title: 'Integra',
      description: 'Endpoint para a comunicação entre o frontend e o backend do projeto Integra',
    },
    servers: [{ url: 'v1' }],
  })

  router.use('/', swaggerUi.serve, swaggerUi.setup(document))

  return router
}
