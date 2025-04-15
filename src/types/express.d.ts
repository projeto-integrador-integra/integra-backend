import { UserRole } from '@/constants/user'
import { APIGatewayProxyEvent } from 'aws-lambda'

declare global {
  declare namespace Express {
    export interface Request {
      user: {
        sub: string
        email: string
        role?: UserRole
      }
      event?: APIGatewayProxyEvent
    }
  }
}
