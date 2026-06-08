import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

/**
 * POST /api/aztec/migrate-identity
 *
 * Migration endpoint for users who received QDs at their raw EVM address
 * (via the old /api/aztec/mintIdentity endpoint) instead of their derived
 * Aztec address (SHA-256 of EVM address).
 *
 * This ensures the portfolio tab (which queries by derived Aztec address)
 * correctly shows the balance.
 *
 * Body: { evmAddress: string }
 * Returns: { migrated: boolean, balance: number }
 */
export async function POST(req: Request) {
  try {
    const { evmAddress } = await req.json();

    if (!evmAddress || typeof evmAddress !== 'string') {
      return NextResponse.json({ error: 'evmAddress is required' }, { status: 400 });
    }

    const normalizedEvm = evmAddress.toLowerCase();

    // Derive the canonical Aztec address (same algorithm as /api/aztec/derive-address)
    const round1 = crypto.createHash('sha256').update(`aztec-schnorr:${normalizedEvm}`).digest();
    const round2 = crypto.createHash('sha256').update(round1).digest('hex');
    const derivedAztecAddress = `0x${round2}`;

    // Check if there are any QDs transactions at the RAW EVM address (old format)
    const oldMintTxs = await prisma.transaction.findMany({
      where: {
        toAddress: normalizedEvm,
        token: 'QDs',
        type: 'MINT_IDENTITY',
        status: 'COMPLETED',
      }
    });

    // Check if the derived Aztec address already has an airdrop
    const existingAirdrop = await prisma.transaction.findFirst({
      where: {
        toAddress: derivedAztecAddress,
        token: 'QDs',
        type: 'AIRDROP',
        status: 'COMPLETED',
      }
    });

    let migrated = false;

    if (oldMintTxs.length > 0 && !existingAirdrop) {
      // Migrate: create a new AIRDROP transaction at the correct derived address
      const txCount = await prisma.transaction.count();
      const blockNumber = 103860 + txCount + 1;
      const payload = `migrate-${derivedAztecAddress}-10-${Date.now()}-${blockNumber}`;
      const txHash = '0x' + crypto.createHash('sha256').update(payload).digest('hex');

      await prisma.transaction.create({
        data: {
          txHash,
          status: 'COMPLETED',
          type: 'AIRDROP',
          amount: 10,
          token: 'QDs',
          tokenSymbol: 'QDs',
          fromAddress: '0x0000000000000000000000000000000000000000000000000000000000000000',
          toAddress: derivedAztecAddress,
          blockNumber: BigInt(blockNumber),
          chainId: 2151908,
          metadata: {
            aztecTxHash: txHash,
            explorerUrl: `https://testnet.aztecscan.xyz/tx-effects/${txHash}`,
            network: 'aztec-testnet',
            note: 'Migrated from MINT_IDENTITY (EVM address) to AIRDROP (Aztec derived address)',
            migratedFromEvm: normalizedEvm,
          },
        },
      });

      migrated = true;
      console.log(`[Aztec Migrate] ✅ Migrated ${normalizedEvm} → ${derivedAztecAddress}`);
    }

    // Return current balance at the derived address
    const [receivedAgg, sentAgg] = await Promise.all([
      prisma.transaction.aggregate({
        where: { toAddress: derivedAztecAddress, token: 'QDs', status: 'COMPLETED' },
        _sum: { amount: true }
      }),
      prisma.transaction.aggregate({
        where: { fromAddress: derivedAztecAddress, token: 'QDs', status: 'COMPLETED' },
        _sum: { amount: true }
      })
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
        : 'No QDs found to migrate'
    });

  } catch (err: any) {
    console.error('[Aztec Migrate Error]', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
