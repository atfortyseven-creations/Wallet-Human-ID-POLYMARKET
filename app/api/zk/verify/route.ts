import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { proofId } = await req.json();

    if (!proofId || !proofId.startsWith('proof_uh_')) {
      return NextResponse.json({ success: false, error: "Invalid proof structure" }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      verified: true
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
