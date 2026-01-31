import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const authUser = await prisma.authUser.findUnique({
            where: { email: session.user.email },
            select: {
                encryptedMnemonic: true,
                walletAddress: true,
            }
        });

        if (!authUser || !(authUser as any).encryptedMnemonic) {
            return NextResponse.json({ error: 'Internal wallet not found' }, { status: 404 });
        }

        // [SENIOR UPGRADE] Log this high-risk access attempt
        const { logSecurityEvent } = await import('@/lib/security');
        const ip = request.headers.get('x-forwarded-for') || 'unknown';
        const userAgent = request.headers.get('user-agent') || 'unknown';
        
        await logSecurityEvent({
            type: 'REVEAL_MNEMONIC',
            userId: session.user.email, // using email as identifier for logging
            ipAddress: ip,
            userAgent,
            severity: 'CRITICAL',
            metadata: { 
                walletAddress: (authUser as any).walletAddress,
                timestamp: new Date().toISOString()
            }
        });

        return NextResponse.json({
            encryptedMnemonic: (authUser as any).encryptedMnemonic,
            walletAddress: (authUser as any).walletAddress
        });
    } catch (error) {
        console.error('[API] Failed to fetch encrypted mnemonic:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
