import { NextRequest, NextResponse } from 'next/server';
import { safeRedisGet } from '@/lib/redis/client';

export const dynamic = 'force-dynamic';

/**
 * GET /api/auth/qr-session-key?uuid=<uuid>
 * 
 * Called by the MOBILE app after scanning the short QR code.
 * Returns the ephemeral public key that was stored by the desktop via qr-init.
 * 
 * Response: { pub: string, ecdh: '0'|'1', exp: string }
 */
export async function GET(req: NextRequest) {
  const uuid = req.nextUrl.searchParams.get('uuid');
  if (!uuid) return NextResponse.json({ error: 'Missing uuid' }, { status: 400 });

  const raw = await safeRedisGet(`qr-ephkey:${uuid}`);
  if (!raw) {
    return NextResponse.json({ error: 'Session not found or expired' }, { status: 404 });
  }

  try {
    const data = JSON.parse(raw);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Malformed session data' }, { status: 500 });
  }
}
