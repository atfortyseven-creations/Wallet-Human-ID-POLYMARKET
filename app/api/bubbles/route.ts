import { NextResponse, NextRequest } from 'next/server';
import rateLimit from '@/lib/rate-limit';

const limiter = rateLimit({
    interval: 60 * 1000,
    uniqueTokenPerInterval: 500,
});

export async function GET(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'anonymous';
    try {
        await limiter.check(30, ip); // 30 requests per minute
    } catch {
        return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }
    const cgKey = process.env.NEXT_PUBLIC_COINGECKO_KEY || process.env.COINGECKO_KEY;
    console.log('Fetching Bubbles from CoinGecko...');
    
    const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=true&price_change_percentage=1h,24h,7d,30d,1y`;
    
    const headers: Record<string, string> = {
      'Accept': 'application/json',
    };
    
    if (cgKey) {
      headers['x-cg-demo-api-key'] = cgKey;
      headers['x-cg-api-key'] = cgKey;
    }

    const response = await fetch(url, { 
      headers,
      next: { revalidate: 1 } // Real-time updates every second
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`CoinGecko API Error ${response.status}:`, errorText);
      return NextResponse.json({ 
        error: 'Error de CoinGecko', 
        status: response.status,
        details: errorText 
      }, { status: response.status });
    }

    const data = await response.json();

    if (!Array.isArray(data) || data.length === 0) {
      return NextResponse.json({ error: 'No se encontraron datos en CoinGecko' }, { status: 404 });
    }

    // Conversion rate USD to EUR (approximate for demo or could fetch once)
    const eurRate = 0.93;

    // Map the data to a cleaner format with sparklines
    const bubblesData = data.map((coin: any) => ({
      id: coin.id,
      symbol: (coin.symbol || '').toUpperCase(),
      name: coin.name || 'Unknown',
      image: coin.image || '',
      current_price: coin.current_price || 0,
      current_price_eur: (coin.current_price || 0) * eurRate,
      market_cap: coin.market_cap || 0,
      total_volume: coin.total_volume || 0,
      high_24h: coin.high_24h || 0,
      low_24h: coin.low_24h || 0,
      price_change_1h: coin.price_change_percentage_1h_in_currency || 0,
      price_change_24h: coin.price_change_percentage_24h_in_currency || coin.price_change_percentage_24h || 0,
      price_change_7d: coin.price_change_percentage_7d_in_currency || 0,
      price_change_30d: coin.price_change_percentage_30d_in_currency || 0,
      price_change_1y: coin.price_change_percentage_1y_in_currency || 0,
      sparkline: coin.sparkline_in_7d?.price || [],
      market_cap_rank: coin.market_cap_rank || 0,
    }));

    return NextResponse.json({ bubbles: bubblesData });
  } catch (error: any) {
    console.error('Bubbles API Internal Error:', error);
    return NextResponse.json({ error: 'Internal Server Error', message: error.message }, { status: 500 });
  }
}
