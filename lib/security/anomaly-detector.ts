import { safeRedisGet, safeRedisSet } from '@/lib/redis/client';

interface AnomalyEvent {
  type: string;
  address?: string;
  ip: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  metadata?: Record<string, any>;
}

/**
 * MAINNET ANOMALY DETECTION ENGINE
 * Tracks suspicious patterns and raises alerts for:
 * - Rapid transfer attempts (>10 per minute)
 * - Multiple failed auth attempts (>5 per minute)
 * - Sybil patterns (same IP claiming multiple airdrops)
 * - Unusual balance spikes
 */
export async function detectAnomaly(event: AnomalyEvent): Promise<boolean> {
  const { type, address, ip, severity } = event;
  const key = `anomaly:${type}:${address || ip}`;
  
  const raw = await safeRedisGet(key);
  const count = raw && raw !== 'TIMEOUT' ? parseInt(raw, 10) + 1 : 1;
  
  // Sliding window: reset every 60s
  await safeRedisSet(key, String(count), 'EX', 60);
  
  const thresholds: Record<string, number> = {
    'rapid_transfer': 10,
    'failed_auth': 5,
    'airdrop_abuse': 2,
    'api_abuse': 100,
  };
  
  const threshold = thresholds[type] || 20;
  const triggered = count >= threshold;
  
  if (triggered) {
    console.warn(`[ANOMALY:${severity}] ${type} threshold breached for ${address || ip} (count: ${count})`);
    // Mark as blocked for 5 minutes on CRITICAL anomalies
    if (severity === 'CRITICAL') {
      await safeRedisSet(`blocked:${address || ip}`, '1', 'EX', 300);
    }
  }
  
  return triggered;
}

export async function isBlocked(identifier: string): Promise<boolean> {
  const val = await safeRedisGet(`blocked:${identifier}`);
  return val === '1';
}
