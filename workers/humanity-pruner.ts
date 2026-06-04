import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Maximum space enforcement: 7 Days Rolling Window
const RETENTION_DAYS = 7;

async function pruneOldBlocks() {
  try {
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() - RETENTION_DAYS);
    // Convert to Unix Timestamp (seconds)
    const thresholdTimestamp = Math.floor(thresholdDate.getTime() / 1000);

    console.log(`[PRUNER] Initiating absolute purge for blocks older than timestamp ${thresholdTimestamp}...`);

    // Using typed Prisma Client for maximum database-agnostic resilience.
    // Due to cascading deletion configured in the database, removing blocks
    // automatically removes all associated transactions in a single transaction.
    const result = await prisma.humanityLedgerBlock.deleteMany({
      where: {
        timestamp: {
          lt: BigInt(thresholdTimestamp)
        }
      }
    });

    console.log(`[PRUNER] Purge completed. Deleted blocks: ${result.count}`);

  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(`[PRUNER ERROR] Could not prune old blocks: ${error.message}`);
    } else {
      console.error('[PRUNER ERROR] Could not prune old blocks: Unknown error');
    }
  }
}

// Run once a day
async function runPruner() {
  console.log('[PRUNER] Booting Space Guardian (7-Day Rolling Window)...');
  while (true) {
    await pruneOldBlocks();
    // Wait 24 hours
    await new Promise(resolve => setTimeout(resolve, 24 * 60 * 60 * 1000));
  }
}

// Graceful shutdown handling to prevent orphaned PG connections on Railway
const gracefulShutdown = async (signal: string) => {
  console.log(`[PRUNER] Received ${signal}. Shutting down gracefully...`);
  try {
    await prisma.$disconnect();
    console.log('[PRUNER] Database client disconnected successfully.');
    process.exit(0);
  } catch (err) {
    console.error('[PRUNER ERROR] Error during database disconnection:', err);
    process.exit(1);
  }
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Launch
runPruner();
