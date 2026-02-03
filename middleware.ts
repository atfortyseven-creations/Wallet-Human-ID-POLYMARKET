import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks(.*)',
  '/dashboard(.*)',
  '/mercados(.*)',
  '/favorites(.*)',
  '/tokenomics(.*)',
  '/developer(.*)',
  '/funciones(.*)',
  '/soporte(.*)',
  '/vip(.*)',
  '/wallet(.*)',
  '/desarrollador(.*)',
  '/settings(.*)',
])

export default clerkMiddleware(async (auth, request: NextRequest) => {
  const response = NextResponse.next()
  const isDev = process.env.NODE_ENV === 'development'

  // Generate nonce for CSP
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')

  // Content Security Policy
  // Note: We need 'unsafe-inline' and 'unsafe-eval' for some third-party SDKs and hydration
  // but we restrict sources as much as possible.
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' https://clerk.browser.v6.sk https://*.clerk.accounts.dev https://*.googletagmanager.com https://challenges.cloudflare.com https://*.stripe.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' blob: data: https://*.clerk.com https://img.clerk.com https://*.google-analytics.com https://*.googletagmanager.com https://assets.coingecko.com https://*.alchemy.com;
    font-src 'self' https://fonts.gstatic.com;
    connect-src 'self' https://*.clerk.accounts.dev https://clerk.browser.v6.sk https://*.clerk.com https://*.alchemy.com https://*.google-analytics.com https://*.googletagmanager.com https://api.stripe.com;
    frame-src 'self' https://challenges.cloudflare.com https://js.stripe.com;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    block-all-mixed-content;
    ${isDev ? '' : 'upgrade-insecure-requests;'}
  `.replace(/\s{2,}/g, ' ').trim()

  response.headers.set('Content-Security-Policy', cspHeader)
  response.headers.set('x-nonce', nonce) // Expose nonce if needed by server components

  // Strict Transport Security (HSTS)
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload')
  
  // Anti-Clickjacking
  response.headers.set('X-Frame-Options', 'DENY')
  
  // Prevent MIME type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff')
  
  // Referrer Policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  // XSS Protection (Legacy but still useful for older browsers)
  response.headers.set('X-XSS-Protection', '1; mode=block')

  // Permissions Policy (Strict feature control)
  response.headers.set('Permissions-Policy', [
    'geolocation=()',
    'microphone=()',
    'camera=()',
    'payment=(self "https://js.stripe.com")', // Allow Stripe
    'usb=()',
    'display-capture=()',
    'battery=()',
    'gyroscope=()',
    'accelerometer=()'
  ].join(', '))

  // Remove leaking headers
  response.headers.delete('X-Powered-By')
  response.headers.delete('Server')

  // Protect non-public routes
  if (!isPublicRoute(request)) {
    await auth.protect()
  }

  // Rate Limiting headers (Informational)
  if (request.nextUrl.pathname.startsWith('/api')) {
    response.headers.set('X-RateLimit-Policy', '100; w=60')
  }

  return response
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
