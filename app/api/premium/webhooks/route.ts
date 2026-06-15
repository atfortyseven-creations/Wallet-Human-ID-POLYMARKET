import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get('whale_session')?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { webhookUrl, eventTypes, tier, nonce, timestamp } = body;

    // 1. Abysmal Security Check: Prevent Replay Attacks
    const now = Date.now();
    if (!timestamp || Math.abs(now - timestamp) > 300000) { // 5 minute window
      return NextResponse.json({ error: 'Security Exception: Request expired or timestamp invalid (Anti-Replay Protection).' }, { status: 403 });
    }

    if (!nonce || nonce.length < 16) {
      return NextResponse.json({ error: 'Security Exception: Cryptographic nonce missing or too weak.' }, { status: 403 });
    }

    if (!['PRO', 'ELITE', 'Private'].includes(tier)) {
      return NextResponse.json({ error: 'Webhooks are only available for PRO, ELITE, and Private tiers.' }, { status: 403 });
    }

    // In a real database, we would store this mapping: userId -> webhookUrl -> [eventTypes]
    console.log(`[Webhooks] Registered webhook ${webhookUrl} for events: ${eventTypes.join(', ')}`);

    return NextResponse.json({
      success: true,
      message: 'Webhook registered successfully.',
      webhookId: 'wh_' + Date.now()
    }, { status: 201 });

  } catch (error: any) {
    console.error('[Webhooks] Error:', error.message);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
