import { NextRequest, NextResponse } from 'next/server';
import { safeRedisSet, safeRedisGet } from '@/lib/redis/client';
import { safeJsonParse } from '@/lib/utils/json';

/**
 * [EXPERT-SYNC] QR Seed Bridge
 * 
 * This endpoint allows the desktop to "push" an encrypted XMTP seed to a mobile device
 * that has just linked via QR.
 * 
 * Flow:
 * 1. Desktop posts: { uuid, encryptedSeed, iv, tag }
 * 2. Mobile polls: { uuid }
 */

export async function POST(req: NextRequest) {
  try {
    const { uuid, encryptedSeed, iv, tag } = await req.json();
    if (!uuid || !encryptedSeed || !iv) {
      return NextResponse.json({ error: 'Missing sync data' }, { status: 400 });
    }
    
    // Store with a short TTL (5 minutes)
    await safeRedisSet(`qr-seed:${uuid}`, JSON.stringify({ encryptedSeed, iv, tag }), 'EX', 300);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const uuid = req.nextUrl.searchParams.get('uuid');
  if (!uuid) return NextResponse.json({ error: 'Missing uuid' }, { status: 400 });
  
  const data = await safeRedisGet(`qr-seed:${uuid}`);
  if (!data || data === 'TIMEOUT') return NextResponse.json({ pending: true });
  
  const parsed = safeJsonParse(data, null, 'QR_SYNC_SEED');
  if (!parsed) return NextResponse.json({ error: 'Invalid seed data' }, { status: 500 });
  return NextResponse.json(parsed);
}
