import { Request, Response } from 'express'
import { UserCreationSchema } from '../models/dto/user/create.dto'
import { UserService } from '../services/user.service'

export interface UserController {
  createUser: (req: Request, res: Response) => Promise<void>
  getUser: (req: Request, res: Response) => Promise<void>
}

export function makeUserController(userService: UserService) {
  return {
    async createUser(req: Request, res: Response) {
      const data = UserCreationSchema.parse(req.body)
      const { email, sub } = req.user
      const user = await userService.register({ ...data, email, sub, approvalStatus: 'pending' })

      res.status(201).json({
        message: 'Usuário criado com sucesso!',
        user: user.toObject(),
      })
    },

    async getUser(req: Request, res: Response) {
      const { id } = req.params
      const user = await userService.getById(id)
      res.json({ message: 'Usuário retornado com sucesso!', user: user?.toObject() })
    },
  }
}
