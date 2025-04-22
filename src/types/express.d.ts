/* eslint-disable @typescript-eslint/no-explicit-any */
import { User } from '@/models/domain/user'

declare global {
  declare namespace Express {
    export interface Request {
      user: {
        sub: string
        email: string
      } & Partial<User>
      apiGateway: any
    }
  }
}
