import { NextRequest, NextResponse } from 'next/server';
import { validateSecureRequest } from '@/lib/security/premium-security';
import { logProvenanceEvent, ProvenanceEventType } from '@/lib/aztec/provenanceIndexer';

export const dynamic = 'force-dynamic';

const ALLOWED_TYPES: ProvenanceEventType[] = ['WHALE_CHAT_SYNC', 'PORTFOLIO_ACCESS', 'STUDIO_ACCESS'];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, details } = body;

    if (!ALLOWED_TYPES.includes(type)) {
      return NextResponse.json({ error: 'Invalid event type' }, { status: 400 });
    }

    // Try to get authenticated address from session
    const validation = await validateSecureRequest(req);
    let address = validation.userId;

    // Fallback: if no session but body provides a valid address (from frontend), use it
    // This allows passive logging from pages that have a connected wallet but no SIWE session
    if (!address && details?.address && /^0x[a-fA-F0-9]{40}$/i.test(details.address)) {
      address = details.address.toLowerCase();
    }

    // If still no address, silently skip — don't return 401, just succeed silently
    // so the frontend fire-and-forget never throws visible errors
    if (!address) {
      return NextResponse.json({ success: true, skipped: true });
    }

    const record = await logProvenanceEvent(type as ProvenanceEventType, address, details || {});
    
    return NextResponse.json({ success: true, hash: record?.txHash });
  } catch (err: any) {
    console.error('[Provenance Log] Error:', err);
    // Always return 200 — this is fire-and-forget from the frontend
    return NextResponse.json({ success: false, error: err.message });
  }
}
