import { AppError } from '@/errors/AppErro'
import { Request, Response, NextFunction } from 'express'

export function errorHandler(err: AppError, _req: Request, res: Response, next: NextFunction) {
  const statusCode = err.statusCode || 500
  console.error(err)

  res.status(statusCode).json({
    code: err.code || 'INTERNAL_SERVER_ERROR',
    message: err.message || 'Erro interno do servidor.',
  })

  next()
}
