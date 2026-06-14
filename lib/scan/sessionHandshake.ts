/**
 * Desktop ↔ mobile session QR handshake (extracted from QRScannerModal).
 */

export type SessionHandshakeResult =
  | { ok: true }
  | { ok: false; message: string; needsWallet?: boolean };

/**
 * Read the wallet address from the system_handshake cookie (JS-readable).
 * Returns null if not set or invalid format.
 */
function getHandshakeCookieAddress(): string | null {
  try {
    const match = document.cookie.match(/system_handshake=(0x[0-9a-fA-F]{40})/i);
    return match?.[1]?.toLowerCase() ?? null;
  } catch {
    return null;
  }
}

export async function completeSessionHandshake(
  decodedText: string,
  getAddress: () => string | null,
  signMessageAsync?: (args: { message: string }) => Promise<string>
): Promise<SessionHandshakeResult> {
  let uuid: string | null = null;
  let ephemeralPub: string | null = null;
  let isECDH = false;

  try {
    const url = new URL(decodedText.trim());
    // NEW STATELESS FORMAT: ?s=UUID&p=Base64PubKey
    const shortUuid = url.searchParams.get('s');
    if (shortUuid) {
      uuid = shortUuid;
      // We read the public key directly from the URL to avoid server dependency issues on Edge/Railway
      const pParam = url.searchParams.get('p');
      if (!pParam) {
        return { ok: false, message: 'Invalid QR format. Missing public key.' };
      }
      ephemeralPub = pParam;
      isECDH = url.searchParams.get('ecdh') === '1';
    } else {
      // LEGACY FORMAT: pub embedded in URL params
      uuid = url.searchParams.get('uuid') || url.searchParams.get('session');
      // IMPORTANT: searchParams.get() already URL-decodes the value.
      // Do NOT wrap with decodeURIComponent() — that causes double-decoding
      // which corrupts the base64url-encoded public key.
      const rawPub = url.searchParams.get('pub') || url.searchParams.get('ekey');
      ephemeralPub = rawPub ?? null;
      isECDH = url.searchParams.get('ecdh') === '1';
      const exp = url.searchParams.get('exp');
      if (exp && Date.now() > parseInt(exp, 10)) {
        return { ok: false, message: 'QR code has expired. Please refresh it on the desktop terminal.' };
      }
    }
  } catch {
    try {
      const parsed = JSON.parse(decodedText);
      uuid = parsed.uuid ?? null;
      ephemeralPub = parsed.ephemeralPub ?? parsed.pub ?? null;
      isECDH = parsed.isECDH ?? false;
    } catch {
      return {
        ok: false,
        message:
          'Invalid QR code. Please scan the QR code displayed on the Whale Network desktop site.',
      };
    }
  }

  if (!uuid || !ephemeralPub) {
    return { ok: false, message: 'Invalid session data. Please refresh the desktop QR code.' };
  }

  // ────────────────────────────────────────────────────────────────
  // STEP 1: Robustly resolve the wallet address from multiple sources
  // Priority: wagmi hook > export-jwt payload > system_handshake cookie
  // ────────────────────────────────────────────────────────────────
  const wagmiAddr = getAddress();

  // Try export-jwt first — gives us both the JWT and the address from the server
  let jwt: string | null = null;
  let jwtAddress: string | null = null;

  try {
    const exportRes = await fetch('/api/auth/export-jwt', { credentials: 'include', cache: 'no-store' });
    if (exportRes.ok) {
      const exportData = await exportRes.json();
      if (exportData.jwt) {
        jwt = exportData.jwt;
        // Extract address from JWT payload to verify it matches the current wallet
        try {
          const parts = jwt.split('.');
          if (parts.length === 3) {
            const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
            jwtAddress = (payload.sub || payload.address || '').toLowerCase() || null;
          }
        } catch { /* non-fatal */ }
      }
    }
  } catch {
    /* server mint path */
  }

  // Determine the authoritative address:
  // - If wagmi has an address AND the JWT belongs to a DIFFERENT address, the user
  //   switched wallets since the cookie was set → ignore the stale JWT, re-auth with new wallet
  // - If wagmi has no address (wagmi not hydrated yet), trust the JWT address
  // - Final fallback: read system_handshake cookie
  let resolvedAddress: string | null = null;

  if (wagmiAddr) {
    const wagmiNorm = wagmiAddr.toLowerCase();
    if (jwtAddress && jwtAddress !== wagmiNorm) {
      // Wallet switched — stale JWT, need fresh token for the new wallet
      console.warn(`[QR:Handshake] Wallet mismatch: jwt=${jwtAddress} wagmi=${wagmiNorm}. Re-minting for ${wagmiNorm}.`);
      jwt = null;
      jwtAddress = null;
    }
    resolvedAddress = wagmiNorm;
  } else if (jwtAddress) {
    resolvedAddress = jwtAddress;
  } else {
    resolvedAddress = getHandshakeCookieAddress();
  }

  // If we have a wagmi address but no JWT, mint a fresh one
  if (!jwt && resolvedAddress) {
    if (!signMessageAsync) {
      console.error('[QR:Handshake] Missing signMessageAsync function for secure SIWE verification.');
    } else {
      try {
        // [QUANTUM AEGIS] Real SIWE Signature Generation
        const nonceRes = await fetch('/api/auth/nonce');
        if (nonceRes.ok) {
          const { nonce } = await nonceRes.json();
          const message = `Authenticate to Whale Network.\n\nNonce: ${nonce}`;
          const signature = await signMessageAsync({ message });

          const sigRes = await fetch('/api/auth/system-verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ address: resolvedAddress, message, signature, nonce }),
            credentials: 'include',
          });
          if (sigRes.ok) {
            const data = await sigRes.json();
            jwt = data.jwt ?? null;
          }
        }
      } catch (err) {
        console.warn('[QR:Handshake] SIWE verification failed during handshake recovery:', err);
        /* non-fatal — qr-mobile-link will use system_handshake cookie fallback */
      }
    }
  }

  if (!jwt && !resolvedAddress) {
    return {
      ok: false,
      message: 'Wallet not connected. Connect your wallet first, then scan the QR code.',
      needsWallet: true,
    };
  }

  // ────────────────────────────────────────────────────────────────
  // STEP 2: Generate ECDH keypair, encrypt payload, POST to server
  // ────────────────────────────────────────────────────────────────
  const { generateX25519KeyPair, deriveSharedSecret, encryptAESGCM } = await import('@/lib/web-crypto');
  const mobilePair = await generateX25519KeyPair();
  const shared = await deriveSharedSecret(mobilePair.privateKey, ephemeralPub, isECDH);

  let postBody: Record<string, unknown>;
  if (jwt) {
    let payloadStr = jwt;
    try {
      const normAddr = resolvedAddress;
      const seed = normAddr ? localStorage.getItem(`whale_chat_seed_${normAddr}`) : null;
      const vault = localStorage.getItem('system_vault_v1');
      payloadStr = JSON.stringify({ jwt, seed, vault });
    } catch {}

    const encrypted = await encryptAESGCM(shared, payloadStr);
    postBody = {
      uuid,
      encryptedPayload: encrypted.encryptedPayload,
      iv: encrypted.iv,
      tag: encrypted.tag,
      mobilePub: mobilePair.publicKey,
      isServerMint: false,
    };
  } else {
    postBody = {
      uuid,
      mobilePub: mobilePair.publicKey,
      isServerMint: true,
    };
  }

  const res = await fetch('/api/auth/qr-mobile-link', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(postBody),
    credentials: 'include',
  });

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    const errText = (errBody as { error?: string }).error || 'Handshake failed';
    if (res.status === 401) {
      return {
        ok: false,
        message: 'Wallet not connected. Connect your wallet first, then scan the QR code.',
        needsWallet: true,
      };
    }
    return { ok: false, message: `Handshake error: ${errText}. Please try again.` };
  }

  // ────────────────────────────────────────────────────────────────
  // STEP 3: Optional seed sync back from desktop
  // ────────────────────────────────────────────────────────────────
  let seedAttempts = 0;
  const pollSeed = setInterval(async () => {
    seedAttempts++;
    if (seedAttempts > 10) {
      clearInterval(pollSeed);
      return;
    }
    try {
      const sRes = await fetch(`/api/auth/qr-sync-seed?uuid=${uuid}`);
      if (sRes.ok) {
        const sData = await sRes.json();
        if (sData.encryptedSeed && sData.iv) {
          clearInterval(pollSeed);
          const { decryptAESGCM } = await import('@/lib/web-crypto');
          const decryptedRaw = await decryptAESGCM(shared, sData.encryptedSeed, sData.iv);
          try {
            const payload = JSON.parse(decryptedRaw);
            const finalAddr = resolvedAddress;
            if (finalAddr) {
              if (payload.seed) localStorage.setItem(`whale_chat_seed_${finalAddr}`, payload.seed);
              if (payload.vault) localStorage.setItem('system_vault_v1', payload.vault);
            }
          } catch {
            if (resolvedAddress) {
              localStorage.setItem(`whale_chat_seed_${resolvedAddress}`, decryptedRaw);
            }
          }
        }
      }
    } catch {
      /* ignore */
    }
  }, 1000);

  return { ok: true };
}
