import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateSecureRequest } from '@/lib/security/premium-security';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const validation = await validateSecureRequest(req);
        if (!validation.valid || !validation.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const user = await prisma.user.findUnique({
            where: { walletAddress: validation.userId },
            select: { id: true }
        });
        if (!user) return NextResponse.json({ notifications: [], unreadCount: 0 });

        let notifications: any[] = [];
        let unreadCount = 0;

        try {
            // Try with actor extended fields
            notifications = await (prisma as any).forumNotification.findMany({
                where: { userId: user.id },
                orderBy: { createdAt: 'desc' },
                take: 50,
                include: {
                    actor: { select: { walletAddress: true } },  // Only safe base column
                }
            });
            unreadCount = await (prisma as any).forumNotification.count({
                where: { userId: user.id, isRead: false }
            });
        } catch {
            // ForumNotification table may not exist yet  return empty
        }

        return NextResponse.json({ notifications, unreadCount });
    } catch (e: any) {
        // Silent degradation  never crash the forum header
        return NextResponse.json({ notifications: [], unreadCount: 0 });
    }
}

export async function PUT(req: NextRequest) {
    try {
        const validation = await validateSecureRequest(req);
        if (!validation.valid || !validation.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const user = await prisma.user.findUnique({
            where: { walletAddress: validation.userId },
            select: { id: true }
        });
        if (!user) return NextResponse.json({ success: false });

        try {
            await (prisma as any).forumNotification.updateMany({
                where: { userId: user.id, isRead: false },
                data: { isRead: true }
            });
        } catch { /* table may not exist */ }

        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ success: false });
    }
}
