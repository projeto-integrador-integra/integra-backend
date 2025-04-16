import { AppError } from '@/errors/AppErro'
import { UserCreationSchema } from '@/models/dto/user/create.dto'
import { ListUsersQuerySchema } from '@/models/dto/user/list.dto'
import { UserService } from '@/services/user.service'
import { Request, Response } from 'express'

export interface UserController {
  createUser: (req: Request, res: Response) => Promise<void>
  listUsers: (req: Request, res: Response) => Promise<void>
  getUserById: (req: Request, res: Response) => Promise<void>
  updateUserById: (req: Request, res: Response) => Promise<void>
  getCurrentUser: (req: Request, res: Response) => Promise<void>
}

export function makeUserController(userService: UserService): UserController {
  return {
    async createUser(req: Request, res: Response) {
      const data = UserCreationSchema.parse(req.body)
      const { email, sub } = req.user
      const user = await userService.register({ ...data, email, sub, approvalStatus: 'pending' })
      res.status(201).json(user.toObject())
    },

    async getUserById(req: Request, res: Response) {
      const { id } = req.params
      const user = await userService.getById(id)
      if (!user) throw new AppError('User not found', 404, 'USER_NOT_FOUND')
      res.status(200).json(user.toObject())
    },

    async listUsers(req: Request, res: Response) {
      const query = ListUsersQuerySchema.parse(req.query)
      const usersList = await userService.list(query)
      res.status(200).json({
        users: usersList.users.map((user) => user.toObject()),
        total: usersList.total,
        page: query.page,
        limit: query.limit,
      })
    },

    async updateUserById(req: Request, res: Response) {
      // TODO: Implement update user logic

      res.status(200).json({
        message: 'User updated successfully',
      })
    },

    async getCurrentUser(req: Request, res: Response) {
      // TODO: Implement get me logic

      res.status(200).json({
        id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        sub: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        role: 'admin',
        name: 'string',
        email: 'user@example.com',
        description: 'string',
        createdAt: 'string',
        updatedAt: 'string',
        approvalStatus: 'pending',
      })
    },
  }
}
