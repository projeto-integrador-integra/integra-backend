import type { CookieOptions, Request } from 'express'

export function getCookieOptions(req: Request): CookieOptions {
  console.log('getCookieOptions', req.hostname, process.env.NODE_ENV)

  return {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    maxAge: 1000 * 60 * 60,
  }
}
