/**
 * Desktop ↔ mobile session QR handshake (extracted from QRScannerModal).
 */

export type SessionHandshakeResult =
  | { ok: true }
  | { ok: false; message: string; needsWallet?: boolean };

export async function completeSessionHandshake(
  decodedText: string,
  getAddress: () => string | null
): Promise<SessionHandshakeResult> {
  let uuid: string | null = null;
  let ephemeralPub: string | null = null;
  let isECDH = false;

  try {
    const url = new URL(decodedText.trim());
    uuid = url.searchParams.get('uuid') || url.searchParams.get('session');
    const rawPub = url.searchParams.get('pub') || url.searchParams.get('ekey');
    ephemeralPub = rawPub ? decodeURIComponent(rawPub) : null;
    isECDH = url.searchParams.get('ecdh') === '1';
    const exp = url.searchParams.get('exp');
    if (exp && Date.now() > parseInt(exp, 10)) {
      return { ok: false, message: 'QR code expired. Refresh it on the desktop terminal.' };
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
          'QR code not recognized. Scan the desktop connect QR shown on this site (Whale Alert Network).',
      };
    }
  }

  if (!uuid || !ephemeralPub) {
    return { ok: false, message: 'Invalid QR code: missing session data. Please refresh the desktop QR.' };
  }

  const addr = getAddress();

  const { generateX25519KeyPair, deriveSharedSecret, encryptAESGCM } = await import('@/lib/web-crypto');
  const mobilePair = await generateX25519KeyPair();
  const shared = await deriveSharedSecret(mobilePair.privateKey, ephemeralPub, isECDH);

  let jwt: string | null = null;
  try {
    const exportRes = await fetch('/api/auth/export-jwt', { credentials: 'include' });
    if (exportRes.ok) {
      const exportData = await exportRes.json();
      jwt = exportData.jwt ?? null;
    }
  } catch {
    /* server mint path */
  }

  let postBody: Record<string, unknown>;
  if (jwt) {
    const encrypted = await encryptAESGCM(shared, jwt);
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
    return { ok: false, message: `${errText}. Refresh the QR on your desktop and try again.` };
  }

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
            const finalAddr = addr || getAddress();
            if (finalAddr) {
              const normAddr = finalAddr.toLowerCase();
              if (payload.seed) localStorage.setItem(`whale_chat_seed_${normAddr}`, payload.seed);
              if (payload.vault) localStorage.setItem('system_vault_v1', payload.vault);
            }
          } catch {
            const finalAddr = addr || getAddress();
            if (finalAddr) {
              localStorage.setItem(`whale_chat_seed_${finalAddr.toLowerCase()}`, decryptedRaw);
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
