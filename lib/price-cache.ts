const cache = new Map<string, { price: number; ts: number }>();
const TTL = 60_000; // 60 seconds
const ACTIVE_FETCHES = new Map<string, Promise<number>>();

export async function getPriceCached(coinId: string, symbol: string): Promise<number> {
  const hit = cache.get(coinId);
  if (hit && Date.now() - hit.ts < TTL) {
    return hit.price;
  }

  // Deduplicate inflight requests for the same coin
  if (ACTIVE_FETCHES.has(coinId)) {
    return ACTIVE_FETCHES.get(coinId)!;
  }

  const fetchPromise = (async () => {
    try {
      const res = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`,
        { signal: AbortSignal.timeout(3000) }
      );
      if (!res.ok) throw new Error('CoinGecko failed');
      const json = await res.json();
      const price = json[coinId]?.usd || 0;
      cache.set(coinId, { price, ts: Date.now() });
      return price;
    } catch {
      // Fallback
      const fallbacks: Record<string, number> = { ETH: 3300, BNB: 600, BTC: 86000, SOL: 145, MATIC: 0.7, LINK: 18 };
      const fallbackPrice = fallbacks[symbol] || 0;
      // Cache the fallback for a shorter time to not punish transient errors too long
      cache.set(coinId, { price: fallbackPrice, ts: Date.now() - TTL + 10000 });
      return fallbackPrice;
    } finally {
      ACTIVE_FETCHES.delete(coinId);
    }
  })();

  ACTIVE_FETCHES.set(coinId, fetchPromise);
  return fetchPromise;
}
