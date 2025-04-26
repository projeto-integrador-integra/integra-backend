import {
  AdminConfirmSignUpCommand,
  AdminInitiateAuthCommand,
  GlobalSignOutCommand,
  SignUpCommand,
} from '@aws-sdk/client-cognito-identity-provider'

import { cognitoClient } from '@/config/cognito'
import { loadEnv } from '@/config/env'
import { AppError } from '@/errors/AppErro'

export interface AuthService {
  signUp: (input: { email: string; password: string }) => Promise<void>
  signIn: (input: { email: string; password: string }) => Promise<{
    accessToken: string
    idToken: string
    refreshToken?: string
  }>
  signOut: (token: string) => Promise<void>
  refreshTokens: (refreshToken: string) => Promise<{
    accessToken: string
    idToken: string
    refreshToken?: string
  }>
}

export class CognitoAuthService implements AuthService {
  private env: Awaited<ReturnType<typeof loadEnv>>

  constructor(env: Awaited<ReturnType<typeof loadEnv>>) {
    this.env = env
  }

  async signUp({ email, password }: { email: string; password: string }) {
    try {
      await cognitoClient.send(
        new SignUpCommand({
          ClientId: this.env.COGNITO_CLIENT_ID,
          Username: email,
          Password: password,
          UserAttributes: [{ Name: 'email', Value: email }],
        })
      )

      await cognitoClient.send(
        new AdminConfirmSignUpCommand({
          UserPoolId: this.env.COGNITO_USER_POOL_ID,
          Username: email,
        })
      )
    } catch (err: unknown) {
      const message = this.extractErrorMessage(err)
      if (message !== 'User already exists') {
        throw new AppError(message, 400, 'SIGNUP_FAILED')
      }
    }
  }

  async signIn({ email, password }: { email: string; password: string }) {
    try {
      const response = await cognitoClient.send(
        new AdminInitiateAuthCommand({
          UserPoolId: this.env.COGNITO_USER_POOL_ID,
          ClientId: this.env.COGNITO_CLIENT_ID,
          AuthFlow: 'ADMIN_USER_PASSWORD_AUTH',
          AuthParameters: {
            USERNAME: email,
            PASSWORD: password,
          },
        })
      )

      const tokens = response.AuthenticationResult

      if (!tokens?.AccessToken || !tokens?.IdToken) {
        throw new AppError('Tokens inválidos.', 401, 'INVALID_TOKENS')
      }

      return {
        accessToken: tokens.AccessToken,
        idToken: tokens.IdToken,
        refreshToken: tokens.RefreshToken,
      }
    } catch (err: unknown) {
      const message = this.extractErrorMessage(err)
      throw new AppError(message, 401, 'SIGNIN_FAILED')
    }
  }

  async signOut(token: string) {
    try {
      await cognitoClient.send(new GlobalSignOutCommand({ AccessToken: token }))
    } catch (err: unknown) {
      const message = this.extractErrorMessage(err)
      throw new AppError(message, 401, 'SIGNOUT_FAILED')
    }
  }

  async refreshTokens(refreshToken: string) {
    try {
      const response = await cognitoClient.send(
        new AdminInitiateAuthCommand({
          UserPoolId: this.env.COGNITO_USER_POOL_ID,
          ClientId: this.env.COGNITO_CLIENT_ID,
          AuthFlow: 'REFRESH_TOKEN_AUTH',
          AuthParameters: {
            REFRESH_TOKEN: refreshToken,
          },
        })
      )

      const tokens = response.AuthenticationResult

      if (!tokens?.AccessToken || !tokens?.IdToken) {
        throw new AppError('Tokens inválidos', 401, 'INVALID_TOKENS')
      }

      return {
        accessToken: tokens.AccessToken,
        idToken: tokens.IdToken,
        refreshToken: tokens.RefreshToken,
      }
    } catch (err: unknown) {
      const message = this.extractErrorMessage(err)
      throw new AppError(message, 401, 'REFRESH_TOKENS_FAILED')
    }
  }

  private extractErrorMessage(err: unknown): string {
    return typeof err === 'object' && err !== null && 'message' in err
      ? String(err.message)
      : 'Erro desconhecido.'
  }
}
