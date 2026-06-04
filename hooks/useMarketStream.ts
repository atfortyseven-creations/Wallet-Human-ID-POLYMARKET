"use client";

import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAccount } from 'wagmi';
import { DisplaySymbol } from '@/lib/bybit/markets';

export interface MarketTicker {
  symbol: string;
  price: number;
  priceChange: number;
  priceChangePercent: number;
  high: number;
  low: number;
  volume: number;
  openInterest: number;
  fundingRate: number;
  fundingCountdown: string;
}

export interface OrderBookEntry {
  price: number;
  size: number;
  total: number;
}

export interface OrderBookData {
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
}

export interface MarketTrade {
  id: string;
  price: number;
  size: number;
  side: 'BUY' | 'SELL';
  timestamp: string;
}

export interface MarketKline {
  symbol: string;
  interval: string;
  start: number;
  end: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  confirm: boolean;
  timestamp: number;
}

export function useMarketStream(symbol: DisplaySymbol = 'BTC/USDT') {
  const { address: userId } = useAccount();
  const [ticker, setTicker] = useState<MarketTicker | null>(null);
  const [orderBook, setOrderBook] = useState<OrderBookData | null>(null);
  const [trades, setTrades] = useState<MarketTrade[]>([]);
  const [lastKline, setLastKline] = useState<MarketKline | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!userId) return;

    // Connect to WebSocket server - Use relative path / same origin to avoid port issues
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || window.location.origin;
    
    console.log(`[MarketStream]  Connecting to ${wsUrl}`);

    const socket = io(wsUrl, {
      auth: { userId },
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log(`[MarketStream]  Connected - Subscribing to ${symbol}`);
      setIsConnected(true);
      setConnectionError(null);
      socket.emit('subscribe-market', symbol);
    });

    socket.on('connect_error', (err) => {
      console.error('[MarketStream]  Connection Error:', err.message);
      setConnectionError(err.message);
      setIsConnected(false);
    });

    socket.on('disconnect', (reason) => {
      console.log(`[MarketStream] ️ Disconnected: ${reason}`);
      setIsConnected(false);
    });

    socket.on('ticker_update', (data: MarketTicker) => {
      // console.log('[MarketStream]  Ticker update:', data.symbol, data.price);
      if (data.symbol === symbol) {
        setTicker(data);
      }
    });

    socket.on('orderbook_update', (data: OrderBookData) => {
      // console.log('[MarketStream]  Order book update:', data.bids.length, 'bids');
      setOrderBook(data);
    });

    socket.on('trade_update', (trade: MarketTrade) => {
      setTrades(prev => [trade, ...prev].slice(0, 50));
    });

    socket.on('kline_update', (kline: MarketKline) => {
      setLastKline(kline);
    });

    return () => {
      console.log(`[MarketStream]  Unsubscribing from ${symbol}`);
      socket.emit('unsubscribe-market', symbol);
      socket.disconnect();
    };
  }, [userId, symbol]);

  return { ticker, orderBook, trades, lastKline, isConnected, connectionError };
}

