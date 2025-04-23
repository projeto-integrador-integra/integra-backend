import { AppError } from '@/errors/AppErro'
import { User } from '@/models/domain/user'
import { ListUsersQueryType } from '@/models/dto/user/list.dto'
import { UserType } from '@/models/dto/user/user.dto'
import { UserRepository } from '@/repositories/user.repository'

export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async register(data: UserType): Promise<User> {
    if (!data.email || !data.sub)
      throw new AppError('User identity not found', 401, 'USER_NOT_AUTHENTICATED')
    const existingUser = await this.userRepository.getByEmailOrSub(data.email, data.sub)
    if (existingUser) throw new AppError('User already exists', 409, 'USER_ALREADY_EXISTS')

    const user = new User(data)
    await this.userRepository.create(user)

    return user
  }

  async getById(id: string): Promise<User | null> {
    const user = await this.userRepository.getById(id)
    return user
  }

  async getBySub(sub: string): Promise<User | null> {
    const user = await this.userRepository.getBySub(sub)
    return user
  }

  async getByEmailOrSub(email: string, sub: string): Promise<User | null> {
    const user = await this.userRepository.getByEmailOrSub(email, sub)
    return user
  }

  async list(query: ListUsersQueryType): Promise<{ users: User[]; total: number }> {
    const users = await this.userRepository.findAllWithFilters(query)
    return users
  }
}
