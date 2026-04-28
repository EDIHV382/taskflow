import { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_lib/prisma.js';
import { requireAuth } from '../_lib/auth.js';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  // Check method
  if (request.method !== 'GET') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const decoded = requireAuth(request, response);
    if (!decoded) return;

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    if (!user) {
      return response.status(404).json({ error: 'User not found' });
    }

    return response.status(200).json(user);
  } catch (error) {
    console.error('Get user error:', error);
    return response.status(500).json({ error: 'Internal server error' });
  }
}
