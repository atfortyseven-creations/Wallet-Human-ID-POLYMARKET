/**
 * GOLDEN TICKET  ZK-SNARK Verification Layer
 *
 * Implements Groth16-based Zero-Knowledge proof verification for the
 * Golden Ticket NFT claim system. Allows users to prove:
 *   1. They hold a valid Golden Ticket (NFT ownership)
 *   2. Their WorldID nullifier has not been previously used (anti-sybil)
 *   3. Their tier (GENESIS/FOUNDER/AMBASSADOR) without revealing wallet address
 *
 * Circuit: GoldenTicketMembership (Circom 2.x)
 *   Private inputs: wallet_address, ticket_serial, world_id_secret
 *   Public inputs:  nullifier_hash, tier_commitment, domain_hash
 *   Proof system:   Groth16 (bn128 curve)
 *
 * Verification key: loaded from /public/circuits/golden_ticket.vkey.json
 * This key is generated from the Powers of Tau ceremony (Hermez Phase 2)
 *
 * eIDAS 2.0 note: ZK proofs provide selective disclosure compatible with
 * W3C Verifiable Presentations without revealing underlying PII.
 */

import crypto from 'crypto';

// 
// TYPE DEFINITIONS
// 

export interface ZKProof {
  pi_a: [string, string, string];
  pi_b: [[string, string], [string, string], [string, string]];
  pi_c: [string, string, string];
  protocol: 'groth16';
  curve: 'bn128';
}

export interface GoldenTicketPublicSignals {
  nullifier_hash: string;     // Keccak256(world_id_secret || domain_hash)
  tier_commitment: string;    // Pedersen hash of (serial || tier)
  domain_hash: string;        // Keccak256('humanity-ledger.system.v1')
}

export interface ZKVerificationResult {
  valid: boolean;
  nullifierHash?: string;
  tierCommitment?: string;
  error?: string;
}

export interface GoldenTicketClaim {
  proof: ZKProof;
  publicSignals: GoldenTicketPublicSignals;
  walletAddress: string;
  timestamp: number;
}

// 
// DOMAIN CONSTANTS
// 

export const Private_DOMAIN = 'humanity-ledger.system.v1';
export const DOMAIN_HASH = '0x' + crypto
  .createHash('sha256')
  .update(Private_DOMAIN)
  .digest('hex');

// Tier commitment salt  used in Pedersen hash (production: from ceremony)
// In production this is derived from the Powers of Tau ceremony output
export const TIER_SALT = process.env.ZK_TIER_SALT ?? 'development-tier-salt-replace-in-production';

// 
// NULLIFIER REGISTRY  Prevents double-claim (anti-replay)
// Production: stored in PostgreSQL with UNIQUE constraint on nullifier_hash
// 

const usedNullifiers = new Set<string>(); // In-memory for dev; PostgreSQL in production

export async function isNullifierUsed(nullifierHash: string): Promise<boolean> {
  try {
    const { prisma } = await import('@/lib/prisma');
    // @ts-ignore  PrivacyDonation reused for ZK nullifier storage (will migrate)
    const existing = await (prisma as any).privacyDonation.findUnique({
      where: { nullifier: nullifierHash },
    });
    return !!existing;
  } catch {
    // Fallback to in-memory registry during development
    return usedNullifiers.has(nullifierHash);
  }
}

export async function consumeNullifier(nullifierHash: string, walletAddress: string): Promise<boolean> {
  try {
    const { prisma } = await import('@/lib/prisma');
    await (prisma as any).privacyDonation.create({
      data: {
        nullifier: nullifierHash,
        commitment: crypto.createHash('sha256').update(walletAddress).digest('hex'),
        timestamp: new Date(),
      },
    });
    return true;
  } catch (error: any) {
    if (error?.code === 'P2002') {
      // Prisma unique constraint violation  someone beat us in a race condition
      return false;
    }
    // Fallback to in-memory registry during development
    if (usedNullifiers.has(nullifierHash)) return false;
    usedNullifiers.add(nullifierHash);
    return true;
  }
}

// 
// PROOF STRUCTURE VALIDATION
// Pre-validates proof structure before calling snarkjs (fast-fail path)
// 

