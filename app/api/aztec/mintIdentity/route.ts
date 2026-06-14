import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateAztecTxHash, getAztecChainState, buildAztecMetadata } from '@/lib/aztec/realTx';
import { logProvenanceEvent } from '@/lib/aztec/provenanceIndexer';

export const dynamic = 'force-dynamic';

const MINT_AMOUNT    = 10;
const SYSTEM_ADDRESS = '0x0000000000000000000000000000000000000000';

import { getSession } from '@/lib/session';

export async function POST(req: Request) {
  // [QUANTUM AEGIS] Zero-Trust Session Verification
  const session = await getSession();
  if (!session || !session.userId) {
    return NextResponse.json({ error: 'UNAUTHORIZED: Cryptographic session required to mint identity.' }, { status: 401 });
  }

  let body: any;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 }); }

  const { to } = body;
  if (!to) {
    return NextResponse.json({ error: 'to address is required' }, { status: 400 });
  }

  const normalizedTo = to.toLowerCase();

  // [SECURITY FATAL FIX] The caller MUST cryptographically own the address receiving the identity.
  if (normalizedTo !== session.userId) {
    return NextResponse.json({ error: 'FORBIDDEN: You can only mint identity for your own authenticated wallet.' }, { status: 403 });
  }

  try {
    // ── One mint per address ──────────────────────────────────────────────
    const existingMint = await prisma.transaction.findFirst({
      where: { toAddress: normalizedTo, token: 'QDs', type: 'MINT_IDENTITY', status: 'COMPLETED' },
    });

    if (existingMint) {
      return NextResponse.json({ error: 'Identity already minted' }, { status: 400 });
    }

    // ── Fetch real chain state ────────────────────────────────────────────
    const txCount = await prisma.transaction.count();
    const { blockNumber, isLive } = await getAztecChainState();
    const finalBlock = Math.max(blockNumber, 103860 + txCount + 1);

    // ── Unique hash per mint ──────────────────────────────────────────────
    const txHash = generateAztecTxHash('MINT_IDENTITY', SYSTEM_ADDRESS, normalizedTo, MINT_AMOUNT, txCount);

    const newTx = await prisma.transaction.create({
      data: {
        txHash,
        status:      'COMPLETED',
        type:        'MINT_IDENTITY',
        amount:      MINT_AMOUNT,
        token:       'QDs',
        tokenSymbol: 'QDs',
        fromAddress: SYSTEM_ADDRESS,
        toAddress:   normalizedTo,
        blockNumber: BigInt(finalBlock),
        chainId:     2151908,
        metadata:    buildAztecMetadata({
          txHash,
          operation:   'MINT_IDENTITY',
          toAddress:   normalizedTo,
          amount:      MINT_AMOUNT,
          blockNumber: finalBlock,
          nodeIsLive:  isLive,
          note:        'Aztec Identity Mint — 10 QDs genesis grant',
        }),
      },
    });

    // [ATOMIC INDEXING]
    await logProvenanceEvent('IDENTITY_PROOF', normalizedTo, {
      action: 'MINT',
      amount: MINT_AMOUNT,
      originalTxId: newTx.id
    });

    console.log(`[Aztec Mint] ✅ ${MINT_AMOUNT} QDs minted → ${normalizedTo} | block ${finalBlock} | hash ${txHash}`);

    return NextResponse.json({
      success:     true,
      txHash,
      amount:      MINT_AMOUNT,
      blockNumber: finalBlock,
      id:          newTx.id,
      explorerUrl: `https://testnet.aztecscan.xyz/tx/${txHash}`,
    });

  } catch (err: any) {
    console.error('[Aztec Mint Error]', err.message);
    return NextResponse.json({ error: `Mint failed: ${err.message}` }, { status: 500 });
  }
}
