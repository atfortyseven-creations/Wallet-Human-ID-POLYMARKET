import { NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { address } = await req.json();

    if (!address || typeof address !== 'string') {
      return NextResponse.json({ error: 'Missing address' }, { status: 400 });
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return NextResponse.json({ error: 'Invalid Ethereum address' }, { status: 400 });
    }

    const recipient = address.toLowerCase();
    const prisma = getPrisma();

    // BUG FIX: Use interactive transaction (callback form) for TRUE atomicity.
    // The array form ($transaction([op1, op2])) is NOT truly atomic —
    // each op runs independently. The callback form wraps both in a single DB transaction.
    const messages = await prisma.$transaction(async (tx) => {
      const pending = await tx.pendingChatMessage.findMany({
        where: { recipient },
        orderBy: { timestamp: 'asc' },
      });

      if (pending.length > 0) {
        await tx.pendingChatMessage.deleteMany({
          where: { recipient },
        });
      }

      return pending;
    });

    return NextResponse.json({ success: true, messages });
  } catch (error: any) {
    console.error('[OfflineQueueConsume] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
