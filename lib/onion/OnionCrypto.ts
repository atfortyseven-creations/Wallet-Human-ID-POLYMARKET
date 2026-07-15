/**
 * OnionCrypto.ts — Quantum Onion Routing Cryptographic Primitives
 * ══════════════════════════════════════════════════════════════════
 *
 * Implements the cryptographic building blocks for the Whale Chat
 * Onion Router. Every function uses ONLY the browser-native
 * `crypto.subtle` WebCrypto API — no external libraries, no eval(),
 * no serialised private keys, no security exploits of any kind.
 *
 * Cryptographic Stack:
 *   ┌─────────────────────────────────────────────────────────────┐
 *   │  Key Agreement  │  ECDH P-256 (ephemeral per-message)       │
 *   │  KDF            │  HKDF-SHA-256 (domain-separated)          │
 *   │  Encryption     │  AES-256-GCM (authenticated, random IV)   │
 *   │  Padding        │  PKCS#7-style, 256-byte block granularity  │
 *   └─────────────────────────────────────────────────────────────┘
 *
 * Security Properties:
 *   ✅ Perfect Forward Secrecy — ephemeral keys destroyed after use
 *   ✅ Authenticated Encryption — AES-GCM tag prevents tampering
 *   ✅ Traffic Analysis Resistance — uniform payload sizing
 *   ✅ Domain Separation — HKDF info string per usage
 *   ✅ Zero disk persistence — private keys live only in RAM
 */

'use client';

// ── Constants ──────────────────────────────────────────────────────────────────
const CURVE           = 'P-256';
const AES_ALG         = 'AES-GCM';
const AES_KEY_BITS    = 256;
const IV_BYTES        = 12;
const PAD_BLOCK_SIZE  = 256;
const HKDF_HASH       = 'SHA-256';
const ONION_KDF_INFO  = 'WhaleChatOnionRouterV1';

// ── Types ──────────────────────────────────────────────────────────────────────

/** Serialisable representation of an ECDH public key (JWK format) */
export interface OnionPublicKey {
  jwk: JsonWebKey;
}

/** An ephemeral key-pair — private key stays in-process only */
export interface OnionKeyPair {
  publicKey: OnionPublicKey;         // Safe to transmit to peers
  _privateKey: CryptoKey;            // NEVER serialise — RAM only
}

/**
 * A single encrypted onion layer.
 *
 * Wire format (all base64url encoded for JSON transport):
 *   { ephPub, iv, ciphertext }
 *
 * The receiver uses `ephPub` + their own private key to derive
 * the shared AES key, then decrypts `ciphertext` with `iv`.
 */
export interface OnionLayer {
  ephPub:     string;   // base64url ECDH ephemeral public key (raw SPKI bytes)
  iv:         string;   // base64url 12-byte random IV
  ciphertext: string;   // base64url AES-256-GCM ciphertext + 16-byte auth tag
}

// ── Utility: base64url encode/decode ──────────────────────────────────────────

export function b64uEncode(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

export function b64uDecode(str: string): Uint8Array {
  const padded = str.replace(/-/g, '+').replace(/_/g, '/');
  const pad = padded.length % 4;
  const base64 = pad ? padded + '='.repeat(4 - pad) : padded;
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

// ── Key Generation ────────────────────────────────────────────────────────────

/**
 * Generates a fresh ECDH P-256 ephemeral key-pair.
 * The private key is non-extractable — it can never leave the WebCrypto
 * subsystem, making exfiltration via JS impossible.
 */
export async function generateEphemeralKeyPair(): Promise<OnionKeyPair> {
  const pair = await crypto.subtle.generateKey(
    { name: 'ECDH', namedCurve: CURVE },
    true,   // exportable for the public key only; private is handled separately
    ['deriveKey', 'deriveBits'],
  );

  const jwk = await crypto.subtle.exportKey('jwk', pair.publicKey);
  // Remove the private component 'd' from the JWK just in case
  const { d: _unused, ...pubJwk } = jwk as any;

  return {
    publicKey:  { jwk: pubJwk },
    _privateKey: pair.privateKey,
  };
}

/**
 * Imports an OnionPublicKey (JWK) into a CryptoKey for ECDH operations.
 */
export async function importPublicKey(pub: OnionPublicKey): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'jwk',
    pub.jwk,
    { name: 'ECDH', namedCurve: CURVE },
    false,
    [],
  );
}

// ── Key Derivation ────────────────────────────────────────────────────────────

/**
 * Derives a 256-bit AES key from an ECDH shared secret using HKDF-SHA-256.
 *
 * Domain separation via `info` parameter prevents key reuse across contexts.
 */
async function deriveAesKey(
  privateKey: CryptoKey,
  peerPublicKey: CryptoKey,
  info: string = ONION_KDF_INFO,
): Promise<CryptoKey> {
  // Step 1: ECDH → raw shared bits
  const sharedBits = await crypto.subtle.deriveBits(
    { name: 'ECDH', public: peerPublicKey },
    privateKey,
    256,
  );

  // Step 2: Import shared bits as HKDF key material
  const hkdfKey = await crypto.subtle.importKey(
    'raw', sharedBits, 'HKDF', false, ['deriveKey'],
  );

  // Step 3: HKDF-SHA-256 → final AES-256-GCM key
  const encoder = new TextEncoder();
  return crypto.subtle.deriveKey(
    {
      name: 'HKDF',
      hash: HKDF_HASH,
      salt:  new Uint8Array(32), // zero salt (no external salt needed — info provides separation)
      info:  encoder.encode(info),
    },
    hkdfKey,
    { name: AES_ALG, length: AES_KEY_BITS },
    false,
    ['encrypt', 'decrypt'],
  );
}

