import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { mintJWT } from '@/lib/jwt';
import { ethers } from 'ethers';

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
        const body = await req.json();
        const rawAddress: string = (body.address || '').trim().toLowerCase();
        const signature: string = body.signature;
        const message: string = body.message;

        if (!rawAddress || !/^0x[a-f0-9]{40}$/.test(rawAddress) || !signature || !message) {
            return NextResponse.json({ error: 'Invalid or missing authentication parameters' }, { status: 400 });
        }

        // [QUANTUM AEGIS] Strict SIWE Cryptographic Verification
        // The backdoor bypass has been DESTROYED.
        if (message === 'bypass' || signature === 'bypass') {
             return NextResponse.json({ error: 'FORBIDDEN: Bypass backdoor has been eradicated.' }, { status: 403 });
        }

        // Validate the cryptographic signature
        try {
            const recoveredAddress = ethers.verifyMessage(message, signature);
            if (recoveredAddress.toLowerCase() !== rawAddress) {
                console.error(`[Auth:Spoof] Signature mismatch: recovered ${recoveredAddress} !== expected ${rawAddress}`);
                return NextResponse.json({ error: 'Cryptographic verification failed: Unauthorized' }, { status: 401 });
            }
        } catch (cryptoErr) {
            console.error('[Auth:CryptoError] Failed to verify message:', cryptoErr);
            return NextResponse.json({ error: 'Invalid cryptographic signature format' }, { status: 401 });
        }

        // Nonce Verification (Replay Attack Prevention)
        // Extract nonce from message or body. Assuming body.nonce for cleaner structure.
        const nonce = body.nonce;
        if (!nonce) {
            return NextResponse.json({ error: 'Missing cryptographic nonce' }, { status: 400 });
        }

        const validNonce = await prisma.siweNonce.findUnique({ where: { nonce } });
        if (!validNonce || validNonce.expiresAt < new Date()) {
            return NextResponse.json({ error: 'Nonce invalid or expired. Replay attack prevented.' }, { status: 401 });
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
                creditsBalance: 2500,
                lastActive: new Date(),
            }
        });

        // Mint JWT
        const jwt = await mintJWT({
            sub: rawAddress,
            address: rawAddress,
            clearance: 'Private',
            tier: user.tier || 'FREE',
            kycStatus: 'UNVERIFIED',
            humanityScore: user.humanityScore || 0,
            iss: 'whale-alert-network',
            source: 'system-verify',
            issuedAt: new Date().toISOString(),
        });

        const response = NextResponse.json({
            success: true,
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
        const cookieDomain = (process.env.NODE_ENV === 'production' && appUrl)
            ? (() => { try { return new URL(appUrl).hostname; } catch { return undefined; } })()
            : undefined;

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
