import { NextResponse } from 'next/server';

export async function GET() {
  const res = NextResponse.json({ ok: true, message: 'System session terminated.' });

  const isProd = process.env.NODE_ENV === 'production';
  const expiredDate = 'Thu, 01 Jan 1970 00:00:00 GMT';
  const secure = isProd ? '; Secure' : '';

  // [FIX] BUG-4: whale_session was missing — if user authenticated via SIWE (MetaMask),
  // whale_session persisted and the middleware re-authenticated them on every reload.
  // Also: cookies.set() without matching attributes doesn't clear the original cookie.
  // We use raw Set-Cookie headers to guarantee all attribute variants are cleared.
  const cookiesToClear = [
    'whale_session',    // ← was missing! httpOnly, created by system-verify/qr-hydrate
    'human_session',
    'siwe-nonce',
    'human.session-token',
    'wallet-auth',
    'system_handshake',
  ];

  for (const name of cookiesToClear) {
    // Delete with SameSite=Strict (matches middleware-enforced cookies like whale_session)
    res.headers.append('Set-Cookie', `${name}=; Path=/; Expires=${expiredDate}; HttpOnly${secure}; SameSite=Strict`);
    // Delete with SameSite=Lax (matches cookies set by route handlers directly)
    res.headers.append('Set-Cookie', `${name}=; Path=/; Expires=${expiredDate}; HttpOnly${secure}; SameSite=Lax`);
    // Delete non-httpOnly variant (for system_handshake, wallet-auth)
    res.headers.append('Set-Cookie', `${name}=; Path=/; Expires=${expiredDate}${secure}; SameSite=Lax`);
  }

  return res;
}

