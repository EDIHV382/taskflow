import { Response } from 'express'
import { ZodError } from 'zod'

export const errorHandler = (err: Error, _req: unknown, res: Response, _next: unknown) => {
  console.error(err.stack)
  
  // Zod validation error
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'Validation error',
      details: err.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    })
  }
  
  // Prisma error
  if (err.name === 'PrismaClientKnownRequestError') {
    return res.status(400).json({
      error: 'Database error',
      message: err.message,
    })
  }
  
  // Default error
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500
  res.status(statusCode).json({
    error: err.message || 'Internal server error',
  })
  
  return undefined
}
