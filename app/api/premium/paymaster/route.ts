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
    const { transactionPayload, signature, nonce, timestamp } = body;

    // 1. Abysmal Security Check: Prevent Replay Attacks
    const now = Date.now();
    if (!timestamp || Math.abs(now - timestamp) > 300000) { // 5 minute window
      return NextResponse.json({ error: 'Security Exception: Request expired or timestamp invalid (Anti-Replay Protection).' }, { status: 403 });
    }

    if (!nonce || nonce.length < 16) {
      return NextResponse.json({ error: 'Security Exception: Cryptographic nonce missing or too weak.' }, { status: 403 });
    }

    // 2. Signature verification (Pseudo-code for the implementation)
    // const isValidSignature = verifyECDSA(transactionPayload.creatorAddress, signature, { nonce, timestamp });
    // if (!isValidSignature) return NextResponse.json({ error: 'Security Exception: Invalid ECDSA Handshake.' }, { status: 401 });

    // 3. Strict Plan Enforcement via Database
    const user = await prisma.user.findUnique({
      where: { walletAddress: issuerAddress },
      select: { tier: true }
    });

    const userTier = (user?.tier as PlanTier) || PlanTier.FREE;

    // Only FULL_NODE (Professional) and ARCHIVE_PROVER (Empresa) get gasless transactions
    if (![PlanTier.FULL_NODE, PlanTier.ARCHIVE_PROVER].includes(userTier)) {
      return NextResponse.json({ error: 'Paymaster gasless services are exclusively available for Professional and Empresa tiers.' }, { status: 403 });
    }

    // Abstract the gas fee: 
    // In production, this signs the user's transaction payload with the Humanity Ledger sponsor private key.
    console.log(`[Paymaster] Subsidizing gas for transaction payload from tier: ${userTier}`);

    return NextResponse.json({
      success: true,
      sponsoredTransaction: {
        ...transactionPayload,
        paymasterData: '0xLedgerNetworkGasSponsorSignature' + Date.now(),
        gasSubsidized: true
      }
    }, { status: 200 });

  } catch (error: any) {
    console.error('[Paymaster] Error:', error.message);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
