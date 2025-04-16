import Express from 'express'
import helmet from 'helmet'
import { initDependencies } from './initDependecies'
import { requireAuth } from './middleware/auth'
import { errorHandler } from './middleware/errorHandler'
import { createDocsRoutes } from './routes/docs.routes'
import { createProjectRoutes } from './routes/project.routes'
import { createUserRoutes } from './routes/user.routes'

export async function createApp() {
  const { controllers, services } = await initDependencies()
  const app = Express()
  app.use(helmet())
  app.use(Express.json())

  app.use('/users', requireAuth(services.user), createUserRoutes(controllers.user))
  app.use('/projects', requireAuth(services.user), createProjectRoutes(controllers.project))

  app.use('/docs', createDocsRoutes())

  app.use(errorHandler)

  return app
}
