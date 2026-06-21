import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const { acir } = await req.json();

    if (!acir || typeof acir !== 'string') {
      return NextResponse.json({ success: false, error: "Missing ACIR bytecode" }, { status: 400 });
    }

    // Derive a deterministic witness ID from the ACIR bytecode + timestamp
    const wId = crypto
      .createHash('sha256')
      .update(acir + Date.now().toString())
      .digest('hex')
      .substring(0, 16);

    return NextResponse.json({
      success: true,
      witnessId: `wtns_${wId}`,
      acirHash: crypto.createHash('sha256').update(acir).digest('hex').substring(0, 32),
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
