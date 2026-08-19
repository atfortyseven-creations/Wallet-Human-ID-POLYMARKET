/**
 * backfill-explorer-urls.ts
 *
 * One-time migration script:
 *   Finds all Transaction rows with explorerUrl stored as /tx/0x{hash}
 *   and rewrites them to /tx-effect/{hash} (correct AztecScan path).
 *
 * Run with:
 *   npx tsx scripts/backfill-explorer-urls.ts
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const AZTEC_EXPLORER = 'https://testnet.aztecscan.xyz';

async function main() {
  console.log('[Backfill] Finding transactions with stale explorer URLs...');

  // Find all QDs transactions with metadata
  const txs = await prisma.transaction.findMany({
    where: { token: 'QDs' },
    select: { id: true, metadata: true, txHash: true },
  });

  let updated = 0;
  let skipped = 0;

  for (const tx of txs) {
    const meta = tx.metadata as any;
    if (!meta) { skipped++; continue; }

    const currentUrl: string = meta.explorerUrl ?? '';

    // Compute correct URL from stored aztecTxHash or txHash
    const rawHash: string = (meta.aztecTxHash ?? tx.txHash ?? '').replace('0x', '');
    if (!rawHash || rawHash.length !== 64) { skipped++; continue; }

    const correctUrl = `${AZTEC_EXPLORER}/tx-effect/${rawHash}`;
    if (currentUrl === correctUrl) { skipped++; continue; }

    // Update
    await prisma.transaction.update({
      where: { id: tx.id },
      data: {
        metadata: {
          ...meta,
          explorerUrl: correctUrl,
        },
      },
    });
    updated++;
    console.log(`[Backfill] ✅ ${tx.id.slice(0, 8)}… → ${correctUrl}`);
  }

  console.log(`\n[Backfill] Done. Updated: ${updated} | Skipped: ${skipped}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
