/**
 * Security Headers Configuration
 * 
 * Implements enterprise-grade security headers to protect against:
 * - XSS attacks
 * - Clickjacking
 * - MIME sniffing
 * - Man-in-the-middle attacks
 */

export interface SecurityHeaders {
  'Content-Security-Policy': string;
  'Strict-Transport-Security': string;
  'X-Frame-Options': string;
  'X-Content-Type-Options': string;
  'Referrer-Policy': string;
  'Permissions-Policy': string;
  'X-DNS-Prefetch-Control': string;
}

/**
 * Generates a cryptographically secure nonce for CSP
 * Compatible with Edge Runtime (no Node.js crypto)
 */
export function generateNonce(): string {
  // Use Web Crypto API (works in both browser and Edge Runtime)
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  
  // Convert to base64 manually (Buffer not available in Edge)
  let binary = '';
  for (let i = 0; i < array.length; i++) {
    binary += String.fromCharCode(array[i]);
  }
  
  // Base64 encode
  if (typeof btoa !== 'undefined') {
    return btoa(binary);
  }
  
  // Fallback for environments without btoa
  return Buffer.from(array).toString('base64');
}

/**
 * Builds strict Content Security Policy
 * 
 * @param nonce - Unique nonce for inline scripts
 * @param isDev - Whether in development mode
 */
export function buildCSP(nonce?: string, isDev = false): string {
  const directives = [
    // Default: Only same origin
    "default-src 'self'",
    
    // Scripts: Self + nonce + required CDNs + Auth/Wallet providers
    isDev 
      ? "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.jsdelivr.net https://clerk.browser.js https://metamask-sdk.api.cx.metamask.io" 
      : `script-src 'self' ${nonce ? `'nonce-${nonce}'` : ''} https://cdn.jsdelivr.net https://*.clerk.com https://*.clerk.accounts.dev https://*.metamask.io`,
    
    // Styles: Self + nonce + safe inline
    `style-src 'self' ${nonce ? `'nonce-${nonce}'` : ''} 'unsafe-inline' https://fonts.googleapis.com`,
    
    // Images: Self + data URLs + IPFS + common CDNs + Clerk
    "img-src 'self' data: https: ipfs: https://img.clerk.com",
    
    // Fonts: Self + Google Fonts
    "font-src 'self' data: https://fonts.gstatic.com",
    
    // Connect: API endpoints + Web3 providers + Auth + Analytics + wallet universal links
    "connect-src 'self' https://api.exchangerate-api.com https://*.alchemy.com https://*.infura.io https://*.walletconnect.com https://*.walletconnect.org https://*.reown.com https://*.reown.org https://*.coinbase.com https://*.metamask.io https://*.clerk.com https://*.clerk.accounts.dev https://trustwallet.com https://*.trustwallet.com https://link.trustwallet.com https://rnbwapp.com https://go.cb-w.com https://relay.walletconnect.com https://*.bridge.walletconnect.org wss://*.walletconnect.com wss://*.walletconnect.org wss://*.reown.com wss://*.reown.org wss://*.metamask.io wss://relay.walletconnect.com wss://*.bridge.walletconnect.org",
    
    // Frames: WalletConnect + Trusted providers + Auth
    "frame-src 'self' https://verify.walletconnect.com https://verify.walletconnect.org https://verify.reown.com https://verify.reown.org https://*.clerk.com https://clerk.accounts.dev",
    
    // Objects: None allowed
    "object-src 'none'",
    
    // Base URI: Self only
    "base-uri 'self'",
    
    // Form actions: Self only
    "form-action 'self'",
    
    // Frame ancestors: Prevent clickjacking
    "frame-ancestors 'none'",
    
    // Upgrade insecure requests
    "upgrade-insecure-requests",
    
    // Block mixed content
    "block-all-mixed-content"
  ];
  
  return directives.join('; ');
}

/**
 * Gets all security headers with strict configuration
 */
export function getSecurityHeaders(nonce?: string, isDev = false): SecurityHeaders {
  return {
    // Content Security Policy
    'Content-Security-Policy': buildCSP(nonce, isDev),
    
    // HSTS: Force HTTPS for 2 years, include subdomains, allow preload
    'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
    
    // Prevent clickjacking
    'X-Frame-Options': 'DENY',
    
    // Prevent MIME sniffing
    'X-Content-Type-Options': 'nosniff',
    
    // Strict referrer policy
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    
    // Permissions policy - disable unnecessary features, but allow camera for QR scanning
    'Permissions-Policy': [
      'geolocation=()',
      'microphone=()',
      'camera=(self)',   // Required for QR scanner in mobile wallet linking flow
      'payment=(self)',
      'usb=()',
      'magnetometer=()',
      'gyroscope=()',
      'accelerometer=()'
    ].join(', '),
    
    // Disable DNS prefetching for privacy
    'X-DNS-Prefetch-Control': 'off'
  };
}

/**
 * Validates CSP header is properly configured
 */
export function validateCSP(csp: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!csp.includes("default-src 'self'")) {
    errors.push("Missing default-src 'self' directive");
  }
  
  if (!csp.includes("object-src 'none'")) {
    errors.push("Missing object-src 'none' directive");
  }
  
  if (!csp.includes("frame-ancestors 'none'")) {
    errors.push("Missing frame-ancestors 'none' directive");
  }
  
  if (csp.includes("'unsafe-eval'") && !csp.includes("script-src 'self' 'unsafe-eval'")) {
    errors.push("unsafe-eval should only be in development");
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

