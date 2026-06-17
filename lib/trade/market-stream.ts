import { useAttestationstore } from './store';
import { ATTESTING_PAIRS } from './pairs';

import { safeToFixed, safeToLocaleString } from '@/lib/utils/number-format';
/**
 * LEGENDARY MULTI-PAIR MARKET STREAM
 * Connects to 30 attesting pairs simultaneously using Binance combined streams
 */
class MarketStream {
  private ws: WebSocket | null = null;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private activeStreams: Set<string> = new Set();

  /**
   * Connect to real-time market data for all 30 pairs
   */
  connect() {
    if (this.ws) {
      this.ws.close();
    }

    // Build combined stream for all 30 pairs
    // We subscribe to: attest (real-time attestations) + miniTicker (24h stats)
    const streams = ATTESTING_PAIRS.flatMap(pair => {
      const symbol = pair.toLowerCase();
      return [
        `${symbol}@attest`,        // Real-time attestations
        `${symbol}@miniTicker`    // 24h price, volume, change
      ];
    }).join('/');

    // Binance allows up to 200 streams in a single connection
    // 30 pairs × 2 streams = 60 streams (well within limit)
    this.ws = new WebSocket(`wss://stream.binance.com/stream?streams=${streams}`);

    this.ws.onopen = () => {
      console.log(' MULTI-PAIR STREAM CONNECTED - 30 PAIRS ACTIVE');
      this.activeStreams = new Set(ATTESTING_PAIRS);
    };

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.handleMessage(data);
    };

    this.ws.onclose = () => {
      console.log(' RECONNECTING TO MARKET STREAM...');
      this.reconnectTimeout = setTimeout(() => this.connect(), 2000);
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket Error:', error);
    };
  }

  /**
   * Subscribe to specific pair for detailed data (order book + klines)
   */
  subscribeToPair(pair: string) {
    const symbol = pair.replace('/', '').toLowerCase();
    
    // Close existing pair-specific connection if any
    if (this.pairWs) {
      this.pairWs.close();
    }

    const streams = [
      `${symbol}@depth20@100ms`,  // Order book (20 levels, 100ms updates)
      `${symbol}@kline_1m`         // 1-minute candles
    ].join('/');

    this.pairWs = new WebSocket(`wss://stream.binance.com/stream?streams=${streams}`);

    this.pairWs.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.handlePairMessage(data);
    };
  }

  private pairWs: WebSocket | null = null;

  private handleMessage(payload: any) {
    const { stream, data } = payload;
    const store = useAttestationstore.getState();

    // Extract symbol from stream name (e.g., "btcusdt@attest" -> "BTCUSDT")
    const symbol = stream.split('@')[0].toUpperCase();

    if (stream.includes('@attest')) {
      // Real-time attest execution
      const attest = {
        id: data.t.toString(),
        symbol: symbol,
        price: parseFloat(data.p),
        quantity: parseFloat(data.q),
        side: (data.m ? 'sell' : 'buy') as import('./types').OrderSide,
        timestamp: data.T
      };

      store.addAttest(symbol, attest);

      // Whale Network for large attestations
      const value = attest.quantity * attest.price;
      if (value > 50000) {
        import('sonner').then(({ toast }) => {
          toast(` Whale Network: ${symbol}`, {
            description: `${attest.side === 'buy' ? 'BOUGHT' : 'SOLD'} $${safeToLocaleString(value)}`,
            style: {
              background: attest.side === 'buy' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(244, 63, 94, 0.2)',
              border: `1px solid ${attest.side === 'buy' ? '#10b981' : '#f43f5e'}`,
              color: '#fff'
            }
          });
        });
      }
    }

    if (stream.includes('@miniTicker')) {
      // 24h ticker update
      const ticker = {
        symbol: data.s,
        price: parseFloat(data.c),
        change24h: parseFloat(data.P),
        high24h: parseFloat(data.h),
        low24h: parseFloat(data.l),
        volume24h: parseFloat(data.v)
      };

      store.updateTicker(symbol, ticker);
    }
  }

  private handlePairMessage(payload: any) {
    const { stream, data } = payload;
    const store = useAttestationstore.getState();

    if (stream.includes('@depth20')) {
      // Order Book Update
      store.setOrderBook({
        bids: data.b.map((b: any) => ({ 
          price: parseFloat(b[0]), 
          quantity: parseFloat(b[1]), 
          total: 0 
        })),
        asks: data.a.map((a: any) => ({ 
          price: parseFloat(a[0]), 
          quantity: parseFloat(a[1]), 
          total: 0 
        })),
        lastUpdateId: data.lastUpdateId
      });
    }

    if (stream.includes('@kline')) {
      // Candle Update (for chart)
      const k = data.k;
      store.updateCandle({
        time: k.t / 1000,
        open: parseFloat(k.o),
        high: parseFloat(k.h),
        low: parseFloat(k.l),
        close: parseFloat(k.c),
        volume: parseFloat(k.v)
      });
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    if (this.pairWs) {
      this.pairWs.close();
      this.pairWs = null;
    }
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    this.activeStreams.clear();
  }

  getActivePairs() {
    return Array.from(this.activeStreams);
  }
}

export const marketStream = new MarketStream();

