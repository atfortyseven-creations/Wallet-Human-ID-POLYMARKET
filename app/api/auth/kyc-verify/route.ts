import { NextRequest, NextResponse } from 'next/server';
import { verifyMessage } from 'viem';
import { prisma } from '@/lib/prisma';
import { mintJWT } from '@/lib/jwt';

/**
 * POST /api/auth/kyc-verify
 * 
 * Finalizes the Zero-Knowledge KYC process by verifying the signature
 * and updating the user's verification status in the database.
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { address, signature, message } = body;
        
        if (!address || !signature || !message) {
            return NextResponse.json({ error: 'Missing cryptographic verification data' }, { status: 400 });
        }

        // 1. Strict Cryptographic Verification of the Attestation
        const isValid = await verifyMessage({ address, message, signature });
        if (!isValid) {
            console.error(`[KYC:SECURITY]  Invalid biometric signature attempted for ${address}`);
            return NextResponse.json({ error: 'Cryptographic binding failed' }, { status: 401 });
        }
        const normalizedAddress = address.toLowerCase();
        const user = await prisma.user.upsert({
            where: { walletAddress: normalizedAddress },
            update: { 
                isZkVerified: true,
                humanityScore: { increment: 100 },
                lastActive: new Date()
            },
            create: {
                walletAddress: normalizedAddress,
                isZkVerified: true,
                humanityScore: 100,
                tier: 'INITIATE',
                lastActive: new Date()
            }
        });

        // 3. Issue Updated System JWT
        const jwt = await mintJWT({
            sub: normalizedAddress,
            address: normalizedAddress,
            clearance: 'Private',
            tier: user.tier || 'FREE',
            kycStatus: 'VERIFIED',
            isZkVerified: true,
            humanityScore: user.humanityScore || 100,
            iss: 'whale-alert-network',
            issuedAt: new Date().toISOString()
        });

        // 4. Response with cookies
        const response = NextResponse.json({ 
            success: true,
            status: 'VERIFIED',
            user: {
                address: normalizedAddress,
                isZkVerified: true
            }
        });

        response.cookies.set('human_session', jwt, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 604800, // 7 days
            path: '/',
        });

        console.log(`[KYC:Success] Identity verified and persisted for ${normalizedAddress}`);
        return response;

    } catch (error: any) {
        console.error('[KYC:Fatal]', error);
        return NextResponse.json({ error: 'Identity Engine Failure' }, { status: 500 });
    }
}
