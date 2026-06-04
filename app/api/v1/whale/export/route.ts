import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateApiKey, logApiRequest } from '@/lib/api-guard';

export const dynamic = 'force-dynamic';

/**
 * @api {get} /api/v1/whale/export Export historical data to CSV
 */
export async function GET(req: NextRequest) {
  const endpoint = '/api/v1/whale/export';
  
  const auth = await validateApiKey(req);
  if (!auth.valid || !auth.subscription) {
    return NextResponse.json({ error: auth.error }, { status: auth.statusCode || 401 });
  }

  const { subscription } = auth;
  
  // Elite only
  if (subscription.tier !== 'Elite') {
    return NextResponse.json({ 
      error: 'Access denied. CSV Export is an Elite exclusive feature.' 
    }, { status: 403 });
  }

  try {
    const searchParams = req.nextUrl.searchParams;
    const days = Math.min(parseInt(searchParams.get('days') || '30'), 365);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const events = await (prisma as any).globalWhaleEvent.findMany({
      where: {
        timestamp: { gte: startDate }
      },
      orderBy: { timestamp: 'desc' },
      take: 10000 // Limit to 10k rows per export for performance
    });

    // Generate CSV
    const headers = ['id', 'timestamp', 'hash', 'wallet', 'token', 'amount', 'usd_value', 'action', 'dex'].join(',');
    const rows = events.map((e: any) => [
      e.id,
      e.timestamp.toISOString(),
      e.hash,
      e.wallet,
      e.token,
      e.amount,
      e.usdValue,
      e.action,
      e.dex || 'N/A'
    ].map(v => `"${v}"`).join(','));

    const csvContent = [headers, ...rows].join('\n');

    await logApiRequest(req, subscription.id, endpoint, 200);

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="wac_whale_export_${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });

  } catch (error: any) {
    console.error('[EXPORT API] Error:', error);
    return NextResponse.json({ error: 'Failed to generate export' }, { status: 500 });
  }
}

