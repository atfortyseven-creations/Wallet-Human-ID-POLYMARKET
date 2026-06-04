import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 
// HUMANITY LEDGER AUTO-RESET CRON
// Schedule: Every 11h 59min  prevents block accumulation & keeps the
// local indexer operating at peak core efficiency.
//
// HOW TO TRIGGER:
//   Railway Cron Service: Call GET /api/cron/ledger-reset
//   with header: Authorization: Bearer <CRON_SECRET>
//
// Add to Railway: Settings  Cron Jobs  "0 */12 * * *"  GET /api/cron/ledger-reset
// 

const RESET_INTERVAL_MS = 11 * 60 * 60 * 1000 + 59 * 60 * 1000; // 11h 59m exactly

export async function GET(request: Request) {
  // Validate the shared cron secret to prevent unauthorized wipes
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Check the timestamp of the last reset from a meta key
    const lastReset = await prisma.auditLog.findFirst({
      where: { action: 'HUMANITY_LEDGER_RESET' },
      orderBy: { timestamp: 'desc' },
    });

    const now = Date.now();
    const lastResetTs = lastReset ? new Date(lastReset.timestamp).getTime() : 0;
    const elapsed = now - lastResetTs;

    // Guard: Do NOT reset if we haven't reached 11h 59m since last reset
    if (lastReset && elapsed < RESET_INTERVAL_MS) {
      const nextResetIn = RESET_INTERVAL_MS - elapsed;
      const nextResetMin = Math.ceil(nextResetIn / 60000);
      return NextResponse.json({
        ok: true,
        skipped: true,
        reason: `Next reset in ${nextResetMin} minutes.`,
        lastReset: lastReset.timestamp,
      });
    }

    //  ATOMIC RESET 
    // Delete only old transactions and blocks (older than 11h 59m).
    const thresholdDate = new Date(now - RESET_INTERVAL_MS);

    const [deletedTx, deletedBlocks] = await prisma.$transaction([
      prisma.humanityLedgerTransaction.deleteMany({
        where: {
          block: {
            syncedAt: { lt: thresholdDate }
          }
        }
      }),
      prisma.humanityLedgerBlock.deleteMany({
        where: {
          syncedAt: { lt: thresholdDate }
        }
      }),
    ]);

    // Record this reset event in the audit log for full traceability
    await prisma.auditLog.create({
      data: {
        action: 'HUMANITY_LEDGER_RESET',
        resource: 'HumanityLedgerBlock',
        metadata: {
          deletedBlocks: deletedBlocks.count,
          deletedTransactions: deletedTx.count,
          triggeredAt: new Date().toISOString(),
          intervalMs: RESET_INTERVAL_MS,
        },
      },
    });

    console.log(
      `[CRON] Humanity Ledger reset  ${deletedBlocks.count} blocks, ${deletedTx.count} transactions purged.`
    );

    return NextResponse.json({
      ok: true,
      reset: true,
      deletedBlocks: deletedBlocks.count,
      deletedTransactions: deletedTx.count,
      nextResetAt: new Date(now + RESET_INTERVAL_MS).toISOString(),
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('[CRON] Humanity Ledger reset failed:', msg);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
