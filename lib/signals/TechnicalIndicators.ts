import { safeToFixed, safeToLocaleString } from '@/lib/utils/number-format';

/**
 * TechnicalIndicators.ts
 * INTERESTELAR-GRADE Technical Analysis Library
 * 
 * Implements mathematically precise calculations for:
 * - RSI (Relative Strength Index)
 * - MACD (Moving Average Convergence Divergence)
 * - EMA (Exponential Moving Average)
 * - Bollinger Bands
 * - Volume Profile Analysis
 * - Support/Resistance Detection
 * 
 * All calculations use IEEE 754 double precision arithmetic.
 */

export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface RSIResult {
  value: number;
  signal: 'OVERSOLD' | 'NEUTRAL' | 'OVERBOUGHT';
  strength: number; // 0-100, how far from neutral
}

export interface MACDResult {
  macd: number;
  signal: number;
  histogram: number;
  trend: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  crossover: boolean; // True if recent crossover
}

export interface BollingerBandsResult {
  upper: number;
  middle: number;
  lower: number;
  bandwidth: number;
  position: 'UPPER' | 'MIDDLE' | 'LOWER'; // Where price is
}

export interface VolumeAnalysis {
  averageVolume: number;
  currentVolume: number;
  volumeRatio: number; // current / average
  trend: 'INCREASING' | 'DECREASING' | 'STABLE';
  buyPressure: number; // 0-1, estimated buy vs sell
}

export interface SupportResistance {
  support: number[];
  resistance: number[];
  currentLevel: 'SUPPORT' | 'RESISTANCE' | 'MIDDLE';
  distanceToSupport: number; // percentage
  distanceToResistance: number; // percentage
}

export class TechnicalIndicators {
  /**
   * Calculate RSI (Relative Strength Index)
   * Formula: RSI = 100 - (100 / (1 + RS))
   * Where RS = Average Gain / Average Loss
   * 
   * @param candles - Array of candles (minimum: period + 1)
   * @param period - RSI period (default: 14)
   * @returns RSI result with value and signal
   */
  public static calculateRSI(candles: Candle[], period = 14): RSIResult {
    if (candles.length < period + 1) {
      throw new Error(`Insufficient data: need ${period + 1} candles, got ${candles.length}`);
    }

    // Calculate price changes
    const changes: number[] = [];
    for (let i = 1; i < candles.length; i++) {
      changes.push(candles[i].close - candles[i - 1].close);
    }

    // Separate gains and losses
    let gains = 0;
    let losses = 0;

    // Initial average (first 'period' changes)
    for (let i = 0; i < period; i++) {
      if (changes[i] > 0) {
        gains += changes[i];
      } else {
        losses += Math.abs(changes[i]);
      }
    }

    let avgGain = gains / period;
    let avgLoss = losses / period;

    // Smooth the averages (Wilder's smoothing method)
    for (let i = period; i < changes.length; i++) {
      const change = changes[i];
      const gain = change > 0 ? change : 0;
      const loss = change < 0 ? Math.abs(change) : 0;

      avgGain = (avgGain * (period - 1) + gain) / period;
      avgLoss = (avgLoss * (period - 1) + loss) / period;
    }

    // Calculate RS and RSI
    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    const rsi = 100 - (100 / (1 + rs));

    // Determine signal
    let signal: 'OVERSOLD' | 'NEUTRAL' | 'OVERBOUGHT';
    if (rsi < 30) signal = 'OVERSOLD';
    else if (rsi > 70) signal = 'OVERBOUGHT';
    else signal = 'NEUTRAL';

    // Calculate strength (how extreme the RSI is)
    const strength = rsi < 50 
      ? ((50 - rsi) / 50) * 100 // 0-50 maps to 100-0
      : ((rsi - 50) / 50) * 100; // 50-100 maps to 0-100

    return {
      value: parseFloat(safeToFixed(rsi || 0, 2)),
      signal,
      strength: parseFloat(safeToFixed(strength || 0, 2))
    };
  }

  /**
   * Calculate EMA (Exponential Moving Average)
   * Formula: EMA = Price(t) * k + EMA(y) * (1 - k)
   * Where k = 2 / (N + 1), N = period
   * 
   * @param values - Array of values to average
   * @param period - EMA period
   * @returns Current EMA value
   */
  public static calculateEMA(values: number[], period: number): number {
    if (values.length < period) {
      throw new Error(`Insufficient data for EMA: need ${period}, got ${values.length}`);
    }

    // Calculate initial SMA
    let ema = 0;
    for (let i = 0; i < period; i++) {
      ema += values[i];
    }
    ema /= period;

    // Smoothing factor
    const k = 2 / (period + 1);

    // Calculate EMA for remaining values
    for (let i = period; i < values.length; i++) {
      ema = values[i] * k + ema * (1 - k);
    }

    return ema;
  }

