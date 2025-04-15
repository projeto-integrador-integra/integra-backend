import { UserRole } from '@/constants/user'
import { AppError } from '@/errors/AppErro'
import { NextFunction, Request, Response } from 'express'

export function requiredRole(roles: UserRole[]) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    const role = req.user?.role
    if (!role || !roles.includes(role))
      throw new AppError('User role not authorized', 403, 'USER_ROLE_NOT_AUTHORIZED')
    next()
  }
}
