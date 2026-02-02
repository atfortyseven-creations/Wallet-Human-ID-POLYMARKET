import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const cgKey = process.env.NEXT_PUBLIC_COINGECKO_KEY || process.env.COINGECKO_KEY;
    console.log('Fetching Bubbles from CoinGecko...');
    
    const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=1h,24h,7d,30d,1y`;
    
    const headers: Record<string, string> = {
      'Accept': 'application/json',
    };
    
    if (cgKey) {
      headers['x-cg-demo-api-key'] = cgKey;
      headers['x-cg-api-key'] = cgKey;
    }

    const response = await fetch(url, { 
      headers,
      next: { revalidate: 60 } 
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

    // Map the data to a cleaner format
    const bubblesData = data.map((coin: any) => ({
      id: coin.id,
      symbol: (coin.symbol || '').toUpperCase(),
      name: coin.name || 'Unknown',
      image: coin.image || '',
      current_price: coin.current_price || 0,
      market_cap: coin.market_cap || 0,
      total_volume: coin.total_volume || 0,
      high_24h: coin.high_24h || 0,
      low_24h: coin.low_24h || 0,
      price_change_1h: coin.price_change_percentage_1h_in_currency || 0,
      price_change_24h: coin.price_change_percentage_24h_in_currency || coin.price_change_percentage_24h || 0,
      price_change_7d: coin.price_change_percentage_7d_in_currency || 0,
      price_change_30d: coin.price_change_percentage_30d_in_currency || 0,
      price_change_1y: coin.price_change_percentage_1y_in_currency || 0,
    }));

    return NextResponse.json({ bubbles: bubblesData });
  } catch (error: any) {
    console.error('Bubbles API Internal Error:', error);
    return NextResponse.json({ error: 'Internal Server Error', message: error.message }, { status: 500 });
  }
}