  /**
   * Calculate MACD (Moving Average Convergence Divergence)
   * Components:
   * - MACD Line: 12-period EMA - 26-period EMA
   * - Signal Line: 9-period EMA of MACD Line
   * - Histogram: MACD Line - Signal Line
   * 
   * @param candles - Array of candles (minimum: 35)
   * @returns MACD result with all components
   */
  public static calculateMACD(candles: Candle[]): MACDResult {
    if (candles.length < 35) {
      throw new Error(`Insufficient data for MACD: need 35, got ${candles.length}`);
    }

    const closePrices = candles.map(c => c.close);

    // Calculate EMAs
    const ema12 = this.calculateEMA(closePrices, 12);
    const ema26 = this.calculateEMA(closePrices, 26);

    // MACD Line
    const macdLine = ema12 - ema26;

    // For signal line, we need MACD values for last 9 periods
    const macdValues: number[] = [];
    for (let i = 26; i <= closePrices.length; i++) {
      const slice = closePrices.slice(0, i);
      const ema12_i = this.calculateEMA(slice, 12);
      const ema26_i = this.calculateEMA(slice, 26);
      macdValues.push(ema12_i - ema26_i);
    }

    // Signal Line (9-period EMA of MACD)
    const signalLine = this.calculateEMA(macdValues, 9);

    // Histogram
    const histogram = macdLine - signalLine;

    // Determine trend
    let trend: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
    if (histogram > 0 && macdLine > signalLine) trend = 'BULLISH';
    else if (histogram < 0 && macdLine < signalLine) trend = 'BEARISH';
    else trend = 'NEUTRAL';

    // Check for crossover (compare with previous histogram)
    const prevHistogram = macdValues.length >= 2 
      ? macdValues[macdValues.length - 2] - signalLine
      : histogram;
    
    const crossover = (histogram > 0 && prevHistogram <= 0) || 
                      (histogram < 0 && prevHistogram >= 0);

    return {
      macd: parseFloat(safeToFixed(macdLine || 0, 8)),
      signal: parseFloat(safeToFixed(signalLine || 0, 8)),
      histogram: parseFloat(safeToFixed(histogram || 0, 8)),
      trend,
      crossover
    };
  }

  /**
   * Calculate Bollinger Bands
   * Components:
   * - Middle Band: 20-period SMA
   * - Upper Band: Middle + (2 * Standard Deviation)
   * - Lower Band: Middle - (2 * Standard Deviation)
   * 
   * @param candles - Array of candles (minimum: 20)
   * @param period - Period for SMA (default: 20)
   * @param stdDev - Standard deviation multiplier (default: 2)
   * @returns Bollinger Bands result
   */
  public static calculateBollingerBands(
    candles: Candle[],
    period = 20,
    stdDev = 2
  ): BollingerBandsResult {
    if (candles.length < period) {
      throw new Error(`Insufficient data for Bollinger Bands: need ${period}, got ${candles.length}`);
    }

    const closePrices = candles.slice(-period).map(c => c.close);
    const currentPrice = candles[candles.length - 1].close;

    // Calculate SMA (Middle Band)
    const sma = closePrices.reduce((sum, price) => sum + price, 0) / period;

    // Calculate Standard Deviation
    const squaredDiffs = closePrices.map(price => Math.pow(price - sma, 2));
    const variance = squaredDiffs.reduce((sum, diff) => sum + diff, 0) / period;
    const standardDeviation = Math.sqrt(variance);

    // Calculate bands
    const upper = sma + (stdDev * standardDeviation);
    const lower = sma - (stdDev * standardDeviation);

    // Bandwidth (volatility measure)
    const bandwidth = ((upper - lower) / sma) * 100;

    // Determine position
    let position: 'UPPER' | 'MIDDLE' | 'LOWER';
    const upperThird = sma + (standardDeviation * stdDev / 3);
    const lowerThird = sma - (standardDeviation * stdDev / 3);

    if (currentPrice > upperThird) position = 'UPPER';
    else if (currentPrice < lowerThird) position = 'LOWER';
    else position = 'MIDDLE';

    return {
      upper: parseFloat(safeToFixed(upper || 0, 2)),
      middle: parseFloat(safeToFixed(sma || 0, 2)),
      lower: parseFloat(safeToFixed(lower || 0, 2)),
      bandwidth: parseFloat(safeToFixed(bandwidth || 0, 2)),
      position
    };
  }

