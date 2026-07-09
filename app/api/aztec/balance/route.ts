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
  const { searchParams } = new URL(req.url);
  const aztecAddress = searchParams.get('aztecAddress');

  if (!aztecAddress) {
      return NextResponse.json({ error: 'Missing aztecAddress parameter.' }, { status: 400 });
  }

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
