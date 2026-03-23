import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { UserRepository } from '../repositories/user.repository.js'
import { RefreshTokenRepository } from '../repositories/refreshToken.repository.js'
import { RegisterInput, LoginInput } from '../validators/auth.validator.js'

const userRepository = new UserRepository()
const refreshTokenRepository = new RefreshTokenRepository()

export class AuthService {
  async register(data: RegisterInput) {
    const existingUser = await userRepository.findByEmail(data.email)
    
    if (existingUser) {
      throw new Error('Email already registered')
    }
    
    const hashedPassword = await bcrypt.hash(data.password, 10)
    
    const user = await userRepository.create({
      name: data.name,
      email: data.email,
      password: hashedPassword,
    })
    
    const accessToken = this.generateAccessToken(user.id)
    const refreshToken = this.generateRefreshToken(user.id)
    
    await refreshTokenRepository.create(
      refreshToken,
      user.id,
      this.getRefreshTokenExpiration()
    )
    
    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      accessToken,
    }
  }

  async login(data: LoginInput) {
    const user = await userRepository.findByEmail(data.email)
    
    if (!user) {
      throw new Error('Invalid credentials')
    }
    
    const isPasswordValid = await bcrypt.compare(data.password, user.password)
    
    if (!isPasswordValid) {
      throw new Error('Invalid credentials')
    }
    
    const accessToken = this.generateAccessToken(user.id)
    const refreshToken = this.generateRefreshToken(user.id)
    
    await refreshTokenRepository.create(
      refreshToken,
      user.id,
      this.getRefreshTokenExpiration()
    )
    
    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      accessToken,
      refreshToken,
    }
  }

  async logout(refreshToken: string) {
    await refreshTokenRepository.deleteByToken(refreshToken)
  }

  async refresh(refreshToken: string) {
    const tokenRecord = await refreshTokenRepository.findByToken(refreshToken)
    
    if (!tokenRecord) {
      throw new Error('Invalid refresh token')
    }
    
    if (tokenRecord.expiresAt < new Date()) {
      await refreshTokenRepository.deleteByToken(refreshToken)
      throw new Error('Refresh token expired')
    }
    
    const newAccessToken = this.generateAccessToken(tokenRecord.userId)
    const newRefreshToken = this.generateRefreshToken(tokenRecord.userId)
    
    await refreshTokenRepository.deleteByToken(refreshToken)
    await refreshTokenRepository.create(
      newRefreshToken,
      tokenRecord.userId,
      this.getRefreshTokenExpiration()
    )
    
    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    }
  }

  async getUserById(userId: string) {
    const user = await userRepository.findById(userId)
    
    if (!user) {
      throw new Error('User not found')
    }
    
    return {
      id: user.id,
      name: user.name,
      email: user.email,
    }
  }

  private generateAccessToken(userId: string): string {
    const secret = process.env.JWT_ACCESS_SECRET as string
    const expiresIn = process.env.ACCESS_TOKEN_EXPIRES_IN || '15m'
    
    if (!secret) {
      throw new Error('JWT_ACCESS_SECRET not configured')
    }
    
    // @ts-ignore - expiresIn accepts string like '15m', '1h', '7d'
    return jwt.sign({ userId }, secret, { expiresIn }) as string
  }

  private generateRefreshToken(userId: string): string {
    const secret = process.env.JWT_REFRESH_SECRET as string
    const expiresIn = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d'
    
    if (!secret) {
      throw new Error('JWT_REFRESH_SECRET not configured')
    }
    
    // @ts-ignore - expiresIn accepts string like '15m', '1h', '7d'
    return jwt.sign({ userId }, secret, { expiresIn }) as string
  }

  private getRefreshTokenExpiration(): Date {
    const expiresIn = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d'
    const ms = this.parseExpiration(expiresIn)
    return new Date(Date.now() + ms)
  }

  private parseExpiration(expiresIn: string): number {
    const match = expiresIn.match(/^(\d+)([mhd])$/)
    if (!match) return 7 * 24 * 60 * 60 * 1000
    
    const value = parseInt(match[1])
    const unit = match[2]
    
    switch (unit) {
      case 'm': return value * 60 * 1000
      case 'h': return value * 60 * 60 * 1000
      case 'd': return value * 24 * 60 * 60 * 1000
      default: return 7 * 24 * 60 * 60 * 1000
    }
  }
}
