"use client";

import React, { useMemo } from 'react';
import { useReadContracts } from 'wagmi';
import { formatUnits } from 'viem';
import { Layers, Database, RefreshCw, ExternalLink, Activity } from 'lucide-react';
import { ERC20_ABI } from './quantum-constants';
import { QUANTUM_TOKENS } from '@/lib/config/tokens';

export function TokenHoldingsTable({ address, activeNetwork, scannerBase }: { address: string, activeNetwork: string, scannerBase: string }) {
  // Filter tokens based on the currently active network
  const networkTokens = useMemo(() => {
    // Map internal network IDs to CoinGecko network IDs stored in the registry
    const networkMap: Record<string, string> = {
      ethereum: 'ethereum', polygon: 'polygon', arbitrum: 'arbitrum',
      optimism: 'optimism', base: 'base', bsc: 'bsc', avalanche: 'avalanche',
      fantom: 'fantom', linea: 'linea', scroll: 'scroll', celo: 'celo'
    };
    const mappedNet = networkMap[activeNetwork] || activeNetwork;
    
    return QUANTUM_TOKENS.filter(t => t.addresses && t.addresses[mappedNet])
                         .map(t => ({ ...t, address: t.addresses[mappedNet] }));
  }, [activeNetwork]);

  // Construct the multi-call array. Wagmi v2's useReadContracts automatically handles 
  // atomic Multicall3 batching in a SINGLE RPC request, providing extreme CU efficiency.
  const contracts = useMemo(() => {
    if (!address || networkTokens.length === 0) return [];
    return networkTokens.map(token => ({
      address: token.address as `0x${string}`,
      abi: ERC20_ABI,
      functionName: 'balanceOf',
      args: [address as `0x${string}`]
    }));
  }, [address, networkTokens]);

  const { data, isError, isLoading, refetch } = useReadContracts({
    contracts,
    query: {
        enabled: contracts.length > 0
    }
  });

  const holdings = useMemo(() => {
    if (!data) return [];
    return data.map((result, i) => {
      const token = networkTokens[i];
      let balance = "0";
      let raw = 0n;
      if (result.status === 'success' && result.result) {
        raw = result.result as bigint;
        balance = formatUnits(raw, token.decimals);
      }
      return {
        ...token,
        balance,
        raw,
        hasBalance: raw > 0n
      };
    }).sort((a, b) => (b.raw > a.raw ? 1 : -1));
  }, [data, networkTokens]);

  const nonZeroHoldings = holdings.filter(h => h.hasBalance);

  if (networkTokens.length === 0) {
      return (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-black/5 border border-black/10">
              <Layers size={24} className="text-black/20 mb-4" />
              <p className="text-[11px] text-black/60 uppercase tracking-widest font-black mb-2">No Tokens Indexed</p>
              <p className="text-[10px] text-black/40">The Quantum Registry hasn't mapped tokens for {activeNetwork} yet.</p>
          </div>
      );
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[300px] text-center p-8 border border-black/10 bg-white">
        <Activity size={24} className="animate-spin text-black/20 mb-4" />
        <p className="text-[11px] font-black uppercase tracking-widest text-black/60">Atomic Execution Active...</p>
        <p className="text-[9px] font-mono mt-2 text-black/30">Batching {networkTokens.length} token checks into 1 CU via Multicall3</p>
      </div>
    );
  }

  if (isError) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center min-h-[300px] text-center p-8 border border-black/10 bg-white">
          <Database size={24} className="text-red-500/50 mb-4" />
          <p className="text-[11px] font-black uppercase tracking-widest text-red-500">RPC Sync Failure</p>
          <button onClick={() => refetch()} className="mt-4 px-4 py-2 bg-black text-white text-[9px] uppercase tracking-widest font-black hover:bg-black/80">
            Retry State Fetch
          </button>
        </div>
      );
  }

  return (
    <div className="border border-black/10 bg-white flex flex-col min-h-[300px] overflow-hidden relative group">
        <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => refetch()} className="w-6 h-6 rounded border border-black/10 flex items-center justify-center hover:bg-black/5">
                <RefreshCw size={10} className="text-black/50" />
            </button>
        </div>
      
        <div className="p-0 flex-1 flex flex-col overflow-y-auto">
        <table className="w-full text-left text-[11px] font-mono">
            <thead className="bg-black/5 border-b border-black/10 text-[9px] uppercase tracking-widest text-black/50">
                <tr>
                    <th className="py-3 px-4 font-black">Asset</th>
                    <th className="py-3 px-4 font-black text-right">Balance</th>
                    <th className="py-3 px-4 font-black text-right">Contract</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
                {nonZeroHoldings.length > 0 ? (
                    nonZeroHoldings.map((token) => (
                        <tr key={token.address} className="hover:bg-black/5 transition-colors group/row">
                            <td className="py-3 px-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-sm flex items-center justify-center shadow-inner border border-black/10 bg-black/5 overflow-hidden">
                                        <img src={token.logoPath} alt={token.symbol} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                                    </div>
                                    <span className="font-black text-[12px]">{token.symbol}</span>
                                </div>
                            </td>
                            <td className="py-3 px-4 text-right font-black">
                                {Number(token.balance) > 0 ? Number(token.balance).toLocaleString(undefined, { maximumFractionDigits: 6 }) : "0.00"}
                            </td>
                            <td className="py-3 px-4 text-right">
                                <a 
                                    href={`${scannerBase}/token/${token.address}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 px-2 py-1 bg-white border border-black/10 rounded-sm text-[9px] text-black/40 hover:text-black hover:border-black/30 transition-all"
                                >
                                    {token.address.slice(0,6)}...{token.address.slice(-4)}
                                    <ExternalLink size={9} />
                                </a>
                            </td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan={3} className="py-12">
                            <div className="flex flex-col items-center justify-center text-center">
                                <Database size={24} className="text-black/20 mb-3" />
                                <p className="text-[10px] text-black/40 uppercase tracking-widest font-black mb-1">Zero Assets Detected</p>
                                <p className="text-[9px] text-black/30 max-w-[200px]">No balances detected for the monitored token list associated with this address.</p>
                            </div>
                        </td>
                    </tr>
                )}
            </tbody>
        </table>
        
        {/* Render zero balances grouped together */}
        {holdings.filter(h => !h.hasBalance).length > 0 && (
            <div className="mt-auto border-t border-black/10 bg-[#FAFAFA] p-3 flex flex-wrap gap-2 opacity-50">
                <span className="text-[8px] font-black uppercase tracking-widest w-full text-black/40 mb-1">Zero Balance Assets</span>
                {holdings.filter(h => !h.hasBalance).map(t => (
                    <span key={t.address} className="text-[9px] font-mono border border-black/10 px-1.5 py-0.5 rounded-sm bg-white text-black/30">
                        {t.symbol}
                    </span>
                ))}
            </div>
        )}
      </div>
    </div>
  );
}
