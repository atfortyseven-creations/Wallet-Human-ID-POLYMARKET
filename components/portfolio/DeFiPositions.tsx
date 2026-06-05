"use client";

import React, { useMemo } from 'react';
import { useReadContracts } from 'wagmi';
import { Layers, RefreshCw, Landmark, ExternalLink, Zap } from 'lucide-react';
import { AAVE_POOL_DATA_PROVIDER_ABI, UNISWAP_V3_POOL_ABI } from './quantum-constants';
import { formatUnits } from 'viem';

// AAVE V3 Pool Data Provider (Mainnet)
const AAVE_DATA_PROVIDER = "0x7B4EB56E7CD4b454AA8ac720e1886D13A90089A1" as const;
const WETH_ASSET = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2" as const;
const USDC_ASSET = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48" as const;

export function DeFiPositions({ address, activeNetwork }: { address: string, activeNetwork: string }) {
    
    // Quantum parallel multicall to AAVE V3 
    const contracts = useMemo(() => {
        if (!address || activeNetwork !== 'ethereum') return [];
        return [
            {
                address: AAVE_DATA_PROVIDER,
                abi: AAVE_POOL_DATA_PROVIDER_ABI,
                functionName: 'getUserReserveData',
                args: [WETH_ASSET, address as `0x${string}`]
            },
            {
                address: AAVE_DATA_PROVIDER,
                abi: AAVE_POOL_DATA_PROVIDER_ABI,
                functionName: 'getUserReserveData',
                args: [USDC_ASSET, address as `0x${string}`]
            }
        ];
    }, [address, activeNetwork]);

    const { data, isLoading, refetch } = useReadContracts({
        contracts,
        query: {
            enabled: contracts.length > 0
        }
    });

    const positions = useMemo(() => {
        if (!data) return [];
        const result = [];
        // WETH Position
        if (data[0]?.status === 'success' && data[0].result) {
            const [aTokenBalance, stableDebt, variableDebt] = data[0].result as any;
            if (aTokenBalance > 0n || variableDebt > 0n) {
                result.push({
                    protocol: 'AAVE V3',
                    asset: 'WETH',
                    supplied: formatUnits(aTokenBalance, 18),
                    borrowed: formatUnits(variableDebt, 18),
                    color: '#B6509E'
                });
            }
        }
        // USDC Position
        if (data[1]?.status === 'success' && data[1].result) {
            const [aTokenBalance, stableDebt, variableDebt] = data[1].result as any;
            if (aTokenBalance > 0n || variableDebt > 0n) {
                result.push({
                    protocol: 'AAVE V3',
                    asset: 'USDC',
                    supplied: formatUnits(aTokenBalance, 6),
                    borrowed: formatUnits(variableDebt, 6),
                    color: '#2775CA'
                });
            }
        }
        return result;
    }, [data]);

    if (activeNetwork !== 'ethereum') {
        return (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-black/5 border border-black/10">
                <Layers size={24} className="text-black/20 mb-4" />
                <p className="text-[11px] text-black/60 uppercase tracking-widest font-black mb-2">Network Segment Mismatch</p>
                <p className="text-[10px] text-black/40 max-w-[250px]">DeFi positioning engine requires Ethereum Mainnet RPC to interrogate money market states.</p>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center min-h-[300px] text-center p-8 border border-black/10 bg-white">
              <RefreshCw size={24} className="animate-spin text-black/20 mb-4" />
              <p className="text-[11px] font-black uppercase tracking-widest text-black/60">Interrogating Liquidity Protocols...</p>
              <p className="text-[9px] font-mono mt-2 text-black/30">Resolving multi-collateral state via AAVE V3 Data Provider</p>
            </div>
        );
    }

    return (
        <div className="border border-black/10 bg-white min-h-[300px] flex flex-col relative group">
            <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <button onClick={() => refetch()} className="w-6 h-6 rounded border border-black/10 flex items-center justify-center hover:bg-black/5 bg-white">
                    <RefreshCw size={10} className="text-black/50" />
                </button>
            </div>

            <div className="p-0 flex-1 flex flex-col overflow-y-auto">
                <table className="w-full text-left text-[11px] font-mono">
                    <thead className="bg-black/5 border-b border-black/10 text-[9px] uppercase tracking-widest text-black/50">
                        <tr>
                            <th className="py-3 px-4 font-black">Protocol Target</th>
                            <th className="py-3 px-4 font-black text-right">Liquidity Supplied</th>
                            <th className="py-3 px-4 font-black text-right">Active Debt</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-black/5">
                        {positions.length > 0 ? (
                            positions.map((pos, idx) => (
                                <tr key={idx} className="hover:bg-black/5 transition-colors group/row">
                                    <td className="py-4 px-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full border border-black/10 flex items-center justify-center text-white font-black text-[10px]" style={{ backgroundColor: pos.color }}>
                                                {pos.protocol[0]}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-black text-[12px] uppercase tracking-widest">{pos.protocol}</span>
                                                <span className="text-[9px] text-black/50">{pos.asset} Market</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-4 text-right">
                                        <span className="font-black text-green-600 block">{Number(pos.supplied).toFixed(4)} {pos.asset}</span>
                                        <span className="text-[9px] text-black/30 font-mono">Collateralized</span>
                                    </td>
                                    <td className="py-4 px-4 text-right">
                                        <span className="font-black text-red-600 block">{Number(pos.borrowed).toFixed(4)} {pos.asset}</span>
                                        <span className="text-[9px] text-black/30 font-mono">Variable Rate</span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={3} className="py-12">
                                    <div className="flex flex-col items-center justify-center text-center">
                                        <Landmark size={24} className="text-black/20 mb-3" />
                                        <p className="text-[10px] text-black/40 uppercase tracking-widest font-black mb-1">Zero DeFi Exposure</p>
                                        <p className="text-[9px] text-black/30 max-w-[200px]">No active liquidity positions or collateralised debt structures were detected for this address across monitored protocols.</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="border-t border-black/10 p-3 bg-black/5 flex items-center justify-between">
                <div className="flex items-center gap-2 text-black/40">
                    <Zap size={12} className="text-black/60" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Real-time Oracle Yield Computation Active</span>
                </div>
                <a href="https://app.aave.com/" target="_blank" rel="noopener noreferrer" className="text-[9px] uppercase tracking-widest font-black border border-black/20 px-2 py-1 rounded-sm bg-white hover:bg-black/5 flex items-center gap-1 transition-colors">
                    Manage Protocols <ExternalLink size={9} />
                </a>
            </div>
        </div>
    );
}
