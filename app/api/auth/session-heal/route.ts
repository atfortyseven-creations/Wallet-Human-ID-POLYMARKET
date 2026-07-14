import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * GET /api/auth/session-heal
 *
 * [GOOGLE OAUTH SESSION HEALER]
 * Called client-side after a NextAuth (Google/Email) OAuth callback.
 * 
 * Flow:
 *   1. User completes Google OAuth → NextAuth sets HttpOnly `human.session-token`
 *   2. Client calls this endpoint (credentials: include)
 *   3. Server reads the NextAuth session via getServerSession()
 *   4. If valid: sets JS-readable `system_handshake` cookie with email-derived identifier
 *   5. Client-side TitaniumGate/useSystemAccount can now detect the authenticated state
 *
 * Security:
 *   - system_handshake is set HttpOnly:false (intentional — must be readable by client JS)
 *   - But it's validated by the SIWE/JWT system, NOT trusted for access control alone
 *   - The HttpOnly `human.session-token` from NextAuth is the authoritative auth token
 *   - This endpoint only HEALS the readable cookie; it cannot create a new session
 */
export async function GET(request: NextRequest) {
    try {
        const isProd = process.env.NODE_ENV === 'production';

        // Read the NextAuth session (server-side, reads HttpOnly token)
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ healed: false, reason: 'no_session' }, { status: 401 });
        }

        const email = session.user.email;
        const name  = session.user.name || '';

        if (!email) {
            return NextResponse.json({ healed: false, reason: 'no_email' }, { status: 400 });
        }

        // Derive a stable identifier from the email.
        // Format: email_<sanitized_email> — distinguishable from wallet addresses (0x...)
        // The TitaniumGate accepts any truthy system_handshake starting with "email_" or "0x"
        const emailId = `email_${email.toLowerCase().replace(/[^a-z0-9@._-]/g, '')}`;

        const res = NextResponse.json({
            healed: true,
            identity: { email, name, type: 'google_oauth' }
        });

        // Set the JS-readable handshake cookie
        res.cookies.set('system_handshake', emailId, {
            httpOnly: false,         // Must be readable by TitaniumGate / useSystemAccount
            secure: isProd,
            sameSite: 'lax',         // lax allows it to be sent on top-level navigation redirects
            maxAge: 7 * 24 * 60 * 60, // 7 days — matches NextAuth session maxAge
            path: '/',
        });

        // Also set a non-httpOnly session marker for the gate
        res.cookies.set('nextauth_healed', '1', {
            httpOnly: false,
            secure: isProd,
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60,
            path: '/',
        });

        return res;

    } catch (error) {
        console.error('[session-heal] Error:', error);
        return NextResponse.json({ healed: false, reason: 'internal_error' }, { status: 500 });
    }
}
