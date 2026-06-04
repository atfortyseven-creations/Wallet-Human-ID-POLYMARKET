import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  // Middleware ya validó el JWT si esta ruta no está en PUBLIC_PATHS
  const token = req.cookies.get('human_session')?.value;
  if (!token) {
    return NextResponse.json({ error: 'No session' }, { status: 401 });
  }
  return NextResponse.json({ jwt: token });
}
