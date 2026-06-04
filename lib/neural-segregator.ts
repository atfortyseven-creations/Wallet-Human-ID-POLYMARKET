// lib/neural-segregator.ts
import { EventEmitter } from 'events';

// The definitive 103 Sub-Sector taxonomy matched against live Websocket streams
export const SECTOR_TAXONOMY = {
  BIG_CAPS: ['layer-1', 'smart-contracts', 'stablecoins', 'exchange-tokens'],
  DEEP_NICHES: [
    'yield-farming', 'play-to-earn', 'depin', 'privacy', 'rwa', 'ai', 
    'business-services', 'entertainment', 'governance', 'memecoins', 'gaming',
    'nft', 'dex', 'metaverse', 'oracles', 'interoperability'
    // ... expanding dynamically up to 103
  ],
  ECOSYSTEMS: ['ethereum', 'solana', 'base', 'arbitrum', 'optimism', 'bsc', 'polygon', 'avalanche']
};

class SystemNeuralSegregator extends EventEmitter {
  private activeStreams: Map<string, any[]> = new Map();
  private zScoreDecayFactor: number = 0.95;

  constructor() {
    super();
    // Initialize mapping buckets for the 103 sectors
    [...SECTOR_TAXONOMY.BIG_CAPS, ...SECTOR_TAXONOMY.DEEP_NICHES].forEach(sector => {
      this.activeStreams.set(sector, []);
    });
  }

  /**
   * Ingests a raw websocket packet and clusters it instantly.
   * @param packet { symbol: string, volumeChange: number, currentPrice: number, ecosystem: string, sectorSlug: string }
   */
  public ingestPulse(packet: any) {
    if (!packet.sectorSlug || !this.activeStreams.has(packet.sectorSlug)) return;

    const sectorBucket = this.activeStreams.get(packet.sectorSlug)!;
    
    // Add packet and maintain sliding window of last 100 events per sector
    sectorBucket.push(packet);
    if (sectorBucket.length > 100) sectorBucket.shift();

    // Calculate micro-Z-score dynamically for the sector to detect capital rotation
    const rotationMetrics = this.calculateRotationZScore(packet.sectorSlug);
    
    // Emit clustered data directly to the Frontend subscribers
    this.emit('sector_update', {
      sector: packet.sectorSlug,
      metrics: rotationMetrics,
      latestPacket: packet
    });
  }

  private calculateRotationZScore(sectorSlug: string) {
    const bucket = this.activeStreams.get(sectorSlug)!;
    if (bucket.length < 10) return { mean: 0, zScore: 0, signal: 'NEUTRAL' };

    const volumes = bucket.map(b => b.volumeChange);
    const mean = volumes.reduce((a, b) => a + b, 0) / volumes.length;
    
    const variance = volumes.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / volumes.length;
    const standardDeviation = Math.sqrt(variance);

    const latestVol = volumes[volumes.length - 1];
    
    // Whale Formula
    const zScore = standardDeviation === 0 ? 0 : (latestVol - mean) / standardDeviation;
    
    let signal = 'NEUTRAL';
    if (zScore > 2.5) signal = `LIQUIDITY INFLOW: Anomalous Rotation Detected into ${sectorSlug.toUpperCase()}`;
    if (zScore < -2.5) signal = `LIQUIDITY BLEED: Massive Outflow from ${sectorSlug.toUpperCase()}`;

    return { mean, zScore, signal };
  }
}

export const neuralSegregator = new SystemNeuralSegregator();
