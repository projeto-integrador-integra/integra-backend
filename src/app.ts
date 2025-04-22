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
import { requireAccess } from './middleware/requireAccess'

export async function createApp() {
  const { controllers, services } = await initDependencies()
  const app = Express()
  const api = Express.Router()
  app.use(cors({ origin: 'http://localhost:5173', credentials: true }))
  app.use(helmet({ crossOriginResourcePolicy: false, crossOriginEmbedderPolicy: false }))
  app.use(Express.json())
  app.use(cookieParser())

  api.use(createAuthRouter(controllers.auth))
  api.use('/users', requireAuth, createUserRoutes(services.user, controllers.user))
  api.use(
    '/projects',
    requireAuth,
    requireAccess(services.user),
    createProjectRoutes(services.user, controllers.project)
  )
  api.use('/docs', createDocsRoutes())

  app.use('/api', api)

  app.use(errorHandler)

  return app
}
