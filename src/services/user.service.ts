import { User } from '../models/domain/user'
import { UserCreationType } from '../models/dto/user/create.dto'
import { UserRepository } from '../repositories/user.repository'

export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async register(data: UserCreationType): Promise<User> {
    // TODO: check if user already exists

    const user = new User(data)
    await this.userRepository.create(user)

    return user
  }

  async getById(id: string): Promise<User | null> {
    const user = await this.userRepository.getById(id)
    if (!user) {
      throw new Error('User not found')
    }
    return user
  }
}
