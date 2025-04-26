import jwt, { decode, JwtPayload } from 'jsonwebtoken'
import { randomUUID } from 'node:crypto'

import { AuthService } from './auth.service'
import { AppError } from '@/errors/AppErro'
import { UserRepository } from '@/repositories/user.repository'

const FAKE_SECRET = 'fakeSecret'

export class FakeAuthService implements AuthService {
  private userRepository: UserRepository

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository
  }

  async signUp({ email }: { email: string }) {
    console.log('[FakeAuthService] signUp', email)
  }

  async signIn({ email }: { email: string }) {
    const user = await this.userRepository.getByEmail(email)

    const payload = {
      sub: user?.sub ?? randomUUID(),
      email,
    }

    const token = jwt.sign(payload, FAKE_SECRET, {
      expiresIn: '10h',
    })

    console.log('[FakeAuthService] signIn', email)
    return {
      accessToken: token,
      idToken: token,
      refreshToken: token,
    }
  }

  async signOut(token: string) {
    console.log('[FakeAuthService] signOut', token)
  }

  async refreshTokens(refreshToken: string) {
    const decoded = decode(refreshToken) as JwtPayload | null
    if (!decoded || typeof decoded !== 'object') {
      throw new AppError(
        'Token inválido para ambiente de desenvolvimento. Geração incorreta.',
        401,
        'INVALID_DEV_TOKEN'
      )
    }

    const { sub, email } = decoded
    const newPayload = { sub, email }

    const token = jwt.sign(newPayload, FAKE_SECRET, {
      expiresIn: '10h',
    })

    console.log('[FakeAuthService] refreshTokens', refreshToken)
    return {
      accessToken: token,
      idToken: token,
      refreshToken: token,
    }
  }
}
