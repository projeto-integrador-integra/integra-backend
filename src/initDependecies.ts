import { getDb } from './config/drizzle'
import { UserRepository } from './repositories/user.repository'
import { UserService } from './services/user.service'
import { makeUserController } from './controllers/user.controller'

export async function initDependencies() {
  const db = await getDb()

  const userRepository = new UserRepository(db)
  const userService = new UserService(userRepository)
  const userController = makeUserController(userService)

  return {
    db,
    controllers: {
      user: userController,
    },
    services: {
      user: userService,
    },
    repositories: {
      user: userRepository,
    },
  }
}
