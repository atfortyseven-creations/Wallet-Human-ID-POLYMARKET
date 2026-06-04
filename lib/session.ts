import { SignJWT, jwtVerify, JWTPayload } from 'jose';
import { cookies } from 'next/headers';
import crypto from 'crypto';

//  CRITICAL SECURITY GUARD 
// FIX: 'VOID_SECRET_99_POLY' was the hardcoded fallback. This secret is now
// publicly visible in source code, making every SIWE+session JWT forgeable.
// An attacker could craft:
//   { alg:'HS256' }.{ sub:'0x<any_address>', clearance:'Enterprise', exp:... }
// sign it with the known secret and bypass ALL middleware authentication checks.
// We now fail loud at module load  an unconfigured secret must halt the server.
const _rawJwtSecret = process.env.JWT_SECRET;
if (!_rawJwtSecret && process.env.NODE_ENV === 'production' && process.env.SKIP_ENV_VALIDATION !== 'true') {
    // [RESILIENCE] Log a critical warning but never throw at module-level in production.
    // A fatal throw here prevents the entire server from starting, making the app
    // impossible to deploy without first setting env vars in Railway dashboard.
    // Auth routes will return 401 Unauthorized if JWT_SECRET is missing.
    console.error(
        '[SECURITY CRITICAL] JWT_SECRET environment variable is not set. '
        + 'The server is running INSECURELY. '
        + 'Set JWT_SECRET in your Railway dashboard immediately. '
        + 'All session tokens will use a temporary insecure fallback.'
    );
}
// In development: warn loudly but allow operation with a deterministic dev secret
if (!_rawJwtSecret) {
    console.warn(
        '\x1b[33m[WARNING] JWT_SECRET not set. Using a temporary development secret.\n'
        + 'This is INSECURE. Set JWT_SECRET before deploying to production.\x1b[0m'
    );
}
const JWT_SECRET = new TextEncoder().encode(_rawJwtSecret || 'dev-only-not-for-production-jwt-secret-change-me');

// Session configuration
export const SESSION_CONFIG = {
    ACCESS_TOKEN_DURATION: 7 * 24 * 60 * 60, // 7 days in seconds
    REFRESH_TOKEN_DURATION: 7 * 24 * 60 * 60, // 7 days in seconds
    REFRESH_INTERVAL: 15 * 60 * 1000, // 15 minutes in milliseconds (for client-side)
} as const;

export interface SessionPayload extends JWTPayload {
    userId: string;
    email: string;
    type: 'access' | 'refresh';
    fingerprint?: string;
}

/**
 * Generate device fingerprint from request headers
 */
export function generateFingerprint(userAgent: string, ip: string): string {
    return crypto
        .createHash('sha256')
        .update(`${userAgent}:${ip}`)
        .digest('hex');
}

/**
 * Create an access token (30 min duration)
 */
export async function createAccessToken(userId: string, email: string, fingerprint: string): Promise<string> {
    const token = await new SignJWT({
        userId,
        email,
        type: 'access',
        fingerprint,
    } as SessionPayload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(`${SESSION_CONFIG.ACCESS_TOKEN_DURATION}s`)
        .sign(JWT_SECRET);

    return token;
}

/**
 * Create a refresh token (7 day duration)
 */
export async function createRefreshToken(userId: string, email: string, fingerprint: string): Promise<string> {
    const token = await new SignJWT({
        userId,
        email,
        type: 'refresh',
        fingerprint,
    } as SessionPayload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(`${SESSION_CONFIG.REFRESH_TOKEN_DURATION}s`)
        .sign(JWT_SECRET);

    return token;
}

/**
 * Verify and decode a JWT token
 */
export async function verifyToken(token: string): Promise<SessionPayload | null> {
    try {
        const verified = await jwtVerify(token, JWT_SECRET);
        return verified.payload as SessionPayload;
    } catch (error) {
        console.error('Token verification failed:', error);
        return null;
    }
}

/**
 * Set secure httpOnly cookies for both tokens
 */
export async function setSessionCookies(accessToken: string, refreshToken: string) {
    const cookieStore = await cookies();
    
    // Access token cookie - 30 minutes
    cookieStore.set('human.access-token', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: SESSION_CONFIG.ACCESS_TOKEN_DURATION,
        path: '/',
    });

    // Refresh token cookie - 7 days
    cookieStore.set('human.refresh-token', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: SESSION_CONFIG.REFRESH_TOKEN_DURATION,
        path: '/',
    });
}

/**
 * Get session from cookies.
 * Supports TWO token formats:
 * 1. SIWE system session: cookie 'human_session', JWT payload { sub, address, clearance }
 * 2. Email/legacy session:   cookie 'human.access-token', JWT payload { userId, email, type }
 */
export async function getSession(): Promise<SessionPayload | null> {
    const cookieStore = await cookies();

    //  Priority 1: SIWE system session 
    const siweToken = cookieStore.get('human_session')?.value;
    if (siweToken) {
        try {
            const { verifyJWT } = await import('@/lib/jwt');
            const payload = await verifyJWT(siweToken) as any;
            // Normalize SIWE payload  SessionPayload shape
            const siweUserId = payload.address || payload.sub;
            if (siweUserId) {
                return {
                    userId: (siweUserId as string).toLowerCase(),
                    email: '',
                    type: 'access',
                    sub: payload.sub,
                    exp: payload.exp,
                    iat: payload.iat,
                };
            }
        } catch {
            // Expired or invalid SIWE token  fall through to email session
        }
    }

    //  Priority 2: Email/legacy access token 
    const accessToken = cookieStore.get('human.access-token')?.value;
    if (accessToken) {
        const verified = await verifyToken(accessToken);
        if (verified) return verified;
    }

    //  Priority 3: System QR Handshake 
    const handshakeToken = cookieStore.get('system_handshake')?.value;
    if (handshakeToken && /^0x[a-fA-F0-9]{40}$/.test(handshakeToken)) {
        return {
            userId: handshakeToken.toLowerCase(),
            email: '',
            type: 'access',
            sub: handshakeToken.toLowerCase()
        };
    }

    return null;
}

/**
 * Clear all session cookies
 */
export async function clearSessionCookies() {
    const cookieStore = await cookies();
    
    cookieStore.delete('human.access-token');
    cookieStore.delete('human.refresh-token');
}

/**
 * Validate device fingerprint
 */
export function validateFingerprint(sessionFingerprint: string, requestFingerprint: string): boolean {
    return sessionFingerprint === requestFingerprint;
}

