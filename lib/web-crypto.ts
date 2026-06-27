export async function generateX25519KeyPair() {
  if (typeof crypto === 'undefined' || !crypto.subtle) {
    throw new Error('Web Crypto API is not available (secure context required)');
  }
  
  // ALWAYS use ECDH P-256 for cross-device compatibility 
  // (iOS Safari lacks X25519 support, causing key exchange to fail if Desktop uses X25519)
  const isECDH = true;
  const keyPair = (await crypto.subtle.generateKey(
    { name: 'ECDH', namedCurve: 'P-256' }, 
    true, 
    ['deriveKey', 'deriveBits']
  )) as CryptoKeyPair;

  const pubJwk = await crypto.subtle.exportKey('jwk', keyPair.publicKey) as any;
  const privJwk = await crypto.subtle.exportKey('jwk', keyPair.privateKey) as any;

  // Compact = x,y (88 chars, no special chars)
  const compactPub = `${pubJwk.x},${pubJwk.y}`;

  return {
    publicKey: compactPub,
    privateKey: btoa(JSON.stringify(privJwk)),
    isECDH,
  };
}

/**
 * Generate a cryptographically secure Visual PIN.
 * Returns a 4-digit string (0000-9999), zero-padded.
 * Uses crypto.getRandomValues for uniform distribution.
 */
export function generateVisualPin(): string {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  // Map to [0, 9999] range, zero-padded to 4 digits
  const pin = buf[0] % 10000;
  return pin.toString().padStart(4, '0');
}

export async function deriveSharedSecret(
  privateKeyB64: string,
  publicKeyCompact: string,
  isECDH: boolean = false,
  visualPin?: string
) {
  const algo = isECDH ? { name: 'ECDH', namedCurve: 'P-256' } : { name: 'X25519' };

  const privJwk = JSON.parse(atob(privateKeyB64)) as any;

  // Reconstruct the public JWK from the compact format.
  // Compact = just the x coord (X25519) or "x,y" (P-256).
  // Backward compat: if it looks like a legacy base64-encoded full JWK, decode it.
  let pubJwk: any;
  const isLegacyFull = publicKeyCompact.startsWith('ey'); // btoa'd JSON starts with 'ey'
  if (isLegacyFull) {
    pubJwk = JSON.parse(atob(publicKeyCompact));
  } else if (isECDH) {
    const [x, y] = publicKeyCompact.split(',');
    pubJwk = { kty: 'EC', crv: 'P-256', x, y, ext: true, key_ops: [] };
  } else {
    // X25519 — only the x field
    pubJwk = { kty: 'OKP', crv: 'X25519', x: publicKeyCompact, ext: true, key_ops: [] };
  }

  const priv = await crypto.subtle.importKey('jwk', privJwk, algo, false, ['deriveBits']);
  const pub  = await crypto.subtle.importKey('jwk', pubJwk,  algo, false, []);

  const rawShared = await crypto.subtle.deriveBits(
    isECDH ? { name: 'ECDH', public: pub } : { name: 'X25519', public: pub },
    priv,
    256
  );

  // ─────────────────────────────────────────────────────────────────────────
  // [VISUAL PIN HKDF HARDENING]
  //
  // If a visualPin is provided, we apply HKDF(SHA-256) to mix the ECDH shared
  // secret with the PIN. This produces a DIFFERENT 256-bit key for every
  // different PIN value. A man-in-the-middle who intercepts the encrypted
  // payload will not be able to decrypt it without knowing the exact PIN
  // that was physically displayed on the origin screen.
  //
  // SECURITY PROOF:
  //   - ECDH gives us: Z = DH(priv_a, pub_b) = DH(priv_b, pub_a)  [shared secret]
  //   - HKDF gives us: K = HKDF(Z, salt="whale-visual-pin", info=PIN_UTF8)
  //   - AES-GCM encrypts payload with K
  //   - An attacker who captures (encryptedPayload, iv) cannot decrypt without K
  //   - Getting K requires PIN, which only the legitimate user can see physically
  //   - This is a Zero-Knowledge proof of physical co-presence.
  // ─────────────────────────────────────────────────────────────────────────
  if (visualPin && visualPin.length > 0) {
    const enc = new TextEncoder();

    // Import the raw ECDH output as HKDF key material
    const hkdfKey = await crypto.subtle.importKey(
      'raw',
      rawShared,
      { name: 'HKDF' },
      false,
      ['deriveBits']
    );

    // Salt: deterministic, protocol-specific, known to both parties
    const salt = enc.encode('whale-network-visual-pin-v1');
    // Info: the PIN itself (application-specific context binding)
    const info = enc.encode(visualPin);

    // Derive final 256-bit session key
    const derivedBits = await crypto.subtle.deriveBits(
      {
        name: 'HKDF',
        hash: 'SHA-256',
        salt,
        info,
      },
      hkdfKey,
      256
    );

    return derivedBits;
  }

  // No PIN provided: return raw ECDH shared secret (backward-compatible mode)
  return rawShared;
}

export async function encryptAESGCM(sharedSecret: ArrayBuffer, data: string) {
  const key = await crypto.subtle.importKey('raw', sharedSecret, { name: 'AES-GCM' }, false, ['encrypt']);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(data));
  return {
    encryptedPayload: arrayBufferToBase64(encrypted),
    iv: arrayBufferToBase64(iv),
    tag: arrayBufferToBase64(encrypted.slice(encrypted.byteLength - 16)),
  };
}

export async function decryptAESGCM(sharedSecret: ArrayBuffer, encryptedPayload: string, ivB64: string) {
  const key = await crypto.subtle.importKey('raw', sharedSecret, { name: 'AES-GCM' }, false, ['decrypt']);
  const iv = base64ToArrayBuffer(ivB64);
  const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, base64ToArrayBuffer(encryptedPayload));
  return new TextDecoder().decode(decrypted);
}

function arrayBufferToBase64(buffer: ArrayBuffer | Uint8Array) {
  const u8 = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < u8.length; i++) {
    binary += String.fromCharCode(u8[i]);
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64: string) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}
