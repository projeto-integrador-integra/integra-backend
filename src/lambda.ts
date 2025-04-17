import { APIGatewayProxyEventV2, Context } from 'aws-lambda'
import serverless from 'serverless-http'
import { createApp } from './app'
import { Request } from 'express'

let cachedHandler: serverless.Handler | null = null

export const handler = async (event: APIGatewayProxyEventV2, context: Context) => {
  if (!cachedHandler) {
    const app = await createApp()

    cachedHandler = serverless(app, {
      request: (req: Request, ev: APIGatewayProxyEventV2) => {
        req.url = ev.rawPath.replace(/^\/(default|prod|stage)?/, '').replace(/^\/api/, '') || '/'
      },
    })
  }

  return cachedHandler(event, context)
}
