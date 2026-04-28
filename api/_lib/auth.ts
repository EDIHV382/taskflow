import { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';

interface TokenPayload {
  userId: string;
}

export function requireAuth(
  request: VercelRequest,
  response: VercelResponse
): TokenPayload | null {
  const authHeader = request.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    response.status(401).json({ error: 'Access token missing' });
    return null;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET!
    ) as TokenPayload;
    return decoded;
  } catch {
    response.status(401).json({ error: 'Invalid or expired token' });
    return null;
  }
}

export function generateAccessToken(userId: string): string {
  const secret = process.env.JWT_ACCESS_SECRET;
  if (!secret) {
    throw new Error('JWT_ACCESS_SECRET not configured');
  }
  return jwt.sign({ userId }, secret, { expiresIn: '15m' });
}

export function generateRefreshToken(userId: string): string {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) {
    throw new Error('JWT_REFRESH_SECRET not configured');
  }
  return jwt.sign({ userId }, secret, { expiresIn: '7d' });
}

export function getRefreshTokenExpiration(): Date {
  return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
}
