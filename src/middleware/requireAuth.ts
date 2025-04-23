import { loadEnv } from '@/config/env'
import { AppError } from '@/errors/AppErro'
import { NextFunction, Request, Response } from 'express'
import jwt, { JwtHeader, SigningKeyCallback, JwtPayload } from 'jsonwebtoken'
import jwksClient from 'jwks-rsa'

const jwksClients = new Map<string, ReturnType<typeof jwksClient>>()

function getJwksClient(jwksUri: string) {
  if (!jwksClients.has(jwksUri)) {
    jwksClients.set(jwksUri, jwksClient({ jwksUri }))
  }
  return jwksClients.get(jwksUri)!
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

  const env = await loadEnv()
  const region = 'us-east-1'
  const userPoolId = env.COGNITO_USER_POOL_ID
  const issuer = `https://cognito-idp.${region}.amazonaws.com/${userPoolId}`
  const client = getJwksClient(`${issuer}/.well-known/jwks.json`)

  const getKey = (header: JwtHeader, callback: SigningKeyCallback) => {
    client.getSigningKey(header.kid!, (err, key) => {
      if (err) return callback(err)
      callback(null, key?.getPublicKey())
    })
  }

  jwt.verify(token, getKey, { issuer }, (err, decoded) => {
    if (err || !decoded || typeof decoded !== 'object') {
      throw new AppError(
        'Seu token de autenticação é inválido ou expirou. Faça login novamente',
        401,
        'INVALID_TOKEN'
      )
    }

    const payload = decoded as JwtPayload & {
      email?: string
      username?: string
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
  })
}
