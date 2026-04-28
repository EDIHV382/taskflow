import { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_lib/prisma.js';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  // Check method
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const refreshToken = request.cookies?.refreshToken;

    if (refreshToken) {
      // Delete refresh token from database
      await prisma.refreshToken.deleteMany({
        where: { token: refreshToken },
      });
    }

    // Clear the cookie
    const isProduction = process.env.NODE_ENV === 'production';
    response.setHeader(
      'Set-Cookie',
      `refreshToken=; HttpOnly; ${isProduction ? 'Secure;' : ''} SameSite=Lax; Max-Age=0; Path=/`
    );

    return response.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    return response.status(500).json({ error: 'Internal server error' });
  }
}
