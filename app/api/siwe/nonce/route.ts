import { generateNonce } from 'siwe';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// In-memory rate limit: max 10 nonce requests per IP per minute
const nonceRequests = new Map<string, { count: number; resetAt: number }>();

function isNonceRateLimited(ip: string): boolean {
    const now = Date.now();
    const WINDOW_MS = 60 * 1000;
    const MAX = 10;
    const record = nonceRequests.get(ip);
    if (!record || now > record.resetAt) {
        nonceRequests.set(ip, { count: 1, resetAt: now + WINDOW_MS });
        return false;
    }
    if (record.count >= MAX) return true;
    record.count += 1;
    return false;
}

export async function GET(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1';
  if (isNonceRateLimited(ip)) {
    return new NextResponse('Too Many Requests', { status: 429 });
  }

  const nonce = generateNonce(); // Cryptographically secure nonce (8+ chars)

  const res = new NextResponse(nonce, {
    status: 200,
    headers: { 'Content-Type': 'text/plain' },
  });

  // [IOS CHROME CRITICAL FIX] sameSite MUST be 'lax', NOT 'strict'.
  // iOS WKWebView (Chrome on iOS, Safari) DROPS cookies with SameSite=Strict
  // during cross-site navigation (deep-link to wallet app  universal link back).
  // WalletConnect's redirect flow IS a cross-site top-level GET  'lax' allows it.
  // Using 'strict' = nonce cookie is gone on return  "No nonce in session" error.
  res.cookies.set('siwe-nonce', nonce, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax', // CRITICAL: was 'strict', breaks all iOS wallet redirects
    path: '/',
    maxAge: 60 * 5, // 5 minutes  tight enough to prevent replay
  });

  return res;
}
