import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { serializePassport } from '@/lib/passport/serialize';

/**
 * GET /api/passport/public-registry
 *
 * Returns the most recent publicly confirmed (on-chain) product records.
 * Used by the Studio Provenance "All Records" tab and the public Aztec
 * ecosystem registry page.
 *
 * Query parameters:
 *   limit  — number of records to return (default 50, max 200)
 *   cursor — created-at ISO string for pagination (optional)
 *   batchId — filter by batch ID substring (optional)
 *   category — filter by category (optional)
 *   anchored — "true" to return only on-chain confirmed records (optional)
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 200);
  const cursor = searchParams.get('cursor') || undefined;
  const batchId = searchParams.get('batchId') || undefined;
  const category = searchParams.get('category') || undefined;
  const anchoredOnly = searchParams.get('anchored') === 'true';

  // Build where clause
  const where: Record<string, unknown> = {};

  if (anchoredOnly) {
    where.txHash = { not: null };
  }

  if (category) {
    where.category = { contains: category, mode: 'insensitive' };
  }

  // Batch ID is stored inside the JSON payload column
  // We do a JSON path query if the DB supports it (Postgres / SQLite JSON)
  if (batchId) {
    // Use Prisma's JSON filter for payload->batchId
    where.payload = {
      path: ['batchId'],
      string_contains: batchId,
    };
  }

  // Cursor-based pagination
  const cursorClause = cursor ? { createdAt: { lt: new Date(cursor) } } : {};

  const records = await prisma.productPassport.findMany({
    where: { ...where, ...cursorClause },
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: {
      events: {
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
    },
  });

  const serialized = records.map(serializePassport);

  const nextCursor =
    records.length === limit
      ? records[records.length - 1].createdAt.toISOString()
      : null;

  return NextResponse.json(
    {
      records: serialized,
      count: serialized.length,
      nextCursor,
    },
    {
      headers: {
        // Short public cache — the list is updated frequently
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
      },
    }
  );
}
