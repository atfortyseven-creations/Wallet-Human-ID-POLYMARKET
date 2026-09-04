import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const body = await req.json();
    const { peerAddress, address } = body;
    
    // Update my lastActiveAt
    if (address) {
      await prisma.userMetrics.upsert({
        where: { userAddress: address.toLowerCase() },
        update: { lastActiveAt: new Date() },
        create: { userAddress: address.toLowerCase(), lastActiveAt: new Date() }
      });
    }

    // Fetch peer's lastActiveAt
    if (peerAddress) {
      const peer = await prisma.userMetrics.findUnique({
        where: { userAddress: peerAddress.toLowerCase() },
        select: { lastActiveAt: true }
      });
      return NextResponse.json({ lastActiveAt: peer?.lastActiveAt?.getTime() || null });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
