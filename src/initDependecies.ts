import { getDb } from './config/drizzle'
import { makeAuthController } from './controllers/auth.controller'
import { makeProjectController } from './controllers/project.controller'
import { makeUserController } from './controllers/user.controller'
import { ProjectRepository } from './repositories/project.repository'
import { UserRepository } from './repositories/user.repository'
import { makeAuthService } from './services/auth/make-auth-service'
import { makeEmailService } from './services/email/make-email-service'
import { ProjectService } from './services/project.service'
import { UserService } from './services/user.service'

export async function initDependencies() {
  const db = await getDb()

  const emailService = await makeEmailService()
  const userRepository = new UserRepository(db)
  const userService = new UserService(userRepository)
  const userController = makeUserController(userService, emailService)
  const projectRepository = new ProjectRepository(db)
  const projectService = new ProjectService(projectRepository)
  const projectController = makeProjectController(projectService)
  const authService = await makeAuthService()
  const authController = makeAuthController(authService)

  return {
    db,
    controllers: {
      user: userController,
      project: projectController,
      auth: authController,
    },
    services: {
      user: userService,
      project: projectService,
      auth: authService,
      email: emailService,
    },
    repositories: {
      user: userRepository,
      project: projectRepository,
    },
  }
}
