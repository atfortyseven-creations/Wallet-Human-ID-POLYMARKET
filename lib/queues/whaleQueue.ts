import { redisClient } from '../redis/client';
import { OmnichannelAlertEvent, AlertChain, AlertSeverity } from '../types/alerts';

/**
 *  UNIFIED COSMIC MESSAGE BUS Proxy (v3.0)
 * Replaces legacy BullMQ logic with pure Redis Streams to achieve <10ms 
 * internal propagation across the institutional cluster.
 */
export const WHALE_QUEUE_NAME = 'global_crypto_alerts';

export interface WhaleJobData {
  hash: string;
  from: string;
  to: string;
  asset: string;
  amount: number;
  usdValue: number;
  valueBTC?: number;
  blockNumber: string;
  chain: string; // e.g., "ethereum", "solana"
  type: string;  // e.g., "Transfer", "Swap"
  institutional?: boolean;
  metadata?: any;
}

/** 
 * Helper to add a job  now optimized for Redis Streams 
 */
export async function addWhaleToQueue(data: WhaleJobData) {
  if (!redisClient || redisClient.__isMock) {
    if (process.env.NODE_ENV !== 'production') {
        console.warn(`[StreamProxy] Redis unavailable. Logged: ${data.hash}`);
    }
    return null;
  }

  // Normalize chain string to AlertChain enum
  const chainMap: Record<string, AlertChain> = {
    'ethereum': 'ETH',
    'solana': 'SOL',
    'bitcoin': 'BTC',
    'base': 'BASE',
    'binance-smart-chain': 'BNB',
    'polygon': 'POLYGON'
  };

  const chain: AlertChain = chainMap[data.chain.toLowerCase()] || 'MULTICHAIN';
  const severity: AlertSeverity = data.usdValue > 10000000 ? 'ASTRONOMICAL' : 'CRITICAL';

  const event: OmnichannelAlertEvent = {
    eventId: `evm-${data.hash}`,
    timestamp: Date.now(),
    type: 'WHALE_TX',
    chain,
    severity,
    payload: {
      asset: data.asset,
      amountUsd: data.usdValue,
      fromAddress: data.from,
      toAddress: data.to,
      hash: data.hash,
      metrics: {
        amount: data.amount,
        blockNumber: data.blockNumber,
        ...data.metadata
      }
    },
    targetAudience: 'GLOBAL',
    channels: ['TELEGRAM', 'DISCORD', 'UI_INAPP']
  };

  try {
    // [ESTABILIDAD CÓSMICA / 2M TPS] Uso imperativo de pipelining atómico.
    // Aunque aquí haya 1 comando, el driver agrupará comandos de workers en el mismo frame TCP de NodeJS.
    const pipeline = (redisClient as any).pipeline();
    pipeline.xadd(
        WHALE_QUEUE_NAME, 
        'MAXLEN', '~', 200000, // Escala Archivo Histórico
        '*', 
        'payload', JSON.stringify(event)
    );
    const results = await pipeline.exec();
    return results?.[0]?.[1] || null;
  } catch (err: any) {
    console.error(`[StreamProxy]  Failed to enqueue event ${data.hash}:`, err.message);
    return null;
  }
}

// Deprecated BullMQ singleton for backward compatibility
export const whaleQueue = {
    add: async (_name: string, data: WhaleJobData) => addWhaleToQueue(data)
};
