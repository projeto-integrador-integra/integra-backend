import Express from 'express'
import helmet from 'helmet'
import { initDependencies } from './initDependecies'
import { errorHandler } from './middleware/errorHandler'
import { createDocsRoutes } from './routes/docs.routes'
import { protectedRoute } from './routes/protected.routes'
import { createUserRoutes } from './routes/user.routes'

export async function createApp() {
  const { controllers, services } = await initDependencies()
  const app = Express()
  app.use(helmet())
  app.use(Express.json())

  const protectedRoutes = protectedRoute(services.user)
  protectedRoutes.use('/users', createUserRoutes(controllers.user))

  app.use('/docs', createDocsRoutes())

  app.use(errorHandler)

  return app
}
