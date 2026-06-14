import { NextRequest, NextResponse } from 'next/server';
import { sumsubProvider } from '@/lib/identity/sumsub-provider';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/identity/token
 * Generates a secure access token for Sumsub WebSDK.
 * Binds the verification to the authenticated user.
 */
export async function GET(req: NextRequest) {
    try {
        const { getSession } = await import('@/lib/session');
        const session = await getSession();
        
        if (!session || !session.userId) {
            return NextResponse.json({ error: 'Unauthorized. Must authenticate first.' }, { status: 401 });
        }
        
        const userId = session.userId; // Anchor identity to the unique wallet
        
        // 2. Check existing status
        const kycRecord = await prisma.kYCRecord.findUnique({
            where: { userId }
        });

        if (kycRecord?.status === 'VERIFIED') {
            return NextResponse.json({ kycStatus: 'VERIFIED' });
        }

        // 3. Generate Token
        // 'basic-kyc-level' is a standard preset in Sumsub dashboard
        const token = await sumsubProvider.generateAccessToken(userId, 'basic-kyc-level');

        return NextResponse.json({ 
            token, 
            kycStatus: kycRecord?.status || 'PENDING',
            userId 
        });

    } catch (error: any) {
        console.error('Identity Token Error:', error);
        return NextResponse.json({ error: 'Failed to generate token' }, { status: 500 });
    }
}

