import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  // [SECURITY HARDENING] Never expose the raw JWT in the response body.
  // The original code returned { jwt: token } in plaintext, meaning any XSS
  // or network interception could steal the full session token and replay it.
  // We now verify the JWT server-side and return only the address it encodes.
  const token = req.cookies.get('human_session')?.value || req.cookies.get('whale_session')?.value;
  if (!token) {
    return NextResponse.json({ error: 'No session' }, { status: 401 });
  }
  try {
    const { verifyJWT } = await import('@/lib/jwt');
    const payload = await verifyJWT(token);
    const address = (payload.address || payload.sub) as string;
    if (!address) throw new Error('Missing address in payload');
    return NextResponse.json({ authenticated: true, address: address.toLowerCase() });
  } catch {
    return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 });
  }
}
