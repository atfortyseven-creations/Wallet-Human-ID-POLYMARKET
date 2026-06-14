import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { generateAztecTxHash, getAztecChainState, buildAztecMetadata } from '@/lib/aztec/realTx';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { getSession } = await import('@/lib/session');
    const session = await getSession();
    if (!session?.userId) {
        return NextResponse.json({ error: 'Unauthorized: Authentication required.' }, { status: 401 });
    }

    const { evmAddress } = await req.json();

    if (!evmAddress || typeof evmAddress !== 'string') {
      return NextResponse.json({ error: 'evmAddress is required' }, { status: 400 });
    }

    if (evmAddress.toLowerCase() !== session.userId.toLowerCase()) {
        return NextResponse.json({ error: 'Forbidden: You can only migrate your own identity.' }, { status: 403 });
    }

    const normalizedEvm = evmAddress.toLowerCase();

    // Derive canonical Aztec address (double SHA-256 of EVM address)
    const round1 = crypto.createHash('sha256').update(`aztec-schnorr:${normalizedEvm}`).digest();
    const round2 = crypto.createHash('sha256').update(round1).digest('hex');
    const derivedAztecAddress = `0x${round2}`;

    // Check for old-format QDs at raw EVM address
    const oldMintTxs = await prisma.transaction.findMany({
      where: { toAddress: normalizedEvm, token: 'QDs', type: 'MINT_IDENTITY', status: 'COMPLETED' },
    });

    const existingAirdrop = await prisma.transaction.findFirst({
      where: { toAddress: derivedAztecAddress, token: 'QDs', type: 'AIRDROP', status: 'COMPLETED' },
    });

    let migrated = false;

    if (oldMintTxs.length > 0 && !existingAirdrop) {
      // ── Migrate: issue AIRDROP at correct derived address ────────────────
      const txCount = await prisma.transaction.count();
      const { blockNumber, isLive } = await getAztecChainState();
      const finalBlock = Math.max(blockNumber, 103860 + txCount + 1);

      const txHash = generateAztecTxHash(
        'MIGRATE',
        normalizedEvm,
        derivedAztecAddress,
        10,
        txCount
      );

      await prisma.transaction.create({
        data: {
          txHash,
          status:      'COMPLETED',
          type:        'AIRDROP',
          amount:      10,
          token:       'QDs',
          tokenSymbol: 'QDs',
          fromAddress: '0x0000000000000000000000000000000000000000000000000000000000000000',
          toAddress:   derivedAztecAddress,
          blockNumber: BigInt(finalBlock),
          chainId:     2151908,
          metadata:    buildAztecMetadata({
            txHash,
            operation:        'MIGRATE',
            fromAddress:      normalizedEvm,
            toAddress:        derivedAztecAddress,
            amount:           10,
            blockNumber:      finalBlock,
            nodeIsLive:       isLive,
            migratedFromEvm:  normalizedEvm,
            note:             'Migration: MINT_IDENTITY (EVM address) → AIRDROP (Aztec derived address)',
          }),
        },
      });

      migrated = true;
      console.log(`[Aztec Migrate] ✅ ${normalizedEvm} → ${derivedAztecAddress} | hash ${txHash}`);
    }

    // Return current balance at derived address
    const [receivedAgg, sentAgg] = await Promise.all([
      prisma.transaction.aggregate({
        where: { toAddress: derivedAztecAddress, token: 'QDs', status: 'COMPLETED' },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: { fromAddress: derivedAztecAddress, token: 'QDs', status: 'COMPLETED' },
        _sum: { amount: true },
      }),
    ]);

    const balance = Math.max(0, (receivedAgg._sum.amount || 0) - (sentAgg._sum.amount || 0));

    return NextResponse.json({
      migrated,
      balance,
      derivedAztecAddress,
      message: migrated
        ? 'Successfully migrated QDs to correct Aztec address'
        : existingAirdrop
        ? 'Already at correct Aztec address'
        : 'No QDs found to migrate',
    });

  } catch (err: any) {
    console.error('[Aztec Migrate Error]', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
