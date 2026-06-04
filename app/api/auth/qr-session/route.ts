import { NextRequest, NextResponse } from 'next/server';
import { safeRedisSet } from '@/lib/redis/client';

export async function POST(req: NextRequest) {
  try {
    const { uuid, encryptedPayload, iv, tag, mobilePub } = await req.json();
    if (!uuid || !encryptedPayload) {
      return NextResponse.json({ error: 'Missing payload' }, { status: 400 });
    }
    await safeRedisSet(`qr-session:${uuid}`, JSON.stringify({ encryptedPayload, iv, tag, mobilePub }), 'EX', 300);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

