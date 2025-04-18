import cookieParser from 'cookie-parser'
import Express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import { initDependencies } from './initDependecies'
import { errorHandler } from './middleware/errorHandler'
import { requireAuth } from './middleware/requireAuth'
import { createAuthRouter } from './routes/auth.routes.ts'
import { createDocsRoutes } from './routes/docs.routes'
import { createProjectRoutes } from './routes/project.routes'
import { createUserRoutes } from './routes/user.routes'

export async function createApp() {
  const { controllers, services } = await initDependencies()
  const app = Express()
  app.use(cors({ origin: 'http://localhost:5173', credentials: true }))
  app.use(helmet({ crossOriginResourcePolicy: false, crossOriginEmbedderPolicy: false }))
  app.use(Express.json())
  app.use(cookieParser())

  app.use(createAuthRouter(controllers.auth))

  app.use('/users', requireAuth(services.user), createUserRoutes(controllers.user))
  app.use('/projects', requireAuth(services.user), createProjectRoutes(controllers.project))

  app.use('/docs', createDocsRoutes())

  app.use(errorHandler)

  return app
}
