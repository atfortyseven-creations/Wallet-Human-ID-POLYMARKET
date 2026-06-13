import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateAztecTxHash, getAztecChainState, buildAztecMetadata } from '@/lib/aztec/realTx';

export const dynamic = 'force-dynamic';

const rateLimitMap = new Map<string, number>();
const addressLockMap = new Set<string>();
const RATE_LIMIT_MS = 10_000;

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';

  const lastTx = rateLimitMap.get(ip);
  if (lastTx && Date.now() - lastTx < RATE_LIMIT_MS) {
    const wait = Math.ceil((RATE_LIMIT_MS - (Date.now() - lastTx)) / 1000);
    return NextResponse.json(
      { error: `Rate limited — please wait ${wait}s before next transfer.` },
      { status: 429 }
    );
  }

  let body: any;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 }); }

  const { from, to, amount } = body;

  if (!from || !to || !amount) {
    return NextResponse.json({ error: 'from, to, and amount are required' }, { status: 400 });
  }

  const aztecRegex = /^0x[a-fA-F0-9]{40,64}$/;
  if (!aztecRegex.test(from) || !aztecRegex.test(to)) {
    return NextResponse.json({ error: 'Invalid address format (must be 0x followed by 40-64 hex chars)' }, { status: 400 });
  }

  const normalizedFrom = from.toLowerCase();
  const normalizedTo   = to.toLowerCase();

  if (normalizedFrom === normalizedTo) {
    return NextResponse.json({ error: 'Self-transfers are not allowed' }, { status: 400 });
  }

  const parsedAmount = parseFloat(amount);
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    return NextResponse.json({ error: 'amount must be a positive number' }, { status: 400 });
  }

  if (addressLockMap.has(normalizedFrom)) {
    return NextResponse.json({ error: 'Concurrent transaction detected. Please wait.' }, { status: 409 });
  }
  addressLockMap.add(normalizedFrom);

  try {
    // ── Zero-trust balance check ─────────────────────────────────────────────
    const [receivedAgg, sentAgg] = await Promise.all([
      prisma.transaction.aggregate({
        where: { toAddress: normalizedFrom, token: 'QDs', status: 'COMPLETED' },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: { fromAddress: normalizedFrom, token: 'QDs', status: 'COMPLETED' },
        _sum: { amount: true },
      }),
    ]);
    const rawBalance  = (receivedAgg._sum.amount || 0) - (sentAgg._sum.amount || 0);
    const trueBalance = Math.round(rawBalance * 1_000_000) / 1_000_000;

    if (parsedAmount > trueBalance + 0.000001) {
      return NextResponse.json({ error: 'Insufficient balance on ledger' }, { status: 400 });
    }

    // ── Fetch real chain state from Aztec testnet ────────────────────────────
    const txCount  = await prisma.transaction.count();
    const { blockNumber, isLive } = await getAztecChainState();
    const finalBlock = Math.max(blockNumber, 103860 + txCount + 1);

    // ── Generate unique tx hash (BN254 Fr-compatible) ────────────────────────
    const txHash = generateAztecTxHash('TRANSFER', normalizedFrom, normalizedTo, parsedAmount, txCount);

    console.log(`[Aztec Transfer] ZK proof sim — ${parsedAmount} QDs → ${normalizedTo} | block ${finalBlock} | node ${isLive ? 'LIVE' : 'estimated'}`);

    // ── Persist to Postgres ──────────────────────────────────────────────────
    const newTx = await prisma.transaction.create({
      data: {
        txHash,
        status:      'COMPLETED',
        type:        'TRANSFER',
        amount:      parsedAmount,
        token:       'QDs',
        tokenSymbol: 'QDs',
        fromAddress: normalizedFrom,
        toAddress:   normalizedTo,
        blockNumber: BigInt(finalBlock),
        chainId:     2151908,
        metadata:    buildAztecMetadata({
          txHash,
          operation:   'TRANSFER',
          fromAddress: normalizedFrom,
          toAddress:   normalizedTo,
          amount:      parsedAmount,
          blockNumber: finalBlock,
          nodeIsLive:  isLive,
          note:        `QDs transfer: ${parsedAmount} QDs`,
        }),
      },
    });

    rateLimitMap.set(ip, Date.now());
    console.log(`[Aztec Transfer] ✅ TX saved — hash: ${txHash}`);

    return NextResponse.json({
      success:     true,
      id:          newTx.id,
      txHash,
      from:        normalizedFrom,
      to:          normalizedTo,
      amount:      parsedAmount,
      symbol:      'QDs',
      blockNumber: finalBlock,
      explorerUrl: `https://testnet.aztecscan.xyz/tx/${txHash}`,
    });

  } catch (err: any) {
    console.error('[Aztec Transfer Error]', err.message);
    return NextResponse.json({ error: `Transfer failed: ${err.message}` }, { status: 500 });
  } finally {
    addressLockMap.delete(normalizedFrom);
  }
}
