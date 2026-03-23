const { PrismaClient } = require('@prisma/client')
const jwt = require('jsonwebtoken')

const prisma = new PrismaClient()

module.exports = async function handler(request, response) {
  if (request.method !== 'GET') {
    return response.status(405).json({ error: 'Method not allowed' })
  }
  
  try {
    // Get token from Authorization header
    const authHeader = request.headers.authorization
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return response.status(401).json({ error: 'Access token missing' })
    }
    
    const token = authHeader.split(' ')[1]
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET)
    
    // Get user
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
      },
    })
    
    if (!user) {
      return response.status(404).json({ error: 'User not found' })
    }
    
    return response.status(200).json(user)
  } catch (error) {
    console.error('Me error:', error)
    return response.status(401).json({ error: 'Invalid token' })
  }
}