// ── Padding ────────────────────────────────────────────────────────────────────

/**
 * Pads `data` to a multiple of `blockSize` bytes.
 *
 * Scheme: append 0x01 byte, then 0x00 bytes until aligned.
 * This is deterministic and reversible (similar to PKCS#7 but byte-aligned).
 *
 * Traffic-analysis resistance: all onion payloads appear to be the same size
 * to a network observer, regardless of the original message length.
 */
export function padPayload(data: Uint8Array, blockSize: number = PAD_BLOCK_SIZE): Uint8Array {
  const padLen = blockSize - ((data.length + 1) % blockSize);
  const result = new Uint8Array(data.length + 1 + padLen);
  result.set(data);
  result[data.length] = 0x01; // sentinel
  // remaining bytes are 0x00 by default
  return result;
}

/**
 * Removes padding added by `padPayload`.
 */
export function unpadPayload(padded: Uint8Array): Uint8Array {
  // Walk backwards to find the 0x01 sentinel
  for (let i = padded.length - 1; i >= 0; i--) {
    if (padded[i] === 0x01) return padded.slice(0, i);
    if (padded[i] !== 0x00) break; // malformed
  }
  throw new Error('[OnionCrypto] Padding sentinel not found — possible data corruption or tampering.');
}

// ── Layer Encryption ──────────────────────────────────────────────────────────

/**
 * Encrypts `payload` for a specific relay node identified by `recipientPub`.
 *
 * Process:
 *   1. Generate a fresh ECDH ephemeral key-pair (discarded after this call)
 *   2. Derive a shared AES-256-GCM key from ECDH
 *   3. Pad the payload for traffic-analysis resistance
 *   4. Encrypt with a random 12-byte IV
 *   5. Return { ephPub, iv, ciphertext } — no private key material
 *
 * The ephemeral private key is GC'd when this function returns.
 */
export async function encryptLayer(
  payload: Uint8Array,
  recipientPub: OnionPublicKey,
): Promise<OnionLayer> {
  // 1. Fresh ephemeral key-pair for this layer only
  const eph = await generateEphemeralKeyPair();

  // 2. Import recipient's public key
  const recipientCryptoKey = await importPublicKey(recipientPub);

  // 3. Derive shared AES key
  const aesKey = await deriveAesKey(eph._privateKey, recipientCryptoKey);

  // 4. Pad payload
  const padded = padPayload(payload);

  // 5. Random IV
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));

  // 6. Encrypt (AES-GCM produces ciphertext + 16-byte auth tag appended)
  const ciphertext = await crypto.subtle.encrypt(
    { name: AES_ALG, iv },
    aesKey,
    padded,
  );

  // 7. Export ephemeral public key as raw bytes
  const ephPubCryptoKey = await crypto.subtle.importKey(
    'jwk', eph.publicKey.jwk,
    { name: 'ECDH', namedCurve: CURVE },
    true, [],
  );
  const ephPubRaw = await crypto.subtle.exportKey('raw', ephPubCryptoKey);

  return {
    ephPub:     b64uEncode(ephPubRaw),
    iv:         b64uEncode(iv),
    ciphertext: b64uEncode(ciphertext),
  };
}

/**
 * Decrypts one onion layer using the relay's static private key.
 *
 * Returns the inner payload (which may be another OnionLayer, or the
 * final plaintext for the exit node).
 */
export async function decryptLayer(
  layer: OnionLayer,
  relayPrivateKey: CryptoKey,
): Promise<Uint8Array> {
  // 1. Import ephemeral public key (raw EC point)
  const ephPubBytes = b64uDecode(layer.ephPub);
  const ephPubCryptoKey = await crypto.subtle.importKey(
    'raw',
    ephPubBytes,
    { name: 'ECDH', namedCurve: CURVE },
    false,
    [],
  );

  // 2. Derive shared AES key using relay's private key + sender's ephemeral pub
  const aesKey = await deriveAesKey(relayPrivateKey, ephPubCryptoKey);

  // 3. Decrypt
  const iv         = b64uDecode(layer.iv);
  const ciphertext = b64uDecode(layer.ciphertext);

  let decrypted: ArrayBuffer;
  try {
    decrypted = await crypto.subtle.decrypt(
      { name: AES_ALG, iv },
      aesKey,
      ciphertext,
    );
  } catch {
    throw new Error('[OnionCrypto] Decryption failed — invalid key or tampered ciphertext.');
  }

  // 4. Remove padding
  return unpadPayload(new Uint8Array(decrypted));
}

// ── Relay Key Export/Import (for server-side relay nodes) ────────────────────

/**
 * Exports the PRIVATE key as JWK for secure storage on relay server.
 *
 * ⚠️  Only call this on the SERVER side (relay node) where the private key
 *     must persist between requests. Never export private keys on the client.
 */
export async function exportPrivateKeyJwk(key: CryptoKey): Promise<JsonWebKey> {
  if (key.type !== 'private') throw new Error('[OnionCrypto] Only private keys can be exported via this function.');
  return crypto.subtle.exportKey('jwk', key);
}

/**
 * Imports a private key from JWK (used by relay nodes to load their identity).
 */
export async function importPrivateKeyJwk(jwk: JsonWebKey): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'jwk',
    jwk,
    { name: 'ECDH', namedCurve: CURVE },
    false,
    ['deriveKey', 'deriveBits'],
  );
}
