import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';


/**
 * [Elite] Alchemy Webhook Handler
 * Synchronizes DB with Blockchain reality (Source of Truth).
 */
export async function POST(req: Request) {
    try {
        const body = await req.json();
        
        // Alchemy notify webhook format
        const { event } = body;
        if (!event || !event.activity) {
            return NextResponse.json({ status: 'ignored' });
        }

        for (const activity of event.activity) {
            const hash = activity.hash;
            
            // We only care about transactions we have registered as PENDING
            const tx = await (prisma as any).blockchainTransaction.findUnique({
                where: { hash }
            });

            if (tx) {
                // Update final status
                await (prisma as any).blockchainTransaction.update({
                    where: { hash },
                    data: {
                        status: activity.category === 'external' ? 'CONFIRMED' : 'CONFIRMED',
                        updatedAt: new Date(),
                        // @ts-ignore - blockNumber exists in schema, Prisma types may lag
                        blockNumber: BigInt(activity.blockNum || 0),
                    } as any
                });
                console.log(`[ORCHESTRATOR] Transaction ${hash} CONFIRMED via Webhook`);
            }
        }

        return NextResponse.json({ status: 'ok' });
    } catch (error: any) {
        console.error('[WEBHOOK] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

