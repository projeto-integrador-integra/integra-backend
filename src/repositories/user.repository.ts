import { drizzle } from 'drizzle-orm/node-postgres'
import { User } from '@/models/domain/user'
import { users } from '@/models/schema/user'
import { eq } from 'drizzle-orm'

export class UserRepository {
  constructor(private readonly db: ReturnType<typeof drizzle>) {}

  async create(user: User): Promise<User> {
    const log = await this.db.insert(users).values(user.toObject())
    console.log('log', log)
    return user
  }

  async getById(id: string): Promise<User | null> {
    const [user] = await this.db.select().from(users).where(eq(users.id, id)).execute()

    return user ? new User(user) : null
  }
}
