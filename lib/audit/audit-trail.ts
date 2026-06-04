import crypto from 'crypto';
import { prisma } from '@/lib/prisma';

// 
// Enterprise AUDIT TRAIL  Immutable Cryptographic Event Log
// Every entry is HMAC-signed and chained to the previous entry (hash chain).
// The PostgreSQL table uses INSERT-ONLY triggers  no UPDATE or DELETE allowed.
// Compatible with ENISA audit requirements and eIDAS 2.0 non-repudiation.
// 

export const AUDIT_EVENT_TYPES = [
  // Authentication events
  'AUTH_SUCCESS',
  'AUTH_FAILURE',
  'AUTH_SESSION_CREATED',
  'AUTH_SESSION_EXPIRED',
  'AUTH_REPLAY_BLOCKED',
  // Access control
  'ACCESS_GRANTED',
  'ACCESS_DENIED',
  'ACCESS_KYC_BLOCKED',
  'ACCESS_GEO_BLOCKED',
  // Security events
  'SECURITY_HONEYPOT_HIT',
  'SECURITY_RATE_LIMITED',
  'SECURITY_WAF_BLOCKED',
  'SECURITY_INVALID_SIGNATURE',
  'SECURITY_TAMPERED_JWT',
  // Analytics events
  'WHALE_DETECTED',
  'WHALE_HIGH_CONVICTION',
  'WHALE_MEGA_EVENT',
  // Forum events
  'FORUM_POST_CREATED',
  'FORUM_POST_SIGNATURE_FAILED',
  // System events
  'SYSTEM_WORKER_STARTED',
  'SYSTEM_WORKER_STOPPED',
  'SYSTEM_NEO4J_FALLBACK',
  'SYSTEM_REDIS_FALLBACK',
] as const;

export type AuditEventType = (typeof AUDIT_EVENT_TYPES)[number];

export interface AuditEntry {
  id?: string;
  timestamp: string;          // ISO 8601 UTC
  event: AuditEventType;
  actor: string;              // wallet address or system identifier
  ip: string;
  metadata: Record<string, unknown>;
  payload_hash: string;       // SHA-256(timestamp+event+actor+ip+JSON(metadata))
  hmac_sig: string;           // HMAC-SHA256(payload_hash+prev_hash, AUDIT_SECRET)
  prev_hash: string;          // SHA-256 of previous entry's payload_hash (chain link)
}

const AUDIT_SECRET = process.env.AUDIT_SECRET || process.env.JWT_SECRET || '';

function sha256(data: string): string {
  return crypto.createHash('sha256').update(data, 'utf8').digest('hex');
}

function hmacSHA256(data: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(data, 'utf8').digest('hex');
}

/**
 * Computes the payload hash for an audit entry (before signing).
 * This is the canonical representation used for chain linking.
 */
function computePayloadHash(
  timestamp: string,
  event: AuditEventType,
  actor: string,
  ip: string,
  metadata: Record<string, unknown>
): string {
  const canonical = JSON.stringify({ timestamp, event, actor, ip, metadata }, null, 0);
  return sha256(canonical);
}

/**
 * Retrieves the hash of the last entry in the audit log.
 * Returns 'GENESIS' for the first entry (no previous entry).
 */
async function getLastEntryHash(): Promise<string> {
  try {
    // @ts-ignore  auditLog model added via migration
    const last = await (prisma as any).auditLog.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { payloadHash: true },
    });
    return last?.payloadHash ?? 'GENESIS';
  } catch {
    // Table may not exist yet  return genesis hash
    return 'GENESIS';
  }
}

/**
 * Appends a cryptographically signed, chained entry to the immutable audit log.
 *
 * Chain integrity: each entry's HMAC includes the previous entry's payload_hash.
 * Any deletion or modification of historical entries breaks the chain,
 * detectable by re-computing all HMACs from the genesis entry forward.
 */
export async function appendAuditEntry(
  event: AuditEventType,
  actor: string,
  ip: string,
  metadata: Record<string, unknown> = {}
): Promise<void> {
  if (!AUDIT_SECRET) {
    console.error('[AUDIT-TRAIL:CRITICAL] AUDIT_SECRET not set. Audit entry DROPPED. Configure AUDIT_SECRET env var.');
    return;
  }

  try {
    const timestamp = new Date().toISOString();
    const prevHash = await getLastEntryHash();
    const payloadHash = computePayloadHash(timestamp, event, actor, ip, metadata);
    const hmacSig = hmacSHA256(`${payloadHash}:${prevHash}`, AUDIT_SECRET);

    const entry: Omit<AuditEntry, 'id'> = {
      timestamp,
      event,
      actor,
      ip,
      metadata,
      payload_hash: payloadHash,
      hmac_sig: hmacSig,
      prev_hash: prevHash,
    };

    // @ts-ignore  auditLog model added via migration
    await (prisma as any).auditLog.create({
      data: {
        timestamp: new Date(timestamp),
        event,
        actor,
        ip,
        metadata: JSON.stringify(metadata),
        payloadHash: payloadHash,
        hmacSig: hmacSig,
        prevHash: prevHash,
      },
    });
  } catch (err: any) {
    // Audit trail must NEVER crash the calling code  log but don't throw
    console.error(`[AUDIT-TRAIL] Failed to append entry (${event}): ${err.message}`);
  }
}

/**
 * Verifies the integrity of the entire audit trail by re-computing all HMACs
 * and validating the hash chain from genesis to the latest entry.
 *
 * Returns { valid: true, count } on success.
 * Returns { valid: false, brokenAt: id, reason } on any chain integrity violation.
 */
export async function verifyAuditTrailIntegrity(): Promise<
  { valid: true; count: number } | { valid: false; brokenAt: string; reason: string }
> {
  if (!AUDIT_SECRET) {
    return { valid: false, brokenAt: 'N/A', reason: 'AUDIT_SECRET not configured' };
  }

  try {
    // @ts-ignore
    const entries = await (prisma as any).auditLog.findMany({
      orderBy: { createdAt: 'asc' },
    });

    let prevHash = 'GENESIS';

    for (const entry of entries) {
      // Reconstruct the payload hash
      const metadata = typeof entry.metadata === 'string'
        ? JSON.parse(entry.metadata)
        : entry.metadata;

      const expectedPayloadHash = computePayloadHash(
        entry.timestamp.toISOString(),
        entry.event,
        entry.actor,
        entry.ip,
        metadata
      );

      if (expectedPayloadHash !== entry.payloadHash) {
        return {
          valid: false,
          brokenAt: entry.id,
          reason: `Payload hash mismatch (entry modified after creation)`,
        };
      }

      const expectedHmac = hmacSHA256(`${entry.payloadHash}:${prevHash}`, AUDIT_SECRET);
      if (expectedHmac !== entry.hmacSig) {
        return {
          valid: false,
          brokenAt: entry.id,
          reason: `HMAC chain broken (entry deleted or prev_hash tampered)`,
        };
      }

      if (entry.prevHash !== prevHash) {
        return {
          valid: false,
          brokenAt: entry.id,
          reason: `Chain link broken: expected prev_hash=${prevHash}, got ${entry.prevHash}`,
        };
      }

      prevHash = entry.payloadHash;
    }

    return { valid: true, count: entries.length };
  } catch (err: any) {
    return { valid: false, brokenAt: 'N/A', reason: err.message };
  }
}
