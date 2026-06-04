import { NextResponse } from 'next/server';
import { nodeHealthService } from '@/lib/services/NodeHealthService';

/**
 * GET /api/infrastructure/node-health
 * Returns real-time health for Elite nodes.
 */
export async function GET() {
    try {
        const health = await nodeHealthService.getCriticalNodesHealth();
        return NextResponse.json(health);
    } catch (error: any) {
        console.error('[API] Node health failed:', error.message);
        return NextResponse.json({ error: 'Failed to fetch node health' }, { status: 500 });
    }
}
