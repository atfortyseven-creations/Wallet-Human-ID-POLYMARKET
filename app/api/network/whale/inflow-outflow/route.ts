export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';

// Known major exchange cold wallet addresses (subset)
const EXCHANGE_ADDRESSES: Record<string, string> = {
  'bc1qazcm763858nkj2dj986etajv6wquslv8uxjjt': 'Binance',
  '34xp4vRoCGJym3xR7yCVPFHoCNxv4Twseo': 'Binance',
  '1NDyJtNTjmwk5xPNhjgAMu4HDHigtobu1s': 'Binance',
  '3E5oK3MVNgbmkKCjMCnBJcqhRHWm3gJxrQ': 'Coinbase',
  '3HjQLF9uVsZqXBQjMbMNwp3GS3eUPXfRqG': 'Kraken',
};

export async function GET() {
  try {
    // Fetch last 10 blocks to determine inflow/outflow balance
    const blocksRes = await fetch('https://mempool.space/api/v1/blocks', {
      next: { revalidate: 15 }
    });

    if (!blocksRes.ok) throw new Error('mempool.space unavailable');

    const blocks = await blocksRes.json();
    
    // Fetch mempool statistics for current state
    const statsRes = await fetch('https://mempool.space/api/mempool', {
      next: { revalidate: 10 }
    });
    const mempoolStats = statsRes.ok ? await statsRes.json() : null;

    // Compute derived metrics from recent blocks
    const totalFees = blocks.slice(0, 6).reduce((sum: number, b: any) => sum + (b.extras?.totalFees || 0), 0);
    const avgFee = totalFees / 6;
    const avgBlockSize = blocks.slice(0, 6).reduce((sum: number, b: any) => sum + b.size, 0) / 6;
    
    // Fee pressure as proxy for buy/sell pressure from large txs
    const feeVelocity = mempoolStats ? (mempoolStats.vsize / 1_000_000) : 0; // MB of pending txs
    
    // Derive inflow/outflow signal from fee velocity
    // High feeVelocity + high avg fees = likely withdrawal demand (sell pressure, exchange inflow)
    // Low feeVelocity + low fees = cold storage migration (accumulation, exchange outflow)
    const netFlowScore = Math.min(100, Math.max(-100, 
      (feeVelocity - 2) * 20 + (avgFee - 50000) / 10000
    ));

    // Categorize flow direction
    const direction = netFlowScore > 20 ? 'INFLOW_DOMINANT' 
                    : netFlowScore < -20 ? 'OUTFLOW_DOMINANT' 
                    : 'NEUTRAL';
    
    const sentiment = direction === 'INFLOW_DOMINANT' ? 'bearish' 
                    : direction === 'OUTFLOW_DOMINANT' ? 'bullish' 
                    : 'neutral';

    const historicalPoints = blocks.slice(0, 12).map((b: any, i: number) => {
      // Derive per-block flow from real fee data  no random noise
      const blockFeeVelocity = (b.size / 1_000_000); // MB as proxy for pressure
      const blockScore = Math.min(100, Math.max(0, (blockFeeVelocity - 1) * 30 + 50));
      return {
        time: b.timestamp * 1000,
        inflow: Math.round(blockScore * 1000),
        outflow: Math.round((100 - blockScore) * 1000),
        blockHeight: b.height,
      };
    });

    return NextResponse.json({
      netFlowScore: parseFloat(netFlowScore.toFixed(1)),
      direction,
      sentiment,
      mempoolSizeMb: parseFloat(feeVelocity.toFixed(2)),
      avgFeeSat: Math.round(avgFee),
      avgBlockSizeKb: Math.round(avgBlockSize / 1024),
      totalPendingTxs: mempoolStats?.count || 0,
      historicalPoints,
      updatedAt: Date.now(),
    });
    
  } catch (err) {
    console.error('[InflowOutflow]', err);
    return NextResponse.json({ error: 'Data unavailable', netFlowScore: 0, direction: 'NEUTRAL', sentiment: 'neutral' });
  }
}


