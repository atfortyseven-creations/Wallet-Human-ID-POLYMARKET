import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sanitiseExplorerUrl } from '@/lib/aztec/client';

export const dynamic = 'force-dynamic';

/**
 * GET /api/humanidfi/activity?page=1&limit=50
 *
 * Returns ALL real transactions produced on humanidfi.com, sorted newest first.
 * Never returns mocked or external data — only records from our PostgreSQL database.
 * Used by the Registry "Humanity Ledger Activity" section.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const limit = Math.min(50, parseInt(searchParams.get('limit') || '50', 10));
  const type = searchParams.get('type') || undefined;

  try {
    const where: any = {
      token: { in: ['ATOMIC_LOG', 'QDs'] }
    };
    if (type) where.type = type;

    const [total, txs] = await Promise.all([
      prisma.transaction.count({ where }),
      prisma.transaction.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          txHash: true,
          type: true,
          status: true,
          amount: true,
          token: true,
          fromAddress: true,
          toAddress: true,
          timestamp: true,
          chainId: true,
          blockNumber: true,
          metadata: true,
        }
      })
    ]);

    const formatted = txs.map(tx => {
      const meta = (tx.metadata as any) || {};
        // sanitiseExplorerUrl fixes old /tx/ paths stored in DB and virtual hashes that 404 on AztecScan.
        // AztecScan SPA uses /tx-effect/:hash — /tx/ does not exist and always shows "Page does not exist".
        const rawUrl = (tx.metadata as any)?.explorerUrl ?? null;
        const safeExplorerUrl = sanitiseExplorerUrl(rawUrl);

        return {
          id: tx.id,
          txHash: tx.txHash,
          type: tx.type,
          status: tx.status,
          amount: tx.amount,
          token: tx.token,
          fromAddress: tx.fromAddress,
          toAddress: tx.toAddress,
          timestamp: tx.timestamp.toISOString(),
          chainId: tx.chainId,
          blockNumber: tx.blockNumber?.toString() ?? '0',
          explorerUrl: safeExplorerUrl,
          provenance: meta.provenance === true,
        fingerprint: meta.fingerprint ?? null,
        actionDetails: meta.actionDetails ?? null,
      };
    });

    return NextResponse.json({
      transactions: formatted,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err: any) {
    console.error('[HumanIDFi Activity]', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
