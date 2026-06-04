import { create } from 'zustand';
import { OrderBookSnapshot, OrderBookEngine } from './orderbook-engine';
import { wsManager } from './websocket-manager';
import { usePortfolioStore } from '../portfolio/store';

export interface Trade {
  id: string;
  price: number;
  quantity: number;
  time: number;
  isBuyerMaker: boolean; // true = sell (red), false = buy (green)
}

export interface Ticker24h {
  symbol: string;
  lastPrice: number;
  priceChange: number;
  priceChangePercent: number;
  high: number;
  low: number;
  volume: number;
  quoteVolume: number;
}

interface ProfessionalTradeState {
  // Current pair
  currentPair: string;
  
  // Order book
  orderBook: OrderBookSnapshot | null;
  orderBookEngine: OrderBookEngine;
  
  // Recent trades
  recentTrades: Trade[];
  maxTrades: number;
  
  // 24h ticker data
  ticker: Ticker24h | null; // Current pair ticker
  globalTickers: Record<string, { price: number; change24h?: number }>; //  All pairs' realtime prices
  lastCandle: { time: number; open: number; high: number; low: number; close: number; volume: number } | null;
  
  // Connection status
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error';
  isConnected: boolean; // Keep for backward compatibility
  historicalCandles: any[];
  currentInterval: string;
  
  // Actions
  setCurrentPair: (pair: string) => void;
  updateOrderBook: (snapshot: OrderBookSnapshot) => void;
  addTrade: (trade: Trade) => void;
  updateTicker: (ticker: Ticker24h) => void;
  setConnectionStatus: (status: 'disconnected' | 'connecting' | 'connected' | 'error') => void;
  
  // New API Actions
  fetchHistoricalCandles: (symbol: string, interval?: string) => Promise<void>;
  saveCandle: (symbol: string, interval: string, candle: any) => Promise<void>;
  
  // Positions
  positions: any[];
  isLoadingPositions: boolean;
  
  // UI State
  orderInput: { price: string; quantity: string };
  setOrderInput: (input: Partial<{ price: string; quantity: string }>) => void;
  
  fetchPositions: (address: string) => Promise<void>;
  startPositionsSyncer: (address: string) => void;

  // WebSocket methods
  connectToMarket: (symbol: string, interval?: string) => void;
  disconnectFromMarket: () => void;
  retryCount: number;
  isRestricted: boolean;
}

