// src/services/email/make-email-service.ts

import { ResendEmailService } from './email.service'
import { FakeEmailService } from './fake-email.service'
import { loadEnv } from '@/config/env'

export async function makeEmailService() {
  const load = await loadEnv()
  const isDev = process.env.NODE_ENV !== 'production'

  if (isDev || !load.RESEND_API_KEY) {
    console.warn('🧪 RESEND_API_KEY não encontrada ou ambiente de dev. Usando FakeEmailService.')
    return new FakeEmailService()
  }

  return new ResendEmailService(load.RESEND_API_KEY)
}
