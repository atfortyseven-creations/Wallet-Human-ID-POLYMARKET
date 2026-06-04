import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    return NextResponse.json({
        success: true,
        graph: { nodes: [], links: [] },
        degraded: true,
        reason: 'Graph database offline  no data available at this time.'
    });
}
