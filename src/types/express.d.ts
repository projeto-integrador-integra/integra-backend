/* eslint-disable @typescript-eslint/no-explicit-any */
import { UserRole } from '@/constants/user'

declare global {
  declare namespace Express {
    export interface Request {
      user: {
        sub: string
        email: string
        role?: UserRole
      }
      apiGateway: any
    }
  }
}
