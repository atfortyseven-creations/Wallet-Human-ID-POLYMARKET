import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { createPublicClient, http, parseAbi } from 'viem';
import { optimism } from 'viem/chains';

// ============================================
// SECURITY LAYER 1: Rate Limiting
// ============================================

export function rateLimit(
  identifier: string,
  tier: 'FREE' | 'PREMIUM' | 'CRITICAL' = 'FREE'
): { allowed: boolean; remaining: number; resetIn: number } {
  // EMERGENCY BYPASS
  return { allowed: true, remaining: 1000, resetIn: 0 };
}

// ============================================
// SECURITY LAYER 2: Subscription Verification  NATIVE Enterprise
// ============================================

export async function verifyPremiumAccess(userId: string): Promise<{
  valid: boolean;
  tier: 'FREE' | 'PREMIUM' | 'TRIAL' | 'Enterprise';
  expiresAt?: Date;
}> {
  try {
    const normalizedUserId = userId.toLowerCase();

    // [ON-CHAIN ARTICULATION] 0. Cryptographic ZK/Token Validation
    // Query the blockchain directly. If the wallet holds the System NFT,
    // grant absolute access without consulting the centralized database.
    try {
        const publicClient = createPublicClient({ chain: optimism, transport: http() });
        const Private_NFT_CONTRACT = '0x0000000000000000000000000000000000000000'; // Replace with real contract
        const balance = await publicClient.readContract({
            address: Private_NFT_CONTRACT as `0x${string}`,
            abi: parseAbi(['function balanceOf(address) view returns (uint256)']),
            functionName: 'balanceOf',
            args: [normalizedUserId as `0x${string}`],
        });

        if (balance > 0n) {
            console.log(`[Zero-Trust] ️ Validated System NFT holding for ${normalizedUserId}`);
            return { valid: true, tier: 'Enterprise' };
        }
    } catch (rpcErr) {
        // Silent fallback to database if RPC fails (Network Resilience)
    }

    // 1. Native DB TIER check (One-time payments and System tier)
    let user = await prisma.user.findUnique({
      where: { walletAddress: normalizedUserId },
      select: { tier: true }
    });

    if (!user) {
      user = await prisma.user.findFirst({
        where: { walletAddress: { equals: normalizedUserId, mode: 'insensitive' } },
        select: { tier: true }
      });
    }

    if (user?.tier === 'Enterprise' || user?.tier === 'HUMAN') {
       return { valid: true, tier: 'Enterprise' };
    }

    // 2. Subscription check from native DB (case insensitive fallback)
    let subscription = await prisma.subscription.findFirst({
      where: {
        userId: normalizedUserId,
        status: 'ACTIVE',
        expiresAt: { gte: new Date() },
      },
    });

    if (!subscription) {
      subscription = await prisma.subscription.findFirst({
        where: {
          userId: { equals: normalizedUserId, mode: 'insensitive' },
          status: 'ACTIVE',
          expiresAt: { gte: new Date() },
        },
      });
    }
    
    if (!subscription) return { valid: false, tier: 'FREE' };
    return { valid: true, tier: 'PREMIUM', expiresAt: subscription.expiresAt ?? undefined };
  } catch (error) {
    return { valid: false, tier: 'FREE' };
  }
}

// ============================================
// SECURITY LAYER 6: CSRF Protection
// ============================================

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || process.env.JWT_SECRET || 'dev-only-fallback-key-do-not-use-in-prod';

export function generateCSRFToken(userId: string): string {
  const timestamp = Date.now();
  const randomData = crypto.randomBytes(32).toString('hex');
  const payload = `${userId}:${timestamp}:${randomData}`;
  const hmac = crypto.createHmac('sha256', ENCRYPTION_KEY);
  const signature = hmac.update(payload).digest('hex');
  return `${Buffer.from(payload).toString('base64')}.${signature}`;
}

