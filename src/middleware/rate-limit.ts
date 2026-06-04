import { NextRequest, NextResponse } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Initialize Redis for rate limiting
const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

// Rate limit configurations
const publicLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(100, '1 m'), // 100 requests per minute
      analytics: true,
    })
  : null;

const authenticatedLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(500, '1 m'), // 500 requests per minute
      analytics: true,
    })
  : null;

const websocketLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, '5 m'), // 10 connections per 5 minutes
      analytics: true,
    })
  : null;

/**
 * Rate limiting middleware
 */
export async function rateLimit(
  request: NextRequest,
  tier: 'public' | 'authenticated' | 'websocket' = 'public'
): Promise<{ success: boolean; limit?: number; remaining?: number; reset?: number }> {
  // Skip rate limiting if Redis is not configured
  if (!redis) {
    console.warn('[RateLimit] Redis not configured, skipping rate limit');
    return { success: true };
  }

  // Get identifier (IP or user ID)
  const identifier = getIdentifier(request);

  // Check if user is owner (unlimited access)
  const isOwner = await checkIfOwner(request);
  if (isOwner) {
    return { success: true };
  }

  // Select appropriate limiter
  const limiter = tier === 'websocket' 
    ? websocketLimiter 
    : tier === 'authenticated' 
      ? authenticatedLimiter 
      : publicLimiter;

  if (!limiter) {
    return { success: true };
  }

  // Check rate limit
  const { success, limit, remaining, reset } = await limiter.limit(identifier);

  if (!success) {
    console.warn(`[RateLimit] Exceeded for ${identifier} (tier: ${tier})`);
  }

  return {
    success,
    limit,
    remaining,
    reset,
  };
}

/**
 * Get unique identifier for rate limiting
 */
function getIdentifier(request: NextRequest): string {
  // Try to get user ID from auth header or session
  const userId = request.headers.get('x-user-id');
  if (userId) {
    return `user:${userId}`;
  }

  // Fallback to IP address
  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             'unknown';
  
  return `ip:${ip}`;
}

/**
 * Check if user is owner (unlimited access)
 */
async function checkIfOwner(request: NextRequest): Promise<boolean> {
  try {
    // Get user from Clerk session
    const userId = request.headers.get('x-user-id');
    if (!userId) return false;

    // Check if user is the owner
    const OWNER_ID = process.env.OWNER_CLERK_ID || 'user_2rQykN5YoCz95dTdB3V9pO6DhGx';
    return userId === OWNER_ID;
  } catch {
    return false;
  }
}

/**
 * Rate limit response helper
 */
export function rateLimitResponse(result: Awaited<ReturnType<typeof rateLimit>>) {
  if (!result.success) {
    return NextResponse.json(
      {
        error: 'Rate limit exceeded',
        limit: result.limit,
        remaining: 0,
        reset: result.reset,
      },
      { 
        status: 429,
        headers: {
          'X-RateLimit-Limit': result.limit?.toString() || '0',
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': result.reset?.toString() || '0',
        }
      }
    );
  }

  return null;
}

/**
 * Middleware wrapper for API routes
 */
export function withRateLimit(
  handler: (req: NextRequest) => Promise<NextResponse>,
  tier: 'public' | 'authenticated' | 'websocket' = 'public'
) {
  return async (req: NextRequest) => {
    const result = await rateLimit(req, tier);
    
    const errorResponse = rateLimitResponse(result);
    if (errorResponse) {
      return errorResponse;
    }

    // Add rate limit headers to successful responses
    const response = await handler(req);
    
    if (result.limit) {
      response.headers.set('X-RateLimit-Limit', result.limit.toString());
      response.headers.set('X-RateLimit-Remaining', result.remaining?.toString() || '0');
      response.headers.set('X-RateLimit-Reset', result.reset?.toString() || '0');
    }

    return response;
  };
}
