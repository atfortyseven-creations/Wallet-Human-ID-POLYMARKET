import { NextRequest, NextResponse } from 'next/server';
import { safeRedisGet } from '@/lib/redis/client';

export async function GET(req: NextRequest) {
  const uuid = req.nextUrl.searchParams.get('uuid');
  if (!uuid) return NextResponse.json({ error: 'Missing uuid' }, { status: 400 });
  
  const data = await safeRedisGet(`qr-session:${uuid}`);
  if (!data) return NextResponse.json({ pending: true });
  
  if (data === "TIMEOUT") {
    return NextResponse.json({ error: "TIMEOUT" }, { status: 408 });
  }

  try {
    return NextResponse.json(JSON.parse(data));
  } catch (err) {
    return NextResponse.json({ error: 'Invalid session data' }, { status: 500 });
  }
}
