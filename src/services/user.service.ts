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

  async update(creator: User, id: string, data: Partial<UserType>): Promise<User> {
    if (creator.role !== 'admin') {
      delete data.approvalStatus
      delete data.role
      if (creator.id !== id) throw new AppError('User not authorized', 403, 'USER_NOT_AUTHORIZED')
    }

    const prevUser = await this.userRepository.getById(id)
    if (!prevUser) throw new AppError('User not found', 404, 'USER_NOT_FOUND')

    const user = User.fromObject({ ...prevUser.toObject(), ...data })
    return await this.userRepository.update(user)
  }

  async getById(id: string): Promise<User | null> {
    const user = await this.userRepository.getById(id)
    return user
  }

  async getBySub(sub: string): Promise<User | null> {
    const user = await this.userRepository.getBySub(sub)
    return user
  }

  async getByEmail(email: string): Promise<User | null> {
    const user = await this.userRepository.getByEmail(email)
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
