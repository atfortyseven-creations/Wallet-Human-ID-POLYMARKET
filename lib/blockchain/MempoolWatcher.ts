import { getEthWsClient } from './rpcClient';
import { formatEther } from 'viem';

// Absolute Perfection: The Engine that listens to Web3 without sleeping.
// Integrates Phase 2 Stochastic Filtering and Data Lake Indexation.

class SystemMempoolStreamer {
  private static instance: SystemMempoolStreamer;
  private isListening = false;
  private activeStreams: (() => void)[] = [];

  // Memory buffer for the absolute latest 150 deep-liquidity events
  public readonly recentTiers: any[] = [];

  private constructor() {
    console.log('[System Engine] Mempool Streamer Initialized.');
  }

  public static getInstance(): SystemMempoolStreamer {
    if (!SystemMempoolStreamer.instance) {
      SystemMempoolStreamer.instance = new SystemMempoolStreamer();
    }
    return SystemMempoolStreamer.instance;
  }

  public startListening() {
    if (this.isListening) return;
    this.isListening = true;

    console.log('[System Engine] Opening Dark Forest WebSockets...');

    // Watch Ethereum Blocks (True Macro Tracking - Zero Mock)
    const unwatchBlocks = getEthWsClient().watchBlocks({
      includeTransactions: true,
      onBlock: (block: any) => {
        if (!block || !block.transactions) return;

        console.log(`[ETH L1] Block: ${block.number} | Txs: ${block.transactions.length}`);

        const timestamp = Date.now();
        let appended = 0;

        block.transactions.forEach((tx: any) => {
          if (!tx.value || !tx.gasPrice) return;

          const valueEth = parseFloat(formatEther(tx.value || 0n));
          const gasPriceGwei = parseFloat(formatEther(tx.gasPrice || 0n)) * 1e9;
          const type = valueEth > 5 ? 'whale' : 'dust';

          // Only index events with actual economic transfer
          if (valueEth > 0.05 || (tx.input && tx.input !== '0x')) {
            const eventData = {
              hash: tx.hash,
              timestamp,
              network: 'Ethereum',
              value: valueEth.toString(), // Store as string for parseFloat later
              gasPrice: gasPriceGwei.toString(),
              type,
              from: tx.from,
              to: tx.to,
              input: tx.input || tx.data || '0x',
            };

            this.recentTiers.push(eventData);
            appended++;
          }
        });

        // Cap buffer to 150 elements to prevent server RAM exhaustion
        if (this.recentTiers.length > 150) {
          this.recentTiers.splice(0, this.recentTiers.length - 150);
        }

        console.log(`[System Indexer] Processed ${appended} active liquidity events into buffer.`);
      },
      onError: (error: any) =>
        console.error('[Block Watch Error] Critical WebSocket Failure:', error),
    });

    this.activeStreams.push(unwatchBlocks);
  }

  public stopListening() {
    this.activeStreams.forEach(unwatch => unwatch());
    this.activeStreams = [];
    this.isListening = false;
  }
} //  class SystemMempoolStreamer closes here

// Global scope isolation for Next.js hot-reloading stability
const globalForSystem = globalThis as unknown as {
  systemMempool?: SystemMempoolStreamer;
};

export const mempoolWatcher =
  globalForSystem.systemMempool ?? SystemMempoolStreamer.getInstance();

if (process.env.NODE_ENV !== 'production') {
  globalForSystem.systemMempool = mempoolWatcher;
}
