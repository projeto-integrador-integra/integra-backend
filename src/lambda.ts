import { APIGatewayProxyEvent, Context } from 'aws-lambda'
import serverless from 'serverless-http'
import { createApp } from './app'

let cachedHandler: serverless.Handler | null = null

export const handler = async (event: APIGatewayProxyEvent, context: Context) => {
  if (!cachedHandler) {
    const app = await createApp()
    cachedHandler = serverless(app)
  }

  return cachedHandler(event, context)
}
