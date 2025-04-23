import { drizzle } from 'drizzle-orm/node-postgres'
import { User } from '@/models/domain/user'
import { users } from '@/models/schema/user'
import { and, count, desc, eq, ilike, or } from 'drizzle-orm'
import { ListUsersQueryType } from '@/models/dto/user/list.dto'

export class UserRepository {
  constructor(private readonly db: ReturnType<typeof drizzle>) {}

  async create(user: User): Promise<User> {
    await this.db.insert(users).values(user.toObject())
    return user
  }

  async getById(id: string): Promise<User | null> {
    const [user] = await this.db.select().from(users).where(eq(users.id, id)).execute()
    return user ? new User(user) : null
  }

  async getBySub(sub: string): Promise<User | null> {
    const [user] = await this.db.select().from(users).where(eq(users.sub, sub)).execute()
    return user ? new User(user) : null
  }

  async getByEmail(email: string): Promise<User | null> {
    const [user] = await this.db.select().from(users).where(eq(users.email, email)).execute()
    return user ? new User(user) : null
  }

  async getByEmailOrSub(email: string, sub: string): Promise<User | null> {
    const [user] = await this.db
      .select()
      .from(users)
      .where(or(eq(users.email, email), eq(users.sub, sub)))
      .execute()
    return user ? new User(user) : null
  }

  async findAllWithFilters(query: ListUsersQueryType): Promise<{ users: User[]; total: number }> {
    const { limit, page } = query
    const conditions = []
    if (query.role) {
      conditions.push(eq(users.role, query.role))
    }
    if (query.approvalStatus) {
      conditions.push(eq(users.approvalStatus, query.approvalStatus))
    }
    if (query.name) {
      conditions.push(ilike(users.name, query.name))
    }

    const usersList = await this.db
      .select()
      .from(users)
      .limit(limit)
      .offset((page - 1) * limit)
      .orderBy(desc(users.createdAt))
      .where(and(...conditions))
      .execute()

    const [totalResult] = await this.db
      .select({ count: count() })
      .from(users)
      .where(and(...conditions))
      .execute()

    return { users: usersList.map((user) => new User(user)), total: Number(totalResult.count) }
  }
}
