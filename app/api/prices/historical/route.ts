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
    
    // Return empty state if API fails, avoid fictitious data at all costs
    return NextResponse.json(
      { 
        symbol: 'UNKNOWN',
        currency: 'USD',
        data: [],
        currentPrice: 0,
        error: "Real-time market data currently unavailable"
      }, 
      { status: 503 }
    );
  }
}
