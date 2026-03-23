import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

interface JwtPayload {
  userId: string
}

declare global {
  namespace Express {
    interface Request {
      userId?: string
    }
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Access token missing or invalid' })
      return
    }
    
    const token = authHeader.split(' ')[1]
    const secret = process.env.JWT_ACCESS_SECRET
    
    if (!secret) {
      throw new Error('JWT_ACCESS_SECRET not configured')
    }
    
    const decoded = jwt.verify(token, secret) as JwtPayload
    req.userId = decoded.userId
    next()
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ error: 'Invalid or expired token' })
      return
    }
    next(error)
  }
}
