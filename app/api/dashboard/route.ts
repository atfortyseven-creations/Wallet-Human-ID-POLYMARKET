import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const wallet = searchParams.get('address')?.toLowerCase();
        
        if (!wallet) return NextResponse.json({ nodes: [], edges: [] });

        const state = await prisma.canvasState.findUnique({
            where: { userId: wallet }
        });

        return NextResponse.json(state || { nodes: [], edges: [] });
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    try {
        const body = await req.json();
        const wallet = body.address?.toLowerCase();
        if (!wallet) return NextResponse.json({ error: 'Missing Identity' }, { status: 400 });

        const state = await prisma.canvasState.upsert({
            where: { userId: wallet },
            update: {
                nodes: body.nodes,
                edges: body.edges,
                pan: body.pan,
                lastSyncedAt: new Date()
            },
            create: {
                userId: wallet,
                nodes: body.nodes,
                edges: body.edges,
                pan: body.pan
            }
        });

        return NextResponse.json({ success: true, lastSyncedAt: state.lastSyncedAt });
    } catch (error) {
        return NextResponse.json({ error: 'Persistence Failure' }, { status: 500 });
    }
}

