import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { mintJWT } from '@/lib/jwt';
import { ethers } from 'ethers';
import rateLimit from '@/lib/rate-limit';
import { z } from 'zod';

const limiter = rateLimit({
    interval: 60 * 1000, // 1 minute
    uniqueTokenPerInterval: 500,
});

const VerifySchema = z.object({
    address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address format"),
    message: z.string().min(1),
    signature: z.string().min(1),
    nonce: z.string().min(1)
});

/**
 * POST /api/auth/system-verify
 * 
 * [HARDENED v2] Accepts a wallet address, message, and signature and:
 *   0. Verifies cryptographic signature proves ownership of the address (SIWE)
 *   1. Upserts the User in DB (creates if not found — fixes "account not found")
 *   2. Mints a 7-day JWT covering BOTH whale_session and human_session cookies
 *   3. Sets system_handshake cookie (JS-readable) for mobile QR auth
 *   4. Updates lastActive timestamp for indexation
 *
 * This is the single source of truth for session establishment.
 * Called from: CoreAuthGate, QuantumVaultOnboarding, login/page.tsx
 */
export async function POST(req: NextRequest) {
    try {
        const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
        try {
            await limiter.check(20, ip); // Max 20 auth attempts per minute
        } catch {
            return NextResponse.json({ error: 'Too many authentication attempts' }, { status: 429 });
        }

        const body = await req.json();
        
        // Zod Input Validation
        const parsedBody = VerifySchema.safeParse(body);
        if (!parsedBody.success) {
            return NextResponse.json({ error: 'Invalid input payload', details: (parsedBody.error as any).errors }, { status: 400 });
        }

        const rawAddress: string = parsedBody.data.address.toLowerCase();
        const signature: string = parsedBody.data.signature;
        const message: string = parsedBody.data.message;
        const nonce: string = parsedBody.data.nonce;

        // [CRITICAL FIX] Nonce is validated by Zod above — do NOT re-read from raw body.
        // Validate the cryptographic signature strictly for ALL users
        try {
            const recoveredAddress = ethers.verifyMessage(message, signature);
            if (recoveredAddress.toLowerCase() !== rawAddress) {
                // [DATA LEAKAGE FIX] Do NOT log the full recovered address — truncate to prevent
                // attacker reconnaissance of valid addresses from log aggregators.
                console.error(`[Auth:Spoof] Signature mismatch for ${rawAddress.slice(0,8)}...`);
                return NextResponse.json({ error: 'Cryptographic verification failed: Unauthorized' }, { status: 401 });
            }
        } catch (cryptoErr) {
            console.error('[Auth:CryptoError] Failed to verify message signature');
            return NextResponse.json({ error: 'Invalid cryptographic signature format' }, { status: 401 });
        }

        // Nonce Verification (Replay Attack Prevention)
        if (!nonce) {
            return NextResponse.json({ error: 'Missing cryptographic nonce' }, { status: 400 });
        }

        const validNonce = await prisma.siweNonce.findUnique({ where: { nonce } });
        if (!validNonce || validNonce.expiresAt < new Date()) {
            return NextResponse.json({ error: 'Nonce invalid or expired. Replay attack prevented.' }, { status: 401 });
        }

        // [CRITICAL FIX] Verify the nonce is actually part of the signed message
        if (!message.includes(nonce)) {
            console.error(`[Auth:Spoof] Message does not contain the expected nonce. Replay attack prevented.`);
            return NextResponse.json({ error: 'Message does not match nonce.' }, { status: 401 });
        }
        
        // Burn the nonce
        await prisma.siweNonce.delete({ where: { nonce } });

        // [INDEXATION FIX] Upsert — never fail with "account not found".
        // If the user somehow never got indexed on signup, this catches them now.
        const user = await prisma.user.upsert({
            where: { walletAddress: rawAddress },
            update: { lastActive: new Date() },
            create: {
                walletAddress: rawAddress,
                tier: 'FREE',
                humanityScore: 0,
                creditsBalance: 0,
                lastActive: new Date(),
            }
        });

        // ── [IDENTITY ADAPTER INTEGRATION] Create Studio Identity ──
        const identity = await prisma.humanityIdentity.upsert({
            where: { walletAddress: rawAddress },
            update: { lastVerifiedAt: new Date() },
            create: {
                walletAddress: rawAddress,
                chainId: 1, // Default EVM chain
                verificationStatus: 'SIWE_VERIFIED',
                lastVerifiedAt: new Date(),
                permissions: []
            }
        });

        const humanitySession = await prisma.humanitySession.create({
            data: {
                identityId: identity.id,
                authenticationMethod: 'SIWE',
                expiresAt: new Date(Date.now() + 604800 * 1000), // 7 days
                securityContext: { ipAddress: ip, userAgent: req.headers.get('user-agent') || 'Unknown' },
            }
        });

        // Mint JWT
        const jwt = await mintJWT({
            sub: rawAddress,
            sid: humanitySession.sessionId, // Required for Option D revocation checks
            address: rawAddress,
            clearance: 'Private',
            tier: user.tier || 'FREE',
            kycStatus: 'UNVERIFIED',
            humanityScore: user.humanityScore || 0,
            iss: 'humanity-ledger', // Fixed old 'whale-alert-network' brand
            source: 'system-verify',
            issuedAt: new Date().toISOString(),
        });

        // [DATA LEAKAGE FIX - Vulnerability #5]
        // The JWT is set in HttpOnly cookies below — it MUST NOT be returned in the JSON body.
        // Exposing the JWT in the response body allows any XSS script to steal the full session token.
        // Clients should rely exclusively on the cookie for subsequent authenticated requests.
        // Exception: the raw JWT string is passed back only for the legacy QR handshake path
        // that requires it for ECDH encryption. This is controlled by the `source` field.
        const isQrHandshake = body._qrHandshake === true;
        const response = NextResponse.json({
            success: true,
            // Only expose JWT in QR handshake mode — all other callers should use cookies
            ...(isQrHandshake ? { jwt } : {}),
            user: { address: rawAddress, tier: user.tier }
        }, {
            headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate',
                'Pragma': 'no-cache',
            }
        });

        // SECURITY FIX VULN-01: Never hardcode a domain. Read from env so Studio Provenance
        // (studio-provenance-production.up.railway.app) gets cookies on its own domain,
        // not on humanidfi.com which would silently block all sessions.
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || '';
        let cookieDomain = (process.env.NODE_ENV === 'production' && appUrl)
            ? (() => { try { return new URL(appUrl).hostname; } catch { return undefined; } })()
            : undefined;

        // VULN-02: Public Suffix List (PSL) rejection.
        // Browsers SILENTLY REJECT cookies if you set the `Domain` attribute to a host
        // that is on the PSL (like .up.railway.app or .vercel.app).
        // By setting cookieDomain to undefined, it becomes a "host-only" cookie, which works perfectly.
        if (cookieDomain && (cookieDomain.includes('railway.app') || cookieDomain.includes('vercel.app'))) {
            cookieDomain = undefined;
        }

        const secureCookieBase = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax' as const,
            maxAge: 604800, // 7 days
            path: '/',
            domain: cookieDomain,
        };

        // Set all three session cookies so every auth gate works
        response.cookies.set('whale_session', jwt, secureCookieBase);
        response.cookies.set('human_session', jwt, secureCookieBase);
        response.cookies.set('humanity_session', jwt, secureCookieBase); // New Option D SIWE session

        // system_handshake must be JS-readable for mobile isLinked detection
        response.cookies.set('system_handshake', rawAddress, {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 604800,
            domain: cookieDomain,
        });

        console.log(`[Auth:OK] Session established → ${rawAddress} (tier=${user.tier})`);
        return response;

    } catch (error: any) {
        console.error('[Auth:Fatal] system-verify:', error);
        return NextResponse.json({ error: 'Auth engine failure' }, { status: 500 });
    }
}
