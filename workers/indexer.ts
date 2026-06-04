// workers/indexer.ts
import { Worker } from 'bullmq';
import { createPublicClient, webSocket } from 'viem';
import { mainnet, base } from 'viem/chains';
import Redis from 'ioredis';
import { neuralSegregator } from '../lib/neural-segregator';

/**
 * WHALE NODE INDEXER (RPC SIPHON)
 * Connects directly to GetBlock WebSocket nodes to ingest real-time blocks.
 */

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const redis = new Redis(REDIS_URL);

const wssClients = [
  {
    chain: mainnet,
    url: process.env.GB_ETH_WSS_1 || 'wss://shared.us-east-1.getblock.io/d53ccda1da9f451999b60cd4e0871a27'
  },
  {
    chain: mainnet,
    url: process.env.GB_ETH_WSS_2 || 'wss://shared.us-east-1.getblock.io/acb3b84538ba4ae89f076303fcd036c9'
  }
];

async function startSiphons() {

  console.log('[Siphon] Redis connected. Initializing RPC Node Connections...');

  wssClients.forEach(({ chain, url }) => {
    const client = createPublicClient({
      chain,
      transport: webSocket(url)
    });

    console.log(`[Siphon] Attached to ${chain.name} blockchain stream.`);

    client.watchBlocks({
      onBlock: async (block) => {
        const pulsePayload = {
          chain: chain.name,
          blockNumber: Number(block.number),
          transactions: block.transactions.length,
          timestamp: Number(block.timestamp),
          inferredSector: 'layer-1',
          volumeContext: block.transactions.length * 1500
        };

        await redis.set(`pulse:${chain.name}:latest`, JSON.stringify(pulsePayload), 'EX', 60);

        neuralSegregator.ingestPulse({
          symbol: chain.nativeCurrency.symbol,
          volumeChange: pulsePayload.volumeContext,
          ecosystem: chain.name.toLowerCase(),
          sectorSlug: pulsePayload.inferredSector
        });

        console.log(`[Siphon] Extracted Block ${block.number} on ${chain.name} | Txs: ${block.transactions.length}`);
      },
      onError: error => {
        const errStr = String(error);
        if (errStr.includes('-32005') || errStr.includes('rate limit') || errStr.includes('quota')) return;
        console.error('[Siphon] Block Watch Error:', error);
      }
    });
  });
}

startSiphons().catch(console.error);
