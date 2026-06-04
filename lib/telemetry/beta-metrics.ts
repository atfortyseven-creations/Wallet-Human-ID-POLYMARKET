import { prisma } from '@/lib/prisma';

/**
 * System Telemetry Engine (Zero-Third-Party / GDPR Compliant)
 * 
 * Aggregates performance metrics (Latency, Uptime) in-memory and flushes 
 * to PostgreSQL securely. No PII, IP addresses, or wallet addresses are logged.
 */

type MetricType = 'HANDSHAKE_LATENCY' | 'WHALE_DETECTION_LATENCY' | 'WS_UPTIME';

interface AggregatedMetric {
  type: MetricType;
  values: number[]; // e.g. latency in ms
  lastFlush: number;
}

class TelemetryEngine {
  private buffer: Map<MetricType, AggregatedMetric> = new Map();
  private readonly FLUSH_THRESHOLD = 50; // Flush after 50 events
  private readonly FLUSH_INTERVAL_MS = 60000; // or every 60 seconds

  constructor() {
    this.buffer.set('HANDSHAKE_LATENCY', { type: 'HANDSHAKE_LATENCY', values: [], lastFlush: Date.now() });
    this.buffer.set('WHALE_DETECTION_LATENCY', { type: 'WHALE_DETECTION_LATENCY', values: [], lastFlush: Date.now() });
    this.buffer.set('WS_UPTIME', { type: 'WS_UPTIME', values: [], lastFlush: Date.now() });

    // Ensure we flush periodically to prevent memory leaks in long-running edge nodes
    setInterval(() => this.flushAll(), this.FLUSH_INTERVAL_MS);
  }

  /**
   * Records a latency metric (e.g., from a PerformanceObserver).
   */
  public recordMetric(type: MetricType, value: number) {
    const metric = this.buffer.get(type);
    if (!metric) return;

    metric.values.push(value);

    if (metric.values.length >= this.FLUSH_THRESHOLD) {
      this.flush(type);
    }
  }

  /**
   * Calculates the 95th percentile (P95) of an array of numbers.
   */
  private calculateP95(arr: number[]): number {
    if (arr.length === 0) return 0;
    const sorted = [...arr].sort((a, b) => a - b);
    const index = Math.ceil((95 / 100) * sorted.length) - 1;
    return sorted[index];
  }

  /**
   * Flushes a specific metric to the System Database.
   */
  private async flush(type: MetricType) {
    const metric = this.buffer.get(type);
    if (!metric || metric.values.length === 0) return;

    // Clone and clear the buffer to prevent race conditions during async write
    const valuesToFlush = [...metric.values];
    metric.values = [];
    metric.lastFlush = Date.now();

    const p95 = this.calculateP95(valuesToFlush);
    const average = valuesToFlush.reduce((a, b) => a + b, 0) / valuesToFlush.length;

    try {
      await prisma.betaTelemetry.create({
        data: {
          metricType: type,
          value: average,
          p95: p95,
          sampleSize: valuesToFlush.length,
          environment: process.env.NODE_ENV || 'development'
        }
      });
      // console.log(`[Telemetry] Flushed ${valuesToFlush.length} events for ${type}. P95: ${p95.toFixed(2)}ms`);
    } catch (error) {
      // Fail silently for telemetry to avoid crashing the main thread
      console.error(`[Telemetry Error] Failed to flush ${type}:`, error);
    }
  }

  /**
   * Flushes all aggregated metrics.
   */
  public async flushAll() {
    await Promise.all([
      this.flush('HANDSHAKE_LATENCY'),
      this.flush('WHALE_DETECTION_LATENCY'),
      this.flush('WS_UPTIME')
    ]);
  }
}

// Export as singleton to be used across the application
export const SystemTelemetry = new TelemetryEngine();
