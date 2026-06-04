import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Elite Activity Logger
 * Records user actions (trades, simulations, connections) for "Interstellar" persistence.
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { userAddress, type, action, chainId, txHash, metadata } = body;

        if (!userAddress || !type || !action) {
            return NextResponse.json({ error: 'Missing required activity fields' }, { status: 400 });
        }

        // Ensure user exists (Upsert logic for seamless onboarding)
        await (prisma as any).user.upsert({
            where: { walletAddress: userAddress },
            update: { lastActive: new Date() },
            create: { 
                walletAddress: userAddress,
                tier: 'GHOST',
                reputation: 0
            }
        });

        // Record activity
        const activity = await (prisma as any).userActivity.create({
            data: {
                userAddress,
                type,
                action,
                chainId: chainId || 1,
                txHash,
                metadata: metadata || {}
            }
        });

        return NextResponse.json({ success: true, activity });
    } catch (error: any) {
        console.error('[Activity API] Failed to record user action:', error);
        return NextResponse.json({ 
            error: 'Internal Server Error', 
            details: error.message 
        }, { status: 500 });
    }
}

/**
 * Fetch recent activity for a specific user
 */
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const address = searchParams.get('address');

    if (!address) {
        return NextResponse.json({ error: 'Address required' }, { status: 400 });
    }

    try {
        const activities = await (prisma as any).userActivity.findMany({
            where: { userAddress: address },
            orderBy: { timestamp: 'desc' },
            take: 50
        });

        return NextResponse.json({ activities });
    } catch (error: any) {
        console.error('[Activity API] Failed to fetch activities:', error);
        // Fallback: Return empty list to prevent frontend crash
        return NextResponse.json({ activities: [] });
    }
}

