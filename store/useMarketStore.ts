import { create } from 'zustand';

interface OrderBookLevel {
  price: number;
  amount: number;
}

interface MarketState {
  currentPrice: number;
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
  setMarketPrice: (price: number) => void;
  setOrderBook: (bidsRaw: string[][], asksRaw: string[][]) => void;
}

export const useMarketStore = create<MarketState>((set) => ({
  currentPrice: 0,
  bids: [],
  asks: [],
  setMarketPrice: (price) => set({ currentPrice: price }),
  setOrderBook: (bidsRaw, asksRaw) => {
    try {
      // Process raw binance array format [["price", "qty"], ...] and take top 50 levels for performance
      const bids = bidsRaw.slice(0, 50).map(b => ({ price: parseFloat(b[0]), amount: parseFloat(b[1]) }));
      const asks = asksRaw.slice(0, 50).map(a => ({ price: parseFloat(a[0]), amount: parseFloat(a[1]) }));
      set({ bids, asks });
    } catch (err) {
      console.error("Store OrderBook parsing error:", err);
    }
  }
}));
