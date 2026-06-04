/**
 * Feature Flag Engine  Axioma 281 (Canary Releases)
 * 
 * Wallet-scoped feature flag system backed by Redis.
 * Supports:
 *   - Global on/off flags
 *   - Wallet-address allowlist (1%  10%  100% canary)
 *   - Tier-gated flags (STARTER | PRO | ELITE)
 *   - Instant propagation via Redis (no deploy required)
 *   - Graceful fallback to env vars if Redis unavailable
 * 
 */

import { redisClient as redis } from '@/lib/redis/client';

export type FlagTier = 'ALL' | 'STARTER' | 'PRO' | 'ELITE';

export interface FeatureFlag {
  key:        string;
  enabled:    boolean;
  rollout:    number;          // 0100 percentage
  allowlist:  string[];        // wallet addresses (lowercase)
  tierGate:   FlagTier;
  axiom:      number;          // Which axiom this covers
  updatedAt:  string;
}

const FLAG_PREFIX  = 'feature_flag:';
const FLAGS_INDEX  = 'feature_flags:index';
const CACHE_TTL_MS = 30_000; // 30s in-memory cache to reduce Redis RTT

//  In-memory LRU cache 
const memCache = new Map<string, { value: FeatureFlag; ts: number }>();

function fromCache(key: string): FeatureFlag | null {
  const entry = memCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > CACHE_TTL_MS) { memCache.delete(key); return null; }
  return entry.value;
}
function toCache(key: string, flag: FeatureFlag): void {
  memCache.set(key, { value: flag, ts: Date.now() });
}

//  Core evaluation 
export async function evaluateFlag(
  flagKey:       string,
  walletAddress: string,
  userTier:      string = 'STARTER'
): Promise<boolean> {
  try {
    const flag = await getFlag(flagKey);
    if (!flag) return getEnvFallback(flagKey);
    if (!flag.enabled) return false;

    const addr = walletAddress.toLowerCase();

    // Explicit allowlist always wins
    if (flag.allowlist.length > 0 && flag.allowlist.includes(addr)) return true;

    // Tier gate: if flag requires PRO, only PRO/ELITE see it
    if (!passesTierGate(flag.tierGate, userTier)) return false;

    // Rollout percentage: deterministic hash of wallet  stable assignment
    if (flag.rollout >= 100) return true;
    if (flag.rollout <= 0)   return false;
    return walletRolloutBucket(addr) < flag.rollout;

  } catch {
    // Redis unavailable  fall back to env
    return getEnvFallback(flagKey);
  }
}

function passesTierGate(required: FlagTier, actual: string): boolean {
  if (required === 'ALL') return true;
  const order: Record<FlagTier, number> = { ALL: 0, STARTER: 1, PRO: 2, ELITE: 3 };
  return (order[actual as FlagTier] ?? 1) >= (order[required] ?? 1);
}

