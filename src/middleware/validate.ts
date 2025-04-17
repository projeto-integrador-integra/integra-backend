import type { NextFunction, Request, Response } from 'express'
import { ZodError, ZodSchema } from 'zod'

export default (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('Headers:', req.headers)
    console.log('Request body:', req.body)
    const result = schema.parse(req.body)
    console.log('Parsed result:', result)
    req.body = result
    next()
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(422).json({ errors: error.flatten() })
      return
    }
    next(error)
  }
}
