import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const { witnessId } = await req.json();

    if (!witnessId) {
      return NextResponse.json({ success: false, error: "Missing witness ID" }, { status: 400 });
    }

    const baseHash = crypto.createHash('sha256').update(witnessId).digest('hex');

    return NextResponse.json({
      success: true,
      proofId: `proof_uh_${baseHash.substring(0, 12)}`,
      pi_a: [`0x${baseHash.substring(0, 64)}`, `0x${baseHash.substring(64, 128)}`],
      verifierAddress: "0xAztecUltraHonkVerifierV1",
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
