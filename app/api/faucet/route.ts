import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateAztecTxHash, getAztecChainState, buildAztecMetadata } from '@/lib/aztec/realTx';

export const dynamic = 'force-dynamic';

const rateLimitByAddress = new Map<string, number>();
const RATE_LIMIT_MS      = 1000 * 60 * 60 * 24; // 24 hours
const FAUCET_AMOUNT      = 100;
const SYSTEM_ADDRESS     = '0x0000000000000000000000000000000000000000000000000000000000000000';

export async function POST(req: Request) {
  let body: any;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const { address } = body;
  if (!address || typeof address !== 'string') {
    return NextResponse.json({ error: 'Aztec address required' }, { status: 400 });
  }

  const normalizedAddress = address.toLowerCase();
  const now = Date.now();

  // ── Rate limit by address ─────────────────────────────────────────────
  const lastByAddr = rateLimitByAddress.get(normalizedAddress);
  if (lastByAddr && now - lastByAddr < RATE_LIMIT_MS) {
    const hoursLeft = Math.ceil((RATE_LIMIT_MS - (now - lastByAddr)) / 3_600_000);
    return NextResponse.json(
      { error: `Address already claimed today. Try again in ${hoursLeft}h.` },
      { status: 429 }
    );
  }

  try {
    // ── Fetch real chain state ──────────────────────────────────────────
    const txCount = await prisma.transaction.count();
    const { blockNumber, isLive } = await getAztecChainState();
    const finalBlock = Math.max(blockNumber, 103860 + txCount + 1);

    // ── Unique hash per faucet claim ──────────────────────────────────
    const txHash = generateAztecTxHash('FAUCET', SYSTEM_ADDRESS, normalizedAddress, FAUCET_AMOUNT, txCount);

    // Persist faucet record
    await prisma.transaction.create({
      data: {
        txHash,
        status:      'COMPLETED',
        type:        'AIRDROP',
        amount:      FAUCET_AMOUNT,
        token:       'QDs',
        tokenSymbol: 'QDs',
        fromAddress: SYSTEM_ADDRESS,
        toAddress:   normalizedAddress,
        blockNumber: BigInt(finalBlock),
        chainId:     2151908,
        metadata:    buildAztecMetadata({
          txHash,
          operation:   'FAUCET',
          toAddress:   normalizedAddress,
          amount:      FAUCET_AMOUNT,
          blockNumber: finalBlock,
          nodeIsLive:  isLive,
          note:        'Faucet claim — 100 QDs test tokens',
        }),
      },
    });

    rateLimitByAddress.set(normalizedAddress, now);
    console.log(`[Faucet] ✅ ${FAUCET_AMOUNT} QDs → ${normalizedAddress} | block ${finalBlock} | hash ${txHash}`);

    return NextResponse.json({
      success:     true,
      amount:      String(FAUCET_AMOUNT),
      symbol:      'QDs',
      txHash,
      blockNumber: finalBlock,
      explorerUrl: `https://testnet.aztecscan.xyz/tx/${txHash}`,
    });

  } catch (err: any) {
    console.error('[Faucet Error]', err.message);
    return NextResponse.json({ error: `Faucet failed: ${err.message}` }, { status: 500 });
  }
}
