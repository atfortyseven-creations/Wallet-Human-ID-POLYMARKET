export async function generateX25519KeyPair() {
  if (typeof crypto === 'undefined' || !crypto.subtle) {
    throw new Error('Web Crypto API is not available (secure context required)');
  }
  let keyPair;
  let isECDH = false;
  try {
    keyPair = (await crypto.subtle.generateKey({ name: 'X25519' }, true, ['deriveKey', 'deriveBits'])) as CryptoKeyPair;
  } catch (e) {
    console.warn("X25519 not natively supported, falling back to ECDH P-256", e);
    isECDH = true;
    keyPair = (await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveKey', 'deriveBits'])) as CryptoKeyPair;
  }

  const pubJwk = await crypto.subtle.exportKey('jwk', keyPair.publicKey) as any;
  const privJwk = await crypto.subtle.exportKey('jwk', keyPair.privateKey) as any;

  // [QR DENSITY FIX] Export ONLY the raw public key coordinate(s).
  // A full JWK serialized+base64 is ~136 chars including +/= chars that URL-encode
  // to %2B/%2F/%3D, making a ~300-char URL and an extremely dense unreadable QR.
  // Exporting just the x coord (or x,y for P-256) is 43-88 URL-safe base64url chars.
  // The private key JWK is stored full because it never goes into a QR code.
  const compactPub = isECDH
    ? `${pubJwk.x},${pubJwk.y}`  // P-256 needs both coords (88 chars, no special chars)
    : pubJwk.x;                   // X25519 only needs x (43-44 base64url chars)

  return {
    publicKey: compactPub,
    privateKey: btoa(JSON.stringify(privJwk)),
    isECDH,
  };
}

export async function deriveSharedSecret(privateKeyB64: string, publicKeyCompact: string, isECDH: boolean = false) {
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

  return await crypto.subtle.deriveBits(
    isECDH ? { name: 'ECDH', public: pub } : { name: 'X25519', public: pub },
    priv,
    256
  );
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
