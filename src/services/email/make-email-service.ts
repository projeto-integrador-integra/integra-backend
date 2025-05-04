import { ResendEmailService } from './email.service'
import { FakeEmailService } from './fake-email.service'
import { loadEnv } from '@/config/env'

export async function makeEmailService() {
  const load = await loadEnv()
  const isDev = process.env.NODE_ENV !== 'production'

  if (isDev || !load.RESEND_API_KEY) {
    console.warn('🧪 Usando FakeEmailService.')
    return new FakeEmailService()
  }

  return new ResendEmailService(load.RESEND_API_KEY)
}
