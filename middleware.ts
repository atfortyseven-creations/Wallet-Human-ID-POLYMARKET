/**
 * middleware.ts — Whale Network Identity Perimeter
 * ─────────────────────────────────────────────────
 * Edge Middleware (runs before EVERY request, on Vercel/Railway Edge runtime).
 *
 * Implements the Identity Gate described by Axel Maisonneuve:
 *
 *   "If we have the entire system tied to a supply of 200 unique identities
 *    that ONLY THOSE PEOPLE can see and have permission across the entire
 *    domain — because they are unique and have signed."
 *
 * Attack vectors closed:
 *  ┌──────────────────────────────────────────────────────────┐
 *  │ VECTOR                   │ DEFENSE                        │
 *  ├──────────────────────────┼────────────────────────────────┤
 *  │ Proxy farm + new wallets │ No airdrop claim = no access   │
 *  │ Tab flooding             │ Every route checks session JWT │
 *  │ Cookie spoofing          │ JWT signed with JWT_SECRET     │
 *  │ IP rotation              │ Identity is on-chain, not IP   │
 *  │ Replay attacks           │ JWT exp + signed nonce per tx  │
 *  └──────────────────────────┴────────────────────────────────┘
 *
 * Architecture:
 *  This middleware runs at EDGE LEVEL (no Node.js APIs, no Prisma).
 *  It performs a lightweight JWT session check ONLY.
 *  The heavy identity verification (DB airdrop claim check) happens
 *  inside each API route via assertVerifiedIdentity().
 *
 *  Why this split?
 *   - Edge middleware has a 1MB code size limit → no Prisma/pg driver.
 *   - JWT check is O(1) crypto — sufficient to block unauthenticated flooding.
 *   - DB identity check happens once per meaningful action, not every request.
 */

import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

// ── Public routes: accessible to EVERYONE (no auth required) ──────────────────
const PUBLIC_PATHS = new Set([
  '/',
  '/sign-in',
  '/login',
  '/auth',
  '/connect',
  '/manifest.json',
  '/favicon.ico',
  '/robots.txt',
  '/sitemap.xml',
]);

// Public path PREFIXES (startsWith check)
const PUBLIC_PREFIXES = [
  '/api/auth/',           // All SIWE/session auth endpoints
  '/api/aztec/airdrop',   // The claim endpoint itself must remain public
  '/api/health',
  '/api/status',
  '/_next/',
  '/connect',
  '/fonts/',
  '/images/',
  '/icons/',
  '/static/',
  '/opengraph',
];

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_PATHS.has(pathname)) return true;
  return PUBLIC_PREFIXES.some(prefix => pathname.startsWith(prefix));
}

// ── JWT Secret (Edge-compatible — TextEncoder only) ───────────────────────────
function getEdgeSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET || 'VOID_SECRET_99_POLY_DEV_ONLY_CHANGE_IN_PRODUCTION';
  return new TextEncoder().encode(secret);
}

// ── Extract session JWT from cookies ─────────────────────────────────────────
async function extractSessionAddress(req: NextRequest): Promise<string | null> {
  // Priority 1: SIWE whale session
  const whaleCookie = req.cookies.get('whale_session')?.value
    ?? req.cookies.get('human_session')?.value;

  if (whaleCookie) {
    try {
      const { payload } = await jwtVerify(whaleCookie, getEdgeSecret());
      const addr = (payload as any).address ?? (payload as any).sub;
      if (addr && typeof addr === 'string') return addr.toLowerCase();
    } catch {
      // Expired or invalid JWT — fall through
    }
  }

  // Priority 2: Email/standard access token
  const accessToken = req.cookies.get('human.access-token')?.value;
  if (accessToken) {
    try {
      const { payload } = await jwtVerify(accessToken, getEdgeSecret());
      const userId = (payload as any).userId;
      if (userId && typeof userId === 'string') return userId.toLowerCase();
    } catch {
      // Expired or invalid JWT
    }
  }

  return null;
}

export async function middleware(req: NextRequest): Promise<NextResponse> {
  const { pathname } = req.nextUrl;

  // 1. Allow all public paths through immediately
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // 2. Check for a valid session JWT
  const sessionAddress = await extractSessionAddress(req);

  if (!sessionAddress) {
    // No session at all → redirect to sign-in (for pages) or 401 (for API)
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        {
          error: 'Authentication required.',
          code: 'NO_SESSION',
          hint: 'Connect your wallet and claim your Aztec identity at /sign-in',
        },
        { status: 401 }
      );
    }
    const signInUrl = new URL('/sign-in', req.url);
    signInUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(signInUrl);
  }

  // 3. Session exists → pass the address to downstream handlers via header
  //    The heavy DB identity-gate check (assertVerifiedIdentity) runs inside
  //    each sensitive API route — not here — to keep edge latency minimal.
  const response = NextResponse.next();
  response.headers.set('x-verified-session-address', sessionAddress);
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT static files and Next.js internals.
     * This runs for all pages and API routes.
     */
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|manifest.json|fonts|images|icons).*)',
  ],
};
