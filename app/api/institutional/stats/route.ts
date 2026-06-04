// app/api/institutional/stats/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const startTime = performance.now();
  try {
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last1h = new Date(now.getTime() - 1 * 60 * 60 * 1000);

    // 1. Fetch records for Telemetry & Liquid Leak detection
    const records24h = await db.whaleActivity.findMany({
      where: { timestamp: { gte: last24h }, usdValue: { gte: '50000000' } },
      select: { usdValue: true, institutional: true, entityName: true, timestamp: true, type: true }
    });

    const totalUsdVolume = records24h.reduce((acc, curr) => acc + parseFloat(curr.usdValue), 0);
    const institutionalRatio = records24h.length > 0 
      ? records24h.filter(r => r.institutional).length / records24h.length 
      : 0;

    // 2. Telemetry: Throughput
    const records1h = records24h.filter(r => new Date(r.timestamp) >= last1h);
    const whaleThroughput = records1h.length;

    // 3. Liquidity Leak & Supernova Detection
    const liquidityLeaks = records24h.filter(r => r.type === 'CEX_OUTFLOW' || r.entityName.includes('Binance') || r.entityName.includes('Bybit'));
    const liquidityBreachDelta = liquidityLeaks.reduce((acc, curr) => acc + parseFloat(curr.usdValue), 0);
    
    const supernovaDetected = liquidityLeaks.some(r => parseFloat(r.usdValue) >= 500_000_000);
    
    let hazardLevel = 'LOW';
    if (supernovaDetected) hazardLevel = 'CRITICAL';
    else if (liquidityBreachDelta > 200_000_000) hazardLevel = 'MEDIUM';

    // 4. Aggregated Volume BTC
    const stats24h = await db.whaleActivity.aggregate({
      where: { timestamp: { gte: last24h }, usdValue: { gte: '50000000' } },
      _sum: { valueBTC: true },
    });

    // 5. Top Entities
    const entityCounts: Record<string, number> = {};
    records24h.forEach(r => {
      if (r.entityName !== 'Unknown Whale') {
        entityCounts[r.entityName] = (entityCounts[r.entityName] || 0) + 1;
      }
    });

    const topEntities = Object.entries(entityCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name, count]) => ({ name, count }));

    // 6. SOV-ALPHA Score
    const alphaScore = Math.min(Math.floor((totalUsdVolume / 1_000_000_000) * 40 + institutionalRatio * 60), 100);

    const endTime = performance.now();
    const readLatencyMs = (endTime - startTime).toFixed(2);

    return NextResponse.json({
      totalVolumeUSD: totalUsdVolume,
      topPairs: topEntities.map(e => ({ symbol: e.name })),
      total24hVolume: totalUsdVolume,
      total24hBtc: stats24h._sum.valueBTC || 0,
      transactionCount: records24h.length,
      institutionalRatio,
      whaleThroughput,
      liquidityBreachDelta,
      supernovaDetected,
      hazardLevel,
      readLatencyMs,
      topEntities,
      alphaScore,
      lastUpdated: now.toISOString()
    });
  } catch (err: any) {
    console.error('[API_STATS_ERROR]', err);
    return NextResponse.json({ error: 'Telemetry Engine Fail', details: err.message }, { status: 500 });
  }
}
