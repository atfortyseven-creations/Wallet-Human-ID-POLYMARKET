import { NextRequest, NextResponse } from 'next/server';

/**
 * CoinGecko Historical Price Data API
 * Free tier: 50 calls/minute
 */

interface PriceDataPoint {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface HistoricalResponse {
  symbol: string;
  currency: string;
  data: PriceDataPoint[];
  currentPrice: number;
}

// CoinGecko coin ID mapping
const COIN_MAP: Record<string, string> = {
  'ETH': 'ethereum',
  'BTC': 'bitcoin',
  'MATIC': 'matic-network',
  'ARB': 'arbitrum',
  'OP': 'optimism',
  'BASE': 'ethereum', // Base uses ETH
  'USDC': 'usd-coin',
  'USDT': 'tether',
  'DAI': 'dai',
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol')?.toUpperCase() || 'ETH';
    const days = parseInt(searchParams.get('days') || '7');
    const currency = searchParams.get('currency') || 'usd';

    const coinId = COIN_MAP[symbol];
    if (!coinId) {
      return NextResponse.json(
        { error: `Unsupported symbol: ${symbol}` },
        { status: 400 }
      );
    }

    // CoinGecko API (free tier)
    const baseUrl = 'https://api.coingecko.com/api/v3';
    
    // Fetch OHLC data
    const ohlcUrl = `${baseUrl}/coins/${coinId}/ohlc?vs_currency=${currency}&days=${days}`;
    const ohlcRes = await fetch(ohlcUrl, {
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!ohlcRes.ok) {
      throw new Error('Failed to fetch OHLC data');
    }

    const ohlcData = await ohlcRes.json();
    
    // Transform to our format
    const priceData: PriceDataPoint[] = ohlcData.map((point: any[]) => ({
      timestamp: point[0],
      open: point[1],
      high: point[2],
      low: point[3],
      close: point[4],
      volume: 0, // OHLC endpoint doesn't include volume
    }));

    // Get current price
    const currentPriceUrl = `${baseUrl}/simple/price?ids=${coinId}&vs_currencies=${currency}`;
    const priceRes = await fetch(currentPriceUrl, {
      next: { revalidate: 60 },
    });
    const currentPriceRaw = await priceRes.json();
    const currentPrice = currentPriceRaw[coinId]?.[currency] || 0;

    const response: HistoricalResponse = {
      symbol,
      currency: currency.toUpperCase(),
      data: priceData,
      currentPrice,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Price fetch error:', error);
    
    // Return demo data if API fails
    return NextResponse.json(getDemoData());
  }
}

function getDemoData(): HistoricalResponse {
  const now = Date.now();
  const data: PriceDataPoint[] = [];
  
  // Generate demo data for last 7 days
  for (let i = 6; i >= 0; i--) {
    const timestamp = now - (i * 24 * 60 * 60 * 1000);
    const basePrice = 3200 + Math.random() * 200;
    
    data.push({
      timestamp,
      open: basePrice,
      high: basePrice + Math.random() * 100,
      low: basePrice - Math.random() * 100,
      close: basePrice + (Math.random() - 0.5) * 50,
      volume: Math.random() * 1000000,
    });
  }

  return {
    symbol: 'ETH',
    currency: 'USD',
    data,
    currentPrice: 3250,
  };
}