  /**
   * Analyze volume patterns
   * Considers:
   * - Average volume over period
   * - Current volume vs average
   * - Volume trend
   * - Buy/Sell pressure estimation
   * 
   * @param candles - Array of candles (minimum: 20)
   * @returns Volume analysis result
   */
  public static analyzeVolume(candles: Candle[]): VolumeAnalysis {
    if (candles.length < 20) {
      throw new Error(`Insufficient data for volume analysis: need 20, got ${candles.length}`);
    }

    const volumes = candles.map(c => c.volume);
    const currentVolume = volumes[volumes.length - 1];

    // Calculate average volume (last 20 candles)
    const avgVolume = volumes.slice(-20).reduce((sum, v) => sum + v, 0) / 20;

    // Volume ratio
    const volumeRatio = currentVolume / avgVolume;

    // Determine trend (compare recent 10 vs previous 10)
    const recent10Avg = volumes.slice(-10).reduce((sum, v) => sum + v, 0) / 10;
    const prev10Avg = volumes.slice(-20, -10).reduce((sum, v) => sum + v, 0) / 10;

    let trend: 'INCREASING' | 'DECREASING' | 'STABLE';
    if (recent10Avg > prev10Avg * 1.2) trend = 'INCREASING';
    else if (recent10Avg < prev10Avg * 0.8) trend = 'DECREASING';
    else trend = 'STABLE';

    // Estimate buy pressure
    // Use relative position of close in the candle's range
    const lastCandle = candles[candles.length - 1];
    const range = lastCandle.high - lastCandle.low;
    const buyPressure = range === 0 
      ? 0.5 
      : (lastCandle.close - lastCandle.low) / range;

    return {
      averageVolume: parseFloat(safeToFixed(avgVolume || 0, 2)),
      currentVolume: parseFloat(safeToFixed(currentVolume || 0, 2)),
      volumeRatio: parseFloat(safeToFixed(volumeRatio || 0, 2)),
      trend,
      buyPressure: parseFloat(safeToFixed(buyPressure || 0, 2))
    };
  }

  /**
   * Find support and resistance levels
   * Uses pivot point detection algorithm
   * 
   * @param candles - Array of candles (minimum: 50)
   * @param lookback - Number of candles to look back (default: 50)
   * @returns Support and resistance levels
   */
  public static findSupportResistance(
    candles: Candle[],
    lookback = 50
  ): SupportResistance {
    if (candles.length < lookback) {
      throw new Error(`Insufficient data for S/R: need ${lookback}, got ${candles.length}`);
    }

    const recentCandles = candles.slice(-lookback);
    const currentPrice = candles[candles.length - 1].close;

    // Find local highs and lows (pivot points)
    const pivotHighs: number[] = [];
    const pivotLows: number[] = [];

    for (let i = 2; i < recentCandles.length - 2; i++) {
      const current = recentCandles[i];
      
      // Check for pivot high
      if (
        current.high > recentCandles[i - 1].high &&
        current.high > recentCandles[i - 2].high &&
        current.high > recentCandles[i + 1].high &&
        current.high > recentCandles[i + 2].high
      ) {
        pivotHighs.push(current.high);
      }

      // Check for pivot low
      if (
        current.low < recentCandles[i - 1].low &&
        current.low < recentCandles[i - 2].low &&
        current.low < recentCandles[i + 1].low &&
        current.low < recentCandles[i + 2].low
      ) {
        pivotLows.push(current.low);
      }
    }

    // Cluster similar levels (within 0.5% of each other)
    const clusterLevels = (levels: number[]): number[] => {
      if (levels.length === 0) return [];
      
      const sorted = [...levels].sort((a, b) => a - b);
      const clusters: number[][] = [];
      let currentCluster: number[] = [sorted[0]];

      for (let i = 1; i < sorted.length; i++) {
        const percentDiff = Math.abs((sorted[i] - sorted[i - 1]) / sorted[i - 1]) * 100;
        
        if (percentDiff < 0.5) {
          currentCluster.push(sorted[i]);
        } else {
          clusters.push(currentCluster);
          currentCluster = [sorted[i]];
        }
      }
      clusters.push(currentCluster);

      // Average each cluster
      return clusters.map(cluster => 
        cluster.reduce((sum, val) => sum + val, 0) / cluster.length
      );
    };

    const resistance = clusterLevels(pivotHighs)
      .filter(level => level > currentPrice)
      .slice(0, 3); // Top 3 resistance levels

    const support = clusterLevels(pivotLows)
      .filter(level => level < currentPrice)
      .slice(-3) // Bottom 3 support levels
      .reverse();

    // Determine current level
    const nearestSupport = support[0] || currentPrice * 0.95;
    const nearestResistance = resistance[0] || currentPrice * 1.05;

    const distToSupport = ((currentPrice - nearestSupport) / currentPrice) * 100;
    const distToResistance = ((nearestResistance - currentPrice) / currentPrice) * 100;

    let currentLevel: 'SUPPORT' | 'RESISTANCE' | 'MIDDLE';
    if (distToSupport < 1) currentLevel = 'SUPPORT';
    else if (distToResistance < 1) currentLevel = 'RESISTANCE';
    else currentLevel = 'MIDDLE';

    return {
      support: support.map(s => parseFloat(safeToFixed(s || 0, 2))),
      resistance: resistance.map(r => parseFloat(safeToFixed(r || 0, 2))),
      currentLevel,
      distanceToSupport: parseFloat(safeToFixed(distToSupport || 0, 2)),
      distanceToResistance: parseFloat(safeToFixed(distToResistance || 0, 2))
    };
  }
}

