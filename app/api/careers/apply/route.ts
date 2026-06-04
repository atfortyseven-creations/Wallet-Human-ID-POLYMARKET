import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate required fields
    const { name, email, portfolio, motivation, role } = body;
    if (!name || !email || !portfolio || !motivation || !role) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
    }

    // Basic email format guard
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 });
    }

    // Basic URL format guard for portfolio
    try { new URL(portfolio); } catch {
      return NextResponse.json({ error: 'Portfolio must be a valid URL.' }, { status: 400 });
    }

    // Structured log  downstream service (Resend/DB) can be wired here
    console.log(`[CAREERS] Application received`, {
      role,
      name,
      email,
      portfolio,
      motivationLength: motivation.length,
      ts: new Date().toISOString(),
    });

    return NextResponse.json({ ok: true, message: 'Application securely received.' });

  } catch (error: any) {
    console.error('[CAREERS ERROR]', error);
    return NextResponse.json({ error: 'Internal system error during transmission.' }, { status: 500 });
  }
}

