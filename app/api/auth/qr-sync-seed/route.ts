import { NextRequest, NextResponse } from 'next/server';
import { safeRedisSet, safeRedisGet } from '@/lib/redis/client';
import { safeJsonParse } from '@/lib/utils/json';

/**
 * [EXPERT-SYNC] QR Seed Bridge — Security Hardened
 *
 * Desktop pushes an ECDH-encrypted XMTP seed to Redis for the just-linked mobile.
 *
 * Security model:
 *  POST — ONLY the desktop browser that called qr-init (owns `qr_init_session` cookie) may push.
 *          Prevents any third-party from poisoning the seed of an active QR session.
 *  GET  — ONLY a device with a valid, cryptographically verified JWT session may pull.
 *          Prevents unauthenticated exposure of the AES-GCM ciphertext.
 *  UUID — Validated against a strict regex before use as a Redis key (prevents key injection).
 */

// UUID format guard — prevents Redis key injection via crafted UUIDs
const UUID_RE = /^[0-9a-z-]{6,64}$/i;

export async function POST(req: NextRequest) {
  try {
    const { uuid, encryptedSeed, iv, tag } = await req.json();
    if (!uuid || !UUID_RE.test(uuid) || !encryptedSeed || !iv) {
      return NextResponse.json({ error: 'Missing or invalid sync data' }, { status: 400 });
    }

    // [SECURITY] Only the desktop browser that generated this QR session can push a seed.
    // qr_init_session is HttpOnly — clients cannot forge it; it is set exclusively by /api/auth/qr-init.
    const initCookie = req.cookies.get('qr_init_session')?.value;
    if (!initCookie || initCookie !== uuid) {
      console.error(`[QR:SyncSeed:BLOCK] Unauthorized seed push uuid=${uuid}`);
      return NextResponse.json({ error: 'Unauthorized: session ownership check failed' }, { status: 401 });
    }

    // Verify that the QR mobile-link completed before allowing seed push.
    // This closes a race where an attacker pushes a seed before the real mobile scans.
    const sessionExists = await safeRedisGet(`qr-session:${uuid}`);
    if (!sessionExists) {
      return NextResponse.json({ error: 'QR session not found or already expired' }, { status: 404 });
    }

    await safeRedisSet(`qr-seed:${uuid}`, JSON.stringify({ encryptedSeed, iv, tag }), 'EX', 300);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const uuid = req.nextUrl.searchParams.get('uuid');
  if (!uuid || !UUID_RE.test(uuid)) {
    return NextResponse.json({ error: 'Missing or invalid uuid' }, { status: 400 });
  }

  // [SECURITY] Require a valid JWT — the mobile always has human_session after completing qr-mobile-link
  const humanSession =
    req.cookies.get('human_session')?.value ||
    req.cookies.get('ledger_session')?.value;
  if (!humanSession) {
    return NextResponse.json({ error: 'Unauthenticated: session required to retrieve seed' }, { status: 401 });
  }
  try {
    const { verifyJWT } = await import('@/lib/jwt');
    await verifyJWT(humanSession);
  } catch {
    return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 });
  }

  const data = await safeRedisGet(`qr-seed:${uuid}`);
  if (!data || data === 'TIMEOUT') return NextResponse.json({ pending: true });

  const parsed = safeJsonParse(data, null, 'QR_SYNC_SEED');
  if (!parsed) return NextResponse.json({ error: 'Invalid seed data' }, { status: 500 });
  return NextResponse.json(parsed);
}
