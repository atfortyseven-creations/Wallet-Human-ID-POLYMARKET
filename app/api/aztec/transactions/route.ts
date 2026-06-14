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
  const { getSession } = await import('@/lib/session');
  const session = await getSession();
  if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized: Authentication required.' }, { status: 401 });
  }
  const crypto = await import('crypto');
  const normalizedEvm = session.userId.toLowerCase();
  const round1 = crypto.createHash('sha256').update(`aztec-schnorr:${normalizedEvm}`).digest();
  const round2 = crypto.createHash('sha256').update(round1).digest('hex');
  const address = `0x${round2}`;

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
      id:          tx.id,          // ← unique PG row ID — used for client deduplication
      txHash:      (tx.metadata as any)?.aztecTxHash ?? tx.txHash, // display only
      type:        tx.toAddress === address ? 'receive' : 'send',
      amount:      tx.amount,
      fromAddress: tx.fromAddress,
      toAddress:   tx.toAddress,
      timestamp:   tx.timestamp.toISOString(),
      blockNumber: tx.blockNumber?.toString() ?? '0',
      explorerUrl: (tx.metadata as any)?.explorerUrl ?? `https://testnet.aztecscan.xyz/tx/${(tx.metadata as any)?.aztecTxHash ?? tx.txHash}`,
    }));

    return NextResponse.json({ transactions: formatted });
  } catch (err: any) {
    console.error('[Aztec Transactions]', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
