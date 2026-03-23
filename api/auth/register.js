const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const prisma = new PrismaClient()

module.exports = async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' })
  }
  
  try {
    const { name, email, password } = request.body
    
    // Validate input
    if (!name || !email || !password) {
      return response.status(400).json({ error: 'All fields required' })
    }
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })
    
    if (existingUser) {
      return response.status(400).json({ error: 'Email already registered' })
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)
    
    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    })
    
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
    
    return response.status(201).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      accessToken,
    })
  } catch (error) {
    console.error('Register error:', error)
    return response.status(500).json({ error: 'Internal server error' })
  }
}
