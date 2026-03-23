import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const prisma = new PrismaClient()

const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1),
})

export async function POST(request: NextRequest) {
  try {
    const refreshToken = request.cookies.get('refreshToken')?.value
    
    if (!refreshToken) {
      return NextResponse.json(
        { error: 'Refresh token missing' },
        { status: 401 }
      )
    }
    
    // Verify refresh token
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET!
    ) as { userId: string }
    
    // Check if refresh token exists in DB
    const tokenRecord = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    })
    
    if (!tokenRecord) {
      return NextResponse.json(
        { error: 'Invalid refresh token' },
        { status: 401 }
      )
    }
    
    // Check if expired
    if (tokenRecord.expiresAt < new Date()) {
      await prisma.refreshToken.delete({
        where: { token: refreshToken },
      })
      return NextResponse.json(
        { error: 'Refresh token expired' },
        { status: 401 }
      )
    }
    
    // Generate new tokens
    const newAccessToken = jwt.sign(
      { userId: decoded.userId },
      process.env.JWT_ACCESS_SECRET!,
      { expiresIn: '15m' }
    )
    
    const newRefreshToken = jwt.sign(
      { userId: decoded.userId },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: '7d' }
    )
    
    // Delete old refresh token and create new one
    await prisma.refreshToken.delete({
      where: { token: refreshToken },
    })
    
    await prisma.refreshToken.create({
      data: {
        token: newRefreshToken,
        userId: decoded.userId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    })
    
    const response = NextResponse.json({
      accessToken: newAccessToken,
    })
    
    // Set new refresh token in cookie
    response.cookies.set('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    })
    
    return response
  } catch (error) {
    console.error('Refresh error:', error)
    return NextResponse.json(
      { error: 'Invalid refresh token' },
      { status: 401 }
    )
  }
}
