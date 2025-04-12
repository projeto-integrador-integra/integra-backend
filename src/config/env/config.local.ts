import { config as loadDotenv } from 'dotenv'
import { z } from 'zod'

loadDotenv()

const schema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  POSTGRES_HOST: z.string(),
  POSTGRES_PORT: z.coerce.number().int().positive(),
  POSTGRES_USER: z.string(),
  POSTGRES_PASSWORD: z.string(),
  POSTGRES_DB: z.string(),
})

export function loadLocalEnv() {
  const parsed = schema.parse(process.env)
  return {
    DATABASE_URL: `postgres://${parsed.POSTGRES_USER}:${parsed.POSTGRES_PASSWORD}@${parsed.POSTGRES_HOST}:${parsed.POSTGRES_PORT}/${parsed.POSTGRES_DB}`,
  }
}
