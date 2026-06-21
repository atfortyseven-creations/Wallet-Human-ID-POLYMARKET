import { NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/prisma'; // Assumes Prisma client is available here

const ZK_SECRET = process.env.ZK_PIPELINE_SECRET || 'quantum-abysmal-fallback-secret-key-3948';

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

    // [SECURITY HARDENING 1] Stateless Cryptographic Verification of the Proof ID
    const parts = proofId.substring(9).split('.');
    if (parts.length !== 2) {
      return NextResponse.json({ success: false, error: "Malformed proofId structure. Forgery detected." }, { status: 403 });
    }

    const [base64Payload, signature] = parts;
    const payload = Buffer.from(base64Payload, 'base64').toString('utf-8');
    const expectedSignature = crypto.createHmac('sha256', ZK_SECRET).update(payload).digest('hex');

    if (signature !== expectedSignature) {
      return NextResponse.json({ success: false, error: "CRYPTOGRAPHIC_ERROR: Proof signature mismatch. Tampering detected." }, { status: 403 });
    }

    // Ensure the proof's signed payload contains the exact nullifier passed to us
    const [signedNullifier] = payload.split(':');
    if (signedNullifier !== nullifierHash) {
       return NextResponse.json({ success: false, error: "NULLIFIER_MISMATCH: Proof payload does not match the provided nullifier." }, { status: 403 });
    }

    // [SECURITY HARDENING 2] Replay Attack Prevention via PostgreSQL (Prisma)
    // Check if nullifier is already spent globally
    const existingNullifier = await prisma.zkNullifier.findUnique({
      where: { nullifierHash }
    });

    if (existingNullifier) {
      return NextResponse.json({
        success: false,
        error: "REPLAY_ATTACK_DETECTED: This proof has already been submitted and the nullifier is spent."
      }, { status: 403 });
    }

    // Mark nullifier as spent securely in the DB
    await prisma.zkNullifier.create({
      data: {
        nullifierHash,
        proofId,
      }
    });

    return NextResponse.json({
      success: true,
      verified: true,
      verifiedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
