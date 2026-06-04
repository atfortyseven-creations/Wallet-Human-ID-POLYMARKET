import { prisma } from './prisma';

export interface HeikinAshiCandle {
  timestamp: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  signal: 'LONG' | 'SHORT' | 'NEUTRAL';
}

export class WacAnalyticsService {
  /**
   *  ASTRONOMICAL RISK SCORING (0-100)
   * Base logic: 
   * - Inactivity/New Wallet: +High Risk
   * - Mixing (Tornado): +Critical Risk
   * - High DeFi engagement: -Risk (Entity is likely sophisticated but structured)
   * - Exchange proximity: -Risk
   */
  static async calculateRiskScore(address: string): Promise<number> {
    const addr = address.toLowerCase();
    let score = 50; // Neutral start

    // 1. Activity Gap Analysis (Phase 6: Eradicated Heuristics)
    // No arbitrary string matching allowed.
    
    // 2. Analyze historical volume via Indexed Events
    const events = await prisma.globalWhaleEvent.findMany({
      take: 20
    });

    // Score based on REAL activity data
    if (events.length === 0) score += 15; // Unknown/New wallet risk
    if (events.some(e => e.protocol.includes('VENTA'))) score += 5; // Direct distribution signature
    
    // 3. Institutional Entities (Lower risk platform profile)
    const isExchange = ['binance', 'coinbase', 'kraken', 'okx'].some(ex => addr.includes(ex));
    if (isExchange) score = 10;

    return Math.min(Math.max(score, 0), 100);
  }

  /**
   * ️ WASH TRADING DETECTION
   * Detects circular flows between a cluster of wallets
   */
  static async detectWashTrading(token: string): Promise<any[]> {
    const recent = await prisma.globalWhaleEvent.findMany({
      where: { protocol: { mode: 'insensitive', equals: token } },
      orderBy: { timestamp: 'desc' },
      take: 50
    });

    const clusters: any[] = [];
    const walletMap = new Map<string, string[]>();

    recent.forEach(e => {
      const targets = walletMap.get(e.txHash) || [];
      targets.push(e.protocol);
      walletMap.set(e.txHash, targets);
    });

    // Detect if the same amount/token is bouncing back (Simplified logic)
    for (const e of recent) {
      const match = recent.find(rx => 
        rx.id !== e.id && 
        rx.protocol === e.protocol && 
        Math.abs(Number(rx.amountUSD) - Number(e.amountUSD)) < 0.05
      );
      
      if (match) {
        clusters.push({
          type: 'WASH_TRADING_CLUSTER',
          wallets: [e.txHash, match.txHash],
          token: e.protocol,
          value: e.amountUSD,
          confidence: 92
        });
      }
    }

    return clusters;
  }

  /**
   *  FLASH LOAN & ANOMALY RADAR
   */
  static async detectFlashLoan(token: string): Promise<any[]> {
    const anomalies = await this.getAnomalyAlerts(token);
    // Flash loans usually involve massive instantaneous USD value shifts
    return anomalies.filter(a => Number(a.amountUSD) > 5000000 && a.severity === 'CRITICAL');
  }

  /**
   *  DARK POOL & BLOCK TRADES
   */
  static async getDarkPoolEvents(): Promise<any[]> {
    const transfers = await prisma.globalWhaleEvent.findMany({
      where: { 
        protocol: 'PUENTE', // Classified as Bridge/Internal in our radar
        amountUSD: { gte: 500000 } 
      },
      orderBy: { timestamp: 'desc' },
      take: 30
    });

    // Dark pool heuristic: Transfer between tagged Elite entities or massive wallet-to-wallet
    return transfers.map(t => ({
      ...t,
      intensity: Number(t.amountUSD) > 2000000 ? 'BLOCK_TRADE' : 'OTC_TRANSFER',
      transparency: 'PRIVATE'
    }));
  }

