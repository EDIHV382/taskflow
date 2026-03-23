const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const prisma = new PrismaClient()

module.exports = async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' })
  }
  
  try {
    const { email, password } = request.body
    
    // Validate input
    if (!email || !password) {
      return response.status(400).json({ error: 'Email and password required' })
    }
    
    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    })
    
    if (!user) {
      return response.status(401).json({ error: 'Invalid credentials' })
    }
    
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password)
    
    if (!isPasswordValid) {
      return response.status(401).json({ error: 'Invalid credentials' })
    }
    
    // Generate tokens
    const accessToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: '15m' }
    )
    
    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    )
    
    // Save refresh token
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    })
    
    // Set refresh token in httpOnly cookie
    response.setHeader('Set-Cookie', `refreshToken=${refreshToken}; HttpOnly; Secure; SameSite=Lax; Max-Age=604800; Path=/`)
    
    return response.status(200).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      accessToken,
    })
  } catch (error) {
    console.error('Login error:', error)
    return response.status(500).json({ error: 'Internal server error' })
  }
}
