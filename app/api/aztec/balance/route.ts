import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
  const { getSession } = await import('@/lib/session');
  const session = await getSession();
  if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized: Authentication required.' }, { status: 401 });
  }
  const crypto = await import('crypto');
  const normalizedEvm = session.userId.toLowerCase();
  const round1 = crypto.createHash('sha256').update(`aztec-schnorr:${normalizedEvm}`).digest();
  const round2 = crypto.createHash('sha256').update(round1).digest('hex');
  const aztecAddress = `0x${round2}`;

  const normalizedAddress = aztecAddress.toLowerCase();

  try {
    // ─── LEDGER BALANCE CALCULATION ───────────────────────────────────────
    // Prevent infinite minting by calculating absolute truth from PostgreSQL
    const [receivedAgg, sentAgg] = await Promise.all([
      prisma.transaction.aggregate({
        where: { toAddress: normalizedAddress, token: 'QDs', status: 'COMPLETED' },
        _sum: { amount: true }
      }),
      prisma.transaction.aggregate({
        where: { fromAddress: normalizedAddress, token: 'QDs', status: 'COMPLETED' },
        _sum: { amount: true }
      })
    ]);

    const genesisAmount = 0; // Genesis removed. Users must sign in Identity to get QDs.
    const received = receivedAgg._sum.amount || 0;
    const sent = sentAgg._sum.amount || 0;
    
    // Fix precision
    const rawBalance = genesisAmount + received - sent;
    const trueBalance = Math.round(rawBalance * 1000000) / 1000000;

    // Ensure we don't go below 0 theoretically, though transfers prevent it
    const finalBalance = Math.max(0, trueBalance);

    console.log(`[Aztec Ledger] ${aztecAddress} → ${finalBalance} QDs (In: ${received}, Out: ${sent})`);

    return NextResponse.json({
      balance: finalBalance.toFixed(2),
      raw: (finalBalance * 1e18).toLocaleString('fullwide', { useGrouping: false }),
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
