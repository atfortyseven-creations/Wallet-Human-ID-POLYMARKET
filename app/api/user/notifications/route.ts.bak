import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateSecureRequest } from '@/lib/security/premium-security';

export async function GET(req: NextRequest) {
    try {
        const validation = await validateSecureRequest(req);
        if (!validation.valid) {
            return NextResponse.json({ error: validation.error }, { status: 401 });
        }
        const userId = validation.userId!;

        const notifications = await prisma.notification.findMany({
            where: { userId, archived: false },
            orderBy: { createdAt: 'desc' },
            take: 50
        });

        // Map to SmartAlert interface
        const alerts = notifications.map(n => {
            const meta = n.metadata as any || {};
            return {
                id: n.id,
                type: n.type === 'market' ? 'whale_move' : 'system',
                walletLabel: 'Wallet', // Could fetch relation or store in metadata
                walletAddress: meta.wallet || '',
                title: n.title,
                description: n.message,
                action: meta.amount ? {
                    type: meta.action === 'buy' ? 'COMPRA' : meta.action === 'sell' ? 'VENTA' : (meta.action || 'TRANSFER'),
                    token: meta.symbol || 'ETH',
                    amount: meta.amount,
                    usdValue: meta.usdValue || 0
                } : undefined,
                timestamp: n.createdAt,
                priority: meta.usdValue > 1000 ? 'critical' : 'medium',
                read: n.read,
                copyable: true
            };
        });

        return NextResponse.json({ alerts });
    } catch (error: any) {
        console.warn("[NotificationsAPI] DB Connection failed, returning empty alerts.", error.message);
        return NextResponse.json({ 
            alerts: [], 
            warning: 'Database offline. Notifications unavailable.' 
        });
    }
}

export async function PUT(req: NextRequest) {
    try {
        const validation = await validateSecureRequest(req);
        if (!validation.valid) {
            return NextResponse.json({ error: validation.error }, { status: 401 });
        }
        const userId = validation.userId!;

        const body = await req.json();
        const { id, read } = body;
        
        // STRICTOR: Only update if it belongs to the user
        const result = await prisma.notification.updateMany({
            where: { id, userId },
            data: { read }
        });

        if (result.count === 0) {
            return NextResponse.json({ error: 'Notification not found or access denied' }, { status: 404 });
        }
        
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
    }
}