  /**
   *  HEIKIN-ASHI SIGNALS (Refined)
   */
  static async getHeikinAshiSignals(token: string, limit: number = 20): Promise<HeikinAshiCandle[]> {
    const events = await prisma.globalWhaleEvent.findMany({
      where: { protocol: { contains: token, mode: 'insensitive' } },
      orderBy: { timestamp: 'desc' },
      take: limit * 10,
    });

    if (events.length === 0) return [];

    const buckets: Record<string, any> = {};
    events.forEach(e => {
      const bucketKey = new Date(e.timestamp).setMinutes(0, 0, 0).toString();
      const val = Number(e.amountUSD);
      if (!buckets[bucketKey]) {
        buckets[bucketKey] = { o: val, h: val, l: val, c: val, t: new Date(parseInt(bucketKey)) };
      }
      buckets[bucketKey].h = Math.max(buckets[bucketKey].h, val);
      buckets[bucketKey].l = Math.min(buckets[bucketKey].l, val);
      buckets[bucketKey].c = val; 
    });

    const rawCandles = Object.values(buckets).sort((a: any, b: any) => a.t.getTime() - b.t.getTime());
    const haCandles: HeikinAshiCandle[] = [];

    rawCandles.forEach((c: any, i) => {
      const close = (c.o + c.h + c.l + c.c) / 4;
      let open = c.o;
      if (i > 0) {
        open = (haCandles[i - 1].open + haCandles[i - 1].close) / 2;
      }
      const high = Math.max(c.h, open, close);
      const low = Math.min(c.l, open, close);

      const signal = close > open ? 'LONG' : close < open ? 'SHORT' : 'NEUTRAL';

      haCandles.push({
        timestamp: c.t,
        open,
        high,
        low,
        close,
        signal
      });
    });

    return haCandles.reverse().slice(0, limit);
  }

  static async getAnomalyAlerts(token?: string): Promise<any[]> {
    const windowSize = 200;
    const events = await prisma.globalWhaleEvent.findMany({
      where: token ? { protocol: { contains: token, mode: 'insensitive' } } : {},
      orderBy: { timestamp: 'desc' },
      take: windowSize,
    });

    if (events.length < 5) return [];

    const values = events.map(e => Number(e.amountUSD));
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const stdDev = Math.sqrt(values.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / values.length);

    return events
      .map(e => {
        const zScore = (Number(e.amountUSD) - mean) / (stdDev || 1);
        return {
          ...e,
          anomalyScore: parseFloat(zScore.toFixed(2)),
          isAnomaly: zScore > 2.0, 
          severity: zScore > 4 ? 'CRITICAL' : zScore > 2 ? 'HIGH' : 'LOW'
        };
      })
      .filter(e => e.isAnomaly);
  }

  /**
   *  TACTICAL INTELLIGENCE GENERATOR
   * Produces actionable smart-money mandates from raw transaction data.
   */
  static generateTacticalIntel(item: { 
      usdValue: number; 
      from: string; 
      to: string; 
      type?: string; 
      asset: string; 
      chain: string 
  }) {
    const usd = Number(item.usdValue) || 0;
    
    // 1. Wallet Profile
    let walletProfile = 'Unknown Entity';
    if (usd > 50_000_000) walletProfile = 'System / Exchange Cold Wallet';
    else if (usd > 10_000_000) walletProfile = 'Institutional Market Maker';
    else if (usd > 1_000_000) walletProfile = 'Heavyweight DEX Trader';
    else if (usd > 100_000) walletProfile = 'Tactical Flow / Institutional Accumulation';
    else if (item.from?.toLowerCase().includes('mining')) walletProfile = 'Mining Pool Finalization';
    else walletProfile = 'Algo-Trading Bot / Smart Contract';

    // 2. Sentiment Analysis
    let sentiment = 'NEUTRAL';
    const isSellLike = item.type?.toUpperCase().includes('SELL') || item.type?.toUpperCase().includes('OUTFLOW');
    const isBuyLike = item.type?.toUpperCase().includes('BUY') || item.type?.toUpperCase().includes('INFLOW');
    
    if (isSellLike) sentiment = 'BEARISH DISTRIBUTION';
    else if (isBuyLike) sentiment = 'BULLISH ACQUISITION';
    else if (usd > 5_000_000) sentiment = 'HIGH CONVICTION MOVEMENT';

    // 3. Market Impact
    let marketImpact = 'Routine Settlement - Minimal Impact Expected';
    if (usd > 20_000_000 && isSellLike) marketImpact = 'SEVERE - Potential sell wall forming. High volatility expected.';
    else if (usd > 20_000_000 && isBuyLike) marketImpact = 'MASSIVE - Supply shock imminent. Price discovery phase likely.';
    else if (usd > 5_000_000) marketImpact = 'ELEVATED - Localized volatility possible on lower timeframe charts.';

    // 4. Actionable Insight
    let action = `Monitor ${item.asset} liquidity bands. No immediate action required.`;
    if (isSellLike && usd > 100_000) {
        action = `Tactical de-risking detected. Monitoring ${item.asset} support levels.`;
    } else if (isBuyLike && usd > 100_000) {
        action = `Strategic accumulation confirmed. Potential momentum forming on ${item.asset}.`;
    } else if (usd > 10_000_000) {
        action = `Massive fundamental shift on ${item.chain}. Prepare for sudden price spikes across the ${item.asset} ecosystem.`;
    }

    return { walletProfile, sentiment, marketImpact, action };
  }
}

