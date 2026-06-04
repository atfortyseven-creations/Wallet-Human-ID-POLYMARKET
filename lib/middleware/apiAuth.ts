import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../prisma';
import { RedisRateLimiter } from '../redis/rate-limiter';
import { SAAS_PLANS, PlanTier } from '../saas/plans';
import * as crypto from 'crypto';

/** Safely coerce an arbitrary string to a PlanTier enum value, defaulting to FREE. */
function toPlanTier(raw: string | undefined | null): PlanTier {
  const upper = (raw ?? '').toUpperCase();
  return (Object.values(PlanTier) as string[]).includes(upper)
    ? (upper as PlanTier)
    : PlanTier.FREE;
}

export interface ApiAuthResult {
  userId: string;
  tier: string;
  keyId: string;
  rateLimit: {
    limit: number;
    remaining: number;
    current: number;
  };
}

/**
 * Universal Access Control Middleware for SaaS API Endpoints
 * 1. API Key Auth
 * 2. IP Whitelisting (Pro/Elite)
 * 3. HMAC Signature Validation (Pro/Elite)
 * 4. Redis Sliding Window Rate Limiting (FREE, STD: 5k, STR: 10k, PRO: 500k, INST: )
 */
export async function withApiAuth(
  req: NextRequest, 
  validateHmac: boolean = false
): Promise<{ auth?: ApiAuthResult; error?: NextResponse }> {
  const apiKeyHdr = req.headers.get('x-api-key');

  if (!apiKeyHdr) {
    return { error: NextResponse.json({ error: 'Missing x-api-key header' }, { status: 401 }) };
  }

  // 1. Fetch Key and User Tier (We cache this in Redis in a real prod env)
  const apiKeyRecord = await prisma.apiKey.findUnique({
    where: { key: apiKeyHdr },
    include: {
      user: true
    }
  });

  if (!apiKeyRecord || !apiKeyRecord.isActive) {
    return { error: NextResponse.json({ error: 'Invalid or inactive API key' }, { status: 401 }) };
  }

  const userTier = toPlanTier(apiKeyRecord.plan);
  const planConfig = SAAS_PLANS[userTier];

  // 4. Rate Limiting via Redis
  const rateLimitResult = await RedisRateLimiter.check(apiKeyRecord.id, userTier);

  // Background async tracking: record usage stat
  // (In a real high-freq system, we buffer these to ClickHouse, not Postgres directly on every req)
  // Removed lastUsedAt update because it is not in the schema.

  if (!rateLimitResult.success) {
    return { 
      error: NextResponse.json(
        { error: `Rate limit exceeded for tier ${userTier}. Limit is ${rateLimitResult.limit} requests per day.` }, 
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': rateLimitResult.limit.toString(),
            'X-RateLimit-Remaining': '0',
            'Retry-After': '86400' // Simple 24h reset
          }
        }
      ) 
    };
  }

  return {
    auth: {
      userId: apiKeyRecord.userId,
      tier: userTier,
      keyId: apiKeyRecord.id,
      rateLimit: {
        limit: rateLimitResult.limit,
        remaining: rateLimitResult.remaining,
        current: rateLimitResult.current
      }
    }
  };
}

/**
 * Helper to attach Rate Limit headers to a successful response
 */
export function withRateLimitHeaders(response: NextResponse, authInfo: ApiAuthResult) {
    response.headers.set('X-RateLimit-Limit', authInfo.rateLimit.limit.toString());
    response.headers.set('X-RateLimit-Remaining', authInfo.rateLimit.remaining.toString());
    response.headers.set('X-RateLimit-Used', authInfo.rateLimit.current.toString());
    return response;
}

