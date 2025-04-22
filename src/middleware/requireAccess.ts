import { UserRole } from '@/constants/user'
import { AppError } from '@/errors/AppErro'
import { UserSchema } from '@/models/dto/user/user.dto'
import { UserService } from '@/services/user.service'
import { NextFunction, Request, Response } from 'express'

export function requireAccess(userService: UserService, roles?: UserRole[]) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user?.sub) throw new AppError('Missing user sub', 401, 'UNAUTHORIZED')

    const result = UserSchema.safeParse(req.user)
    const user = result.success ? result.data : await userService.getBySub(req.user.sub)

    if (!user || user.approvalStatus === 'pending') {
      throw new AppError('User not approved yet', 403, 'USER_NOT_APPROVED')
    }

    req.user = { ...req.user, ...user }

    if (roles && !roles.includes(user.role) && user.role !== 'admin') {
      throw new AppError('User role not authorized', 403, 'USER_ROLE_NOT_AUTHORIZED')
    }

    next()
  }
}
