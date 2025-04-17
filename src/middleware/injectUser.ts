import { AppError } from '@/errors/AppErro'
import { NextFunction, Request, Response } from 'express'

export function injectUser() {
  return (req: Request, _res: Response, next?: NextFunction) => {
    if (process.env.NODE_ENV !== 'production') {
      req.user = {
        sub: req.headers.sub as string,
        email: req.headers.email as string,
      }
    }

    const event = req.apiGateway
    const claims = event?.requestContext?.authorizer?.jwt?.claims
    console.log('claims', event, claims)

    if (claims?.sub) {
      req.user = {
        sub: claims.sub,
        email: claims.email,
      }
    }

    if (!req.user.email || !req.user.sub)
      throw new AppError('User identity not found', 401, 'USER_NOT_AUTHENTICATED')

    if (next) next()
  }
}
