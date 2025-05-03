import { NextFunction, Request, Response } from 'express'
import { decode, JwtHeader, JwtPayload, verify } from 'jsonwebtoken'
import jwksClient from 'jwks-rsa'

import { loadEnv } from '@/config/env'
import { AppError } from '@/errors/AppErro'

const jwksClients = new Map<string, ReturnType<typeof jwksClient>>()

function getJwksClient(jwksUri: string) {
  if (!jwksClients.has(jwksUri)) {
    jwksClients.set(jwksUri, jwksClient({ jwksUri }))
  }
  return jwksClients.get(jwksUri)!
}

async function verifyTokenProd(token: string, issuer: string) {
  const client = getJwksClient(`${issuer}/.well-known/jwks.json`)

  const getKey = (header: JwtHeader, callback: (err: Error | null, key?: string) => void) => {
    client.getSigningKey(header.kid!, (err, key) => {
      if (err) return callback(err)
      callback(null, key?.getPublicKey())
    })
  }

  return new Promise<JwtPayload>((resolve, reject) => {
    verify(token, getKey, { issuer }, (err, decoded) => {
      if (err || typeof decoded !== 'object' || !decoded) {
        return reject(
          new AppError(
            'Seu token de autenticação é inválido ou expirou. Faça login novamente',
            401,
            'INVALID_TOKEN'
          )
        )
      }
      resolve(decoded as JwtPayload)
    })
  })
}

function verifyTokenDev(token: string) {
  const decoded = decode(token) as JwtPayload | null

  if (!decoded || typeof decoded !== 'object') {
    throw new AppError(
      'Token inválido para ambiente de desenvolvimento. Geração incorreta.',
      401,
      'INVALID_DEV_TOKEN'
    )
  }

  return decoded
}

export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const token = req.cookies?.idToken
  if (!token) {
    throw new AppError(
      'Seu token de autenticação é inválido ou expirou. Faça login novamente',
      401,
      'INVALID_TOKEN'
    )
  }

  const isDev = process.env.NODE_ENV !== 'production'

  try {
    let payload: JwtPayload

    if (isDev) {
      payload = verifyTokenDev(token)
    } else {
      const env = await loadEnv()
      const region = 'us-east-1'
      const issuer = `https://cognito-idp.${region}.amazonaws.com/${env.COGNITO_USER_POOL_ID}`
      payload = await verifyTokenProd(token, issuer)
    }

    if (!payload.sub || (!payload.email && !payload.username)) {
      throw new AppError(
        'Seu token de autenticação é inválido ou expirou. Faça login novamente',
        401,
        'INVALID_TOKEN'
      )
    }

    req.user = {
      sub: payload.sub,
      email: payload.email ?? payload.username ?? '',
    }

    next()
  } catch (err) {
    next(err)
  }
}
