import { eq } from 'drizzle-orm'
import { fakeUser } from './users'
import { getDb } from '../config/drizzle'
import { users } from '../models/schema/user'

export async function main() {
  const db = await getDb()
  const user = fakeUser()

  await db.insert(users).values(user)
  console.log('New user created!')

  const userList = await db.select().from(users)
  console.log('Getting all users from the database: ', userList)

  await db.update(users).set({ name: 'John Doe' }).where(eq(users.email, user.email))
  console.log('User info updated!')

  await db.delete(users).where(eq(users.email, user.email))
  console.log('User deleted!')
}
