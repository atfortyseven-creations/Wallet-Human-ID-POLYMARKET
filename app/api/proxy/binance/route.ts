import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol');
  const interval = searchParams.get('interval') || '1m';
  const limit = searchParams.get('limit') || '500';

  if (!symbol) {
    return NextResponse.json({ error: 'Symbol is required' }, { status: 400 });
  }

  try {
    const res = await fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`, {
        next: { revalidate: 30 }
    });
    
    if (!res.ok) {
      if (res.status === 451) {
        return NextResponse.json({ 
          error: 'Region Restricted', 
          details: 'Binance API is not available in your region.',
          restricted: true 
        }, { status: 451 });
      }
      const errorText = await res.text();
      return NextResponse.json({ error: `Binance API error: ${res.status}`, details: errorText }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=59'
      }
    });
  } catch (error) {
    console.error('Binance proxy error:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}

