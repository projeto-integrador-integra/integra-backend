import Express from 'express'
import helmet from 'helmet'
import { initDependencies } from './initDependecies'
import { errorHandler } from './middleware/errorHandler'
import { injectUser } from './middleware/injectUser'
import { createDocsRoutes } from './routes/docs.routes'
import { createUserRoutes } from './routes/user.routes'
import { attachUserRole } from './middleware/attachRole'

export async function createApp() {
  const { controllers, services } = await initDependencies()
  const app = Express()
  app.use(helmet())
  app.use(Express.json())
  app.use(injectUser())
  app.use(attachUserRole(services.user))

  app.use('/users', createUserRoutes(controllers.user))
  app.use('/docs', createDocsRoutes())

  app.use(errorHandler)

  return app
}
