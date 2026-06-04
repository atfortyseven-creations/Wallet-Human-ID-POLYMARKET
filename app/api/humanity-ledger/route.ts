import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET  Real on-chain data only. No fallback mocks. No fabricated data.
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 200);
    const page  = Math.max(parseInt(searchParams.get('page')  || '1',  10), 1);
    const skip  = (page - 1) * limit;

    const [blocks, currentBlocks, currentTransactions, auditLogs] = await Promise.all([
      prisma.humanityLedgerBlock.findMany({
        take: limit,
        skip,
        orderBy: { timestamp: 'desc' },
        include: {
          transactions: {
            take: 10,
            orderBy: { value: 'desc' },
          },
        },
      }),
      prisma.humanityLedgerBlock.count(),
      prisma.humanityLedgerTransaction.count(),
      prisma.auditLog.findMany({
        where: { action: 'HUMANITY_LEDGER_RESET' }
      })
    ]);

    let totalBlocks = currentBlocks;
    let totalTransactions = currentTransactions;

    for (const log of auditLogs) {
      if (log.metadata && typeof log.metadata === 'object') {
        const meta = log.metadata as any;
        if (meta.deletedBlocks) totalBlocks += meta.deletedBlocks;
        if (meta.deletedTransactions) totalTransactions += meta.deletedTransactions;
      }
    }

    // BigInt  string for JSON serialization
    const body = JSON.stringify(
      { ok: true, blocks, stats: { totalBlocks, totalTransactions } },
      (_, v) => (typeof v === 'bigint' ? v.toString() : v)
    );

    return new NextResponse(body, {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('[API Humanity Ledger]', error);
    return NextResponse.json(
      { ok: false, error: 'Database synchronization failed' },
      { status: 500 }
    );
  }
}
