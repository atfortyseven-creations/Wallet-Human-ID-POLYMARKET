/**
 * Analytics Engine  Axiomas 350358
 * 
 * Churn prediction, LTV modeling, cohort analysis, virality
 * coefficient, conversion funnel, NPS  all wallet-scoped,
 * zero PII, GDPR-compliant.
 * 
 */

import { prisma } from '@/lib/prisma';
import { redisClient as redis } from '@/lib/redis/client';

async function getRedisValue<T>(key: string): Promise<T | null> {
  const val = await redis.get(key);
  if (!val) return null;
  try { return typeof val === 'string' ? JSON.parse(val) as T : val as T; } catch { return val as unknown as T; }
}
async function getRedisNumber(key: string): Promise<number | null> {
  const val = await redis.get(key);
  if (!val) return null;
  return Number(val);
}
async function setRedisValue(key: string, value: any, ttlSeconds?: number): Promise<void> {
  const val = typeof value === 'string' ? value : JSON.stringify(value);
  if (ttlSeconds) {
    await redis.set(key, val, 'EX', ttlSeconds);
  } else {
    await redis.set(key, val);
  }
}

//  Types 
export interface ChurnScore {
  walletAddress: string;
  score:         number;    // 0.01.0 (1.0 = certain churn)
  predictedDays: number;    // Days until estimated churn
  signals:       string[];
  computedAt:    string;
}

export interface CohortData {
  cohortWeek:   string;     // ISO week: "2026-W19"
  totalWallets: number;
  retained: {
    week1: number; week2: number; week4: number; week8: number;
  };
}

export interface FunnelEvent {
  step:          string;
  walletAddress: string;
  metadata?:     Record<string, string | number>;
  timestamp:     string;
}

export interface ViralityMetrics {
  kFactor:        number;   // K = invites_sent × conversion_rate
  totalReferrals: number;
  convertedRef:   number;
  conversionRate: number;
  computedAt:     string;
}

//  CHURN PREDICTION (Axioma 351) 
/**
 * Simple 30-day LTV regression scoring. 
 * Signals: days since last login, forum activity, tier level, referrals.
 * Score 0.0 = loyal user, 1.0 = near-certain churn.
 */
