import { create } from 'zustand';
import { Trade, OrderBook, Ticker } from './types';
import { toast } from 'sonner';
import { TRADING_PAIRS } from './pairs';

interface PairData {
  ticker: Ticker | null;
  recentTrades: Trade[];
}

interface TradeState {
  currentPair: string;
  
  // Multi-pair data structure
  pairData: Record<string, PairData>;
  
  // Current pair specific data
  orderBook: OrderBook | null;
  lastCandle: { time: number, open: number, high: number, low: number, close: number, volume: number } | null;
  activeOrders: Array<any>;
  positions: Array<any>;
  isLoadingPositions: boolean;
  snxAccountId: string | null;
  isHuman: boolean;
  activeTokenAddress: string | null;
  
  // Actions
  setPair: (pair: string, tokenAddress?: string) => void;
  
  // Multi-pair updates
  updateTicker: (symbol: string, ticker: Ticker) => void;
  addTrade: (symbol: string, trade: Trade) => void;
  
  // Current pair updates
  setOrderBook: (book: OrderBook) => void;
  updateCandle: (candle: any) => void;
  
  // API Actions
  fetchOrders: (address?: string) => Promise<void>;
  placeOrder: (order: { 
    symbol: string, 
    side: 'BUY' | 'SELL', 
    type: 'LIMIT' | 'MARKET', 
    quantity: number, 
    price: number,
    walletAddress?: string
  }) => Promise<any>;
  cancelOrder: (id: string) => Promise<void>;
  
  // Positions
  fetchPositions: (address?: string) => Promise<void>;
  startPositionsSyncer: (address: string) => () => void;
  
  // Onboarding & Sync
  fetchSnxAccount: (address: string) => Promise<void>;
  setSnxAccount: (address: string, accountId: string) => Promise<void>;
  checkHumanity: (address: string) => Promise<boolean>;
  
  // Getters
  getCurrentTicker: () => Ticker | null;
  getCurrentTrades: () => Trade[];
  getAllTickers: () => Record<string, Ticker | null>;
}


// Initialize data structure for all 30 pairs
const initializePairData = (): Record<string, PairData> => {
  const data: Record<string, PairData> = {};
  TRADING_PAIRS.forEach(pair => {
    data[pair] = {
      ticker: null,
      recentTrades: []
    };
  });
  return data;
};

export const useTradeStore = create<TradeState>((set, get) => ({
  currentPair: 'ETHUSDT',
  pairData: initializePairData(),
  orderBook: null,
  lastCandle: null,
  activeOrders: [],
  positions: [],
  isLoadingPositions: false,
  snxAccountId: null,
  isHuman: false,
  activeTokenAddress: null,

  setPair: (pair, tokenAddress) => {
    set({ currentPair: pair, activeTokenAddress: tokenAddress || null });
    get().fetchOrders();
  },

  updateTicker: (symbol, ticker) => set((state) => ({
    pairData: {
      ...state.pairData,
      [symbol]: {
        ...state.pairData[symbol],
        ticker
      }
    }
  })),

  addTrade: (symbol, trade) => set((state) => ({
    pairData: {
      ...state.pairData,
      [symbol]: {
        ...state.pairData[symbol],
        recentTrades: [trade, ...state.pairData[symbol].recentTrades].slice(0, 50)
      }
    }
  })),
  
  setOrderBook: (book) => set({ orderBook: book }),
  
  updateCandle: (candle) => set({ lastCandle: candle }),
  
  // Getters
  getCurrentTicker: () => {
    const state = get();
    return state.pairData[state.currentPair]?.ticker || null;
  },

  getCurrentTrades: () => {
    const state = get();
    return state.pairData[state.currentPair]?.recentTrades || [];
  },

  getAllTickers: () => {
    const state = get();
    const tickers: Record<string, Ticker | null> = {};
    Object.keys(state.pairData).forEach(symbol => {
      tickers[symbol] = state.pairData[symbol].ticker;
    });
    return tickers;
  },
  
  // API Actions
  fetchOrders: async (address?: string) => {
      try {
          const url = address ? `/api/trade/orders?address=${address}` : '/api/trade/orders';
          const res = await fetch(url);
          if (res.ok) {
              const orders = await res.json();
              set({ activeOrders: Array.isArray(orders) ? orders.filter((o: any) => o.status === 'NEW' || o.status === 'PARTIAL') : [] });
          }
      } catch (err) {
          console.error("Failed to fetch orders", err);
      }
  },
  
  fetchSnxAccount: async (address: string) => {
      try {
          const res = await fetch(`/api/user/snx-account?address=${address}`);
          if (res.ok) {
              const data = await res.json();
              set({ snxAccountId: data.snxAccountId });
          }
      } catch (err) {
          console.error("Failed to fetch SNX account", err);
      }
  },

  setSnxAccount: async (address: string, accountId: string) => {
      try {
          const res = await fetch('/api/user/snx-account', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ walletAddress: address, snxAccountId: accountId })
          });
          if (res.ok) {
              set({ snxAccountId: accountId });
              toast.success('ACCOUNT SYNCED', { description: 'Trading terminal ready.' });
          }
      } catch (err) {
          console.error("Failed to sync SNX account", err);
          toast.error('SYNC FAILED', { description: 'Could not persist account ID.' });
      }
  },

  checkHumanity: async (address: string) => {
      try {
          const res = await fetch(`/api/user/status?address=${address}`);
          if (res.ok) {
              const data = await res.json();
              set({ isHuman: data.verified });
              return data.verified;
          }
      } catch (err) {
          console.error("Failed to check humanity", err);
      }
      return false;
  },

  placeOrder: async (orderData: any) => {
      try {
          // ️ [HUMAN GATE] Check if user is verified
          const isHuman = get().isHuman || await get().checkHumanity(orderData.walletAddress);
          if (!isHuman) {
              toast.error('HUMANITY REQUIRED', {
                  description: 'Verification via World ID is mandatory for Elite trades.',
                  action: {
                      label: 'Verify Now',
                      onClick: () => window.dispatchEvent(new CustomEvent('TRIGGER_WORLD_ID_MODAL'))
                  }
              });
              return null;
          }
          const res = await fetch('/api/trade/order', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  ...orderData,
                  tokenAddress: orderData.tokenAddress || get().activeTokenAddress
              })
          });
          
          const data = await res.json();
          
          if (!res.ok) {
              throw new Error(data.error || 'Failed to place order');
          }

          toast.success('ORDER RELAYED ', {
               description: `Action pending on blockchain...`,
               style: { border: '1px solid #10b981' }
          });
          
          if (orderData.walletAddress) {
              get().fetchOrders(orderData.walletAddress);
          } else {
              get().fetchOrders();
          }

          return data; 
          
      } catch (error: any) {
          toast.error('ORDER FAILED', {
              description: error.message,
              style: { border: '1px solid #ef4444' }
          });
          throw error;
      }
  },


  cancelOrder: async (id: string) => {
       set((state) => ({ activeOrders: state.activeOrders.filter(o => o.id !== id) }));
  },

  fetchPositions: async (address?: string) => {
    if (!address) return;
    set({ isLoadingPositions: true });
    try {
      const res = await fetch(`/api/trade/positions?address=${address}`);
      const data = await res.json();
      set({ positions: data.positions || [], isLoadingPositions: false });
    } catch (err) {
      console.error("Failed to fetch positions", err);
      set({ isLoadingPositions: false });
    }
  },

  startPositionsSyncer: (address: string) => {
    get().fetchPositions(address);
    const interval = setInterval(() => get().fetchPositions(address), 5000);
    return () => clearInterval(interval);
  }

}));

