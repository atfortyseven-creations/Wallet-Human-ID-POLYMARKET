import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/jwt';

/**
 * POST /api/auth/qr-hydrate
 *
 * Called by the desktop QR poll (ConnectPage) once the mobile has completed
 * the handshake via /api/auth/qr-mobile-link.
 *
 * Hydrates the desktop browser session from the JWT minted on mobile.
 * Sets the same cookie trio as /api/auth/system-verify so every auth
 * path (Humanity Ledger, MetaMask, Rainbow, QR scan) is fully equivalent:
 *
 *   whale_session   — HttpOnly JWT for server-side middleware validation
 *   human_session   — HttpOnly JWT for client-facing session reads
 *   system_handshake — JS-readable Ethereum address for TitaniumGate / MobileEnforcer
 */
export async function POST(req: NextRequest) {
  try {
    const { jwt } = await req.json();
    if (!jwt) return NextResponse.json({ error: 'Missing jwt' }, { status: 400 });

    const payload = await verifyJWT(jwt);
    const address = (payload.sub || payload.address) as string;

    if (!address || !/^0x[a-fA-F0-9]{40}$/i.test(address)) {
      return NextResponse.json({ error: 'JWT payload missing valid address' }, { status: 400 });
    }

    const secureCookieBase = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: 604800, // 7 days — identical to system-verify
      path: '/',
    };

    const response = NextResponse.json({ success: true });

    // [PARITY FIX] Set whale_session so middleware siweSessionValid = true.
    // Previously only human_session was set, causing middleware to fall back
    // to the system_handshake check which then failed after cookie wiping.
    response.cookies.set('whale_session', jwt, secureCookieBase);

    // human_session — read by verify-session and getSession() shims
    response.cookies.set('human_session', jwt, secureCookieBase);

    // system_handshake — JS-readable for TitaniumGate / MobileEnforcer / useSystemAccount
    // CRITICAL: httpOnly MUST be false so document.cookie is readable client-side.
    response.cookies.set('system_handshake', address.toLowerCase(), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 604800,
      path: '/',
    });

    console.log(`[QR:Hydrate] Desktop session established for ${address}`);
    return response;
  } catch (e: any) {
    console.error('[QR:Hydrate] Error:', e?.message);
    return NextResponse.json({ error: 'Invalid JWT' }, { status: 401 });
  }
}
