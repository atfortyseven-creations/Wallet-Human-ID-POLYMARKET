/**
 * Enterprise CRYPTOGRAPHIC VERIFICATION ENGINE
 *
 * Formal EIP-191 signature verification with full security hardening:
 *   1. Exact EIP-191 prefix enforcement (\x19Ethereum Signed Message:\n)
 *   2. Signature malleability protection (EIP-2: low-s enforcement)
 *   3. Timing-safe address comparison (prevents timing oracle attacks)
 *   4. 256-bit nonce validation for replay protection
 *   5. Signature freshness enforcement (configurable replay window)
 *
 * References:
 *   - EIP-191: https://eips.ethereum.org/EIPS/eip-191
 *   - EIP-2 (Homestead): https://eips.ethereum.org/EIPS/eip-2
 *   - NIST SP 800-107: Recommendation for Applications Using Approved Hash Algorithms
 */

import { ethers } from 'ethers';
import crypto from 'crypto';

// secp256k1 curve order n  used for low-s malleability check
const SECP256K1_N = BigInt('0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141');
const SECP256K1_HALF_N = SECP256K1_N / 2n;

export interface VerificationResult {
  valid: boolean;
  recoveredAddress?: string;
  error?: string;
}

export interface SignedPayload {
  message: string;
  signature: string;
  address: string;
  /** Unix timestamp (ms) when the signature was created */
  timestamp: number;
  /** 256-bit hex nonce (32 bytes = 64 hex chars) */
  nonce: string;
}

/**
 * Validates that a nonce is cryptographically strong.
 * Requires exactly 64 hex characters (256 bits).
 */
export function validateNonce(nonce: string): boolean {
  return /^[0-9a-fA-F]{64}$/.test(nonce);
}

/**
 * Generates a cryptographically secure 256-bit nonce.
 */
export function generateNonce(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Timing-safe address comparison.
 * Prevents timing oracle attacks where comparing addresses character-by-character
 * could leak information about the expected address length or prefix.
 */
export function safeAddressEqual(a: string, b: string): boolean {
  const normalA = a.toLowerCase();
  const normalB = b.toLowerCase();
  // Addresses must be exactly 42 characters (0x + 40 hex)
  if (normalA.length !== 42 || normalB.length !== 42) return false;
  const bufA = Buffer.from(normalA.slice(2), 'hex'); // 20 bytes
  const bufB = Buffer.from(normalB.slice(2), 'hex'); // 20 bytes
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Checks that the signature's s-value is in the lower half of the curve order.
 * Signatures with high s-values are malleable (EIP-2 / BIP62).
 * Any signature with s > n/2 has an equivalent signature with s' = n - s,
 * which would pass standard ECDSA verification but has a different byte representation.
 */
export function enforceLoSValue(signature: string): boolean {
  try {
    const sig = ethers.Signature.from(signature);
    const s = BigInt(sig.s);
    return s <= SECP256K1_HALF_N;
  } catch {
    return false;
  }
}

/**
 * Formal EIP-191 signature verification.
 *
 * Verifies that:
 * 1. The signature was produced over: Keccak256("\x19Ethereum Signed Message:\n" + len(msg) + msg)
 * 2. The recovered address matches the declared address (timing-safe)
 * 3. The s-value is in the lower half of the curve order (anti-malleability)
 *
 * @param message  The original plaintext message that was signed
 * @param signature The hex-encoded ECDSA signature (65 bytes, 130 hex chars)
 * @param expectedAddress The 0x-prefixed Ethereum address claiming authorship
 */
export function verifyEIP191Signature(
  message: string,
  signature: string,
  expectedAddress: string
): VerificationResult {
  // 1. Validate signature format (must be 65 bytes = 130 hex chars + 0x prefix)
  if (!/^0x[0-9a-fA-F]{130}$/.test(signature)) {
    return { valid: false, error: 'INVALID_SIGNATURE_FORMAT' };
  }

  // 2. Enforce low-s (anti-malleability  EIP-2)
  if (!enforceLoSValue(signature)) {
    return { valid: false, error: 'HIGH_S_MALLEABILITY_DETECTED' };
  }

  // 3. EIP-191 recovery: ethers.verifyMessage() applies the prefix internally
  //    ethers.verifyMessage(msg, sig) = ECDSA_Recover(Keccak256("\x19Ethereum Signed Message:\n" + len(msg) + msg), sig)
  let recoveredAddress: string;
  try {
    recoveredAddress = ethers.verifyMessage(message, signature);
  } catch (err: any) {
    return { valid: false, error: `RECOVERY_FAILED: ${err.message}` };
  }

  // 4. Timing-safe address comparison
  if (!safeAddressEqual(recoveredAddress, expectedAddress)) {
    return {
      valid: false,
      recoveredAddress,
      error: 'ADDRESS_MISMATCH',
    };
  }

  return { valid: true, recoveredAddress };
}

/**
 * Full system payload verification including timestamp and nonce validation.
 *
 * @param payload The signed payload to verify
 * @param replayWindowMs How long (ms) a signature remains valid (default: 30s)
 * @param usedNonces Set of already-consumed nonces (caller maintains this set)
 */
export function verifySignedPayload(
  payload: SignedPayload,
  replayWindowMs: number = 30_000,
  usedNonces?: Set<string>
): VerificationResult & { nonce?: string } {
  // 1. Timestamp freshness check (MANDATORY)
  const age = Date.now() - payload.timestamp;
  if (age > replayWindowMs) {
    return { valid: false, error: `PAYLOAD_EXPIRED: age=${age}ms window=${replayWindowMs}ms` };
  }
  if (age < -5_000) {
    // Reject payloads from the future (clock skew tolerance: 5s)
    return { valid: false, error: 'PAYLOAD_FROM_FUTURE' };
  }

  // 2. Nonce validation (256-bit strength requirement, MANDATORY)
  if (!validateNonce(payload.nonce)) {
    return { valid: false, error: 'WEAK_NONCE: must be 64 hex chars (256 bits)' };
  }
  if (usedNonces?.has(payload.nonce)) {
    return { valid: false, error: 'REPLAY_DETECTED: nonce already consumed' };
  }

  // 3. EIP-191 signature verification
  const result = verifyEIP191Signature(payload.message, payload.signature, payload.address);

  // 4. Consume nonce on success
  if (result.valid && payload.nonce && usedNonces) {
    usedNonces.add(payload.nonce);
  }

  return { ...result, nonce: payload.nonce };
}

/**
 * Constructs the canonical EIP-191 message string for a given auth context.
 * Ensures message format is deterministic and cannot be reused across domains.
 */
export function buildAuthMessage(params: {
  domain: string;
  address: string;
  nonce: string;
  issuedAt: string;
  statement?: string;
}): string {
  const statement = params.statement ?? 'Sign this message to authenticate with System Network. This request will not trigger a blockchain transaction or cost any gas fees.';
  return [
    `${params.domain} wants you to sign in with your Ethereum account:`,
    params.address,
    '',
    statement,
    '',
    `Nonce: ${params.nonce}`,
    `Issued At: ${params.issuedAt}`,
  ].join('\n');
}
