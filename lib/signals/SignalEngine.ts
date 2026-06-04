/**
 * SignalEngine.ts
 * INTERESTELAR-GRADE Trading Signal Generator
 * 
 * Combines multiple technical indicators into actionable trading signals
 * with confidence scores, leverage recommendations, and risk management.
 */

import { TechnicalIndicators, type Candle } from './TechnicalIndicators';

import { safeToFixed, safeToLocaleString } from '@/lib/utils/number-format';
export interface TradingSignal {
  // Asset info
  asset: string;
  timestamp: number;
  currentPrice: number;

  // Signal
  direction: 'LONG' | 'SHORT' | 'NEUTRAL';
  strength: 'STRONG' | 'MODERATE' | 'WEAK';
  confidence: number; // 0-100

  // Trade parameters
  entry: number;
  target: number;
  stopLoss: number;
  recommendedLeverage: number;
  riskReward: number;

  // Technical analysis breakdown
  indicators: {
    rsi: {
      value: number;
      signal: 'OVERSOLD' | 'NEUTRAL' | 'OVERBOUGHT';
      score: number; // Contribution to overall signal (-100 to +100)
    };
    macd: {
      value: number;
      signal: number;
      histogram: number;
      trend: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
      score: number;
    };
    bollingerBands: {
      position: 'UPPER' | 'MIDDLE' | 'LOWER';
      bandwidth: number;
      score: number;
    };
    volume: {
      ratio: number;
      trend: 'INCREASING' | 'DECREASING' | 'STABLE';
      buyPressure: number;
      score: number;
    };
    supportResistance: {
      nearestSupport: number;
      nearestResistance: number;
      distanceToSupport: number;
      distanceToResistance: number;
      score: number;
    };
  };

  // Explanation
  reasoning: string[];
  warnings: string[];
}

export class SignalEngine {
  /**
   * Generate comprehensive trading signal for an asset
   * 
   * @param symbol - Trading symbol (e.g., 'AUTHUSDT')
   * @param candles - Historical candle data (minimum 100 candles)
   * @returns Complete trading signal with all analysis
   */
  public async generateSignal(
    symbol: string,
    candles: Candle[]
  ): Promise<TradingSignal> {
    if (candles.length < 100) {
      throw new Error(`Insufficient candle data: need 100, got ${candles.length}`);
    }

    const currentPrice = candles[candles.length - 1].close;
    const timestamp = Date.now();

    // Calculate all indicators
    const rsi = TechnicalIndicators.calculateRSI(candles);
    const macd = TechnicalIndicators.calculateMACD(candles);
    const bb = TechnicalIndicators.calculateBollingerBands(candles);
    const volume = TechnicalIndicators.analyzeVolume(candles);
    const sr = TechnicalIndicators.findSupportResistance(candles);

    // Score each indicator
    const rsiScore = this.scoreRSI(rsi);
    const macdScore = this.scoreMACD(macd);
    const bbScore = this.scoreBollingerBands(bb, currentPrice);
    const volumeScore = this.scoreVolume(volume);
    const srScore = this.scoreSupportResistance(sr, currentPrice);

    // Combine scores with weights
    const weights = {
      rsi: 0.25,
      macd: 0.20,
      bb: 0.15,
      volume: 0.20,
      sr: 0.20
    };

    const totalScore = 
      (rsiScore * weights.rsi) +
      (macdScore * weights.macd) +
      (bbScore * weights.bb) +
      (volumeScore * weights.volume) +
      (srScore * weights.sr);

    // Determine direction and strength
    const { direction, strength } = this.interpretScore(totalScore);
    const confidence = Math.min(Math.abs(totalScore), 100);

    // Calculate trade parameters
    const nearestSupport = sr.support[0] || currentPrice * 0.97;
    const nearestResistance = sr.resistance[0] || currentPrice * 1.03;

    const entry = currentPrice;
    const target = direction === 'LONG' ? nearestResistance : nearestSupport;
    const stopLoss = direction === 'LONG' ? nearestSupport : nearestResistance;

    // Risk/Reward ratio
    const risk = Math.abs(entry - stopLoss);
    const reward = Math.abs(target - entry);
    const riskReward = risk === 0 ? 0 : reward / risk;

    // Leverage recommendation
    const recommendedLeverage = this.calculateSafeLeverage(
      confidence,
      riskReward,
      bb.bandwidth
    );

    // Generate reasoning
    const reasoning = this.generateReasoning({
      rsi,
      rsiScore,
      macd,
      macdScore,
      bb,
      bbScore,
      volume,
      volumeScore,
      sr,
      srScore,
      direction
    });

    // Generate warnings
    const warnings = this.generateWarnings({
      riskReward,
      volume,
      bb,
      confidence
    });

    return {
      asset: symbol,
      timestamp,
      currentPrice,
      direction,
      strength,
      confidence: parseFloat(safeToFixed(confidence || 0, 2)),
      entry: parseFloat(safeToFixed(entry || 0, 2)),
      target: parseFloat(safeToFixed(target || 0, 2)),
      stopLoss: parseFloat(safeToFixed(stopLoss || 0, 2)),
      recommendedLeverage,
      riskReward: parseFloat(safeToFixed(riskReward || 0, 2)),
      indicators: {
        rsi: {
          value: rsi.value,
          signal: rsi.signal,
          score: parseFloat(safeToFixed(rsiScore || 0, 2))
        },
        macd: {
          value: macd.macd,
          signal: macd.signal,
          histogram: macd.histogram,
          trend: macd.trend,
          score: parseFloat(safeToFixed(macdScore || 0, 2))
        },
        bollingerBands: {
          position: bb.position,
          bandwidth: bb.bandwidth,
          score: parseFloat(safeToFixed(bbScore || 0, 2))
        },
        volume: {
          ratio: volume.volumeRatio,
          trend: volume.trend,
          buyPressure: volume.buyPressure,
          score: parseFloat(safeToFixed(volumeScore || 0, 2))
        },
        supportResistance: {
          nearestSupport,
          nearestResistance,
          distanceToSupport: sr.distanceToSupport,
          distanceToResistance: sr.distanceToResistance,
          score: parseFloat(safeToFixed(srScore || 0, 2))
        }
      },
      reasoning,
      warnings
    };
  }

