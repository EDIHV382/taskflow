import { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';
import { prisma } from '../_lib/prisma.js';
import {
  generateAccessToken,
  generateRefreshToken,
  getRefreshTokenExpiration,
} from '../_lib/auth.js';

interface RefreshTokenPayload {
  userId: string;
}

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

    if (!refreshToken) {
      return response.status(401).json({ error: 'Refresh token missing' });
    }

    // Verify refresh token
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET!
    ) as RefreshTokenPayload;

    // Check if refresh token exists in DB
    const tokenRecord = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!tokenRecord) {
      return response.status(401).json({ error: 'Invalid refresh token' });
    }

    // Check if expired
    if (tokenRecord.expiresAt < new Date()) {
      await prisma.refreshToken.delete({
        where: { token: refreshToken },
      });
      return response.status(401).json({ error: 'Refresh token expired' });
    }

    // Generate new tokens
    const newAccessToken = generateAccessToken(decoded.userId);
    const newRefreshToken = generateRefreshToken(decoded.userId);

    // Delete old refresh token and create new one (token rotation)
    await prisma.refreshToken.delete({
      where: { token: refreshToken },
    });

    await prisma.refreshToken.create({
      data: {
        token: newRefreshToken,
        userId: decoded.userId,
        expiresAt: getRefreshTokenExpiration(),
      },
    });

    // Set new refresh token in cookie
    const isProduction = process.env.NODE_ENV === 'production';
    response.setHeader(
      'Set-Cookie',
      `refreshToken=${newRefreshToken}; HttpOnly; ${isProduction ? 'Secure;' : ''} SameSite=Lax; Max-Age=604800; Path=/`
    );

    return response.status(200).json({
      accessToken: newAccessToken,
    });
  } catch (error) {
    console.error('Refresh error:', error);
    return response.status(401).json({ error: 'Invalid refresh token' });
  }
}
