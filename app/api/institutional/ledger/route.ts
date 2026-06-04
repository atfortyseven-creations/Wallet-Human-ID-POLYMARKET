// app/api/institutional/ledger/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limit  = Math.min(Number(searchParams.get('limit')  ?? 100), 1000);
    const cursor = searchParams.get('cursor') ?? undefined;
    const filterInstitutional = searchParams.get('institutional') === 'true';

    const entries = await db.whaleActivity.findMany({
      where: {
        usdValue: { gte: '50000000' }, // $>50M
        ...(filterInstitutional && { institutional: true }),
      },
      orderBy: { timestamp: 'desc' },
      take: limit,
      cursor: cursor ? { id: cursor } : undefined,
      select: {
        id:          true,
        immutableId: true,
        timestamp:   true,
        entityName:  true,
        usdValue:    true,
        valueBTC:    true,
        chain:       true,
        transactionHash: true,
        institutional: true,
        confirmed:    true,
      },
    });

    const totalIndexed = await db.whaleActivity.count({
      where: { usdValue: { gte: '50000000' } }
    });

    return NextResponse.json({
      entries,
      nextCursor: entries.length === limit ? entries.at(-1)?.id : null,
      totalIndexed,
    });
  } catch (err: any) {
    console.error('[API_LEDGER_ERROR]', err);
    return NextResponse.json({ error: 'Internal Terminal Error', details: err.message }, { status: 500 });
  }
}
