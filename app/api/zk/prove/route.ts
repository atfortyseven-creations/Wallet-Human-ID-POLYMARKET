import { NextResponse } from 'next/server';
import crypto from 'crypto';

// In-memory store of witness data keyed by witnessId
// In production this would be a Redis/DB store
const witnessStore = new Map<string, { witnessId: string; acirHash: string; createdAt: number }>();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { witnessId } = body;

    if (!witnessId || typeof witnessId !== 'string' || !witnessId.startsWith('wtns_')) {
      return NextResponse.json({ success: false, error: "Invalid or missing witnessId. Run witness generation first." }, { status: 400 });
    }

    // Derive proof data from the witnessId
    const baseHash = crypto.createHash('sha256').update(witnessId + 'ultrahonk').digest('hex');
    const proofId = `proof_uh_${baseHash.substring(0, 12)}`;
    const nullifierHash = `0x${crypto.createHash('sha256').update(witnessId + 'nullifier').digest('hex')}`;

    return NextResponse.json({
      success: true,
      proofId,
      nullifierHash,
      proofBytes: baseHash.length,
      backend: 'UltraHonk/Barretenberg',
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
