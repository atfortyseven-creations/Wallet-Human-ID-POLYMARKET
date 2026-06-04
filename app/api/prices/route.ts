import { NextRequest, NextResponse } from 'next/server';

// [PRODUCTION] Real-time cryptocurrency price API endpoint
// Fetches prices from CoinGecko and caches them to avoid rate limits

interface PriceCache {
  prices: Record<string, number>;
  timestamp: number;
}

let priceCache: PriceCache | null = null;
const CACHE_DURATION = 15000; // 15 seconds  real-time institutional data

// CoinGecko ID mapping
const COIN_IDS: Record<string, string> = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  MATIC: 'matic-network',
  POL: 'matic-network', // POL is the same as MATIC
  USDC: 'usd-coin',
  USDT: 'tether',
  DAI: 'dai',
  WETH: 'weth',
  WBTC: 'wrapped-bitcoin'
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbolsParam = searchParams.get('symbols') || 'BTC,ETH,MATIC,USDC';
    const symbols = symbolsParam.split(',').map(s => s.trim().toUpperCase());

    // Check cache
    const now = Date.now();
    if (priceCache && (now - priceCache.timestamp) < CACHE_DURATION) {
      // Return cached prices for requested symbols
      const result: Record<string, number> = {};
      symbols.forEach(symbol => {
        if (priceCache!.prices[symbol] !== undefined) {
          result[symbol] = priceCache!.prices[symbol];
        }
      });
      
      return NextResponse.json(result, {
        headers: {
          'Cache-Control': 'public, s-maxage=15, stale-while-revalidate=10'
        }
      });
    }

    // Fetch fresh prices from CoinGecko
    const coinIds = symbols
      .map(symbol => COIN_IDS[symbol])
      .filter(Boolean)
      .join(',');

    if (!coinIds) {
      return NextResponse.json(
        { error: 'No valid symbols provided' },
        { status: 400 }
      );
    }

    const apiKey = process.env.NEXT_PUBLIC_COINGECKO_KEY || process.env.COINGECKO_KEY || '';
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coinIds}&vs_currencies=usd${apiKey ? `&x_cg_demo_api_key=${apiKey}` : ''}`,
      {
        headers: { 'Accept': 'application/json' },
        cache: 'no-store', // [REAL-TIME] bypass Next.js Data Cache entirely
        signal: AbortSignal.timeout(5000),
      }
    );

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data = await response.json();

    // Transform CoinGecko response to symbol-based format
    const prices: Record<string, number> = {};
    symbols.forEach(symbol => {
      const coinId = COIN_IDS[symbol];
      if (coinId && data[coinId]?.usd) {
        prices[symbol] = data[coinId].usd;
      }
    });

    // Update cache
    priceCache = {
      prices,
      timestamp: now
    };

    return NextResponse.json(prices, {
      headers: {
        'Cache-Control': 'public, s-maxage=15, stale-while-revalidate=10'
      }
    });

  } catch (error: unknown) {
    console.error('Price API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Return cached data if available, even if stale
    if (priceCache) {
      return NextResponse.json(priceCache.prices, {
        headers: {
          'Cache-Control': 'public, s-maxage=15, stale-while-revalidate=10',
          'X-Cache-Status': 'stale'
        }
      });
    }

    return NextResponse.json(
      { error: 'Failed to fetch prices', message: errorMessage },
      { status: 500 }
    );
  }
}

