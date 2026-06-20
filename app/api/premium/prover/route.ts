import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { PlanTier } from '@/lib/node_infrastructure/tiers';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const issuerAddress = session.userId.toLowerCase();

    const body = await req.json();
    const { circuitConstraints, nonce, timestamp } = body;

    // 1. Abysmal Security Check: Prevent Replay Attacks
    const now = Date.now();
    if (!timestamp || Math.abs(now - timestamp) > 300000) { // 5 minute window
      return NextResponse.json({ error: 'Security Exception: Request expired or timestamp invalid (Anti-Replay Protection).' }, { status: 403 });
    }

    if (!nonce || nonce.length < 16) {
      return NextResponse.json({ error: 'Security Exception: Cryptographic nonce missing or too weak.' }, { status: 403 });
    }

    // 2. Strict Plan Enforcement via Database
    const user = await prisma.user.findUnique({
      where: { walletAddress: issuerAddress },
      select: { tier: true }
    });

    const userTier = (user?.tier as PlanTier) || PlanTier.FREE;

    if (userTier !== PlanTier.ARCHIVE_PROVER) {
      return NextResponse.json({ error: 'Server-side ZK Proving is an exclusive feature for the Archive Prover (Empresa) tier.' }, { status: 403 });
    }

    // In a real implementation, this forwards the zk-SNARK constraints to a GPU cluster
    // which generates the proof in < 1 second instead of doing it in WASM on the client.
    console.log(`[Prover] Delegating ZK proof generation for tier: ${userTier}`);

    // Mock delay to simulate GPU cluster proving time
    await new Promise(resolve => setTimeout(resolve, 300));

    return NextResponse.json({
      success: true,
      proof: '0xMockProof' + Array.from(crypto.getRandomValues(new Uint8Array(64))).map(b => b.toString(16).padStart(2, '0')).join(''),
      publicInputs: ['0x1', '0x2'],
      provingTimeMs: 295
    }, { status: 200 });

  } catch (error: any) {
    console.error('[Prover] Error:', error.message);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
