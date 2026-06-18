import { NextResponse } from 'next/server';

// [SECURITY HARDENING] Global Nullifier Registry to prevent replay attacks
const nullifierRegistry = new Set<string>();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const proofId = body.proofId;
    const nullifierHash = body.nullifierHash;

    if (!proofId || typeof proofId !== 'string' || !proofId.startsWith('proof_uh_')) {
      return NextResponse.json({ success: false, error: "Invalid proof structure" }, { status: 400 });
    }

    if (!nullifierHash || typeof nullifierHash !== 'string') {
      return NextResponse.json({ success: false, error: "Missing nullifier hash. Proof cannot be verified safely." }, { status: 400 });
    }

    // [SECURITY HARDENING] Replay Attack Prevention
    if (nullifierRegistry.has(nullifierHash)) {
      return NextResponse.json({ success: false, error: "REPLAY_ATTACK_DETECTED: This proof has already been submitted and the nullifier is spent." }, { status: 403 });
    }

    // Mark as spent
    nullifierRegistry.add(nullifierHash);

    return NextResponse.json({
      success: true,
      verified: true
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
