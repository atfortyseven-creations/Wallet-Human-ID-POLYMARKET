/**
 * Universal scan router — classifies decoded QR / barcode text before handling.
 */

export type ScanRouteType = 'session' | 'wallet' | 'passport' | 'gs1' | 'unknown';

export interface ScanRoute {
  type: ScanRouteType;
  raw: string;
  slug?: string;
  gtin?: string;
  walletAddress?: string;
}

const ETH_ADDRESS_RE = /0x[a-fA-F0-9]{40}/;
const GTIN_RE = /^\d{8,14}$/;

function extractWalletAddress(text: string): string | null {
  const trimmed = text.trim();
  if (trimmed.startsWith('ethereum:')) {
    const addr = trimmed.slice('ethereum:'.length).split(/[?@/]/)[0];
    if (ETH_ADDRESS_RE.test(addr)) return addr;
  }
  const addrMatch = trimmed.match(ETH_ADDRESS_RE);
  if (addrMatch) return addrMatch[0];
  try {
    const url = new URL(trimmed);
    const fromParam =
      url.searchParams.get('address') ||
      url.searchParams.get('wallet') ||
      url.searchParams.get('to');
    if (fromParam && ETH_ADDRESS_RE.test(fromParam)) return fromParam;
  } catch {
    /* not a URL */
  }
  return null;
}

function extractPassportSlug(text: string): string | null {
  const trimmed = text.trim();
  try {
    const url = new URL(trimmed);
    const fromQuery = url.searchParams.get('passport');
    if (fromQuery && /^[a-zA-Z0-9_-]{4,64}$/.test(fromQuery)) return fromQuery;
    const pathMatch = url.pathname.match(/\/passport\/([a-zA-Z0-9_-]{4,64})\/?$/i);
    if (pathMatch?.[1]) return pathMatch[1];
  } catch {
    const pathOnly = trimmed.match(/\/passport\/([a-zA-Z0-9_-]{4,64})\/?$/i);
    if (pathOnly?.[1]) return pathOnly[1];
  }
  return null;
}

function extractGtin(text: string): string | null {
  const trimmed = text.trim();
  try {
    const url = new URL(trimmed);
    const host = url.hostname.toLowerCase();
    if (host.includes('gs1') || host.includes('id.gs1.org')) {
      const segments = url.pathname.split('/').filter(Boolean);
      for (const seg of segments) {
        const digits = seg.replace(/\D/g, '');
        if (GTIN_RE.test(digits)) return digits;
      }
      const gtinParam = url.searchParams.get('gtin') || url.searchParams.get('01');
      if (gtinParam && GTIN_RE.test(gtinParam.replace(/\D/g, ''))) {
        return gtinParam.replace(/\D/g, '');
      }
    }
    if (url.pathname.match(/^\/01\/(\d{8,14})/)) {
      const m = url.pathname.match(/^\/01\/(\d{8,14})/);
      if (m?.[1]) return m[1];
    }
  } catch {
    const digits = trimmed.replace(/\D/g, '');
    if (GTIN_RE.test(digits) && digits.length >= 8) return digits;
  }
  return null;
}

function isSessionQr(text: string): boolean {
  const trimmed = text.trim();
  try {
    const url = new URL(trimmed);
    const uuid = url.searchParams.get('uuid') || url.searchParams.get('session');
    const pub = url.searchParams.get('pub') || url.searchParams.get('ekey');
    if (uuid && pub) return true;
    if ((url.pathname.includes('/connect') || url.pathname.includes('/mobile-kyc')) && uuid) return true;
  } catch {
    /* fall through */
  }
  try {
    const parsed = JSON.parse(trimmed);
    if (parsed?.uuid && (parsed?.ephemeralPub || parsed?.pub)) return true;
  } catch {
    /* not JSON */
  }
  return false;
}

export function parseScanPayload(decodedText: string): ScanRoute {
  const raw = decodedText.trim();
  if (!raw) return { type: 'unknown', raw };

  if (isSessionQr(raw)) {
    return { type: 'session', raw };
  }

  const wallet = extractWalletAddress(raw);
  if (wallet) {
    return { type: 'wallet', raw, walletAddress: wallet };
  }

  const slug = extractPassportSlug(raw);
  if (slug) {
    return { type: 'passport', raw, slug };
  }

  const gtin = extractGtin(raw);
  if (gtin) {
    return { type: 'gs1', raw, gtin };
  }

  return { type: 'unknown', raw };
}

export function passportPublicUrl(slug: string, origin?: string): string {
  const base = origin || (typeof window !== 'undefined' ? window.location.origin : 'https://www.humanidfi.com');
  return `${base.replace(/\/$/, '')}/passport/${slug}`;
}
