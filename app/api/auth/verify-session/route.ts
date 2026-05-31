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
 * Previously only checked next-auth.session-token via getSession(), which
 * returned 401 for every QR, Humanity Ledger, and system-verify session,
 * causing ConnectPage to skip the "already authenticated" fast path and
 * trigger a redundant wallet re-sign loop.
 */
export async function GET(request: NextRequest) {
    try {
        // Priority 1: whale_session or human_session JWT
        const whaleSession  = request.cookies.get('whale_session')?.value;
        const humanSession  = request.cookies.get('human_session')?.value;
        const handshake = request.cookies.get('system_handshake')?.value;
        const primaryJwt    = whaleSession || humanSession;

        if (primaryJwt) {
            // [ZOMBIE SESSION HEALER]
            // If the HTTP-only JWT exists but the client-side system_handshake is missing,
            // this is a "zombie" session (caused by the old logout bug where localStorage/handshake
            // were cleared but httpOnly cookies were left behind).
            // We MUST invalidate the session to break the Connect -> Portfolio -> Connect redirect loop.
            if (!handshake) {
                console.warn('[verify-session] Zombie session detected (missing handshake). Purging cookies.');
                const res = NextResponse.json({ authenticated: false }, { status: 401 });
                res.cookies.set('whale_session', '', { maxAge: 0, path: '/' });
                res.cookies.set('human_session', '', { maxAge: 0, path: '/' });
                return res;
            }

            try {
                const { verifyJWT } = await import('@/lib/jwt');
                const payload = await verifyJWT(primaryJwt);
                const address = (payload.sub || payload.address) as string;
                if (address) {
                    return NextResponse.json({
                        authenticated: true,
                        user: { address, tier: payload.tier ?? 'FREE' }
                    });
                }
            } catch {
                // JWT invalid or expired — fall through
            }
        }

        // Priority 2: system_handshake cookie (raw Ethereum address)
        // Set by QR hydration and system-verify. JS-readable (httpOnly: false).
        if (handshake && /^0x[a-fA-F0-9]{40}$/.test(handshake)) {
            return NextResponse.json({
                authenticated: true,
                user: { address: handshake, tier: 'FREE' }
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
