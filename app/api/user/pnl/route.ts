import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateSecureRequest } from '@/lib/security/premium-security';

export async function GET(req: NextRequest) {
    try {
        const validation = await validateSecureRequest(req);
        if (!validation.valid || !validation.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const requestedAddress = searchParams.get('address');

        // Enforce strict owner-only access  users cannot view others' PnL
        if (!requestedAddress || requestedAddress.toLowerCase() !== validation.userId.toLowerCase()) {
            return NextResponse.json({ error: 'Forbidden: You can only view your own positions.' }, { status: 403 });
        }

        const address = requestedAddress;

        // @ts-ignore
        const positions = await prisma.exchangePosition.findMany({
            where: { userId: address, status: 'OPEN' }
        });

        let totalPnL = 0;
        const enrichedPositions = positions.map((pos: any) => {
            const unrealized = Number(pos.unrealizedPnl);
            totalPnL += unrealized;
            return {
                ...pos,
                unrealizedPnl: unrealized
            };
        });

        return NextResponse.json({ totalPnL, positions: enrichedPositions });
    } catch (e: any) {
        console.error('[API/PNL] Error:', e);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

