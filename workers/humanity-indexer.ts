import { createPublicClient, http, fallback } from 'viem';
import { mainnet } from 'viem/chains';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// High performance resilient client
const ethClient = createPublicClient({
  chain: mainnet,
  transport: fallback([
    http('https://eth.llamarpc.com'),
    http('https://ethereum-rpc.publicnode.com'),
    http('https://cloudflare-eth.com'),
    http('https://rpc.ankr.com/eth'),
    http('https://1rpc.io/eth')
  ], { rank: true })
});

async function indexLatestBlock() {
  try {
    const block = await ethClient.getBlock({
      includeTransactions: true
    });

    console.log(`[INDEXER] Captured Block: ${block.number}`);

    await prisma.$transaction(async (tx) => {
      // 1. Safe Reorg Handling: delete the block if it already exists for this block number.
      // Thanks to onDelete: Cascade on the schema relation, this automatically purges
      // any stale transactions associated with this block number in a single atomic SQL operation.
      await tx.humanityLedgerBlock.deleteMany({
        where: { id: block.number }
      });

      // 2. Insert Block
      await tx.humanityLedgerBlock.create({
        data: {
          id: block.number,
          hash: block.hash,
          parentHash: block.parentHash,
          timestamp: block.timestamp,
          miner: block.miner,
          gasUsed: block.gasUsed,
          gasLimit: block.gasLimit,
          baseFee: block.baseFeePerGas || 0n,
          txCount: block.transactions.length
        }
      });

      // 3. Map transactions with maximum resilience (safe fallback for nuls and typed cast)
      const transactionsToInsert = block.transactions.map((t: any) => ({
        hash: t.hash,
        blockNumber: block.number,
        from: t.from,
        to: t.to || 'CONTRACT_CREATION',
        value: (t.value !== undefined && t.value !== null) ? t.value.toString() : '0',
        gasPrice: (t.gasPrice !== undefined && t.gasPrice !== null ? t.gasPrice : (t.maxFeePerGas !== undefined && t.maxFeePerGas !== null ? t.maxFeePerGas : 0n)).toString(),
        gas: t.gas || 0n,
        transactionIndex: t.transactionIndex !== undefined ? Number(t.transactionIndex) : 0,
        timestamp: block.timestamp
      }));

      // 4. Insert Transactions in bulk
      if (transactionsToInsert.length > 0) {
        await tx.humanityLedgerTransaction.createMany({
          data: transactionsToInsert,
          skipDuplicates: true
        });
      }
    }, {
      timeout: 15000 // 15 seconds max for a transaction block
    });

    console.log(`[INDEXER] Processed ${block.transactions.length} transactions from block ${block.number}.`);
  } catch (error: unknown) {
    if (error instanceof Error) {
      const msg = error.message;
      if (msg.includes('Rate limit') || msg.includes('limit') || msg.includes('429') || msg.includes('exceeds defined limit')) {
        console.warn('[INDEXER] Rate limit encountered on public RPC, retrying next block...');
      } else {
        const firstLine = msg.split('\n')[0];
        console.error(`[INDEXER ERROR] Could not index block: ${firstLine}`);
      }
    } else {
      console.error('[INDEXER ERROR] Could not index block: Unknown error');
    }
  }
}

// Continuous polling loop with high fault tolerance
async function runIndexer() {
  console.log('[INDEXER] Booting System Humanity Indexer...');
  while (true) {
    await indexLatestBlock();
    // Wait 12 seconds (Ethereum block time)
    await new Promise(resolve => setTimeout(resolve, 12000));
  }
}

// Graceful shutdown handling to prevent orphaned PG connections on Railway
const gracefulShutdown = async (signal: string) => {
  console.log(`[INDEXER] Received ${signal}. Shutting down gracefully...`);
  try {
    await prisma.$disconnect();
    console.log('[INDEXER] Database client disconnected successfully.');
    process.exit(0);
  } catch (err) {
    console.error('[INDEXER ERROR] Error during database disconnection:', err);
    process.exit(1);
  }
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Launch
runIndexer();
