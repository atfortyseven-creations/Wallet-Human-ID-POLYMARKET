import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * GET /api/aztec/transactions?address=0x...
 *
 * Returns all QDs transactions (sends & receives) for a given Aztec address.
 * Used by the client to detect incoming transfers and credit the recipient's balance.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const rawAddress = searchParams.get('address');

  if (!rawAddress || !/^0x[0-9a-f]{64}$/i.test(rawAddress)) {
    return NextResponse.json({ error: 'Valid Aztec address required (0x + 64 hex chars)' }, { status: 400 });
  }

  const address = rawAddress.toLowerCase();

  try {
    const txs = await prisma.transaction.findMany({
      where: {
        token: 'QDs',
        OR: [
          { fromAddress: address },
          { toAddress:   address },
        ],
      },
      orderBy: { timestamp: 'desc' },
      take: 50,
    });

    const formatted = txs.map(tx => ({
      id:          tx.id,
      txHash:      (tx.metadata as any)?.aztecTxHash ?? tx.txHash,
      type:        tx.toAddress === address ? 'receive' : 'send',
      txType:      tx.type,  // TRANSFER | SPEND | AIRDROP
      reason:      (tx.metadata as any)?.reason ?? null,
      amount:      tx.amount,
      fromAddress: tx.fromAddress,
      toAddress:   tx.toAddress,
      timestamp:   tx.timestamp.toISOString(),
      blockNumber: tx.blockNumber?.toString() ?? '0',
      explorerUrl: (tx.metadata as any)?.explorerUrl
        ? ((tx.metadata as any).explorerUrl as string).replace(/\/tx\/0x[a-fA-F0-9]+/, '')
        : 'https://testnet.aztecscan.xyz',
    }));

    return NextResponse.json({ transactions: formatted });
  } catch (err: any) {
    console.error('[Aztec Transactions]', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
