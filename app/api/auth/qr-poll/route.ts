import { NextRequest, NextResponse } from 'next/server';
import { safeRedisGet } from '@/lib/redis/client';

export async function GET(req: NextRequest) {
  const uuid = req.nextUrl.searchParams.get('uuid');
  if (!uuid) return NextResponse.json({ error: 'Missing uuid' }, { status: 400 });
  
  // [AUDIT FIX A4] Verify session ownership to prevent remote JWT/session theft
  const initCookie = req.cookies.get('qr_init_session')?.value;
  if (!initCookie || initCookie !== uuid) {
      return NextResponse.json({ error: 'Unauthorized: Session hijack prevented' }, { status: 401 });
  }
  
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