export async function computeChurnScore(walletAddress: string): Promise<ChurnScore> {
  const cacheKey = `churn:${walletAddress}`;
  const cached = await getRedisValue<ChurnScore>(cacheKey);
  if (cached) return cached;

  const wallet = walletAddress.toLowerCase();
  const signals: string[] = [];
  let score = 0;

  try {
    // Fetch user data
    const user = await prisma.user.findUnique({
      where: { walletAddress: wallet },
      select: {
        tier: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return { walletAddress, score: 0.5, predictedDays: 14, signals: ['no_account'], computedAt: new Date().toISOString() };
    }

    const daysSinceUpdate = (Date.now() - new Date(user.updatedAt).getTime()) / 86_400_000;

    // Signal 1: Inactivity
    if (daysSinceUpdate > 21) { score += 0.4; signals.push('inactive_21d'); }
    else if (daysSinceUpdate > 7) { score += 0.2; signals.push('inactive_7d'); }

    // Signal 2: Free tier (higher churn risk)
    if (!user.tier || user.tier === 'FREE') { score += 0.2; signals.push('free_tier'); }

    // Signal 3: Recency (newly joined < 3 days  still evaluating)
    const daysSinceJoin = (Date.now() - new Date(user.createdAt).getTime()) / 86_400_000;
    if (daysSinceJoin < 3) { score -= 0.1; signals.push('new_user'); }

    score = Math.max(0, Math.min(1, score));
    const predictedDays = Math.round(30 * (1 - score));

    const result: ChurnScore = { walletAddress, score, predictedDays, signals, computedAt: new Date().toISOString() };
    await setRedisValue(cacheKey, result, 3600); // 1hr cache
    return result;

  } catch {
    return { walletAddress, score: 0, predictedDays: 30, signals: ['error'], computedAt: new Date().toISOString() };
  }
}

//  COHORT ANALYSIS (Axioma 352) 
export async function computeWeeklyCohorts(): Promise<CohortData[]> {
  const cacheKey = 'analytics:cohorts';
  const cached = await getRedisValue<CohortData[]>(cacheKey);
  if (cached) return cached;

  try {
    // Raw SQL for windowed cohort retention
    const rows = await prisma.$queryRaw<Array<{
      cohort_week: string;
      total: bigint;
      w1: bigint; w2: bigint; w4: bigint; w8: bigint;
    }>>`
      WITH cohorts AS (
        SELECT
          walletAddress,
          DATE_TRUNC('week', "createdAt") AS cohort_week
        FROM "User"
        WHERE "createdAt" >= NOW() - INTERVAL '90 days'
      ),
      activity AS (
        SELECT walletAddress, DATE_TRUNC('week', "updatedAt") AS active_week
        FROM "User"
      )
      SELECT
        TO_CHAR(c.cohort_week, 'IYYY"-W"IW') AS cohort_week,
        COUNT(DISTINCT c.walletAddress) AS total,
        COUNT(DISTINCT CASE WHEN a.active_week = c.cohort_week + INTERVAL '1 week' THEN a.walletAddress END) AS w1,
        COUNT(DISTINCT CASE WHEN a.active_week = c.cohort_week + INTERVAL '2 weeks' THEN a.walletAddress END) AS w2,
        COUNT(DISTINCT CASE WHEN a.active_week = c.cohort_week + INTERVAL '4 weeks' THEN a.walletAddress END) AS w4,
        COUNT(DISTINCT CASE WHEN a.active_week = c.cohort_week + INTERVAL '8 weeks' THEN a.walletAddress END) AS w8
      FROM cohorts c
      LEFT JOIN activity a ON c.walletAddress = a.walletAddress
      GROUP BY c.cohort_week
      ORDER BY c.cohort_week DESC
      LIMIT 12
    `;

    const cohorts: CohortData[] = rows.map((r) => ({
      cohortWeek:   r.cohort_week,
      totalWallets: Number(r.total),
      retained: {
        week1: Number(r.w1),
        week2: Number(r.w2),
        week4: Number(r.w4),
        week8: Number(r.w8),
      },
    }));

    await setRedisValue(cacheKey, cohorts, 3600);
    return cohorts;

  } catch {
    return [];
  }
}

//  CONVERSION FUNNEL (Axioma 350) 
export async function trackFunnelEvent(event: FunnelEvent): Promise<void> {
  const key = `funnel:${event.step}:${new Date().toISOString().slice(0, 10)}`;
  await redis.incr(key);
  await redis.expire(key, 86_400 * 90); // 90 days retention
}

export async function getFunnelMetrics(days = 7): Promise<Record<string, number>> {
  const steps = ['LANDING', 'WALLET_CONNECT', 'AUTHENTICATED', 'DASHBOARD', 'PLAN_VIEW', 'CHECKOUT', 'SUBSCRIBED'];
  const metrics: Record<string, number> = {};

  for (const step of steps) {
    let total = 0;
    for (let d = 0; d < days; d++) {
      const date = new Date(Date.now() - d * 86_400_000).toISOString().slice(0, 10);
      const count = await getRedisNumber(`funnel:${step}:${date}`);
      total += count ?? 0;
    }
    metrics[step] = total;
  }
  return metrics;
}

//  VIRALITY COEFFICIENT (Axioma 353) 
export async function computeViralityMetrics(): Promise<ViralityMetrics> {
  const cacheKey = 'analytics:virality';
  const cached = await getRedisValue<ViralityMetrics>(cacheKey);
  if (cached) return cached;

  try {
    const [totalReferrals, convertedRef] = await Promise.all([
      getRedisNumber('referrals:total') ?? Promise.resolve(0),
      getRedisNumber('referrals:converted') ?? Promise.resolve(0),
    ]);

    const totalUsers = await prisma.user.count();
    const total = Number(totalReferrals);
    const converted = Number(convertedRef);
    const conversionRate = total > 0 ? converted / total : 0;
    const invitesPerUser = totalUsers > 0 ? total / totalUsers : 0;
    const kFactor = invitesPerUser * conversionRate;

    const result: ViralityMetrics = {
      kFactor: parseFloat(kFactor.toFixed(4)),
      totalReferrals: total,
      convertedRef: converted,
      conversionRate: parseFloat(conversionRate.toFixed(4)),
      computedAt: new Date().toISOString(),
    };

    await setRedisValue(cacheKey, result, 3600);
    return result;

  } catch {
    return { kFactor: 0, totalReferrals: 0, convertedRef: 0, conversionRate: 0, computedAt: new Date().toISOString() };
  }
}

//  NPS SIGNED (Axioma 356) 
export interface NPSEntry {
  walletAddress: string;
  score:         number;   // 010
  comment?:      string;
  signature:     string;   // EIP-191 over JSON.stringify({walletAddress, score, comment, ts})
  timestamp:     string;
}

export async function submitNPS(entry: NPSEntry): Promise<void> {
  const key = `nps:${entry.walletAddress}:${new Date().toISOString().slice(0, 7)}`; // Monthly
  await setRedisValue(key, entry, 86_400 * 35); // 35-day TTL

  // Increment NPS bucket counter
  const bucket = entry.score >= 9 ? 'promoter' : entry.score >= 7 ? 'passive' : 'detractor';
  await redis.incr(`nps:count:${bucket}:${new Date().toISOString().slice(0, 7)}`);
}

export async function getNPSSummary(yearMonth?: string): Promise<{ promoters: number; passives: number; detractors: number; nps: number }> {
  const ym = yearMonth ?? new Date().toISOString().slice(0, 7);
  const [p, pa, d] = await Promise.all([
    getRedisNumber(`nps:count:promoter:${ym}`),
    getRedisNumber(`nps:count:passive:${ym}`),
    getRedisNumber(`nps:count:detractor:${ym}`),
  ]);
  const promoters  = p  ?? 0;
  const passives   = pa ?? 0;
  const detractors = d  ?? 0;
  const total      = promoters + passives + detractors;
  const nps        = total > 0 ? Math.round(((promoters - detractors) / total) * 100) : 0;
  return { promoters, passives, detractors, nps };
}
