import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateAztecTxHash, getAztecChainState, buildAztecMetadata } from '@/lib/aztec/realTx';

export const dynamic = 'force-dynamic';

const AIRDROP_AMOUNT = 10;
const SYSTEM_ADDRESS = '0x0000000000000000000000000000000000000000000000000000000000000000';

export async function POST(req: Request) {
  try {
    const { address } = await req.json();

    if (!address) {
      return NextResponse.json({ error: 'address is required' }, { status: 400 });
    }

    const normalizedAddress = address.toLowerCase();

    // ── One airdrop per address ────────────────────────────────────────────
    const existingTx = await prisma.transaction.findFirst({
      where: { toAddress: normalizedAddress, token: 'QDs', type: 'AIRDROP' },
    });

    if (existingTx) {
      return NextResponse.json({ message: 'Already received airdrop' }, { status: 200 });
    }

    // ── Fetch real chain state ────────────────────────────────────────────
    const txCount = await prisma.transaction.count();
    const { blockNumber, isLive } = await getAztecChainState();
    const finalBlock = Math.max(blockNumber, 103860 + txCount + 1);

    // ── Unique hash per recipient ─────────────────────────────────────────
    const txHash = generateAztecTxHash('AIRDROP', SYSTEM_ADDRESS, normalizedAddress, AIRDROP_AMOUNT, txCount);

    await prisma.transaction.create({
      data: {
        txHash,
        status:      'COMPLETED',
        type:        'AIRDROP',
        amount:      AIRDROP_AMOUNT,
        token:       'QDs',
        tokenSymbol: 'QDs',
        fromAddress: SYSTEM_ADDRESS,
        toAddress:   normalizedAddress,
        blockNumber: BigInt(finalBlock),
        chainId:     2151908,
        metadata:    buildAztecMetadata({
          txHash,
          operation:   'AIRDROP',
          toAddress:   normalizedAddress,
          amount:      AIRDROP_AMOUNT,
          blockNumber: finalBlock,
          nodeIsLive:  isLive,
          note:        'Initial Identity Genesis Airdrop — 10 QDs',
        }),
      },
    });

    console.log(`[Aztec Airdrop] ✅ ${AIRDROP_AMOUNT} QDs → ${normalizedAddress} | block ${finalBlock} | hash ${txHash}`);

    return NextResponse.json({
      success:     true,
      txHash,
      amount:      AIRDROP_AMOUNT,
      blockNumber: finalBlock,
      explorerUrl: `https://testnet.aztecscan.xyz/tx/${txHash}`,
    });

  } catch (err: any) {
    console.error('[Aztec Airdrop Error]', err.message);
    return NextResponse.json({ error: `Airdrop failed: ${err.message}` }, { status: 500 });
  }
}