export const useProfessionalTradeStore = create<ProfessionalTradeState>((set, get) => ({
  currentPair: 'BTCUSDT',
  orderBook: null,
  orderBookEngine: new OrderBookEngine(),
  recentTrades: [],
  maxTrades: 50,
  // Initialize with default ticker to PREVENT BLANK SCREEN
  ticker: null,
  globalTickers: {}, //  Stores real-time prices for ALL 31 pairs
  lastCandle: null,
  historicalCandles: [],
  currentInterval: '1m',
  isConnected: false,
  connectionStatus: 'disconnected',
  retryCount: 0,
  isRestricted: false,

  positions: [],
  isLoadingPositions: false,

  orderInput: { price: '', quantity: '' },
  setOrderInput: (input) => set((state) => ({ 
    orderInput: { ...state.orderInput, ...input } 
  })),

  fetchPositions: async (address: string) => {
    try {
      const res = await fetch(`/api/trade/positions?address=${address}`);
      const data = await res.json();
      set({ positions: data.positions || [] });
    } catch (e) {
      console.error("Failed to fetch positions", e);
    }
  },

  startPositionsSyncer: (address: string) => {
    get().fetchPositions(address);
    const interval = setInterval(() => get().fetchPositions(address), 5000);
    return () => clearInterval(interval);
  },

  setCurrentPair: (pair) => set({ currentPair: pair }),
  
  updateOrderBook: (snapshot) => set({ orderBook: snapshot }),
  
  addTrade: (trade) => set((state) => ({
    recentTrades: [trade, ...state.recentTrades].slice(0, state.maxTrades)
  })),
  
  updateTicker: (ticker) => set({ ticker }),
  
  setConnectionStatus: (status) => set({ 
    connectionStatus: status,
    isConnected: status === 'connected' 
  }),

  fetchHistoricalCandles: async (symbol, interval = '1m') => {
      try {
          const res = await fetch(`/api/trade/candles?symbol=${symbol}&interval=${interval}`);
          
          if (res.status === 451) {
              set({ isRestricted: true, connectionStatus: 'error' });
              return;
          }

          if (res.ok) {
              const data = await res.json();
              set({ historicalCandles: data, isRestricted: false });
          } else {
              set({ connectionStatus: 'error' });
          }
      } catch (e) {
          console.error("Failed to fetch historical candles", e);
          set({ connectionStatus: 'error' });
      }
  },

  saveCandle: async (symbol, interval, candle) => {
      try {
          await fetch('/api/trade/candles/save', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ symbol, interval, candle })
          });
      } catch (e) {
          // Silent fail for background persistence
      }
  },

  /**
   * Connect to real-time market data for a symbol
   */
  connectToMarket: async (symbol, rawInterval = '1m') => {
    const lowerSymbol = symbol.toLowerCase();
    
    //  FIX: Map TradingView resolution to Binance Interval
    const intervalMap: Record<string, string> = {
        '1': '1m', '3': '3m', '5': '5m', '15': '15m', '30': '30m',
        '60': '1h', '120': '2h', '240': '4h', '360': '6h', '480': '8h', '720': '12h',
        'D': '1d', '1D': '1d', '3D': '3d', 'W': '1w', '1W': '1w', 'M': '1M', '1M': '1M'
    };
    const interval = intervalMap[rawInterval] || rawInterval;

    const currentInterval = get().currentInterval;
    
    // If we're already connected to the same symbol and interval, skip
    // if (get().isConnected && get().currentPair === symbol && currentInterval === interval) return;

    get().setConnectionStatus('connecting');
    set({ currentInterval: interval, currentPair: symbol });

    // Load history first for a smooth chart experience
    await get().fetchHistoricalCandles(symbol, interval);
    
    // Subscribe to multiple streams
    const streams = [
      `${lowerSymbol}@depth20@100ms`,  // Order book (20 levels, 100ms updates)
      `${lowerSymbol}@trade`,           // Recent trades
      `${lowerSymbol}@ticker`,           // 24h ticker
      `${lowerSymbol}@kline_${interval}`, // Dynamic interval candles
      '!miniTicker@arr'                 // Global Tickers
    ];

    try {
      // Try main connection
      await wsManager.connect(streams);
      get().setConnectionStatus('connected');

      // Subscribe to order book updates
      wsManager.subscribe(`${lowerSymbol}@depth20@100ms`, (data) => {
        const engine = get().orderBookEngine;
        
        if (data.lastUpdateId) {
          engine.processUpdate({
            bids: data.bids || [],
            asks: data.asks || [],
            lastUpdateId: data.lastUpdateId
          });
        } else {
          // Initial snapshot
          engine.processSnapshot({
            bids: data.bids || [],
            asks: data.asks || [],
            lastUpdateId: data.lastUpdateId || 0
          });
        }

        const snapshot = engine.getSnapshot();
        set({ orderBook: snapshot });
      });

      // Subscribe to trades
      wsManager.subscribe(`${lowerSymbol}@trade`, (data) => {
        const trade: Trade = {
          id: data.t?.toString() || Date.now().toString(),
          price: parseFloat(data.p),
          quantity: parseFloat(data.q),
          time: data.T || Date.now(),
          isBuyerMaker: data.m // true = sell order filled (red)
        };
        
        get().addTrade(trade);

        //  REAL-TIME CANDLE UPDATE
        // Update the current candle immediately for "running to the second" feel
        const currentCandle = get().lastCandle;
        if (currentCandle) {
            const price = trade.price;
            const newCandle = {
                ...currentCandle,
                close: price,
                high: Math.max(currentCandle.high, price),
                low: Math.min(currentCandle.low, price),
                volume: currentCandle.volume + trade.quantity 
            };
            set({ lastCandle: newCandle });
        }
      });

      // Subscribe to 24h ticker
      wsManager.subscribe(`${lowerSymbol}@ticker`, (data) => {
        const ticker: Ticker24h = {
          symbol: data.s,
          lastPrice: parseFloat(data.c),
          priceChange: parseFloat(data.p),
          priceChangePercent: parseFloat(data.P),
          high: parseFloat(data.h),
          low: parseFloat(data.l),
          volume: parseFloat(data.v),
          quoteVolume: parseFloat(data.q)
        };
        set({ ticker });
      });

      // Subscribe to Candles (K-Line) for Chart
      wsManager.subscribe(`${lowerSymbol}@kline_${interval}`, (data) => {
          const k = data.k;
          const candle = {
              time: k.t / 1000, // Lightweight charts uses seconds
              open: parseFloat(k.o),
              high: parseFloat(k.h),
              low: parseFloat(k.l),
              close: parseFloat(k.c),
              volume: parseFloat(k.v)
          };
          set({ lastCandle: candle });
          
          // Persist Closed Candles or current one (upsert handles it)
          get().saveCandle(symbol, interval, candle);
      });

      // Subscribe to Global Tickers (!miniTicker@arr) - feeds ALL 31 pairs
      wsManager.subscribe('!miniTicker@arr', (data: any[]) => {
          // data is an array of tickers: { s: symbol, c: closePrice, P: priceChangePercent, ... }
          const tickerMap: Record<string, number> = {};
          const globalTickerUpdate: Record<string, { price: number; change24h: number }> = {};
          
          data.forEach(t => {
              const sym = t.s; // e.g., 'BTCUSDT'
              const price = parseFloat(t.c);
              const change24h = parseFloat(t.P || '0'); // Percent change
              
              tickerMap[sym] = price;
              globalTickerUpdate[sym] = { price, change24h };
          });
          
          //  Update global tickers for MarketSelector to display
          set({ globalTickers: { ...get().globalTickers, ...globalTickerUpdate } });
          
          // Update Portfolio Store for real-time equity calculation
          usePortfolioStore.getState().updatePrices(tickerMap);
      });

    } catch (error) {
      console.error('[Store] Failed to connect:', error);
      get().setConnectionStatus('error');
      
      // Exponential backoff retry
      const retryCount = get().retryCount;
      const delay = Math.min(1000 * Math.pow(2, retryCount), 30000); // Max 30s
      
      console.log(`[Store] Retrying in ${delay}ms (Attempt ${retryCount + 1})...`);
      
      setTimeout(() => {
        if (get().connectionStatus === 'error' || get().connectionStatus === 'connecting') {
           set({ retryCount: retryCount + 1 });
           get().connectToMarket(symbol, interval);
        }
      }, delay);
    }
  },

  /**
   * Disconnect from market data
   */
  disconnectFromMarket: () => {
    wsManager.disconnect();
    set({ 
      connectionStatus: 'disconnected',
      isConnected: false,
      // Don't clear data immediately to avoid flickering
    });
  }
}));

