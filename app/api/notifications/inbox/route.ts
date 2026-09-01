/**
 * /api/notifications/inbox
 * 
 * GET  — returns unread notifications for the authenticated wallet
 * POST — marks notification(s) as read
 *        body: { ids: string[] }  or  { all: true }
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

async function resolveUserId(req: NextRequest): Promise<string | null> {
  const session = await getSession();
  if (session?.userId) return session.userId.toLowerCase();
  const web3 = req.headers.get('x-web3-address') || req.headers.get('x-verified-session-address');
  return web3?.toLowerCase() ?? null;
}

export async function GET(req: NextRequest) {
  try {
    const address = await resolveUserId(req);
    if (!address) return NextResponse.json({ notifications: [], unreadCount: 0 });

    // Find the User row to get its UUID (Notification table uses User.id not address)
    const user = await prisma.user.findFirst({
      where: { walletAddress: address },
      select: { id: true },
    }).catch(() => null);

    if (!user) return NextResponse.json({ notifications: [], unreadCount: 0 });

    const notifications = await prisma.notification.findMany({
      where: {
        OR: [
          { userId: user.id },
          { isGlobal: true },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: 30,
    });

    const unreadCount = notifications.filter(n => !n.read).length;

    return NextResponse.json({ notifications, unreadCount });
  } catch (err) {
    console.error('[Notifications] GET error:', err);
    return NextResponse.json({ notifications: [], unreadCount: 0 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const address = await resolveUserId(req);
    if (!address) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await prisma.user.findFirst({
      where: { walletAddress: address },
      select: { id: true },
    }).catch(() => null);
    if (!user) return NextResponse.json({ ok: true });

    const { ids, all } = await req.json();

    if (all) {
      await prisma.notification.updateMany({
        where: { userId: user.id, read: false },
        data: { read: true },
      });
    } else if (Array.isArray(ids) && ids.length > 0) {
      await prisma.notification.updateMany({
        where: { userId: user.id, id: { in: ids } },
        data: { read: true },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[Notifications] POST error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