  /**
   * Score RSI indicator
   * Returns: -100 to +100
   */
  private scoreRSI(rsi: ReturnType<typeof TechnicalIndicators.calculateRSI>): number {
    // Extreme oversold (RSI < 20) = Strong buy
    if (rsi.value < 20) return 90;
    
    // Oversold (RSI 20-30) = Buy
    if (rsi.value < 30) return 60;
    
    // Slightly oversold (RSI 30-40) = Weak buy
    if (rsi.value < 40) return 30;
    
    // Neutral (RSI 40-60)
    if (rsi.value < 60) return 0;
    
    // Slightly overbought (RSI 60-70) = Weak sell
    if (rsi.value < 70) return -30;
    
    // Overbought (RSI 70-80) = Sell
    if (rsi.value < 80) return -60;
    
    // Extreme overbought (RSI > 80) = Strong sell
    return -90;
  }

  /**
   * Score MACD indicator
   * Returns: -100 to +100
   */
  private scoreMACD(macd: ReturnType<typeof TechnicalIndicators.calculateMACD>): number {
    let score = 0;

    // Trend direction
    if (macd.trend === 'BULLISH') score += 40;
    else if (macd.trend === 'BEARISH') score -= 40;

    // Histogram strength
    const histStrength = Math.min(Math.abs(macd.histogram) * 100, 30);
    score += macd.histogram > 0 ? histStrength : -histStrength;

    // Crossover bonus
    if (macd.crossover) {
      score += macd.histogram > 0 ? 30 : -30;
    }

    return Math.max(-100, Math.min(100, score));
  }

  /**
   * Score Bollinger Bands
   * Returns: -100 to +100
   */
  private scoreBollingerBands(
    bb: ReturnType<typeof TechnicalIndicators.calculateBollingerBands>,
    currentPrice: number
  ): number {
    // Price at lower band = oversold = buy signal
    if (bb.position === 'LOWER') {
      const percentFromMiddle = ((bb.middle - currentPrice) / bb.middle) * 100;
      return Math.min(percentFromMiddle * 20, 70); // Max 70 points
    }

    // Price at upper band = overbought = sell signal
    if (bb.position === 'UPPER') {
      const percentFromMiddle = ((currentPrice - bb.middle) / bb.middle) * 100;
      return Math.max(-percentFromMiddle * 20, -70); // Max -70 points
    }

    // Middle = neutral
    return 0;
  }

  /**
   * Score Volume
   * Returns: -100 to +100
   */
  private scoreVolume(volume: ReturnType<typeof TechnicalIndicators.analyzeVolume>): number {
    let score = 0;

    // High volume confirms trend
    if (volume.volumeRatio > 1.5) {
      // Volume is 50% above average
      score += volume.buyPressure > 0.6 ? 40 : -40;
    } else if (volume.volumeRatio > 1.2) {
      score += volume.buyPressure > 0.6 ? 20 : -20;
    }

    // Volume trend
    if (volume.trend === 'INCREASING') {
      score += volume.buyPressure > 0.5 ? 20 : -20;
    }

    return Math.max(-100, Math.min(100, score));
  }

  /**
   * Score Support/Resistance
   * Returns: -100 to +100
   */
  private scoreSupportResistance(
    sr: ReturnType<typeof TechnicalIndicators.findSupportResistance>,
    currentPrice: number
  ): number {
    // Near support = likely to bounce up = buy
    if (sr.distanceToSupport < 1) {
      return 60;
    }

    // Near resistance = likely to bounce down = sell
    if (sr.distanceToResistance < 1) {
      return -60;
    }

    // In middle = consider which is closer
    const supportScore = (1 / (sr.distanceToSupport + 0.1)) * 20;
    const resistanceScore = (1 / (sr.distanceToResistance + 0.1)) * -20;

    return supportScore + resistanceScore;
  }

