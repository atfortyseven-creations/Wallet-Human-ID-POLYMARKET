// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { deriveIdentityHash } from '@/lib/aztec/zk-identity';
import rateLimit from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

const limiter = rateLimit({ interval: 60 * 1000, uniqueTokenPerInterval: 500 });

const EARN_EVENTS = {
  DAILY_LOGIN:        { amount: 10,  description: 'Daily Login Reward' },
  AZTEC_TRANSFER:     { amount: 50,  description: 'Aztec ZK Transfer Completed' },
  IDENTITY_REGISTER:  { amount: 200, description: 'ZK Identity Registration' },
  WALLET_CONNECT:     { amount: 25,  description: 'First Wallet Connection' },
} as const;

type EarnEvent = keyof typeof EARN_EVENTS;

/**
 * POST /api/qds/earn
 *
 * Triggers a QD earning event for a verified user.
 * Deduplication is enforced per event type per day (or per session for one-time events).
 *
 * Body: { address: string, event: EarnEvent }
 */
export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    try { await limiter.check(10, ip); } catch {
      return NextResponse.json({ error: 'Rate limit exceeded.' }, { status: 429 });
    }

    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const rawAddress = typeof body.address === 'string' ? body.address.trim().toLowerCase() : '';
    const event = body.event as EarnEvent;

    if (!rawAddress || rawAddress.length < 10) {
      return NextResponse.json({ error: 'Invalid address.' }, { status: 400 });
    }
    if (rawAddress !== session.userId.toLowerCase()) {
      return NextResponse.json({ error: 'Forbidden: You can only claim rewards for your own address.' }, { status: 403 });
    }
    if (!event || !(event in EARN_EVENTS)) {
      return NextResponse.json({ error: `Unknown event. Valid: ${Object.keys(EARN_EVENTS).join(', ')}` }, { status: 400 });
    }

    const config = EARN_EVENTS[event];
    const identityHash = deriveIdentityHash(rawAddress);

    // Deduplication: daily events can only fire once per calendar day per address
    const isDailyEvent = event === 'DAILY_LOGIN';
    const isOneTimeEvent = event === 'WALLET_CONNECT' || event === 'IDENTITY_REGISTER';

    if (isDailyEvent) {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const existingToday = await (prisma as any).qdTransaction.findFirst({
        where: {
          aztecAddress: rawAddress,
          type: 'EARN',
          description: config.description,
          createdAt: { gte: startOfDay },
        },
      });
      if (existingToday) {
        return NextResponse.json({ message: 'Already claimed today. Come back tomorrow!', alreadyClaimed: true });
      }
    }

    if (isOneTimeEvent) {
      const existingEver = await (prisma as any).qdTransaction.findFirst({
        where: {
          aztecAddress: rawAddress,
          type: 'EARN',
          description: config.description,
        },
      });
      if (existingEver) {
        return NextResponse.json({ message: 'This one-time reward was already claimed.', alreadyClaimed: true });
      }
    }

    // Create the earning transaction
    await (prisma as any).qdTransaction.create({
      data: {
        aztecAddress: rawAddress,
        type: 'EARN',
        amount: config.amount,
        description: config.description,
      },
    });

    return NextResponse.json({
      success: true,
      event,
      earned: config.amount,
      message: `+${config.amount} QDs earned: ${config.description}`,
    });

  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Internal error' }, { status: 500 });
  }
}
