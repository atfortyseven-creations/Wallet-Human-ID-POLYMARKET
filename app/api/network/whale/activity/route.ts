export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const chain = searchParams.get('chain');
        const limit = parseInt(searchParams.get('limit') || '50');

        const where: any = {};
        if (chain) where.chain = chain;

        const activities = await prisma.whaleActivity.findMany({
            where,
            orderBy: { timestamp: 'desc' },
            take: limit
        });

        // Ensure we fix BigInt serialization and include status
        const serialized = activities.map((a: any) => ({
            ...a,
            blockNumber: a.blockNumber.toString(),
            amount: Number(a.amount),
            usdValue: Number(a.usdValue),
            status: a.status // Explicitly include status
        }));

        return NextResponse.json(serialized);
    } catch (err: any) {
        console.error('[Whale Activity API Error]', err);
        return NextResponse.json({ error: err.message }, { status: 502 });
    }
}
