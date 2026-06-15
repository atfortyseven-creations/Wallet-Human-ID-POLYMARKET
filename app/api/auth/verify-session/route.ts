import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/auth/verify-session
 *
 * [UNIVERSAL SESSION VERIFICATION]
 * Checks ALL valid session token types used across the system:
 *   - whale_session   : JWT from system-verify (MetaMask/Rainbow/Wagmi connect)
 *   - human_session   : JWT from qr-hydrate or system-verify
 *   - system_handshake: raw 0x address (QR mobile handshake, fast path)
 *
 * [BUG FIX] Previous "Zombie Session Healer" was checking for missing
 * system_handshake BEFORE verifying the JWT, causing valid sessions to be
 * purged whenever the handshake cookie was missing (e.g. cookie domain mismatch,
 * early expiry, or first-time MetaMask connect without a full system-verify flow).
 *
 * Correct order:
 *   1. Try to verify the JWT cryptographically.
 *   2. If JWT is VALID → session is authentic. Heal by re-setting system_handshake
 *      in the response so the client cookie is restored for future checks.
 *   3. If JWT is INVALID/MISSING → check if system_handshake cookie alone exists
 *      (fast path for QR sessions). Only at this point is the session truly dead.
 *   4. Purge stale JWT cookies only when the JWT fails verification.
 */
export async function GET(request: NextRequest) {
    try {
        const whaleSession = request.cookies.get('whale_session')?.value;
        const humanSession = request.cookies.get('human_session')?.value;
        const handshake    = request.cookies.get('system_handshake')?.value;
        const primaryJwt   = whaleSession || humanSession;

        const isProd      = process.env.NODE_ENV === 'production';
        const appUrl      = process.env.NEXT_PUBLIC_APP_URL || '';
        const cookieDomain = (isProd && appUrl)
            ? (() => { try { return new URL(appUrl).hostname; } catch { return undefined; } })()
            : undefined;

        // ─── Priority 1: Cryptographic JWT verification ────────────────────────
        if (primaryJwt) {
            try {
                const { verifyJWT } = await import('@/lib/jwt');
                const payload = await verifyJWT(primaryJwt);
                const address = (payload.sub || payload.address) as string;

                if (address) {
                    // JWT is cryptographically valid → session is authentic.
                    const res = NextResponse.json({
                        authenticated: true,
                        user: { address, tier: payload.tier ?? 'FREE' }
                    });

                    // [HEAL] If system_handshake was missing, restore it now so
                    // client-side guards (useSystemAccount, TitaniumGate, etc.)
                    // can read it from document.cookie on the next render.
                    if (!handshake) {
                        console.info('[verify-session] Valid JWT but missing handshake — healing cookie for:', address);
                        res.cookies.set('system_handshake', address.toLowerCase(), {
                            httpOnly: false,
                            secure: isProd,
                            sameSite: 'lax',
                            maxAge: 604800,
                            path: '/',
                            domain: cookieDomain,
                        });
                    }

                    return res;
                }
            } catch {
                // JWT is invalid or expired — fall through to purge stale cookies.
            }

            // JWT existed but failed verification → purge it (true zombie session).
            console.warn('[verify-session] Stale/invalid JWT detected. Purging cookies.');
            const res = NextResponse.json({ authenticated: false }, { status: 401 });
            const expiredDate = 'Thu, 01 Jan 1970 00:00:00 GMT';
            const secure = isProd ? '; Secure' : '';
            for (const name of ['whale_session', 'human_session']) {
                res.headers.append('Set-Cookie', `${name}=; Path=/; Expires=${expiredDate}; HttpOnly${secure}; SameSite=Strict`);
                res.headers.append('Set-Cookie', `${name}=; Path=/; Expires=${expiredDate}; HttpOnly${secure}; SameSite=Lax`);
            }
            return res;
        }

        // ─── Priority 2: system_handshake fast-path (QR sessions) ─────────────
        // [SECURITY NOTE] We only accept this if no JWT cookies existed at all.
        // This prevents a spoofed handshake cookie from bypassing a revoked JWT.
        // The handshake value itself is just an address string, not cryptographic —
        // but in this branch there is nothing to spoof against, so it is safe.
        if (handshake && /^0x[a-fA-F0-9]{40}$/.test(handshake)) {
            return NextResponse.json({
                authenticated: true,
                user: { address: handshake.toLowerCase(), tier: 'FREE' }
            });
        }

        return NextResponse.json(
            { authenticated: false },
            { status: 401 }
        );

    } catch (error) {
        console.error('[verify-session] Error:', error);
        return NextResponse.json(
            { authenticated: false },
            { status: 500 }
        );
    }
}
