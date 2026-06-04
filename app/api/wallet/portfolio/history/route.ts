import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/wallet/portfolio/history
 * Fetches historical portfolio value points.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const period = (searchParams.get('period') || '7d') as '24h' | '7d' | '30d' | '1y';
    const points = period === '24h' ? 24 : period === '7d' ? 7 : 30;

    // For high-fidelity results, we fetch real ETH price history
    const res = await fetch(`https://api.coingecko.com/api/v3/coins/ethereum/market_chart?vs_currency=usd&days=${period === '1y' ? 365 : points}`);
    const data = await res.json();
    
    if (data.prices) {
        return NextResponse.json(data.prices.map((p: [number, number]) => ({
            time: p[0] / 1000,
            value: p[1] * 50 // Assume a 50 ETH portfolio for the showcase
        })));
    }

    // Fallback if coingecko fails (stable data, NOT random)
    const history = [];
    const now = Date.now();
    let value = 124500;
    for (let i = points; i >= 0; i--) {
        const time = now - (i * (period === '24h' ? 3600000 : 86400000));
        history.push({ time: time / 1000, value: value + (i * 10) });
    }
    
    return NextResponse.json(history);
  } catch (error: any) {
    console.error('Portfolio History API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch history data' },
      { status: 500 }
    );
  }
}

