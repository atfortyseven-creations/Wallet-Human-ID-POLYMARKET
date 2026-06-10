import { NextRequest, NextResponse } from 'next/server';
import { safeRedisSet } from '@/lib/redis/client';

export const dynamic = 'force-dynamic';

/**
 * POST /api/auth/qr-init
 * 
 * The desktop generates an ephemeral key pair and calls this endpoint
 * to store the PUBLIC key in Redis, keyed by a short UUID.
 * 
 * The QR code then only encodes a short URL:
 *   https://humanidfi.com/connect?s=<uuid>
 * 
 * This reduces QR data from ~600 chars → ~50 chars, making it scannable
 * at 100% zoom on any phone without requiring the user to zoom in.
 * 
 * The mobile app reads the public key via GET /api/auth/qr-session-key?uuid=<uuid>
 * before encrypting the session payload with ECDH/X25519.
 */
export async function POST(req: NextRequest) {
  try {
    const { uuid, pub, ecdh, exp } = await req.json();
    if (!uuid || !pub) {
      return NextResponse.json({ error: 'Missing uuid or pub' }, { status: 400 });
    }

    const ttl = exp ? Math.max(60, Math.ceil((parseInt(exp, 10) - Date.now()) / 1000)) : 300;
    await safeRedisSet(
      `qr-ephkey:${uuid}`,
      JSON.stringify({ pub, ecdh: ecdh === true || ecdh === '1' ? '1' : '0', exp }),
      'EX',
      Math.min(ttl, 300)
    );

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error('[qr-init]', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
