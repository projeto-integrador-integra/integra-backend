import type { CookieOptions, Request } from 'express'

export function getCookieOptions(req: Request): CookieOptions {
  const isLocalhost = req.hostname === 'localhost' || req.hostname.startsWith('127.')
  const isSecure = process.env.NODE_ENV === 'production' && !isLocalhost

  return {
    httpOnly: true,
    secure: isSecure,
    sameSite: isSecure ? 'strict' : 'lax',
    maxAge: 1000 * 60 * 60,
  }
}
