import { NextRequest, NextResponse } from 'next/server';
import { validateSecureRequest } from '@/lib/crypto/auth-server';
import { logProvenanceEvent, ProvenanceEventType } from '@/lib/aztec/provenanceIndexer';

export async function POST(req: NextRequest) {
  try {
    const validation = await validateSecureRequest(req);
    if (!validation.valid || !validation.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const address = validation.userId;
    const body = await req.json();
    const { type, details } = body;

    const allowedTypes: ProvenanceEventType[] = ['WHALE_CHAT_SYNC', 'PORTFOLIO_ACCESS', 'STUDIO_ACCESS'];

    if (!allowedTypes.includes(type)) {
      return NextResponse.json({ error: 'Invalid event type' }, { status: 400 });
    }

    const record = await logProvenanceEvent(type as ProvenanceEventType, address, details || {});
    
    return NextResponse.json({ success: true, hash: record?.txHash });
  } catch (err: any) {
    console.error('[Provenance Log] Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
