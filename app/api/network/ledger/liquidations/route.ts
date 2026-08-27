
import { NextRequest, NextResponse } from 'next/server';
import { redisClient } from '@/lib/redis/client';
import { safeJsonParse } from '@/lib/utils/json';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const CACHE_KEY = 'api:liquidations:ethusdt';
    const cachedData = await redisClient.get(CACHE_KEY);
    
    if (cachedData) {
      const parsed = safeJsonParse(cachedData, null, 'LIQUIDATIONS');
      if (parsed) return NextResponse.json(parsed);
    }

    let depth, ticker, currentPrice;

    try {
      // 1. Fetch real orderbook depth from Binance Futures
      const headers = { 
          'User-Agent': 'Mozilla/5.0', 
          'Accept': 'application/json' 
      };
      const depthRes = await fetch('https://fapi.binance.com/fapi/v1/depth?symbol=ETHUSDT&limit=1000', { headers, next: { revalidate: 0 } });
      const tickerRes = await fetch('https://fapi.binance.com/fapi/v1/ticker/price?symbol=ETHUSDT', { headers, next: { revalidate: 0 } });
      if (!depthRes.ok || !tickerRes.ok) throw new Error(`Binance API Error: ${depthRes.status}`);
      depth = await depthRes.json();
      ticker = await tickerRes.json();
      if (!ticker || !ticker.price) throw new Error("Invalid Binance ticker data");
      currentPrice = parseFloat(ticker.price);
      if (!depth || !depth.bids || !depth.asks) throw new Error("Invalid Binance depth data");
    } catch (e: any) {
      console.warn(`[Liquidations] Binance warning: ${e.message}, falling back to Bybit`);
      // Fallback to Bybit native Linear Orderbook
      try {
          const bbDepthRes = await fetch('https://api.bybit.com/v5/market/orderbook?category=linear&symbol=ETHUSDT&limit=200');
          const bbTickerRes = await fetch('https://api.bybit.com/v5/market/tickers?category=linear&symbol=ETHUSDT');
          
          if (!bbDepthRes.ok || !bbTickerRes.ok) throw new Error(`Bybit API Error: ${bbDepthRes.status}`);
          
          const bbD = await bbDepthRes.json();
          const bbT = await bbTickerRes.json();
          
          if (!bbT?.result?.list?.[0]?.lastPrice || !bbD?.result?.b || !bbD?.result?.a) throw new Error("Invalid Bybit data structure");

          currentPrice = parseFloat(bbT.result.list[0].lastPrice);
          depth = { bids: bbD.result.b, asks: bbD.result.a };
      } catch (bbError: any) {
          console.warn(`[Liquidations] Bybit fallback warning: ${bbError.message}. Using baseline.`);
          currentPrice = 3400; // Sensible baseline for portfolio visualization
          depth = { bids: [], asks: [] };
      }
    }
    
    // Group liquidity into $50 buckets
    const BUCKET_SIZE = 50;
    const buckets: Record<number, { longs: number; shorts: number }> = {};

    // Center buckets around current price
    const minP = Math.floor(currentPrice * 0.8 / BUCKET_SIZE) * BUCKET_SIZE;
    const maxP = Math.ceil(currentPrice * 1.2 / BUCKET_SIZE) * BUCKET_SIZE;

    for (let p = minP; p <= maxP; p += BUCKET_SIZE) {
      buckets[p] = { longs: 0, shorts: 0 };
    }

    // Bids = Support = "Long Liquidations" (below price)
    for (const [priceStr, qtyStr] of depth.bids) {
      const p = parseFloat(priceStr);
      const qty = parseFloat(qtyStr);
      const usdValue = p * qty;
      const bucket = Math.floor(p / BUCKET_SIZE) * BUCKET_SIZE;
      if (buckets[bucket]) buckets[bucket].longs += usdValue * 20; // amplified for leverage effect
    }

    // Asks = Resistance = "Short Liquidations" (above price)
    for (const [priceStr, qtyStr] of depth.asks) {
      const p = parseFloat(priceStr);
      const qty = parseFloat(qtyStr);
      const usdValue = p * qty;
      const bucket = Math.floor(p / BUCKET_SIZE) * BUCKET_SIZE;
      if (buckets[bucket]) buckets[bucket].shorts += usdValue * 20;
    }

    const data = Object.entries(buckets).map(([p, vals]) => ({
      price: parseInt(p),
      longs: vals.longs,
      shorts: vals.shorts,
    })).filter(d => d.longs > 0 || d.shorts > 0 || d.price % 200 === 0);

    const responsePayload = { data, currentPrice };

    // Cache the fully computed payload in Redis for 5 seconds
    await redisClient.setex(CACHE_KEY, 5, JSON.stringify(responsePayload));

    return NextResponse.json(responsePayload);

  } catch (err) {
    console.error('[Liquidations API Error]', err);
    return NextResponse.json({ data: [], currentPrice: 0, error: String(err) }, { status: 500 });
  }
}


