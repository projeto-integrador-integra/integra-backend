import 'dotenv/config'
import { drizzle } from 'drizzle-orm/node-postgres'
import { loadEnv } from './env'

let dbInstance: ReturnType<typeof drizzle> | null = null

export async function getDb() {
  if (dbInstance) return dbInstance
  const env = await loadEnv()
  dbInstance = drizzle(env.DATABASE_URL)
  return dbInstance
}
