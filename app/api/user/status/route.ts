import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { SignJWT } from 'jose';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const address = searchParams.get('address');

        if (!address) {
            return NextResponse.json({ error: 'Wallet address required' }, { status: 400 });
        }

        // FIX: Validate address format to prevent DB injection via crafted query strings
        const normalised = address.toLowerCase();
        if (!/^0x[a-f0-9]{40}$/.test(normalised)) {
            return NextResponse.json({ error: 'Invalid wallet address format' }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where:  { walletAddress: normalised },
            select: { tier: true, worldIdNullifierHash: true }
        });

        // Verification Logic
        const isVerified = user?.tier === 'HUMAN' || user?.tier === 'Private' || !!user?.worldIdNullifierHash;

        // 2. Prepare Response
        const response = NextResponse.json({
            verified: isVerified,
            tier: user?.tier || 'GHOST',
            nullifierHash: user?.worldIdNullifierHash || null
        });

        // [SECURITY HARDENING] Removed cookie auto-hydration here.
        // Previously, if an attacker queried ?address=<verified_whale_address>,
        // the server would issue them valid kyc_token and human_session cookies
        // for that whale, allowing instant account takeover. Sessions must only
        // be established via cryptographic proof in /auth endpoints.

        return response;

    } catch (error: any) {
        console.warn("[UserStatusAPI] DB Connection failed, returning defaults.", error.message);
        return NextResponse.json({
            verified: false,
            tier: 'GHOST',
            nullifierHash: null,
            warning: 'Database offline. Using temporary profile.'
        });
    }
}