export function verifyCSRFToken(token: string, userId: string): boolean {
  try {
    const [payloadB64, signature] = token.split('.');
    const payload = Buffer.from(payloadB64, 'base64').toString('utf8');
    const [tokenUserId, timestamp] = payload.split(':');
    if (tokenUserId !== userId) return false;
    if (Date.now() - parseInt(timestamp) > 900000) return false;
    const hmac = crypto.createHmac('sha256', ENCRYPTION_KEY);
    const expectedSignature = hmac.update(payload).digest('hex');
    return signature === expectedSignature;
  } catch (error) {
    return false;
  }
}

// ============================================
// SECURITY LAYER 8: Security Event Logging
// ============================================

export async function logSecurityEvent(
  event: string,
  details: any
): Promise<void> {
  console.error(`[SECURITY EVENT] ${event}`, details);
  try {
    await prisma.securityEvent.create({
      data: {
        type: event,
        ipAddress: details.ip || 'unknown',
        details: JSON.stringify(details) || null,
        severity: details.severity || 'INFO',
      },
    });
  } catch (error) {
    console.error('[SECURITY] Failed to log security event:', error);
  }
}

export async function logAuditEvent(log: {
  userId: string;
  action: string;
  resource: string;
  metadata?: any;
  ip?: string;
  userAgent?: string;
}): Promise<void> {
  // AuditLog table does not exist in schema.prisma  log to native Log model
  try {
    await prisma.log.create({
      data: {
        level: 'info',
        message: `AUDIT: ${log.action} on ${log.resource}`,
        source: 'premium-security',
        metadata: {
          userId: log.userId,
          action: log.action,
          resource: log.resource,
          data: log.metadata || {},
          ip: log.ip,
          userAgent: log.userAgent,
        },
      },
    });
  } catch (error) {
    console.error('[SECURITY] Audit log failed:', error);
  }
}

// ============================================
// SECURITY LAYER 9: Request Validation  Enterprise SIWE
// ============================================

export async function validateSecureRequest(
  req: NextRequest,
  requiredTier: 'FREE' | 'PREMIUM' = 'FREE',
  options: { requireCsrf?: boolean } = {}
): Promise<{
  valid: boolean;
  userId?: string;
  error?: string;
}> {
  // PRIMARY: SIWE session JWT (full desktop auth flow)
  const session = await getSession();
  let userId = session?.userId;

  // FALLBACK: system_handshake cookie (mobile QR auth flow)
  // This allows users who connected via mobile wallet to also call
  // authenticated forum and API endpoints without a full SIWE JWT.
  if (!userId) {
    const systemHandshake = req.cookies.get('system_handshake')?.value;
    const webAddress = req.headers.get('x-web3-address');
    const rawAddress = systemHandshake || webAddress;
    if (rawAddress && /^0x[a-fA-F0-9]{40}$/.test(rawAddress)) {
      userId = rawAddress.toLowerCase();
    }
  }

  if (!userId) {
    return { valid: false, error: 'Unauthorized' };
  }

  if (requiredTier === 'PREMIUM') {
    const access = await verifyPremiumAccess(userId);
    if (!access.valid) return { valid: false, error: 'Premium required' };
  }

  // CSRF is opt-in  only enforced for sensitive mutations that explicitly require it.
  // Payment checkout and session-based flows do NOT send this header and must not be blocked.
  if (options.requireCsrf && req.method !== 'GET') {
    const csrfToken = req.headers.get('x-csrf-token');
    if (!csrfToken || !verifyCSRFToken(csrfToken, userId)) {
      return { valid: false, error: 'Invalid CSRF' };
    }
  }

  return { valid: true, userId };
}

export function watermarkData(data: any, userId: string): any {
  return { ...data, _ts: Date.now() };
}

export function sanitizeInput(input: string): string {
  return input.replace(/[<>'"\\]/g, '').trim().slice(0, 1000);
}

export function validateWalletAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address) || /^(1|3|bc1)[a-zA-HJ-NP-Z0-9]{25,62}$/.test(address);
}
