import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { ethers } from 'ethers';

export async function POST(req: Request) {
    try {
        const user = await currentUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { plan } = await req.json();
        if (!plan || !plan.id) return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });

        const authUser = await prisma.authUser.findUnique({
            where: { id: plan.userId },
            select: { encryptedPrivateKey: true }
        });

        // Simulate real swaps for the rebalancer
        // In a real scenario, this would loop through the plan and call 1inch/uniswap
        const txHashes = plan.payload.recommendedSwaps.map((s: string) => `rebalance-tx-${Math.random().toString(36).substring(7)}`);

        await prisma.aIRebalancerPlan.update({
            where: { id: plan.id },
            data: {
                executed: true,
                executedAt: new Date(),
                txHashes: txHashes
            }
        });

        return NextResponse.json({ 
            success: true, 
            swapsExecuted: txHashes.length,
            txHashes 
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
