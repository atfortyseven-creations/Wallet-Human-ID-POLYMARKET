import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const events = await (prisma as any).forumTelemetry.findMany({
            take: 20,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                action: true,
                createdAt: true,
                userId: true,
                metadata: true
            }
        });

        return NextResponse.json({ success: true, events });
    } catch (e: any) {
        // Fallback for missing table/schema mismatch gracefully
        console.warn("[Telemetry Active Error]:", e.message);
        
        // Return simulated data if table is missing to maintain aesthetics
        const simulated = [
            { id: 'sim-1', action: 'VIEW_TOPIC', createdAt: new Date().toISOString(), metadata: { simulated: true } },
            { id: 'sim-2', action: 'DRAFT_POST', createdAt: new Date(Date.now() - 5000).toISOString(), metadata: { simulated: true } },
            { id: 'sim-3', action: 'CLICK_LIKE', createdAt: new Date(Date.now() - 12000).toISOString(), metadata: { simulated: true } }
        ];
        
        return NextResponse.json({ success: true, events: simulated, warning: "Using simulated data due to DB missing table." });
    }
}
