import Express from 'express'
import helmet from 'helmet'
import { initDependencies } from './initDependecies'
import { createDocsRoutes } from './routes/docs.routes'
import { createUserRoutes } from './routes/user.routes'
import { injectUser } from './middleware/injectUser'

export async function createApp() {
  const app = Express()
  app.use(helmet())
  app.use(Express.json())
  app.use(injectUser())

  const { controllers } = await initDependencies()

  app.use('/users', createUserRoutes(controllers.user))

  app.use('/docs', createDocsRoutes())

  return app
}
