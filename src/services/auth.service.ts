import {
  SignUpCommand,
  AdminConfirmSignUpCommand,
  AdminInitiateAuthCommand,
  CognitoIdentityProviderClient,
} from '@aws-sdk/client-cognito-identity-provider'

import { AppError } from '@/errors/AppErro'
import { loadEnv } from '@/config/env'

export interface AuthService {
  signUp: (input: { email: string; password: string }) => Promise<void>
  signIn: (input: { email: string; password: string }) => Promise<{
    accessToken: string
    idToken: string
    refreshToken?: string
  }>
}

export async function makeAuthService(): Promise<AuthService> {
  const load = await loadEnv()
  const cognito = new CognitoIdentityProviderClient({
    region: 'us-east-1',
  })

  return {
    async signUp({ email, password }) {
      try {
        await cognito.send(
          new SignUpCommand({
            ClientId: load.COGNITO_CLIENT_ID,
            Username: email,
            Password: password,
            UserAttributes: [{ Name: 'email', Value: email }],
          })
        )

        await cognito.send(
          new AdminConfirmSignUpCommand({
            UserPoolId: load.COGNITO_USER_POOL_ID!,
            Username: email,
          })
        )
      } catch (err: unknown) {
        const message =
          typeof err === 'object' && err !== null && 'message' in err
            ? String(err.message)
            : 'Erro ao criar usuário.'
        if (message !== 'User already exists') throw new AppError(message, 400, 'SIGNUP_FAILED')
      }
    },

    async signIn({ email, password }) {
      try {
        const response = await cognito.send(
          new AdminInitiateAuthCommand({
            UserPoolId: load.COGNITO_USER_POOL_ID!,
            ClientId: load.COGNITO_CLIENT_ID!,
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
        const message =
          typeof err === 'object' && err !== null && 'message' in err
            ? String(err.message)
            : 'Erro ao fazer login.'
        throw new AppError(message, 401, 'SIGNIN_FAILED')
      }
    },
  }
}