  /**
   * Interpret total score into direction and strength
   */
  private interpretScore(score: number): {
    direction: 'LONG' | 'SHORT' | 'NEUTRAL';
    strength: 'STRONG' | 'MODERATE' | 'WEAK';
  } {
    const absScore = Math.abs(score);

    let direction: 'LONG' | 'SHORT' | 'NEUTRAL';
    if (score > 20) direction = 'LONG';
    else if (score < -20) direction = 'SHORT';
    else direction = 'NEUTRAL';

    let strength: 'STRONG' | 'MODERATE' | 'WEAK';
    if (absScore > 60) strength = 'STRONG';
    else if (absScore > 35) strength = 'MODERATE';
    else strength = 'WEAK';

    return { direction, strength };
  }

  /**
   * Calculate safe leverage based on signal confidence and risk
   */
  private calculateSafeLeverage(
    confidence: number,
    riskReward: number,
    volatility: number // Bollinger Bandwidth
  ): number {
    // Base leverage on confidence
    let leverage = 3; // Conservative default

    if (confidence > 80 && riskReward > 2) leverage = 15;
    else if (confidence > 70 && riskReward > 1.5) leverage = 10;
    else if (confidence > 60) leverage = 7;
    else if (confidence > 50) leverage = 5;

    // Reduce leverage in high volatility
    if (volatility > 5) leverage = Math.floor(leverage * 0.7);
    if (volatility > 8) leverage = Math.floor(leverage * 0.5);

    return Math.max(3, Math.min(leverage, 25)); // Cap at 25x
  }

  /**
   * Generate human-readable reasoning
   */
  private generateReasoning(data: any): string[] {
    const reasons: string[] = [];

    // RSI reasoning
    if (data.rsi.signal === 'OVERSOLD') {
      reasons.push(`RSI at ${safeToFixed(data.rsi.value, 0)} indicates oversold conditions (bullish)`);
    } else if (data.rsi.signal === 'OVERBOUGHT') {
      reasons.push(`RSI at ${safeToFixed(data.rsi.value, 0)} indicates overbought conditions (bearish)`);
    }

    // MACD reasoning
    if (data.macd.trend === 'BULLISH') {
      reasons.push(`MACD shows bullish momentum (histogram: ${data.macd.histogram > 0 ? '+' : ''}${safeToFixed(data.macd.histogram, 4)})`);
    } else if (data.macd.trend === 'BEARISH') {
      reasons.push(`MACD shows bearish momentum (histogram: ${safeToFixed(data.macd.histogram, 4)})`);
    }

    // BB reasoning
    if (data.bb.position === 'LOWER') {
      reasons.push(`Price at lower Bollinger Band (oversold zone)`);
    } else if (data.bb.position === 'UPPER') {
      reasons.push(`Price at upper Bollinger Band (overbought zone)`);
    }

    // Volume reasoning
    if (data.volume.volumeRatio > 1.5) {
      const pressure = data.volume.buyPressure > 0.6 ? 'strong buying' : 'strong selling';
      reasons.push(`${pressure.charAt(0).toUpperCase() + pressure.slice(1)} pressure with ${safeToFixed(data.volume.volumeRatio * 100, 0)}% above average volume`);
    }

    // S/R reasoning
    if (data.sr.distanceToSupport < 2) {
      const nearestSupport = data.sr.support[0] || 0;
      reasons.push(`Near support level at $${safeToFixed(nearestSupport, 2)} (${safeToFixed(data.sr.distanceToSupport, 1)}% away)`);
    }
    if (data.sr.distanceToResistance < 2) {
      const nearestResistance = data.sr.resistance[0] || 0;
      reasons.push(`Near resistance level at $${safeToFixed(nearestResistance, 2)} (${safeToFixed(data.sr.distanceToResistance, 1)}% away)`);
    }

    return reasons;
  }

  /**
   * Generate warnings
   */
  private generateWarnings(data: any): string[] {
    const warnings: string[] = [];

    // Poor risk/reward
    if (data.riskReward < 1.5) {
      warnings.push(`Low risk/reward ratio (1:${safeToFixed(data.riskReward, 1)}). Consider waiting for better entry.`);
    }

    // Low volume
    if (data.volume.volumeRatio < 0.7) {
      warnings.push(`Volume is ${((1 - data.volume.volumeRatio) * 100).toFixed(0)}% below average. Signal may be unreliable.`);
    }

    // High volatility
    if (data.bb.bandwidth > 8) {
      warnings.push(`High market volatility detected. Use lower leverage.`);
    }

    // Low confidence
    if (data.confidence < 50) {
      warnings.push(`Low confidence signal. Wait for stronger confirmation.`);
    }

    return warnings;
  }
}

export const signalEngine = new SignalEngine();

