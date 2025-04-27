import { User } from '@/models/domain/user'
import { UserRepository } from './user.repository'
import { ListUsersQueryType } from '@/models/dto/user/list.dto'

export class FakeUserRepository implements UserRepository {
  db: User[] = []

  constructor() {
    this.db = []
  }

  async create(user: User): Promise<User> {
    this.db.push(user)
    return user
  }

  async getById(id: string): Promise<User | null> {
    const [user] = await this.db.filter((user: User) => user.id === id)
    return user ? new User(user) : null
  }

  async getBySub(sub: string): Promise<User | null> {
    const [user] = await this.db.filter((user: User) => user.sub === sub)
    return user ? new User(user) : null
  }

  async getByEmail(email: string): Promise<User | null> {
    const [user] = await this.db.filter((user: User) => user.email === email)
    return user ? new User(user) : null
  }

  async getByEmailOrSub(email: string, sub: string): Promise<User | null> {
    const [user] = await this.db.filter((user: User) => user.email === email || user.sub === sub)
    return user ? new User(user) : null
  }

  async findAllWithFilters(query: ListUsersQueryType): Promise<{ users: User[]; total: number }> {
    const usersList = this.db.filter((user: User) => {
      let match = true
      if (query.role) {
        match = match && user.role === query.role
      }
      if (query.approvalStatus) {
        match = match && user.approvalStatus === query.approvalStatus
      }
      if (query.name) {
        match = match && user.name.includes(query.name)
      }
      return match
    })

    return { users: usersList.map((user: User) => new User(user)), total: usersList.length }
  }

  clean() {
    this.db = []
  }
}
