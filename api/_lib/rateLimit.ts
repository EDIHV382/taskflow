import { VercelRequest, VercelResponse } from '@vercel/node';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// Simple in-memory rate limiter (use Redis in production)
const rateLimitStore = new Map<string, RateLimitEntry>();

const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX = 5; // 5 attempts

function getClientIp(request: VercelRequest): string {
  const forwarded = request.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return request.socket.remoteAddress || 'unknown';
}

export function checkRateLimit(
  request: VercelRequest,
  response: VercelResponse,
  key: string
): boolean {
  const clientIp = getClientIp(request);
  const storeKey = `${clientIp}:${key}`;
  const now = Date.now();

  const entry = rateLimitStore.get(storeKey);

  if (!entry || now > entry.resetTime) {
    // New window
    rateLimitStore.set(storeKey, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW,
    });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
    response.setHeader('Retry-After', retryAfter.toString());
    response.status(429).json({
      error: 'Too many requests',
      retryAfter,
      message: `Please try again in ${Math.ceil(retryAfter / 60)} minutes`,
    });
    return false;
  }

  entry.count++;
  return true;
}

// Cleanup old entries every hour
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 60 * 60 * 1000);
