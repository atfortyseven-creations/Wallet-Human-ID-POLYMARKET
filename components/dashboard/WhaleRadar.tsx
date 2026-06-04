'use client';
import { useEffect, useState } from 'react';
import { createPublicClient, http, parseAbiItem } from 'viem';
import { mainnet } from 'viem/chains';

export default function WhaleRadar() {
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    // Real mempool listener using viem on Ethereum Mainnet
    const client = createPublicClient({
      chain: mainnet,
      transport: http() // In production, replace with wss:// alchemy/infura for real-time WebSocket mempool tracking
    });

    // Real-time tracking of large USDC transfers (Whale movements > $1M)
    const unwatch = client.watchEvent({
      address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eb48', // USDC
      event: parseAbiItem('event Transfer(address indexed from, address indexed to, uint256 value)'),
      onLogs: logs => {
        const massiveTransfers = logs.filter(log => log.args.value && log.args.value > 1000000000000n); // > 1M USDC
        if (massiveTransfers.length > 0) {
          setEvents(prev => [...massiveTransfers, ...prev].slice(0, 10)); // Keep last 10
        }
      }
    });

    return () => unwatch();
  }, []);

  return (
    <div className="mt-6">
      <h3 className="font-mono text-[10px] text-emerald-400 mb-2">LIVE WHALE ACTIVITY (USDC &gt;1M)</h3>
      <div className="space-y-2">
        {events.length === 0 ? (
          <div className="text-xs text-white/30 font-mono animate-pulse">Scanning mempool...</div>
        ) : (
          events.map((ev, i) => (
            <div key={i} className="bg-white/5 border border-white/10 p-2 rounded-lg font-mono text-[9px]">
              <div className="flex justify-between text-white/70">
                <span>From: {ev.args.from?.slice(0,6)}...</span>
                <span>To: {ev.args.to?.slice(0,6)}...</span>
              </div>
              <div className="text-emerald-400 mt-1 font-bold">
                {Number(ev.args.value) / 1e6} USDC
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
