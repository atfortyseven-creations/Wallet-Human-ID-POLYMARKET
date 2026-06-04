import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { consent } = body;
    
    // Stringify consent state safely
    const consentValue = typeof consent === 'object' ? JSON.stringify(consent) : String(consent);

    const cookieStore = await cookies();
    cookieStore.set('whale_system_consent', consentValue, {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 31536000 // 1 year
    });

    return NextResponse.json({ success: true, message: 'Telemetry preference cemented.' });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Protocol violation' }, { status: 400 });
  }
}

export async function GET() {
    const cookieStore = await cookies();
    const consent = cookieStore.get('whale_system_consent');
    return NextResponse.json({ consented: !!consent, state: consent?.value || null });
}
