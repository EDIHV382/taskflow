const { PrismaClient } = require('@prisma/client')
const jwt = require('jsonwebtoken')

const prisma = new PrismaClient()

module.exports = async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' })
  }
  
  try {
    const refreshToken = request.cookies?.refreshToken
    
    if (!refreshToken) {
      return response.status(401).json({ error: 'Refresh token missing' })
    }
    
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET)
    
    // Check if refresh token exists in DB
    const tokenRecord = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    })
    
    if (!tokenRecord) {
      return response.status(401).json({ error: 'Invalid refresh token' })
    }
    
    // Check if expired
    if (tokenRecord.expiresAt < new Date()) {
      await prisma.refreshToken.delete({
        where: { token: refreshToken },
      })
      return response.status(401).json({ error: 'Refresh token expired' })
    }
    
    // Generate new tokens
    const newAccessToken = jwt.sign(
      { userId: decoded.userId },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: '15m' }
    )
    
    const newRefreshToken = jwt.sign(
      { userId: decoded.userId },
      process.env.JWT_REFRESH_SECRET,
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
    
    // Set new refresh token in cookie
    response.setHeader('Set-Cookie', `refreshToken=${newRefreshToken}; HttpOnly; Secure; SameSite=Lax; Max-Age=604800; Path=/`)
    
    return response.status(200).json({
      accessToken: newAccessToken,
    })
  } catch (error) {
    console.error('Refresh error:', error)
    return response.status(401).json({ error: 'Invalid refresh token' })
  }
}
