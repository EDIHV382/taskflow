module.exports = async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' })
  }
  
  // Clear refresh token cookie
  response.setHeader('Set-Cookie', 'refreshToken=; HttpOnly; Secure; SameSite=Lax; Max-Age=0; Path=/')
  
  return response.status(200).json({ message: 'Logged out successfully' })
}
