import { VercelRequest, VercelResponse } from '@vercel/node';
import bcrypt from 'bcryptjs';
import { prisma } from '../_lib/prisma.js';
import { loginSchema } from '../_lib/validators.js';
import {
  generateAccessToken,
  generateRefreshToken,
  getRefreshTokenExpiration,
} from '../_lib/auth.js';
import { checkRateLimit } from '../_lib/rateLimit.js';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  // Check method
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  // Rate limiting
  if (!checkRateLimit(request, response, 'login')) {
    return;
  }

  try {
    // Validate input
    const validatedData = loginSchema.safeParse(request.body);
    if (!validatedData.success) {
      return response.status(400).json({
        error: 'Invalid input',
        details: validatedData.error.issues,
      });
    }

    const { email, password } = validatedData.data;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return response.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return response.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    // Save refresh token
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: getRefreshTokenExpiration(),
      },
    });

    // Set refresh token in httpOnly cookie
    const isProduction = process.env.NODE_ENV === 'production';
    response.setHeader(
      'Set-Cookie',
      `refreshToken=${refreshToken}; HttpOnly; ${isProduction ? 'Secure;' : ''} SameSite=Lax; Max-Age=604800; Path=/`
    );

    return response.status(200).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      accessToken,
    });
  } catch (error) {
    console.error('Login error:', error);
    return response.status(500).json({ error: 'Internal server error' });
  }
}
