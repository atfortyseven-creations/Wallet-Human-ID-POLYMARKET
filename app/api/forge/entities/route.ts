import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { FORGE_ENABLED } from '@/lib/forge';
import { WhaleSeedProcessor } from '@/lib/forge/triggers/whale-seed-processor';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!FORGE_ENABLED) return NextResponse.json({ entities: [] });

  try {
    const limit = 50;
    const entities = await prisma.cosmicEntity.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      where: {
         status: { in: ['ACTIVE', 'HIBERNATING', 'MERGED'] }
      }
    });

    return NextResponse.json({ entities });
  } catch (error) {
    console.error('Failed to fetch entities', error);
    return NextResponse.json({ entities: [] }, { status: 500 });
  }
}

// POST endpoint for the Dev Sandbox Simulator
export async function POST() {
  if (!FORGE_ENABLED) return NextResponse.json({ success: false, error: 'Forge disabled' }, { status: 400 });

  if (process.env.NODE_ENV === 'production') {
     return NextResponse.json({ success: false, error: 'Simulator only available in development mode' }, { status: 403 });
  }

  try {
     const { randomInt, randomBytes } = await import('crypto');
     const dummyEventId = `sim-${Date.now()}-${randomBytes(4).toString('hex')}`;
     const chains = ['ETHEREUM', 'SOLANA', 'BITCOIN', 'BASE', 'ARBITRUM'];
     const dummyUsd = 1_000_000 + randomInt(0, 149_000_000);
     const chain = chains[randomInt(0, chains.length)];

     await WhaleSeedProcessor.tryInjectSeed(dummyEventId, dummyUsd, chain);

     return NextResponse.json({ success: true, simulatedEvent: dummyEventId });
  } catch (error) {
     return NextResponse.json({ success: false }, { status: 500 });
  }
}
