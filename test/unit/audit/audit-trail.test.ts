/**
 * AUDIT TRAIL  Test Suite
 * Validates HMAC chain integrity, tamper detection, and entry structure.
 * Uses an in-memory mock for Prisma to avoid DB dependency in unit tests.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

//  Mock Prisma 
const mockEntries: any[] = [];

vi.mock('@/lib/prisma', () => ({
  prisma: {
    $queryRaw: vi.fn(),
    // @ts-ignore
    systemAuditLog: {
      findFirst: vi.fn(async ({ orderBy, select }: any) => {
        if (!mockEntries.length) return null;
        return { payloadHash: mockEntries[mockEntries.length - 1].payloadHash };
      }),
      create: vi.fn(async ({ data }: any) => {
        mockEntries.push({ ...data, id: String(mockEntries.length + 1) });
        return data;
      }),
      findMany: vi.fn(async ({ orderBy }: any) => {
        return [...mockEntries].map(e => ({
          ...e,
          timestamp: new Date(e.timestamp),
        }));
      }),
    },
  },
}));

//  Set required env 
process.env.AUDIT_SECRET = 'test-audit-secret-256-bits-minimum-length-ok';

import { appendAuditEntry, verifyAuditTrailIntegrity } from '../../../lib/audit/audit-trail';

describe('Audit Trail', () => {
  beforeEach(() => {
    mockEntries.length = 0;
  });

  it('creates a genesis entry with prevHash=GENESIS', async () => {
    await appendAuditEntry('AUTH_SUCCESS', '0xabc123', '1.2.3.4', { path: '/trade' });
    expect(mockEntries).toHaveLength(1);
    expect(mockEntries[0].prevHash).toBe('GENESIS');
    expect(mockEntries[0].payloadHash).toHaveLength(64); // SHA-256 hex
    expect(mockEntries[0].hmacSig).toHaveLength(64);
  });

  it('chains subsequent entries to previous payloadHash', async () => {
    await appendAuditEntry('AUTH_SUCCESS', '0xabc', '1.1.1.1', {});
    await appendAuditEntry('AUTH_FAILURE', '0xdef', '2.2.2.2', {});
    expect(mockEntries[1].prevHash).toBe(mockEntries[0].payloadHash);
  });

  it('verifies a valid chain as intact', async () => {
    await appendAuditEntry('AUTH_SUCCESS', '0xabc', '1.1.1.1', {});
    await appendAuditEntry('WHALE_DETECTED', 'system', '0.0.0.0', { chain: 'BASE' });
    const result = await verifyAuditTrailIntegrity();
    expect(result.valid).toBe(true);
    if (result.valid) expect(result.count).toBe(2);
  });

  it('detects tampering: payload hash mismatch', async () => {
    await appendAuditEntry('AUTH_SUCCESS', '0xabc', '1.1.1.1', {});
    // Tamper: change the actor field without updating payloadHash
    mockEntries[0].actor = '0xevildoer';
    const result = await verifyAuditTrailIntegrity();
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.reason).toMatch(/Payload hash mismatch/);
  });

  it('detects chain break: prevHash mismatch', async () => {
    await appendAuditEntry('AUTH_SUCCESS', '0xabc', '1.1.1.1', {});
    await appendAuditEntry('AUTH_FAILURE', '0xdef', '2.2.2.2', {});
    // Tamper: corrupt the chain link
    mockEntries[1].prevHash = 'a'.repeat(64);
    const result = await verifyAuditTrailIntegrity();
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.reason).toMatch(/Chain link broken/);
  });

  it('does not throw when AUDIT_SECRET is missing  logs error and returns', async () => {
    const original = process.env.AUDIT_SECRET;
    delete process.env.AUDIT_SECRET;
    await expect(appendAuditEntry('AUTH_SUCCESS', '0x0', '0.0.0.0', {})).resolves.toBeUndefined();
    process.env.AUDIT_SECRET = original;
  });

  it('handles empty audit log  valid with count 0', async () => {
    const result = await verifyAuditTrailIntegrity();
    expect(result.valid).toBe(true);
    if (result.valid) expect(result.count).toBe(0);
  });

  it('stores metadata as JSON string', async () => {
    const meta = { chain: 'ETHEREUM', amount: '50000', token: 'USDC' };
    await appendAuditEntry('WHALE_DETECTED', '0xwhale', '3.3.3.3', meta);
    const stored = mockEntries[0].metadata;
    expect(typeof stored).toBe('string');
    expect(JSON.parse(stored)).toMatchObject(meta);
  });
});
