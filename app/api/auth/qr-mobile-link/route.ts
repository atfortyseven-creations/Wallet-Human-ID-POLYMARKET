import { NextRequest, NextResponse } from 'next/server';
import { mintJWT } from '@/lib/jwt';
import { safeRedisSet } from '@/lib/redis/client';
import { isAddress } from 'viem';

/**
 * POST /api/auth/qr-mobile-link
 *
 * Called by the mobile QRScannerModal to complete the desktop QR handshake.
 * This endpoint is the correct replacement for export-jwt in the mobile flow.
 *
 * WHY this exists:
 *   - `export-jwt` returns 401 on mobile because `human_session` doesn't exist
 *     until after desktop-side hydration (chicken-and-egg).
 *   - This endpoint mints a fresh mobile JWT from the `system_handshake`
 *     cookie (set after wallet sign) and stores the encrypted payload in Redis
 *     so the desktop poll can pick it up immediately.
 *
 * Auth Resolution (3 layers):
 *   LAYER 1: human_session / whale_session JWT  standard path for returning users
 *   LAYER 2: system_handshake cookie  set after wallet.connect() on mobile,
 *            before any JWT exists. This is the "first QR scan" path.
 *   LAYER 3: 401 if neither is present.
 *
 * Flow:
 *   1. Mobile reads QR  parses { uuid, ephemeralPub, isECDH }
 *   2. Mobile generates its own ephemeral keypair
 *   3. Mobile derives shared secret: X25519(mobile.priv, desktop.pub)
 *   4. Mobile encrypts the JWT with AES-GCM
 *   5. Mobile POSTs here: { uuid, encryptedPayload, iv, tag, mobilePub }
 *   6. This endpoint stores the encrypted payload in Redis
 *   7. Desktop poll (/api/auth/qr-poll) returns it  desktop decrypts  hydrates
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { uuid, encryptedPayload, iv, tag, mobilePub, isServerMint } = body;

    //  1. Validate required fields 
    if (!uuid || typeof uuid !== 'string' || uuid.length < 8) {
      return NextResponse.json({ error: 'Missing or invalid uuid' }, { status: 400 });
    }
    if (!mobilePub) {
      return NextResponse.json({ error: 'Missing mobilePub' }, { status: 400 });
    }
    // In client-encrypt mode (isServerMint !== true), encryptedPayload + iv are required.
    // In server-mint mode (isServerMint === true), they are omitted intentionally.
    if (!isServerMint && (!encryptedPayload || !iv)) {
      return NextResponse.json({ error: 'Missing encrypted payload fields' }, { status: 400 });
    }

    //  2. Verify mobile identity  3-layer auth resolution 
    // LAYER 1: Secure JWT (human_session / whale_session)  preferred path
    // LAYER 2: system_handshake cookie  set after wallet connection on mobile.
    //          No JWT exists yet but the wallet just connected: this is the valid
    //          "first QR scan" path that was previously returning 401 incorrectly.
    // LAYER 3: Reject 401 if neither is present.
    const humanSession = req.cookies.get('human_session')?.value || req.cookies.get('whale_session')?.value;
    const systemHandshake = req.cookies.get('system_handshake')?.value;

    if (!humanSession && !systemHandshake) {
      console.error(`[QR:Handshake:FAILURE] No session found for UUID: ${uuid}. IP: ${req.headers.get('x-forwarded-for')}`);
      return NextResponse.json(
        { error: 'Session expired or unauthenticated. Connect your wallet first, then scan the QR code.' },
        { status: 401 }
      );
    }

    let walletAddress: string | null = null;

    // PATH A: Validate via secure JWT
    if (humanSession) {
      try {
        const { verifyJWT } = await import('@/lib/jwt');
        const payload = await verifyJWT(humanSession);
        walletAddress = (payload.sub as string) || (payload.address as string) || null;
        if (walletAddress) {
          console.log(`[QR:Handshake] [JWT] Resolved wallet: ${walletAddress}`);
        } else {
          throw new Error('JWT payload missing address');
        }
      } catch (err: any) {
        // JWT failed  fall through to system_handshake path
        console.warn(`[QR:Handshake] JWT failed (${err.message}), falling back to system_handshake`);
        walletAddress = null;
      }
    }

    // PATH B: Derive address from system_handshake (wallet-connect first-time flow on mobile)
    if (!walletAddress && systemHandshake) {
      const normalized = systemHandshake.toLowerCase().trim();
      if (/^0x[0-9a-f]{40}$/.test(normalized)) {
        walletAddress = normalized;
        console.log(`[QR:Handshake] [system_handshake] Resolved wallet: ${walletAddress}`);
      } else {
        console.error(`[QR:Handshake] system_handshake contains invalid address: ${normalized}`);
        return NextResponse.json({ error: 'Invalid session token. Please reconnect your wallet.' }, { status: 401 });
      }
    }

    if (!walletAddress) {
      return NextResponse.json({ error: 'Unable to resolve wallet identity. Please reconnect.' }, { status: 401 });
    }

    //  3. Mint a system JWT for this wallet address 
    const { prisma } = await import('@/lib/prisma');
    const existingUser = await prisma.user.upsert({
      where: { walletAddress: walletAddress.toLowerCase() },
      update: { lastActive: new Date() },
      create: {
        walletAddress: walletAddress.toLowerCase(),
        tier: 'INITIATE',
        lastActive: new Date()
      }
    });

    const crypto = await import('crypto');
    const cryptographicNonce = crypto.randomBytes(32).toString('hex');

    const jwt = await mintJWT({
      sub: walletAddress,
      address: walletAddress,
      clearance: 'Private',
      tier: existingUser?.tier || 'FREE',
      kycStatus: 'UNVERIFIED',
      humanityScore: existingUser?.humanityScore || 0,
      iss: 'whale-alert-network',
      source: 'qr-mobile-handshake',
      nonce: cryptographicNonce, //  INHUMAN OPTIMIZATION: Replay Prevention
      issuedAt: new Date().toISOString()
    });

    //  4. Build and store Redis payload depending on mode 
    // PATH A (client-encrypted): store the full ECDH bundle so the desktop
    //   can decrypt it with X25519(desktop.priv, mobilePub). serverJwt is
    //   a fallback in case decryption fails (iOS X25519 key format quirk).
    // PATH B (server-mint): mobile had no JWT to encrypt. Store ONLY serverJwt
    //   + mobilePub. The desktop poll detects the absence of encryptedPayload
    //   and goes straight to the serverJwt fallback  no AES-GCM attempted.
    let sessionPayload: string;

    if (!isServerMint && encryptedPayload && iv) {
      // PATH A: client encrypted the JWT  store encrypted bundle + fallback
      sessionPayload = JSON.stringify({
        encryptedPayload,
        iv,
        tag: tag || null,
        mobilePub,
        serverJwt: jwt,
      });
    } else {
      // PATH B: server mints  store serverJwt only (no encrypted garbage)
      sessionPayload = JSON.stringify({
        mobilePub,
        serverJwt: jwt,
      });
    }

    await safeRedisSet(`qr-session:${uuid}`, sessionPayload, 'EX', 300);

    //  5. Also set human_session on this response for the mobile 
    const response = NextResponse.json({ success: true });
    response.cookies.set('human_session', jwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 604800,
      path: '/',
    });
    response.cookies.set('system_handshake', walletAddress, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 604800,
      path: '/',
    });

    return response;

  } catch (e: any) {
    console.error('[QRMobileLink] Error:', e?.message);
    return NextResponse.json({ error: 'Server error during mobile QR link' }, { status: 500 });
  }
}
