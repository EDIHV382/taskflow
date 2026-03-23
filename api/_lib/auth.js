const jwt = require('jsonwebtoken')

/**
 * Verifica el Bearer token del header Authorization.
 * Devuelve { userId } si es válido, o lanza error con status 401.
 */
function requireAuth(request, response) {
  const authHeader = request.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    response.status(401).json({ error: 'Access token missing' })
    return null
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET)
    return decoded
  } catch {
    response.status(401).json({ error: 'Invalid or expired token' })
    return null
  }
}

module.exports = { requireAuth }
