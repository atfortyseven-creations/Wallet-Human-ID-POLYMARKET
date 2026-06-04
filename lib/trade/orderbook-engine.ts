/**
 * PROFESSIONAL ORDER BOOK ENGINE
 * - In-memory L2 order book with sub-100ms updates
 * - Price level aggregation
 * - Depth calculation
 * - Best bid/ask tracking
 */

export interface PriceLevel {
  price: number;
  quantity: number;
  total: number; // Cumulative volume
}

export interface OrderBookSnapshot {
  bids: PriceLevel[];
  asks: PriceLevel[];
  lastUpdateId: number;
  spread: number;
  spreadPercent: number;
  midPrice: number;
}

export class OrderBookEngine {
  private bids: Map<number, number> = new Map(); // price -> quantity
  private asks: Map<number, number> = new Map();
  private lastUpdateId = 0;
  private maxDepth = 20; // Show top 20 levels

  /**
   * Process order book snapshot
   */
  processSnapshot(data: { bids: [string, string][]; asks: [string, string][]; lastUpdateId: number }) {
    this.bids.clear();
    this.asks.clear();

    data.bids.forEach(([price, qty]) => {
      this.bids.set(parseFloat(price), parseFloat(qty));
    });

    data.asks.forEach(([price, qty]) => {
      this.asks.set(parseFloat(price), parseFloat(qty));
    });

    this.lastUpdateId = data.lastUpdateId;
  }

  /**
   * Process incremental update (delta)
   */
  processUpdate(data: { bids: [string, string][]; asks: [string, string][]; lastUpdateId: number }) {
    if (data.lastUpdateId <= this.lastUpdateId) {
      return; // Skip old updates
    }

    data.bids.forEach(([price, qty]) => {
      const p = parseFloat(price);
      const q = parseFloat(qty);
      
      if (q === 0) {
        this.bids.delete(p); // Remove level
      } else {
        this.bids.set(p, q); // Update level
      }
    });

    data.asks.forEach(([price, qty]) => {
      const p = parseFloat(price);
      const q = parseFloat(qty);
      
      if (q === 0) {
        this.asks.delete(p);
      } else {
        this.asks.set(p, q);
      }
    });

    this.lastUpdateId = data.lastUpdateId;
  }

  /**
   * Get formatted order book snapshot
   */
  getSnapshot(): OrderBookSnapshot {
    const sortedBids = Array.from(this.bids.entries())
      .sort((a, b) => b[0] - a[0]) // Descending
      .slice(0, this.maxDepth);

    const sortedAsks = Array.from(this.asks.entries())
      .sort((a, b) => a[0] - b[0]) // Ascending
      .slice(0, this.maxDepth);

    // Calculate cumulative totals
    let bidTotal = 0;
    const bids: PriceLevel[] = sortedBids.map(([price, quantity]) => {
      bidTotal += quantity;
      return { price, quantity, total: bidTotal };
    });

    let askTotal = 0;
    const asks: PriceLevel[] = sortedAsks.map(([price, quantity]) => {
      askTotal += quantity;
      return { price, quantity, total: askTotal };
    });

    const bestBid = bids[0]?.price || 0;
    const bestAsk = asks[0]?.price || 0;
    const spread = bestAsk - bestBid;
    const spreadPercent = (spread / bestBid) * 100;
    const midPrice = (bestBid + bestAsk) / 2;

    return {
      bids,
      asks,
      lastUpdateId: this.lastUpdateId,
      spread,
      spreadPercent,
      midPrice
    };
  }

  /**
   * Get best bid and ask
   */
  getBestBidAsk(): { bid: number; ask: number } {
    const bestBid = Math.max(...Array.from(this.bids.keys()));
    const bestAsk = Math.min(...Array.from(this.asks.keys()));
    return { bid: bestBid, ask: bestAsk };
  }

  /**
   * Calculate total volume at price range
   */
  getVolumeInRange(minPrice: number, maxPrice: number, side: 'bid' | 'ask'): number {
    const map = side === 'bid' ? this.bids : this.asks;
    let total = 0;

    map.forEach((qty, price) => {
      if (price >= minPrice && price <= maxPrice) {
        total += qty;
      }
    });

    return total;
  }

  /**
   * Clear order book
   */
  clear() {
    this.bids.clear();
    this.asks.clear();
    this.lastUpdateId = 0;
  }
}

