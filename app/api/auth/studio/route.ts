import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import jwt from 'jsonwebtoken';

const STUDIO_B2B_URL = process.env.STUDIO_B2B_URL || 'https://studio-provenance-production.up.railway.app';

// [BUILD DETERMINISM] Do NOT throw at module scope.
// Next.js eagerly evaluates module-level code during `next build` (page data collection).
// Secrets are NOT injected at build time — only at container start (Railway/Vercel).
// Validation must be lazy, inside the request handler.
function getStudioSecret(): string {
  const s = process.env.JWT_VERIFICATION_SECRET;
  if (!s) throw new Error('[SECURITY FATAL] JWT_VERIFICATION_SECRET is not set.');
  return s;
}


export async function GET(req: NextRequest) {
  try {
    // 1. Verify user is logged into the B2C Wallet
    const ledgerSessionCookie = req.cookies.get('ledger_session')?.value;
    
    if (!ledgerSessionCookie) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://humanidfi.com';
      return NextResponse.redirect(new URL('/?error=unauthorized_for_studio', appUrl));
    }

    let walletAddress = 'unknown_wallet';
    try {
      const { verifyJWT } = await import('@/lib/jwt');
      const payload = await verifyJWT(ledgerSessionCookie);
      walletAddress = String(payload.walletAddress || payload.sub || 'unknown_wallet');
    } catch (e) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://humanidfi.com';
      return NextResponse.redirect(new URL('/?error=invalid_session', appUrl));
    }
    const payload = {
      walletId: walletAddress,
      origin: 'B2C_WALLET_IDP',
      exp: Math.floor(Date.now() / 1000) + (60 * 5) // 5 minutes expiration for the nonce
    };

    const token = jwt.sign(payload, getStudioSecret(), { algorithm: 'HS256' });

    // 3. Redirect to the Studio Provenance B2B Private Repository
    const redirectUrl = new URL('/api/auth/callback', STUDIO_B2B_URL);
    redirectUrl.searchParams.set('token', token);

    return NextResponse.redirect(redirectUrl);

  } catch (error) {
    console.error('[Identity Bridge] Error generating SSO token:', error);
    return NextResponse.json({ error: 'SSO_GENERATION_FAILED' }, { status: 500 });
  }
}
