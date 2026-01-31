import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getPortfolio, getPortfolioHistory, getPortfolioMetrics, exportPortfolioToCSV } from '@/lib/wallet/portfolio';

/**
 * GET /api/wallet/portfolio?address=xxx
 * Get portfolio summary
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('address');
    const period = searchParams.get('period') as '24h' | '7d' | '30d' | '1y';
    const format = searchParams.get('format');

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Missing required parameter: address' },
        { status: 400 }
      );
    }

    const [portfolio, metrics, history] = await Promise.all([
      getPortfolio(walletAddress),
      getPortfolioMetrics(walletAddress),
      period ? getPortfolioHistory(walletAddress, period) : Promise.resolve([]),
    ]);

    // Export as CSV if requested
    if (format === 'csv') {
      const csv = exportPortfolioToCSV(portfolio);
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="portfolio-${Date.now()}.csv"`,
        },
      });
    }

    return NextResponse.json({ portfolio, metrics, history });
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    return NextResponse.json(
      { error: 'Failed to fetch portfolio' },
      { status: 500 }
    );
  }
}
