import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const limitParam = searchParams.get('limit');
        const takeLimit = limitParam ? parseInt(limitParam) : 50;

        // FIX: The original query selected fields (hash, wallet, token, amount) that
        // do NOT exist in GlobalWhaleEvent schema. Correct fields are:
        // txHash, amountUSD, protocol, timestamp
        const whaleEvents = await prisma.globalWhaleEvent.findMany({
            take: takeLimit,
            orderBy: {
                timestamp: 'desc'
            },
            select: {
                id: true,
                txHash: true,
                amountUSD: true,
                protocol: true,
                timestamp: true,
            }
        });

        // Normalize to the schema expected by frontend components
        const formattedEvents = whaleEvents.map(ev => ({
            hash: ev.txHash,
            wallet: 'Unknown',           // Not stored in this model  placeholder
            token: 'ETH',               // Not stored in this model  placeholder
            amount: String(ev.amountUSD),
            usdValue: Number(ev.amountUSD),
            action: 'TRANSFER',
            dex: ev.protocol,
            tier: ev.amountUSD >= 1_000_000 ? 'WHALE'
                : ev.amountUSD >= 250_000 ? 'INSTITUTIONAL'
                : 'RETAIL',
            timestamp: ev.timestamp,
        }));

        return NextResponse.json({ success: true, events: formattedEvents });

    } catch (error) {
        console.error('Data Lake Retrieval Error:', error);
        return NextResponse.json(
            { success: false, events: [], error: 'Failed to fetch indexed whale events.' },
            { status: 500 }
        );
    }
}
