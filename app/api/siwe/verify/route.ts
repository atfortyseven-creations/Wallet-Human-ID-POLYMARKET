import { NextRequest, NextResponse } from 'next/server';
import { SiweMessage } from 'siwe';
import { prisma } from '@/lib/prisma';

// FIX: Same VOID_SECRET_99_POLY vulnerability as lib/session.ts.
// Removed hardcoded fallback. Guard instead of silently using a known secret.
const _rawJwtSecret = process.env.JWT_SECRET;
if (!_rawJwtSecret && process.env.NODE_ENV === 'production' && process.env.SKIP_ENV_VALIDATION !== 'true') {
    throw new Error('[SECURITY FATAL] JWT_SECRET not set. Cannot mint SIWE session tokens safely.');
}
const JWT_SECRET = new TextEncoder().encode(_rawJwtSecret || 'dev-only-not-for-production-jwt-secret-change-me');

export async function POST(req: NextRequest) {
  try {
    const { message, signature } = await req.json();
    const nonce = req.cookies.get('siwe-nonce')?.value;

    if (!nonce) {
      return NextResponse.json({ ok: false, error: 'No nonce in session. Request a new nonce.' }, { status: 400 });
    }

    //  Cryptographic signature verification 
    const siweMessage = new SiweMessage(message);
    const { data: fields, error: siweErr } = await siweMessage.verify({
      signature,
      nonce,
    });

    if (siweErr || !fields) {
      console.error('[SIWE] Verification failed:', siweErr);
      return NextResponse.json({ ok: false, error: 'Invalid signature or nonce mismatch.' }, { status: 401 });
    }

    if (fields.nonce !== nonce) {
      return NextResponse.json({ ok: false, error: 'Nonce mismatch  replay attack rejected.' }, { status: 401 });
    }

    //  Upsert System User 
    let user;
    try {
      user = await prisma.user.upsert({
        where:  { walletAddress: fields.address.toLowerCase() },
        update:  { lastActive: new Date() },
        create:  { walletAddress: fields.address.toLowerCase(), lastActive: new Date() },
      });
    } catch (dbErr) {
      console.error('[SIWE] DB upsert failed (FATAL):', dbErr);
      return NextResponse.json({ ok: false, error: 'Database synchronization failed. Session rejected.' }, { status: 500 });
    }

    //  Mint System JWT 
    const { mintJWT } = await import('@/lib/jwt');
    const sessionToken = await mintJWT({
      sub: fields.address.toLowerCase(),
      address: fields.address.toLowerCase(),
      chainId: fields.chainId,
      domain: fields.domain,
      issuedAt: fields.issuedAt,
      clearance: 'Private',
      tier: user?.tier || 'FREE',
      kycStatus: 'UNVERIFIED',
      humanityScore: user?.humanityScore || 0,
    });

    // Cache tier in Redis for 10 min (Edge Middleware Rate Limiting)
    const { safeRedisSet } = await import('@/lib/redis/client');
    await safeRedisSet(`tier:${fields.address.toLowerCase()}`, JSON.stringify({
        tier: user?.tier || 'FREE',
        kycStatus: 'UNVERIFIED',
        humanityScore: user?.humanityScore || 0
    }), 'EX', 600);

    //  Build response with all session cookies 
    const res = NextResponse.json({
      ok: true,
      address: fields.address,
      chainId: fields.chainId,
      clearance: 'Private',
    });

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    };

    // Primary SIWE session token (JWT)
    res.cookies.set('human_session', sessionToken, cookieOptions);

    // System handshake marker (read by middleware)
    res.cookies.set('system_handshake', fields.address.toLowerCase(), {
      ...cookieOptions,
      httpOnly: false, // Frontend-readable to show wallet address
    });

    // Wallet-auth for fast frontend reads
    res.cookies.set('wallet-auth', fields.address.toLowerCase(), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    // Clear consumed nonce
    res.cookies.delete('siwe-nonce');

    console.info(`[SIWE]  System session issued for: ${fields.address}`);
    return res;

  } catch (e) {
    console.error('[SIWE] Verify error:', e);
    return NextResponse.json({ ok: false, error: 'Verification failed. Signature may be invalid.' }, { status: 400 });
  }
}
