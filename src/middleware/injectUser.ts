import { NextFunction, Request, Response } from 'express'

export const injectUser = () => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (process.env.NODE_ENV !== 'production') {
      req.user = {
        sub: req.headers.sub as string,
        email: req.headers.email as string,
      }
    }

    const event = req.event
    const claims = event?.requestContext?.authorizer?.jwt?.claims

    if (claims?.sub) {
      req.user = {
        sub: claims.sub,
        email: claims.email,
      }
    }

    next()
  }
}
