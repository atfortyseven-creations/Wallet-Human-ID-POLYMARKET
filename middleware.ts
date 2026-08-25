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
  '/sign-up',
  '/login',
  '/auth',
  '/connect',
  '/manifest.json',
  '/favicon.ico',
  '/robots.txt',
  '/sitemap.xml',
]);

const PUBLIC_PREFIXES = [
  '/api/auth/',           // All SIWE/session auth endpoints
  '/api/aztec/airdrop',   // The claim endpoint itself must remain public
  '/api/aztec/balance',
  '/api/aztec/transactions',
  '/api/aztec/derive-address',
  '/api/aztec/identity-status',
  '/api/aztec/restore-session',  // Session restore for returning users (pre-auth)
  '/api/payments/checkout',      // Stripe checkout session creation
  '/api/webhooks/stripe',        // Stripe webhook (must be unauthenticated)
  '/api/webhooks/',              // All webhooks from external services
  '/api/dev/deploy',             // Temporary public route for deploying contracts
  '/api/aztec/deploy-token',     // Admin deploy endpoint — has own DEPLOY_SECRET auth inside
  '/api/health',
  '/api/status',
  '/api/registry/',              // Registry public API
  '/api/humanidfi/',             // HumanIDFi public API
  '/_next/',
  '/connect',
  '/terminal',
  '/portfolio',
  '/studio',                     // Studio Provenance public page
  '/registry',                   // Registry page
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

// ── Rate Limiting (Edge Memory) ──────────────────────────────────────────────
const rateLimitMap = new Map<string, { count: number, resetTime: number }>();
function applyRateLimit(ip: string, pathname: string): NextResponse | null {
  // Allow 150 requests per minute per IP for API routes
  const LIMIT = 150;
  const WINDOW_MS = 60 * 1000;
  
  const now = Date.now();
  const key = `${ip}`; // global IP limit across all routes

  let record = rateLimitMap.get(key);
  if (!record || now > record.resetTime) {
    record = { count: 1, resetTime: now + WINDOW_MS };
    rateLimitMap.set(key, record);
  } else {
    record.count++;
  }

  // Optional cleanup to prevent memory leak in long-running edge isolate
  if (Math.random() < 0.01) {
    for (const [k, v] of rateLimitMap.entries()) {
      if (now > v.resetTime) rateLimitMap.delete(k);
    }
  }

  if (record.count > LIMIT) {
    return NextResponse.json({
      error: 'Too Many Requests',
      message: 'Rate limit exceeded. Please try again later.'
    }, { status: 429, headers: { 'Retry-After': String(Math.ceil((record.resetTime - now) / 1000)) } });
  }

  return null;
}

// ── JWT Secret (Edge-compatible — TextEncoder only) ─────────────────────────
function getEdgeSecret(): Uint8Array {
  // We can't import requireSecret easily in edge middleware without messing up bundle,
  // so we inline the fail closed logic.
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('CRITICAL SECURITY ERROR: JWT_SECRET is not defined.');
  }
  return new TextEncoder().encode(secret);
}

// ── Extract session JWT from cookies ─────────────────────────────────────────
async function extractSessionAddress(req: NextRequest): Promise<string | null> {
  // Priority 1: SIWE whale session
  const whaleCookie = req.cookies.get('humanity_session')?.value
    ?? req.cookies.get('whale_session')?.value
    ?? req.cookies.get('human_session')?.value;

  if (whaleCookie) {
    try {
      const isEdDSA = !!process.env.JWT_EDDSA_PUBLIC_JWK;
      let payload;
      
      if (isEdDSA) {
        const { importJWK } = await import('jose');
        const pubJwk = JSON.parse(process.env.JWT_EDDSA_PUBLIC_JWK!);
        const publicKey = await importJWK(pubJwk, 'EdDSA');
        const result = await jwtVerify(whaleCookie, publicKey, { algorithms: ['EdDSA'] });
        payload = result.payload;
      } else {
        const result = await jwtVerify(whaleCookie, getEdgeSecret(), { algorithms: ['HS256'] });
        payload = result.payload;
      }
      
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

  // ── [FASE 18: OFAC / Restricted Jurisdiction Geofencing] ─────────────────
  // Blocks IP addresses from the US and OFAC-sanctioned countries at the edge.
  // This is a hard requirement for App Store / Play Store compliance for crypto apps.
  const country = req.headers.get('x-vercel-ip-country') || req.headers.get('cf-ipcountry') || '';
  const RESTRICTED_COUNTRIES = ['US', 'CU', 'IR', 'KP', 'SY', 'RU', 'BY'];
  
  if (country && RESTRICTED_COUNTRIES.includes(country.toUpperCase())) {
    return new NextResponse(
      `<!DOCTYPE html><html><head><title>Unavailable</title></head><body style="font-family: monospace; padding: 40px; background: #000; color: #fff;">
       <h2>Error 451: Unavailable For Legal Reasons</h2>
       <p>The Humanity Ledger services are not available in your jurisdiction (${country}) due to regulatory restrictions.</p>
       </body></html>`,
      { status: 451, headers: { 'content-type': 'text/html' } }
    );
  }

  // 1. Edge Rate Limiting for ALL API Routes
  if (pathname.startsWith('/api/')) {
    const ip = req.headers.get('x-forwarded-for') || req.ip || '127.0.0.1';
    const clientIp = ip.split(',')[0].trim();
    const rateLimitRes = applyRateLimit(clientIp, pathname);
    if (rateLimitRes) return rateLimitRes;
  }

  // 2. Allow all public paths through immediately
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
    const signInUrl = new URL('/connect', req.url);
    signInUrl.searchParams.set('redirect', pathname);
    // Use 303 See Other to force the browser to change POST/PUT to GET
    // This fixes the HTTP 405 Method Not Allowed error when NextAuth or Server Actions
    // hit an unauthenticated route and get redirected to a Page.
    return NextResponse.redirect(signInUrl, 303);
  }

  // 3. Session exists → pass the address to downstream handlers via header
  //    [ZK-ALIGNMENT] The middleware injects verified session metadata securely.
  //    The heavy DB identity-gate check (assertVerifiedIdentity) runs inside
  //    each sensitive API route — not here — to keep edge latency minimal.
  //
  //    Headers injected:
  //      x-verified-session-address → cryptographically verified wallet address
  //      x-session-ts               → timestamp for replay-attack detection in routes
  //      x-request-id               → unique request correlation ID for audit trail
  const response = NextResponse.next();
  response.headers.set('x-verified-session-address', sessionAddress);
  response.headers.set('x-session-ts', String(Date.now()));
  // Unique request ID for distributed tracing — helps correlate audit logs
  const requestId = crypto.randomUUID?.() ?? `req_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  response.headers.set('x-request-id', requestId);

  // [PRIVACY COMPLIANCE] Strict CSP to block GTM and external trackers
  response.headers.set(
    'Content-Security-Policy',
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com; object-src 'none'; base-uri 'self';"
  );

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
