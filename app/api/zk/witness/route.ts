import { NextResponse } from 'next/server';
import crypto from 'crypto';

const ZK_SECRET = process.env.ZK_PIPELINE_SECRET || 'aztec-zk-pipeline-secret-key-3948';

export async function POST(req: Request) {
  try {
    const { acir } = await req.json();

    if (!acir || typeof acir !== 'string') {
      return NextResponse.json({ success: false, error: "Missing ACIR bytecode" }, { status: 400 });
    }

    // [SECURITY HARDENING] Stateless Cryptographic Validation
    // Create a payload to sign
    const payload = `${acir}:${Date.now()}`;
    const signature = crypto.createHmac('sha256', ZK_SECRET).update(payload).digest('hex');
    
    // The witnessId embeds the payload and its cryptographic signature
    // Format: wtns_base64(payload).signature
    const base64Payload = Buffer.from(payload).toString('base64');
    const secureWitnessId = `wtns_${base64Payload}.${signature}`;

    return NextResponse.json({
      success: true,
      witnessId: secureWitnessId,
      acirHash: crypto.createHash('sha256').update(acir).digest('hex').substring(0, 32),
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
