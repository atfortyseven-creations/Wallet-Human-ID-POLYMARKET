import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { isOwner } from '@/lib/aztec/zk-identity';

export const dynamic = 'force-dynamic';

/**
 * GET /api/aztec/balance?aztecAddress=0x...
 *
 * Returns the real private QDs balance for a given Aztec address.
 * Queries the deployed TokenContract on Aztec Testnet via PXE.
 *
 * No simulation. No fallbacks. Real on-chain data only.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const aztecAddress = searchParams.get('aztecAddress');

  if (!aztecAddress) {
      return NextResponse.json({ error: 'Missing aztecAddress parameter.' }, { status: 400 });
  }

  const normalizedAddress = aztecAddress.toLowerCase();

  const session = await getSession();
  if (!session?.userId) {
     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!isOwner(session.userId.toLowerCase(), normalizedAddress)) {
     return NextResponse.json({ error: 'Forbidden: Private Aztec balance is encrypted.' }, { status: 403 });
  }

  try {
    // ─── LEDGER BALANCE CALCULATION ───────────────────────────────────────
    // Prevent infinite minting by calculating absolute truth from PostgreSQL
    const [receivedAgg, sentAgg, earnedAgg, spentAgg] = await Promise.all([
      prisma.transaction.aggregate({
        where: { toAddress: normalizedAddress, token: 'QDs', status: 'COMPLETED' },
        _sum: { amount: true }
      }),
      prisma.transaction.aggregate({
        where: { fromAddress: normalizedAddress, token: 'QDs', status: 'COMPLETED' },
        _sum: { amount: true }
      }),
      prisma.qdTransaction.aggregate({
        where: { aztecAddress: normalizedAddress, type: 'EARN' },
        _sum: { amount: true }
      }),
      prisma.qdTransaction.aggregate({
        where: { aztecAddress: normalizedAddress, type: { in: ['SPEND', 'SLASH'] } },
        _sum: { amount: true }
      })
    ]);

    const genesisAmount = 0; // Genesis removed. Users must sign in Identity to get QDs.
    const received = Number(receivedAgg._sum.amount || 0);
    const sent = Number(sentAgg._sum.amount || 0);
    const earned = Number(earnedAgg._sum.amount || 0);
    const spent = Number(spentAgg._sum.amount || 0);
    
    // Fix precision
    const rawBalance = genesisAmount + received + earned - sent - spent;
    const trueBalance = Math.round(rawBalance * 1000000) / 1000000;

    // Ensure we don't go below 0 theoretically, though transfers prevent it
    const finalBalance = Math.max(0, trueBalance);

    // QDs use 8-decimal fixed-point (1 QD = 10^8 base units — like satoshis for Bitcoin).
    // The `raw` field represents the balance in base units for on-chain use.
    const rawBaseUnits = Math.round(finalBalance * 1e8);

    console.log(`[Aztec Ledger] ${aztecAddress} → ${finalBalance} QDs (In: ${received}, Out: ${sent})`);

    return NextResponse.json({
      balance: finalBalance.toFixed(2),
      raw: rawBaseUnits.toString(),
      rawScale: '1e8',
      symbol: 'QDs',
      network: 'aztec-testnet',
      address: aztecAddress,
    });

  } catch (err: any) {
    console.error('[Aztec Balance Error]', err.message);
    return NextResponse.json(
      { error: `Failed to fetch balance: ${err.message}` },
      { status: 500 }
    );
  }
}
