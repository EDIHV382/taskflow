import { Request, Response, NextFunction } from 'express'
import { AuthService } from '../services/auth.service.js'
import { registerSchema, loginSchema } from '../validators/auth.validator.js'
import cookie from 'cookie'

const authService = new AuthService()

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = registerSchema.parse(req.body)
      const result = await authService.register(validatedData)
      res.status(201).json(result)
    } catch (error) {
      next(error)
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = loginSchema.parse(req.body)
      const result = await authService.login(validatedData)
      
      // Set refresh token in httpOnly cookie
      const refreshTokenCookie = cookie.serialize('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: '/',
      })
      
      res.setHeader('Set-Cookie', refreshTokenCookie)
      res.status(200).json({
        user: result.user,
        accessToken: result.accessToken,
      })
    } catch (error) {
      next(error)
    }
  }

  async logout(_req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const refreshToken = _req.cookies.refreshToken
      
      if (refreshToken) {
        await authService.logout(refreshToken)
      }
      
      // Clear the cookie
      const clearCookie = cookie.serialize('refreshToken', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 0,
        path: '/',
      })
      
      res.setHeader('Set-Cookie', clearCookie)
      return res.status(200).json({ message: 'Logged out successfully' })
    } catch (error) {
      next(error)
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies.refreshToken
      
      if (!refreshToken) {
        res.status(401).json({ error: 'Refresh token missing' })
        return
      }
      
      const result = await authService.refresh(refreshToken)
      
      // Set new refresh token in cookie
      const refreshTokenCookie = cookie.serialize('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60,
        path: '/',
      })
      
      res.setHeader('Set-Cookie', refreshTokenCookie)
      res.status(200).json({ accessToken: result.accessToken })
    } catch (error) {
      next(error)
    }
  }

  async me(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const userId = req.userId
      
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' })
      }
      
      const user = await authService.getUserById(userId)
      return res.status(200).json(user)
    } catch (error) {
      next(error)
    }
  }
}
