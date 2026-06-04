"use client";

import { useState, useEffect, useRef, useCallback } from "react";

//  Types 

export interface WhaleEvent {
  type: "whale";
  txHash: string;
  blockNumber: number;
  token: string;
  symbol: string;
  from: string;
  to: string;
  amount: number;
  usdValue: number;
  timestamp: number;
}

export interface NewPairEvent {
  type: "new_pair";
  pool: string;
  token0: string;
  token1: string;
  fee: number;
  blockNumber: number;
  txHash: string;
  timestamp: number;
}

export interface PoolPrice {
  symbol: string;
  pool: string;
  sqrtPriceX96: string;
  tick: number;
  price: number;
}

export interface OnChainToken {
  symbol: string;
  address: string;
  balance: number;
  decimals: number;
  chain: string;
}

//  Whale Events Hook 

/**
 * useWhaleStream
 * 
 * Subscribes to /api/whale-events/stream (SSE  GetBlock EP2 WebSocket)
 * Returns live and buffered whale alert events.
 */
export function useWhaleStream(maxEvents = 50) {
  const [events, setEvents] = useState<WhaleEvent[]>([]);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const esRef = useRef<EventSource | null>(null);
  const retryRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryCount = useRef(0);

  const connect = useCallback(() => {
    if (esRef.current) esRef.current.close();

    const es = new EventSource("/api/whale-events/stream");
    esRef.current = es;

    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.type === "connected") {
          setConnected(true);
          setError(null);
          retryCount.current = 0;
        } else if (data.type === "whale") {
          setEvents((prev) => [data as WhaleEvent, ...prev].slice(0, maxEvents));
        }
      } catch {
        // ignore parse errors
      }
    };

    es.onerror = () => {
      setConnected(false);
      es.close();
      // Exponential backoff reconnect
      const delay = Math.min(1000 * Math.pow(2, retryCount.current), 30_000);
      retryCount.current++;
      retryRef.current = setTimeout(connect, delay);
    };
  }, [maxEvents]);

  useEffect(() => {
    connect();
    return () => {
      esRef.current?.close();
      if (retryRef.current) clearTimeout(retryRef.current);
    };
  }, [connect]);

  return { events, connected, error };
}

//  New Pairs Hook 

/**
 * useNewPairsStream
 * 
 * Subscribes to /api/new-pairs/stream (SSE  GetBlock EP3 WebSocket)
 * Returns live UniswapV3 PoolCreated events.
 */
export function useNewPairsStream(maxPairs = 50) {
  const [pairs, setPairs] = useState<NewPairEvent[]>([]);
  const [connected, setConnected] = useState(false);
  const esRef = useRef<EventSource | null>(null);
  const retryRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryCount = useRef(0);

  const connect = useCallback(() => {
    if (esRef.current) esRef.current.close();

    const es = new EventSource("/api/new-pairs/stream");
    esRef.current = es;

    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.type === "connected") {
          setConnected(true);
          retryCount.current = 0;
        } else if (data.type === "buffer" && Array.isArray(data.pairs)) {
          setPairs(data.pairs.slice(0, maxPairs));
        } else if (data.type === "new_pair") {
          setPairs((prev) => [data as NewPairEvent, ...prev].slice(0, maxPairs));
        }
      } catch {
        // ignore
      }
    };

    es.onerror = () => {
      setConnected(false);
      es.close();
      const delay = Math.min(1000 * Math.pow(2, retryCount.current), 30_000);
      retryCount.current++;
      retryRef.current = setTimeout(connect, delay);
    };
  }, [maxPairs]);

  useEffect(() => {
    connect();
    return () => {
      esRef.current?.close();
      if (retryRef.current) clearTimeout(retryRef.current);
    };
  }, [connect]);

  return { pairs, connected };
}

//  Pool Prices Hook 

/**
 * usePoolPrices
 * 
 * Polls /api/market/pool-prices every 30s (GetBlock EP4  UniswapV3 slot0)
 * Returns live on-chain prices for top pools.
 */
export function usePoolPrices(refreshInterval = 30_000) {
  const [prices, setPrices] = useState<PoolPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchPrices = useCallback(async () => {
    try {
      const res = await fetch("/api/market/pool-prices");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.ok && Array.isArray(data.pools)) {
        setPrices(data.pools);
        setLastUpdated(new Date());
        setError(null);
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch pool prices");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchPrices, refreshInterval]);

  return { prices, loading, error, lastUpdated, refetch: fetchPrices };
}

//  On-Chain Portfolio Hook 

/**
 * useOnChainPortfolio
 * 
 * Fetches real ETH + ERC-20 balances from GetBlock EP1.
 * Pass the connected wallet address.
 */
export function useOnChainPortfolio(address: string | null | undefined) {
  const [ethBalance, setEthBalance] = useState<number | null>(null);
  const [tokens, setTokens] = useState<OnChainToken[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch_ = useCallback(async (addr: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/portfolio/onchain?address=${addr}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.ok) {
        setEthBalance(data.ethBalance);
        setTokens(data.tokens || []);
      } else {
        throw new Error(data.error || "Unknown error");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (address && /^0x[0-9a-fA-F]{40}$/.test(address)) {
      fetch_(address);
    } else {
      setEthBalance(null);
      setTokens([]);
    }
  }, [address, fetch_]);

  return { ethBalance, tokens, loading, error };
}
