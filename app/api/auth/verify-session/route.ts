import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/auth/verify-session
 *
 * [UNIVERSAL SESSION VERIFICATION]
 * Checks ALL valid session token types used across the system:
 *   - whale_session   : JWT from system-verify (MetaMask/Rainbow/Wagmi connect)
 *   - human_session   : JWT from qr-hydrate or system-verify
 *   - system_handshake: raw 0x address (QR mobile handshake, fast path)
 *   - human.session-token: NextAuth JWT (Google OAuth, Email OTP via NextAuth)
 *
 * Priority order:
 *   1. Verify whale_session / human_session JWT cryptographically.
 *   2. If JWT valid → session authentic. Heal system_handshake if missing.
 *   3. If JWT invalid/missing → check NextAuth session (Google OAuth).
 *   4. If NextAuth valid → authenticated. Heal system_handshake with email_ prefix.
 *   5. Otherwise → 401 Unauthenticated.
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
                    if (!handshake || !handshake.startsWith('0x')) {
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

        // ─── Priority 2: NextAuth Session (Google OAuth / Email OTP via NextAuth) ──
        // Handles users who signed in via Google OAuth.
        // The NextAuth HttpOnly token is verified by getServerSession() server-side.
        try {
            const { getServerSession } = await import('next-auth');
            const { authOptions } = await import('@/lib/auth');
            const nextAuthSession = await getServerSession(authOptions);

            if (nextAuthSession?.user?.email) {
                const email = nextAuthSession.user.email;
                const emailId = `email_${email.toLowerCase().replace(/[^a-z0-9@._-]/g, '')}`;

                const res = NextResponse.json({
                    authenticated: true,
                    user: { address: emailId, email, tier: 'FREE', authType: 'google_oauth' }
                });

                // Heal the JS-readable handshake cookie for client-side guards
                const needsHeal = !handshake || (!handshake.startsWith('0x') && !handshake.startsWith('email_'));
                if (needsHeal) {
                    res.cookies.set('system_handshake', emailId, {
                        httpOnly: false,
                        secure: isProd,
                        sameSite: 'lax',
                        maxAge: 7 * 24 * 60 * 60,
                        path: '/',
                        domain: cookieDomain,
                    });
                }

                return res;
            }
        } catch (nextAuthError) {
            // NextAuth not available or session invalid — continue to unauthenticated
            console.debug('[verify-session] NextAuth check skipped:', String(nextAuthError).substring(0, 80));
        }

        // ─── Priority 3: [REMOVED INSECURE FALLBACK] ─────────────
        // The system_handshake cookie alone is NOT trusted for auth bypass.
        // All sessions MUST be cryptographically verified via SIWE/JWT or NextAuth.

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
