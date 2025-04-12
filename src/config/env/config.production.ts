import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm'
import { z } from 'zod'

const schema = z.object({
  DATABASE_URL: z.string().url(),
})

export async function loadProdEnv() {
  const ssm = new SSMClient({ region: process.env.AWS_REGION ?? 'us-east-1' })

  const param = await ssm.send(
    new GetParameterCommand({
      Name: '/integra/database/url',
      WithDecryption: true,
    })
  )

  return schema.parse({
    DATABASE_URL: param.Parameter?.Value,
  })
}
