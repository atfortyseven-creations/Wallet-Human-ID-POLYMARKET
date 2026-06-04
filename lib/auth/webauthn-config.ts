import { NextRequest } from 'next/server';

export const rpName = 'Whale Alert Wallet';

// Fallback for static contexts (client-side build time)
export const rpID = process.env.NEXT_PUBLIC_RP_ID || 'localhost';
export const origin = process.env.NEXT_PUBLIC_ORIGIN || `http://${rpID}:3000`;

/**
 * Dynamic RP ID detection for Server Actions / API Routes
 * Ensures the RP ID matches the actual host (e.g. WhaleAlert ID.railway.app)
 * preventing "Invalid RP ID" errors when env vars are missing.
 */
export function getRpID(req: NextRequest | Request): string {
    const host = req.headers.get('host');
    if (!host) return rpID;
    
    // RP ID cannot contain the port
    return host.split(':')[0]; 
}

export function getOrigin(req: NextRequest | Request): string {
    const host = req.headers.get('host');
    if (!host) return origin;

    // Assume HTTPS in production (non-localhost)
    const protocol = host.includes('localhost') ? 'http' : 'https';
    return `${protocol}://${host}`;
}