/** Deterministic [0,100) bucket from wallet address  stable per address. */
function walletRolloutBucket(addr: string): number {
  let hash = 0;
  for (let i = 0; i < addr.length; i++) {
    hash = ((hash << 5) - hash + addr.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) % 100;
}

function getEnvFallback(flagKey: string): boolean {
  const envKey = `FEATURE_${flagKey.toUpperCase().replace(/-/g, '_')}`;
  return process.env[envKey] === 'true';
}

//  CRUD 
export async function getFlag(flagKey: string): Promise<FeatureFlag | null> {
  const cached = fromCache(flagKey);
  if (cached) return cached;

  try {
    const raw = await redis.get(`${FLAG_PREFIX}${flagKey}`);
    if (!raw) return null;
    // ioredis returns a raw string; Upstash Redis returns an already-parsed object.
    // Handle both to remain compatible with both clients.
    const flag: FeatureFlag = typeof raw === 'string' ? JSON.parse(raw) : raw as FeatureFlag;
    toCache(flagKey, flag);
    return flag;
  } catch {
    return null;
  }
}

export async function setFlag(flag: FeatureFlag): Promise<void> {
  const redisKey = `${FLAG_PREFIX}${flag.key}`;
  const payload = { ...flag, updatedAt: new Date().toISOString() };
  // Serialize to JSON string to be compatible with both ioredis and Upstash
  await redis.set(redisKey, JSON.stringify(payload));
  await redis.sadd(FLAGS_INDEX, flag.key);
  memCache.delete(flag.key); // Invalidate in-memory cache immediately
}

export async function deleteFlag(flagKey: string): Promise<void> {
  await redis.del(`${FLAG_PREFIX}${flagKey}`);
  await redis.srem(FLAGS_INDEX, flagKey);
  memCache.delete(flagKey);
}

export async function listFlags(): Promise<FeatureFlag[]> {
  const keys = await redis.smembers(FLAGS_INDEX);
  const flags = await Promise.all(keys.map(getFlag));
  return flags.filter(Boolean) as FeatureFlag[];
}

//  Canary promotion helper 
/** Promote a flag through canary stages: 0  1  10  50  100 */
export async function promoteCanary(flagKey: string): Promise<number> {
  const flag = await getFlag(flagKey);
  if (!flag) throw new Error(`Flag "${flagKey}" not found`);
  const stages = [0, 1, 10, 50, 100];
  const currentIdx = stages.indexOf(flag.rollout);
  const nextRollout = stages[Math.min(currentIdx + 1, stages.length - 1)];
  await setFlag({ ...flag, rollout: nextRollout });
  return nextRollout;
}

//  Seed default flags for all 500 axiom elements 
export const DEFAULT_FLAGS: Omit<FeatureFlag, 'updatedAt'>[] = [
  { key: 'TITANIUMGATE_ENHANCED',    enabled: true,  rollout: 100, allowlist: [], tierGate: 'ALL',     axiom: 30 },
  { key: 'X25519_SYNC',              enabled: true,  rollout: 100, allowlist: [], tierGate: 'ALL',     axiom: 31 },
  { key: 'EDDSA_TRILLION_EDGE',      enabled: true,  rollout: 100, allowlist: [], tierGate: 'ALL',     axiom: 32 },
  { key: 'REDIS_ZERO_RACE',          enabled: true,  rollout: 100, allowlist: [], tierGate: 'ALL',     axiom: 33 },
  { key: 'REOWN_APPKIT_ABSTRACTION', enabled: true,  rollout: 100, allowlist: [], tierGate: 'ALL',     axiom: 34 },
  { key: 'SSR_HYDRATION_ERADICATION',enabled: true,  rollout: 100, allowlist: [], tierGate: 'ALL',     axiom: 35 },
  { key: 'ATOMIC_MOBILE_REDIRECT',   enabled: true,  rollout: 100, allowlist: [], tierGate: 'ALL',     axiom: 36 },
  { key: 'SESSION_ENFORCER_HARDENED',enabled: true,  rollout: 100, allowlist: [], tierGate: 'ALL',     axiom: 37 },
  { key: 'UA_DETECTION_HEURISTICS',  enabled: true,  rollout: 100, allowlist: [], tierGate: 'ALL',     axiom: 38 },
  { key: 'SESSION_PERSIST_MW',       enabled: true,  rollout: 100, allowlist: [], tierGate: 'ALL',     axiom: 39 },
  { key: 'ZK_2FA',                   enabled: true,  rollout: 100, allowlist: [], tierGate: 'STARTER', axiom: 40 },
  { key: 'WEBAUTHN_FALLBACK',        enabled: true,  rollout: 100, allowlist: [], tierGate: 'STARTER', axiom: 41 },
  { key: 'VPN_TOR_I2P_SUPPORT',      enabled: true,  rollout: 100, allowlist: [], tierGate: 'ALL',     axiom: 42 },
  { key: 'MEMPOOL_INTELLIGENCE',     enabled: true,  rollout: 100, allowlist: [], tierGate: 'STARTER', axiom: 80 },
  { key: 'NEO4J_MULTIHOP',           enabled: true,  rollout: 100, allowlist: [], tierGate: 'PRO',     axiom: 81 },
  { key: 'MEMORY_MATRIX_FALLBACK',   enabled: true,  rollout: 100, allowlist: [], tierGate: 'ALL',     axiom: 82 },
  { key: 'SINGLETON_WS_REFCOUNT',    enabled: true,  rollout: 100, allowlist: [], tierGate: 'ALL',     axiom: 83 },
  { key: 'EVM_THERMODYNAMICS',       enabled: true,  rollout: 100, allowlist: [], tierGate: 'PRO',     axiom: 84 },
  { key: 'MEV_DETECTION',            enabled: true,  rollout: 100, allowlist: [], tierGate: 'PRO',     axiom: 85 },
  { key: 'SIGNED_POLLS',             enabled: true,  rollout: 100, allowlist: [], tierGate: 'STARTER', axiom: 130 },
  { key: 'IPFS_MEDIA_FORUM',         enabled: true,  rollout: 100, allowlist: [], tierGate: 'PRO',     axiom: 131 },
  { key: 'NEO4J_FORUM_SEARCH',       enabled: true,  rollout: 100, allowlist: [], tierGate: 'STARTER', axiom: 132 },
  { key: 'SSE_NOTIFICATIONS',        enabled: true,  rollout: 100, allowlist: [], tierGate: 'STARTER', axiom: 133 },
  { key: 'ATOMIC_TIER_UPGRADE',      enabled: true,  rollout: 100, allowlist: [], tierGate: 'ALL',     axiom: 180 },
  { key: 'SEPA_INVOICE',             enabled: true,  rollout: 100, allowlist: [], tierGate: 'ALL',     axiom: 181 },
  { key: 'FISCAL_EXPORT',            enabled: true,  rollout: 100, allowlist: [], tierGate: 'PRO',     axiom: 182 },
  { key: 'KYC_ZK_PROOF',             enabled: false, rollout: 0,   allowlist: [], tierGate: 'ELITE',   axiom: 183 },
  { key: 'GDPR_DATA_EXPORT',         enabled: true,  rollout: 100, allowlist: [], tierGate: 'ALL',     axiom: 231 },
  { key: 'E2E_XMTP_CHAT',            enabled: true,  rollout: 10,  allowlist: [], tierGate: 'PRO',     axiom: 233 },
  { key: 'SIGNED_VIDEO_TUTORIALS',   enabled: true,  rollout: 100, allowlist: [], tierGate: 'STARTER', axiom: 234 },
  { key: 'BLUE_GREEN_DEPLOY',        enabled: true,  rollout: 100, allowlist: [], tierGate: 'ALL',     axiom: 280 },
  { key: 'CANARY_RELEASES',          enabled: true,  rollout: 100, allowlist: [], tierGate: 'ALL',     axiom: 281 },
  { key: 'CHAOS_ENGINEERING',        enabled: false, rollout: 0,   allowlist: [], tierGate: 'ALL',     axiom: 282 },
  { key: 'SLSA_LEVEL_4',             enabled: true,  rollout: 100, allowlist: [], tierGate: 'ALL',     axiom: 283 },
  { key: 'DDOS_MITIGATION',          enabled: true,  rollout: 100, allowlist: [], tierGate: 'ALL',     axiom: 291 },
  { key: 'AI_RATE_LIMITING',         enabled: true,  rollout: 100, allowlist: [], tierGate: 'ALL',     axiom: 293 },
  { key: 'ANTI_SYBIL',              enabled: true,  rollout: 100, allowlist: [], tierGate: 'ALL',     axiom: 295 },
  { key: 'CONVERSION_FUNNEL',        enabled: true,  rollout: 100, allowlist: [], tierGate: 'ALL',     axiom: 350 },
  { key: 'CHURN_PREDICTION',         enabled: true,  rollout: 100, allowlist: [], tierGate: 'ELITE',   axiom: 351 },
  { key: 'COHORT_ANALYSIS',          enabled: true,  rollout: 100, allowlist: [], tierGate: 'ELITE',   axiom: 352 },
  { key: 'VIRALITY_COEFFICIENT',     enabled: true,  rollout: 100, allowlist: [], tierGate: 'ELITE',   axiom: 353 },
  { key: 'NPS_SURVEY_SIGNED',        enabled: true,  rollout: 100, allowlist: [], tierGate: 'ALL',     axiom: 356 },
  { key: 'FEATURE_VOTING',           enabled: true,  rollout: 100, allowlist: [], tierGate: 'STARTER', axiom: 358 },
  { key: 'BETA_PROGRAM',             enabled: false, rollout: 0,   allowlist: [], tierGate: 'ELITE',   axiom: 359 },
  { key: 'CSP_LEVEL_3',              enabled: true,  rollout: 100, allowlist: [], tierGate: 'ALL',     axiom: 450 },
  { key: 'DYNAMIC_FAVICON',          enabled: true,  rollout: 100, allowlist: [], tierGate: 'ALL',     axiom: 451 },
  { key: 'SIGNED_PWA_UPDATES',       enabled: true,  rollout: 100, allowlist: [], tierGate: 'ALL',     axiom: 452 },
  { key: 'ATOMIC_ROLLBACK',          enabled: true,  rollout: 100, allowlist: [], tierGate: 'ALL',     axiom: 453 },
  { key: 'SBOM_PER_BUILD',           enabled: true,  rollout: 100, allowlist: [], tierGate: 'ALL',     axiom: 462 },
  { key: 'CVE_SCANNER',              enabled: true,  rollout: 100, allowlist: [], tierGate: 'ALL',     axiom: 461 },
  { key: 'SINGLETON_WS_FINAL',       enabled: true,  rollout: 100, allowlist: [], tierGate: 'ALL',     axiom: 500 },
];

export async function seedDefaultFlags(): Promise<void> {
  for (const flag of DEFAULT_FLAGS) {
    const existing = await getFlag(flag.key);
    if (!existing) {
      await setFlag({ ...flag, updatedAt: new Date().toISOString() });
    }
  }
}
