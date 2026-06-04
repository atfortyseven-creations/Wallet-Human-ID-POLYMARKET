import { NextRequest, NextResponse } from 'next/server';
import { safeRedisGet, safeRedisSet } from '@/lib/redis/client';
import { mintJWT } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/auth/kyc-qr-poll?uuid={uuid}&walletAddress={addr}
 *
 * Long-poll endpoint called by the PC every 2s to check if the
 * mobile device has completed the biometric KYC.
 *
 * Flow:
 *   PENDING  mobile hasn't completed yet
 *   SUCCESS + ciphertext  mobile completed, desktop decrypts and hydrates
 *   BURNED   already consumed (replay protection)
 *   EXPIRED  TTL hit, session is gone
 */
export async function GET(req: NextRequest) {
  try {
    const uuid = req.nextUrl.searchParams.get('uuid');
    const walletAddress = req.nextUrl.searchParams.get('walletAddress');

    if (!uuid) {
      return NextResponse.json({ error: 'Session UUID required' }, { status: 400 });
    }

    const raw = await safeRedisGet(`kyc-session:${uuid}`);

    // Session expired or never existed
    if (!raw) {
      return NextResponse.json({ status: 'EXPIRED' });
    }

    // Already consumed (burn-after-read replay protection)
    if (raw === 'BURNED') {
      return NextResponse.json({ status: 'BURNED' }, { status: 403 });
    }

    // Parse stored session
    let session: Record<string, any>;
    try {
      session = JSON.parse(raw);
    } catch {
      return NextResponse.json({ status: 'PENDING' });
    }

    // Still waiting for mobile
    if (session.status === 'PENDING') {
      return NextResponse.json({ status: 'PENDING' });
    }

    //  Mobile has completed KYC 
    if (session.status === 'VERIFIED') {
      const { livenessScore, spoofType, encryptedPayload, ekey } = session;

      // Validate liveness score meets threshold
      if (!livenessScore || livenessScore < 72) {
        return NextResponse.json({ status: 'PENDING' }); // still processing
      }

      // Burn-after-read: mark as consumed immediately
      await safeRedisSet(`kyc-session:${uuid}`, 'BURNED', 'EX', 30);

      // If we have a wallet address, persist KYC verification and issue JWT
      if (walletAddress) {
        try {
          const normalizedAddress = walletAddress.toLowerCase();

          await prisma.user.upsert({
            where: { walletAddress: normalizedAddress },
            update: {
              isZkVerified: true,
              humanityScore: { increment: 100 },
              lastActive: new Date(),
            },
            create: {
              walletAddress: normalizedAddress,
              isZkVerified: true,
              humanityScore: 100,
              tier: 'INITIATE',
              lastActive: new Date(),
            },
          });

          const jwt = await mintJWT({
            sub: normalizedAddress,
            address: normalizedAddress,
            clearance: 'Private',
            tier: 'INITIATE',
            kycStatus: 'VERIFIED',
            isZkVerified: true,
            humanityScore: 100,
            iss: 'whale-alert-network',
            issuedAt: new Date().toISOString(),
          });

          const response = NextResponse.json({
            status: 'SUCCESS',
            livenessScore,
            encryptedPayload,
            ekey,
          });

          // Set whale_session cookie so the page can redirect
          response.cookies.set('whale_session', jwt, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 604800,
            path: '/',
          });

          return response;
        } catch (dbErr: any) {
          console.error('[KYC:Poll] DB error:', dbErr);
          // Still return success but without persisting
          return NextResponse.json({
            status: 'SUCCESS',
            livenessScore,
            encryptedPayload,
            ekey,
          });
        }
      }

      return NextResponse.json({
        status: 'SUCCESS',
        livenessScore,
        encryptedPayload,
        ekey,
      });
    }

    return NextResponse.json({ status: 'PENDING' });
  } catch (err: any) {
    console.error('[KYC:Poll] Error:', err);
    return NextResponse.json({ error: 'Polling fault' }, { status: 500 });
  }
}
