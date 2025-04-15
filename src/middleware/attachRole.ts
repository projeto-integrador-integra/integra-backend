import { AppError } from '@/errors/AppErro'
import { UserService } from '@/services/user.service'
import { NextFunction, Request, Response } from 'express'

export function attachUserRole(userService: UserService) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user?.sub) throw new AppError('Missing user sub', 401, 'UNAUTHORIZED')
    const user = await userService.getBySub(req.user.sub)
    console.log('user', user)
    if (!user) throw new AppError('User not found', 404, 'USER_NOT_FOUND')
    if (!user.role) throw new AppError('User role not found', 404, 'USER_ROLE_NOT_FOUND')
    req.user.role = user.role
    next()
  }
}
