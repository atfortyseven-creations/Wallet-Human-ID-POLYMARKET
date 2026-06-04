import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const wallet = searchParams.get('address')?.toLowerCase();
        
        if (!wallet) {
             return NextResponse.json({ success: true, alerts: [] });
        }

        const alerts = await prisma.alert.findMany({
            where: { userId: wallet },
            orderBy: { createdAt: 'desc' }
        });
        
        // Map back to frontend expected structure
        const mapped = alerts.map(a => ({
            id: a.id,
            name: a.metric ? `Trigger: ${a.metric}` : 'Custom Alert',
            type: a.condition === 'ABOVE' ? 'PRICE_ABOVE' : 'PRICE_BELOW',
            asset: a.metric,
            threshold: a.threshold,
            status: a.isActive ? 'ACTIVE' : 'PAUSED',
            createdAt: a.createdAt,
        }));
        
        return NextResponse.json({ success: true, alerts: mapped });
    } catch (e) {
        return NextResponse.json({ success: false, error: 'Failed to fetch alerts' });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const wallet = body.address?.toLowerCase();
        
        if (!wallet) {
            return NextResponse.json({ success: false, error: 'Wallet address required' }, { status: 400 });
        }

        // Auto-provision System User if missing
        await prisma.user.upsert({
            where: { walletAddress: wallet },
            update: { lastActive: new Date() },
            create: { walletAddress: wallet, tier: 'basic' }
        });

        const newAlert = await prisma.alert.create({
            data: {
                userId: wallet,
                targetType: 'PRICE', // Defaulting to price observation
                condition: body.condition || 'ABOVE',
                threshold: Number(body.threshold) || 0,
                metric: body.metric || 'BTC',
                isActive: true,
            }
        });
        return NextResponse.json({ success: true, alert: newAlert });
    } catch (e: any) {
        console.error('[ALERTS_POST_FAILURE]', e);
        return NextResponse.json({ success: false, error: 'Database Synchronization Failure' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const url = new URL(req.url);
        const id = url.searchParams.get('id');
        const wallet = url.searchParams.get('address')?.toLowerCase();

        if (id && wallet) {
            await prisma.alert.deleteMany({ where: { id, userId: wallet } }); // Strict permission L1
            return NextResponse.json({ success: true });
        }
        return NextResponse.json({ success: false }, { status: 400 });
    } catch (e) {
        return NextResponse.json({ success: false }, { status: 500 });
    }
}
