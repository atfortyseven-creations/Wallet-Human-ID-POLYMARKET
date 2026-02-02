import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const cgKey = process.env.NEXT_PUBLIC_COINGECKO_KEY;
    const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=1h,24h,7d,30d,1y`;
    
    const headers: Record<string, string> = {};
    if (cgKey) {
      headers['x-cg-demo-api-key'] = cgKey;
    }

    const response = await fetch(url, { 
      headers,
      next: { revalidate: 60 } // Cache for 1 minute
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ error: 'Failed to fetch from CoinGecko', details: errorText }, { status: response.status });
    }

    const data = await response.json();

    // Map the data to a cleaner format for the frontend
    const bubblesData = data.map((coin: any) => ({
      id: coin.id,
      symbol: coin.symbol.toUpperCase(),
      name: coin.name,
      image: coin.image,
      current_price: coin.current_price,
      market_cap: coin.market_cap,
      price_change_1h: coin.price_change_percentage_1h_in_currency || 0,
      price_change_24h: coin.price_change_percentage_24h_in_currency || 0,
      price_change_7d: coin.price_change_percentage_7d_in_currency || 0,
      price_change_30d: coin.price_change_percentage_30d_in_currency || 0,
      price_change_1y: coin.price_change_percentage_1y_in_currency || 0,
    }));

    return NextResponse.json({ bubbles: bubblesData });
  } catch (error: any) {
    console.error('Bubbles API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error', message: error.message }, { status: 500 });
  }
}
