import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm'
import { z } from 'zod'

const schema = z.object({
  DATABASE_URL: z.string().url(),
  RESEND_API_KEY: z.string().min(1),
  COGNITO_USER_POOL_ID: z.string().min(1),
  COGNITO_CLIENT_ID: z.string().min(1),
  COGNITO_CLIENT_SECRET: z.string().min(1),
})

export async function loadProdEnv() {
  const ssm = new SSMClient({ region: process.env.AWS_REGION ?? 'us-east-1' })

  const [dbUrl, resendApi, userPoolId, clientId, clientSecret] = await Promise.all([
    ssm.send(
      new GetParameterCommand({
        Name: '/integra/database/url',
        WithDecryption: true,
      })
    ),
    ssm.send(
      new GetParameterCommand({
        Name: '/integra/email/api_key',
        WithDecryption: true,
      })
    ),
    ssm.send(
      new GetParameterCommand({
        Name: '/integra/cognito/userPoolId',
        WithDecryption: true,
      })
    ),
    ssm.send(
      new GetParameterCommand({
        Name: '/integra/cognito/clientId',
        WithDecryption: true,
      })
    ),
    ssm.send(
      new GetParameterCommand({
        Name: '/integra/cognito/clientSecret',
        WithDecryption: true,
      })
    ),
  ])

  console.log('Loaded environment variables from SSM')

  return schema.parse({
    DATABASE_URL: dbUrl.Parameter?.Value,
    RESEND_API_KEY: resendApi.Parameter?.Value,
    COGNITO_USER_POOL_ID: userPoolId.Parameter?.Value,
    COGNITO_CLIENT_ID: clientId.Parameter?.Value,
    COGNITO_CLIENT_SECRET: clientSecret.Parameter?.Value,
  })
}
