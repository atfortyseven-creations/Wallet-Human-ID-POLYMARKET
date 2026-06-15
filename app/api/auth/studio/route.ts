import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_VERIFICATION_SECRET || 'super-secret-sso-key';
const STUDIO_B2B_URL = process.env.STUDIO_B2B_URL || 'http://localhost:3001';

export async function GET(req: NextRequest) {
  try {
    // 1. Verify user is logged into the B2C Wallet
    const session = await getServerSession();
    if (!session || !session.user) {
      return NextResponse.redirect(new URL('/login?error=unauthorized_for_studio', req.url));
    }

    const walletAddress = session.user.name || session.user.email || 'unknown_wallet';

    // 2. Generate the Cryptographic Identity Token for the B2B SaaS
    const payload = {
      walletId: walletAddress,
      origin: 'B2C_WALLET_IDP',
      exp: Math.floor(Date.now() / 1000) + (60 * 5) // 5 minutes expiration for the nonce
    };

    const token = jwt.sign(payload, JWT_SECRET, { algorithm: 'HS256' });

    // 3. Redirect to the Studio Provenance B2B Private Repository
    const redirectUrl = new URL('/api/auth/callback', STUDIO_B2B_URL);
    redirectUrl.searchParams.set('token', token);

    return NextResponse.redirect(redirectUrl);

  } catch (error) {
    console.error('[Identity Bridge] Error generating SSO token:', error);
    return NextResponse.json({ error: 'SSO_GENERATION_FAILED' }, { status: 500 });
  }
}
