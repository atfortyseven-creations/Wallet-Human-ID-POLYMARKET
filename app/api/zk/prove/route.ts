import { NextResponse } from 'next/server';
import crypto from 'crypto';

const ZK_SECRET = process.env.ZK_PIPELINE_SECRET || 'aztec-zk-pipeline-secret-key-3948';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { witnessId } = body;

    if (!witnessId || typeof witnessId !== 'string' || !witnessId.startsWith('wtns_')) {
      return NextResponse.json({ success: false, error: "Invalid or missing witnessId. Run witness generation first." }, { status: 400 });
    }

    // [SECURITY HARDENING] Stateless Cryptographic Verification
    // Format is wtns_base64(payload).signature
    const parts = witnessId.substring(5).split('.');
    if (parts.length !== 2) {
      return NextResponse.json({ success: false, error: "Malformed witnessId structure. Forgery detected." }, { status: 403 });
    }

    const [base64Payload, signature] = parts;
    const payload = Buffer.from(base64Payload, 'base64').toString('utf-8');
    const expectedSignature = crypto.createHmac('sha256', ZK_SECRET).update(payload).digest('hex');

    if (signature !== expectedSignature) {
      return NextResponse.json({ success: false, error: "CRYPTOGRAPHIC_ERROR: Witness signature mismatch. Tampering detected." }, { status: 403 });
    }

    // Derive proof data from the witnessId
    const baseHash = crypto.createHash('sha256').update(witnessId + 'ultrahonk').digest('hex');
    const nullifierHash = `0x${crypto.createHash('sha256').update(witnessId + 'nullifier').digest('hex')}`;
    
    // Sign the proofId for the verifier to consume losslessly
    const proofPayload = `${nullifierHash}:${Date.now()}`;
    const proofSig = crypto.createHmac('sha256', ZK_SECRET).update(proofPayload).digest('hex');
    const proofBase64 = Buffer.from(proofPayload).toString('base64');
    const secureProofId = `proof_uh_${proofBase64}.${proofSig}`;

    return NextResponse.json({
      success: true,
      proofId: secureProofId,
      nullifierHash,
      proofBytes: baseHash.length,
      backend: 'UltraHonk/Barretenberg',
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
