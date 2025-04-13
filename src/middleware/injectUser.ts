import { APIGatewayProxyEvent } from 'aws-lambda'
import { NextFunction, Request, Response } from 'express'

export interface AuthenticatedUser {
  sub: string
  email: string
}

export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser
  event?: APIGatewayProxyEvent
}

export function isAuthenticatedRequest(req: unknown): req is AuthenticatedRequest {
  return typeof req === 'object'
}

export const injectUser = () => {
  return (req: unknown, _res: Response, next: NextFunction) => {
    if (!isAuthenticatedRequest(req)) return next()

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
