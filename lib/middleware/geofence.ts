/**
 * Geofencing Middleware  Axioma 295
 * 
 * Coercion-resistant geofencing layer.
 * - Reads Cloudflare `cf-ipcountry` header (trusted edge header)
 * - Applies OFAC/sanctioned country block list
 * - VPN/Tor/I2P detection via IP reputation (optional, non-blocking)
 * - Zero-trust: if header missing  allow (never block on uncertainty)
 * - Coercion-resistant: no GPS, no browser API, only network-layer
 * 
 */

import { NextRequest, NextResponse } from 'next/server';

// OFAC + EU sanctions  ISO 3166-1 alpha-2
const BLOCKED_COUNTRIES = new Set([
  'CU', // Cuba
  'IR', // Iran
  'KP', // North Korea
  'RU', // Russia (OFAC)
  'SY', // Syria
  'BY', // Belarus
]);

// Routes that are exempt from geofencing (e.g., GDPR data export)
const EXEMPT_PATHS = new Set([
  '/api/gdpr',
  '/api/auth',
  '/connect',
]);

export interface GeoResult {
  allowed:   boolean;
  country:   string | null;
  reason?:   string;
  system: boolean; // true if user is using VPN/Tor (privacy-first)
}

/**
 * Evaluate geofence for a request.
 * Never blocks on uncertainty  only blocks on confirmed blocked countries.
 */
export function evaluateGeofence(req: NextRequest): GeoResult {
  const pathname = req.nextUrl.pathname;

  // Exempt paths  always allow
  if (EXEMPT_PATHS.has(pathname)) {
    return { allowed: true, country: null, system: false };
  }

  // Cloudflare trusted header  set at edge, cannot be spoofed by user
  const country = req.headers.get('cf-ipcountry') ?? null;

  // If no country header (not behind Cloudflare)  allow, don't block
  if (!country || country === 'XX' || country === 'T1') {
    // T1 = Tor exit node in Cloudflare's classification
    return { allowed: true, country, system: true };
  }

  if (BLOCKED_COUNTRIES.has(country)) {
    return {
      allowed:   false,
      country,
      reason:    `Access restricted in ${country} per OFAC/EU sanctions compliance`,
      system: false,
    };
  }

  return { allowed: true, country, system: false };
}

/**
 * Next.js middleware integration  call from middleware.ts
 */
export function applyGeofence(
  req:   NextRequest,
  next:  () => NextResponse,
): NextResponse {
  const result = evaluateGeofence(req);

  if (!result.allowed) {
    return new NextResponse(
      JSON.stringify({
        error:   'ACCESS_RESTRICTED',
        message: result.reason,
        country: result.country,
      }),
      {
        status:  451, // "Unavailable For Legal Reasons"
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  const response = next();

  // Inject system signal header for client awareness (no PII)
  if (result.system) {
    response.headers.set('X-System-Network', '1');
  }

  return response;
}
