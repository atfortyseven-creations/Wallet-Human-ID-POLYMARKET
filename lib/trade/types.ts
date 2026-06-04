export type OrderSide = 'buy' | 'sell';
export type OrderType = 'limit' | 'market' | 'stop_limit' | 'stop_market';
export type OrderStatus = 'new' | 'partially_filled' | 'filled' | 'canceled' | 'rejected';

export interface Ticker {
  symbol: string;
  price: number;
  change24h: number; // 24h Price Change
  priceChangePercent24h?: number; // Optional alias if needed
  high24h: number;
  low24h: number;
  volume24h: number;
  turnover24h?: number; // Quote volume
}

export interface OrderBookEntry {
  price: number;
  quantity: number;
  total: number;
}

export interface OrderBook {
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
  lastUpdateId: number;
}

export interface Trade {
  id: string;
  symbol: string;
  price: number;
  quantity: number;
  side: OrderSide;
  timestamp: number;
}

export interface Order {
  id: string;
  symbol: string;
  side: OrderSide;
  type: OrderType;
  price: number;
  quantity: number;
  filledQuantity: number;
  status: OrderStatus;
  timestamp: number;
}

