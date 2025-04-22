import type { CookieOptions, Request } from 'express'

export function getCookieOptions(req: Request): CookieOptions {
  console.log('getCookieOptions', req.hostname, process.env.NODE_ENV)
  const isLocalhost = req.hostname === 'localhost' || req.hostname.startsWith('127.')

  return {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    ...(isLocalhost ? {} : { domain: '.chambytes.dev' }),
    maxAge: 1000 * 60 * 60,
  }
}
