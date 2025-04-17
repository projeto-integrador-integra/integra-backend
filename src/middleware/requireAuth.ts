import type { RequestHandler } from 'express'
import { injectUser } from './injectUser'
import { attachUserRole } from './attachRole'
import type { UserService } from '@/services/user.service'

export function requireAuth(userService: UserService): RequestHandler {
  const inject = injectUser()
  const attach = attachUserRole(userService)

  return async (req, res, next) => {
    try {
      await Promise.resolve(inject(req, res))
      await Promise.resolve(attach(req, res, next))
    } catch (err) {
      next(err)
    }
  }
}
