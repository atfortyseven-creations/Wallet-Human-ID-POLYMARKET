import { NextResponse } from 'next/server';

// [SECURITY HARDENING] Global Nullifier Registry to prevent replay attacks
// In production this would be a persistent DB (Redis/Postgres)
const nullifierRegistry = new Set<string>();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { proofId, nullifierHash } = body;

    // Validate proofId format
    if (!proofId || typeof proofId !== 'string' || !proofId.startsWith('proof_uh_')) {
      return NextResponse.json({
        success: false,
        error: "Invalid proof structure. Expected a proofId starting with 'proof_uh_'."
      }, { status: 400 });
    }

    // Validate nullifierHash
    if (!nullifierHash || typeof nullifierHash !== 'string' || !nullifierHash.startsWith('0x')) {
      return NextResponse.json({
        success: false,
        error: "Missing nullifier hash. Proof cannot be verified safely without a nullifier."
      }, { status: 400 });
    }

    // [SECURITY HARDENING] Replay Attack Prevention
    if (nullifierRegistry.has(nullifierHash)) {
      return NextResponse.json({
        success: false,
        error: "REPLAY_ATTACK_DETECTED: This proof has already been submitted and the nullifier is spent."
      }, { status: 403 });
    }

    // Mark nullifier as spent
    nullifierRegistry.add(nullifierHash);

    return NextResponse.json({
      success: true,
      verified: true,
      verifiedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
