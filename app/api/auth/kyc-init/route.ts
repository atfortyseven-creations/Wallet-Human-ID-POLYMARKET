import { NextRequest, NextResponse } from 'next/server';
import { safeRedisSet } from '@/lib/redis/client';
import { randomBytes } from 'crypto';

/**
 * POST /api/auth/kyc-init
 *
 * Initializes a KYC session for the PC-to-Mobile handshake.
 * Called by the PC after SIWE authentication to generate
 * the QR payload the user will scan with their mobile device.
 *
 * Returns:
 *   { uuid, ekey, expiresAt }
 *
 * uuid   session identifier embedded in QR URL
 * ekey   AES-256-GCM encryption key (hex) for E2EE payload from mobile
 * expiresAt  Unix timestamp when this session expires (5 minutes)
 */
export async function POST(req: NextRequest) {
  try {
    // Generate cryptographically secure session identifiers
    const uuid = randomBytes(16).toString('hex');
    const ekey = randomBytes(32).toString('hex'); // 256-bit AES key

    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

    // Store session in Redis as PENDING
    // The mobile device will replace this with the encrypted biometric payload
    await safeRedisSet(
      `kyc-session:${uuid}`,
      JSON.stringify({
        status: 'PENDING',
        ekey,                       // stored server-side for decryption
        createdAt: Date.now(),
        expiresAt,
      }),
      'EX',
      300                           // 5 min TTL
    );

    console.log(`[KYC:Init] New session created: ${uuid.slice(0, 8)}`);

    return NextResponse.json({
      uuid,
      ekey,          // returned to PC to embed in QR
      expiresAt,
    });
  } catch (err: any) {
    console.error('[KYC:Init] Error:', err);
    return NextResponse.json({ error: 'Session init failed' }, { status: 500 });
  }
}
