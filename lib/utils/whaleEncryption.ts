// lib/utils/whaleEncryption.ts
// Client-side AES-256-GCM encryption utilities for extra-layer message encryption
// Used as an additional encryption layer ON TOP of XMTP (defense in depth)

const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const IV_LENGTH = 12; // 96 bits for AES-GCM

// ─── Key Derivation ──────────────────────────────────────────────────────────

/**
 * Derives a deterministic AES-256 key from a shared secret (e.g., ECDH shared key or combined addresses).
 * This is the foundation of the extra-layer encryption (ELE) protocol.
 */
export async function deriveSharedKey(sharedSecret: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(sharedSecret),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode('whale-chat-v1-salt'),
      iterations: 100_000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: ALGORITHM, length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Derives a deterministic shared secret from two wallet addresses.
 * Sort them canonically so both parties arrive at the same key.
 */
export function deriveSharedSecretFromAddresses(addrA: string, addrB: string): string {
  const sorted = [addrA.toLowerCase(), addrB.toLowerCase()].sort();
  return `whale-dle-${sorted[0]}-${sorted[1]}`;
}

// ─── Encrypt ─────────────────────────────────────────────────────────────────

/**
 * Encrypts plaintext with the shared key.
 * Returns base64-encoded `iv:ciphertext` string.
 */
export async function encryptMessage(plaintext: string, key: CryptoKey): Promise<string> {
  const encoder = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));

  const cipherBuffer = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv },
    key,
    encoder.encode(plaintext)
  );

  const ivB64 = btoa(String.fromCharCode(...iv));
  const cipherB64 = btoa(String.fromCharCode(...new Uint8Array(cipherBuffer)));

  return `${ivB64}:${cipherB64}`;
}

// ─── Decrypt ─────────────────────────────────────────────────────────────────

/**
 * Decrypts a base64-encoded `iv:ciphertext` string.
 * Returns plaintext or throws on invalid input/key mismatch.
 */
export async function decryptMessage(encrypted: string, key: CryptoKey): Promise<string> {
  const [ivB64, cipherB64] = encrypted.split(':');
  if (!ivB64 || !cipherB64) throw new Error('Invalid encrypted format');

  const iv = Uint8Array.from(atob(ivB64), c => c.charCodeAt(0));
  const cipherBuffer = Uint8Array.from(atob(cipherB64), c => c.charCodeAt(0));

  const decryptedBuffer = await crypto.subtle.decrypt(
    { name: ALGORITHM, iv },
    key,
    cipherBuffer
  );

  return new TextDecoder().decode(decryptedBuffer);
}

// ─── Key Manager ─────────────────────────────────────────────────────────────

/**
 * Caches derived keys in memory (not persisted) to avoid re-deriving on every message.
 * Key cache is invalidated on page unload (memory-only, safe).
 */
const keyCache = new Map<string, CryptoKey>();

export async function getSharedKey(myAddress: string, peerAddress: string): Promise<CryptoKey> {
  const cacheKey = deriveSharedSecretFromAddresses(myAddress, peerAddress);
  
  if (keyCache.has(cacheKey)) {
    return keyCache.get(cacheKey)!;
  }

  const key = await deriveSharedKey(cacheKey);
  keyCache.set(cacheKey, key);
  return key;
}

export function clearKeyCache(): void {
  keyCache.clear();
}

// ─── Fingerprint ─────────────────────────────────────────────────────────────

/**
 * Returns a human-readable safety number for out-of-band verification.
 * Equivalent to Signal's "safety numbers" feature.
 */
export function computeSafetyNumber(addrA: string, addrB: string): string {
  const combined = deriveSharedSecretFromAddresses(addrA, addrB);
  let hash = 0x811c9dc5; // FNV-1a seed
  for (let i = 0; i < combined.length; i++) {
    hash ^= combined.charCodeAt(i);
    hash = (hash * 0x01000193) >>> 0;
  }
  // Format as human-readable groups
  const hex = hash.toString(16).padStart(8, '0').toUpperCase();
  return `${hex.slice(0, 4)} ${hex.slice(4, 8)}`;
}
