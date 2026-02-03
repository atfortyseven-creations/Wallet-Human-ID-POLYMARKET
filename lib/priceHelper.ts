/**
 * CoinGecko Price Helper
 * Real-time crypto price fetching with caching
 */

interface PriceCache {
  [symbol: string]: {
    price: number;
    timestamp: number;
  };
}

const priceCache: PriceCache = {};
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// CoinGecko coin ID mapping (expanded)
const COIN_ID_MAP: Record<string, string> = {
  'ETH': 'ethereum',
  'WETH': 'ethereum',
  'BTC': 'bitcoin',
  'MATIC': 'matic-network',
  'POL': 'matic-network',
  'ARB': 'arbitrum',
  'OP': 'optimism',
  'USDC': 'usd-coin',
  'USDT': 'tether',
  'DAI': 'dai',
};

/**
 * Get real-time price from CoinGecko API
 * FREE tier: No API key needed for simple price queries
 */
export async function getRealTimePrice(symbol: string): Promise<number> {
  const upperSymbol = symbol.toUpperCase();
  
  // Check cache first
  const cached = priceCache[upperSymbol];
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.price;
  }

  try {
    const coinId = COIN_ID_MAP[upperSymbol];
    
    if (!coinId) {
      console.warn(`No CoinGecko ID for symbol: ${symbol}`);
      return 0;
    }

    // CoinGecko free API - no key required
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`;
    
    const response = await fetch(url, {
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data = await response.json();
    const price = data[coinId]?.usd || 0;

    // Update cache
    priceCache[upperSymbol] = {
      price,
      timestamp: Date.now(),
    };

    return price;
  } catch (error) {
    console.error(`Failed to fetch price for ${symbol}:`, error);
    
    // Return cached value even if expired, or 0
    return cached?.price || 0;
  }
}

/**
 * Get multiple prices efficiently in single requests where possible
 */
export async function getBulkPrices(symbols: string[]): Promise<Record<string, number>> {
  if (symbols.length === 0) return {};

  const result: Record<string, number> = {};
  const coinIdsToFetch: string[] = [];
  const symbolToId: Record<string, string> = {};

  symbols.forEach(symbol => {
    const s = symbol.toUpperCase();
    const id = COIN_ID_MAP[s];
    if (id) {
        coinIdsToFetch.push(id);
        symbolToId[id] = s;
    } else {
        result[s] = 0;
    }
  });

  if (coinIdsToFetch.length === 0) return result;

  try {
    // Fetch in chunks of 50 to stay safe
    const CHUNK_SIZE = 50;
    for (let i = 0; i < coinIdsToFetch.length; i += CHUNK_SIZE) {
      const chunk = coinIdsToFetch.slice(i, i + CHUNK_SIZE);
      const ids = chunk.join(',');
      const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`;

      const response = await fetch(url);
      
      if (!response.ok) {
        const text = await response.text();
        if (text.includes('Throttled')) {
            console.warn('[CoinGecko] Bulk price request throttled.');
            continue; // Skip this chunk but keep going
        }
        throw new Error(`CoinGecko Bulk API error: ${response.status}`);
      }

      const data = await response.json();
      
      chunk.forEach(id => {
        const price = data[id]?.usd || 0;
        const sym = symbolToId[id];
        result[sym] = price;
        
        // Update cache
        priceCache[sym] = {
            price,
            timestamp: Date.now()
        };
      });
    }
  } catch (error) {
    console.error('Error fetching bulk prices:', error);
  }

  return result;
}
