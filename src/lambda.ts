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
        console.log('--- event debug ---')
        console.log('event.version:', event.version)
        console.log('isBase64Encoded:', event.isBase64Encoded)
        console.log('event.headers:', event.headers)
        console.log('event.body (first 100):', event.body?.slice?.(0, 100))
        console.log('req.headers:', req.headers)
        console.log(
          'req.body type:',
          typeof req.body,
          Buffer.isBuffer(req.body) ? 'Buffer' : 'Not Buffer'
        )
        console.log('-------------------')

        req.url = ev.rawPath.replace(/^\/(default|prod|stage)?/, '').replace(/^\/api/, '') || '/'
      },
    })
  }

  return cachedHandler(event, context)
}
