import { getDb } from '@/config/drizzle'
import { loadEnv } from '@/config/env'
import { DrizzleUserRepository } from '@/repositories/user.repository'
import { CognitoAuthService } from './auth.service'
import { FakeAuthService } from './fake-auth.service'

export async function makeAuthService() {
  const load = await loadEnv()
  const isDev = process.env.NODE_ENV !== 'production'
  const db = await getDb()
  const userRepository = new DrizzleUserRepository(db)

  if (isDev) {
    console.warn('🧪 Usando FakeAuthService')
    return new FakeAuthService(userRepository)
  }

  return new CognitoAuthService(load)
}