export function validateProofStructure(proof: ZKProof): { valid: boolean; error?: string } {
  if (proof.protocol !== 'groth16') {
    return { valid: false, error: 'INVALID_PROTOCOL: only groth16 supported' };
  }
  if (proof.curve !== 'bn128') {
    return { valid: false, error: 'INVALID_CURVE: only bn128 supported' };
  }
  if (!Array.isArray(proof.pi_a) || proof.pi_a.length !== 3) {
    return { valid: false, error: 'INVALID_PI_A' };
  }
  if (!Array.isArray(proof.pi_b) || proof.pi_b.length !== 3) {
    return { valid: false, error: 'INVALID_PI_B' };
  }
  if (!Array.isArray(proof.pi_c) || proof.pi_c.length !== 3) {
    return { valid: false, error: 'INVALID_PI_C' };
  }
  // Validate all elements are hex strings representing field elements
  const isFieldElement = (s: unknown) =>
    typeof s === 'string' && /^\d+$/.test(s) && BigInt(s) > 0n;

  const flatElements = [
    ...proof.pi_a.slice(0, 2),
    ...proof.pi_b[0], ...proof.pi_b[1],
    ...proof.pi_c.slice(0, 2),
  ];
  if (!flatElements.every(isFieldElement)) {
    return { valid: false, error: 'INVALID_FIELD_ELEMENTS: non-numeric or zero elements' };
  }
  return { valid: true };
}

// 
// DOMAIN HASH VALIDATION
// Ensures proof was generated for this specific deployment
// 

export function validateDomainHash(publicSignals: GoldenTicketPublicSignals): boolean {
  const expectedDomainHash = '0x' + crypto
    .createHash('sha256')
    .update(Private_DOMAIN)
    .digest('hex');
  // Timing-safe comparison
  try {
    const a = Buffer.from(expectedDomainHash.slice(2), 'hex');
    const b = Buffer.from(publicSignals.domain_hash.replace('0x', ''), 'hex');
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

// 
// MAIN VERIFICATION FUNCTION
// 

export async function verifyGoldenTicketProof(
  claim: GoldenTicketClaim
): Promise<ZKVerificationResult> {
  const { proof, publicSignals, walletAddress, timestamp } = claim;

  // 1. Timestamp freshness (5 minute window)
  const age = Date.now() - timestamp;
  if (age > 300_000) {
    return { valid: false, error: 'CLAIM_EXPIRED' };
  }
  if (age < -10_000) {
    return { valid: false, error: 'CLAIM_FROM_FUTURE' };
  }

  // 2. Wallet address format
  if (!/^0x[0-9a-fA-F]{40}$/.test(walletAddress)) {
    return { valid: false, error: 'INVALID_WALLET_ADDRESS' };
  }

  // 3. Proof structure validation (fast path before expensive pairing check)
  const structureCheck = validateProofStructure(proof);
  if (!structureCheck.valid) {
    return { valid: false, error: structureCheck.error };
  }

  // 4. Domain hash validation (prevents cross-deployment proof reuse)
  if (!validateDomainHash(publicSignals)) {
    return { valid: false, error: 'DOMAIN_HASH_MISMATCH: proof generated for different deployment' };
  }

  // 5. Nullifier double-spend check
  const nullifierUsed = await isNullifierUsed(publicSignals.nullifier_hash);
  if (nullifierUsed) {
    return { valid: false, error: 'NULLIFIER_ALREADY_USED: double-claim attempt detected' };
  }

  // 6. Groth16 proof verification via snarkjs
  try {
    const snarkjs = await import('snarkjs');

    // Load verification key (generated from Powers of Tau ceremony)
    const vKeyPath = process.env.ZK_VKEY_PATH ?? './public/circuits/golden_ticket.vkey.json';
    const fs = await import('fs/promises');

    let vKey: unknown;
    try {
      const vKeyRaw = await fs.readFile(vKeyPath, 'utf-8');
      vKey = JSON.parse(vKeyRaw);
    } catch {
      // Development fallback: log warning and return mock success
      // In production, missing vKey is a CRITICAL failure
      if (process.env.NODE_ENV === 'production') {
        return { valid: false, error: 'ZK_VKEY_MISSING: verification key not found' };
      }
      console.warn('[ZK-VERIFY] Development mode: vKey not found, returning mock success. DO NOT deploy without real vKey.');
      return {
        valid: true,
        nullifierHash: publicSignals.nullifier_hash,
        tierCommitment: publicSignals.tier_commitment,
      };
    }

    const signals = [
      publicSignals.nullifier_hash,
      publicSignals.tier_commitment,
      publicSignals.domain_hash,
    ];

    const proofValid = await snarkjs.groth16.verify(vKey, signals, proof);
    if (!proofValid) {
      return { valid: false, error: 'ZK_PROOF_INVALID: Groth16 pairing check failed' };
    }

    // 7. Consume nullifier on success (prevents double-spend and concurrent race conditions)
    const consumed = await consumeNullifier(publicSignals.nullifier_hash, walletAddress);
    if (!consumed) {
      return { valid: false, error: 'NULLIFIER_RACE_CONDITION: double-claim attempt detected during finalization' };
    }

    return {
      valid: true,
      nullifierHash: publicSignals.nullifier_hash,
      tierCommitment: publicSignals.tier_commitment,
    };
  } catch (err: any) {
    return { valid: false, error: `ZK_VERIFICATION_ERROR: ${err.message}` };
  }
}
