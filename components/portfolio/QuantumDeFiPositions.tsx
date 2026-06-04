"use client";

import React, { useMemo } from 'react';
import { useReadContracts } from 'wagmi';
import { Layers, RefreshCw, Landmark, Activity, AlertTriangle, ShieldCheck } from 'lucide-react';
import { AAVE_V3_POOL_ABI, COMPOUND_V3_COMET_ABI, PROTOCOL_ADDRESSES } from './protocol-abis';
import { HEALTH_FACTOR } from './advanced-math';
import { formatUnits } from 'viem';
import { motion } from 'framer-motion';

// ================================================================
// INSTITUTIONAL DEFI POSITIONS ENGINE
// Interrogates AAVE V3, Compound V3 via parallelized on-chain reads
// ================================================================
export function QuantumDeFiPositions({ address, activeNetwork }: { address: string, activeNetwork: string }) {

    const contracts = useMemo(() => {
        if (!address || activeNetwork !== 'ethereum') return undefined;
        return [
            {
                address: PROTOCOL_ADDRESSES.AAVE_V3_POOL as `0x${string}`,
                abi: AAVE_V3_POOL_ABI,
                functionName: 'getUserAccountData' as const,
                args: [address as `0x${string}`]
            },
            {
                address: PROTOCOL_ADDRESSES.COMET_USDC as `0x${string}`,
                abi: COMPOUND_V3_COMET_ABI,
                functionName: 'balanceOf' as const,
                args: [address as `0x${string}`]
            },
            {
                address: PROTOCOL_ADDRESSES.COMET_USDC as `0x${string}`,
                abi: COMPOUND_V3_COMET_ABI,
                functionName: 'borrowBalanceOf' as const,
                args: [address as `0x${string}`]
            }
        ] as const;
    }, [address, activeNetwork]);

    const { data, isLoading, refetch } = useReadContracts({
        contracts: contracts as any,
        query: { enabled: !!contracts }
    });

    const positions = useMemo(() => {
        if (!data) return [];
        const result: {
            protocol: string;
            asset: string;
            supplied: string;
            borrowed: string;
            healthFactor: number;
            color: string;
            risk: string;
        }[] = [];

        // ── AAVE V3: getUserAccountData → (collateralBase, debtBase, …, healthFactor)
        const aaveRaw = data[0];
        if (aaveRaw?.status === 'success' && aaveRaw.result) {
            const [totalCollateralBase, totalDebtBase,,,,healthFactor] =
                aaveRaw.result as readonly [bigint,bigint,bigint,bigint,bigint,bigint];
            if (totalCollateralBase > 0n || totalDebtBase > 0n) {
                const hf = Number(formatUnits(healthFactor, 18));
                result.push({
                    protocol: 'AAVE V3',
                    asset: 'Multi-Collateral',
                    supplied: Number(formatUnits(totalCollateralBase, 8)).toFixed(4),
                    borrowed: Number(formatUnits(totalDebtBase, 8)).toFixed(4),
                    healthFactor: isFinite(hf) ? hf : 999,
                    color: '#B6509E',
                    risk: hf > 2 ? 'LOW' : hf > 1.2 ? 'MEDIUM' : 'CRITICAL'
                });
            }
        }

        // ── Compound V3: balanceOf / borrowBalanceOf
        const compSupply = data[1];
        const compDebt   = data[2];
        if (compSupply?.status === 'success' && compDebt?.status === 'success') {
            const supplied = compSupply.result as bigint;
            const borrowed = compDebt.result   as bigint;
            if (supplied > 0n || borrowed > 0n) {
                const s = Number(formatUnits(supplied, 6));
                const b = Number(formatUnits(borrowed, 6));
                result.push({
                    protocol: 'Compound V3',
                    asset: 'USDC',
                    supplied: s.toFixed(4),
                    borrowed: b.toFixed(4),
                    healthFactor: HEALTH_FACTOR.calculate(s, b, 0.8),
                    color: '#00D395',
                    risk: b === 0 ? 'LOW' : 'MEDIUM'
                });
            }
        }

        return result;
    }, [data]);

    if (activeNetwork !== 'ethereum') {
        return (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-black/5 border border-black/10 min-h-[400px]">
                <Layers size={24} className="text-black/20 mb-4" />
                <p className="text-[11px] text-black/60 uppercase tracking-widest font-black mb-2">Cross-Chain DeFi Analytics</p>
                <p className="text-[10px] text-black/40 max-w-[280px]">DeFi tracking for <span className="uppercase text-black/60 font-bold">{activeNetwork}</span> is syncing. Currently, full institutional tracking is optimized for Ethereum Mainnet.</p>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] text-center p-8 border border-black/10 bg-white">
              <RefreshCw size={24} className="animate-spin text-black/20 mb-4" />
              <p className="text-[11px] font-black uppercase tracking-widest text-black/60">Synchronizing Liquidity Protocols...</p>
              <div className="w-48 h-1 bg-black/5 mt-4 overflow-hidden rounded-full relative">
                  <motion.div 
                    initial={{ x: '-100%' }} animate={{ x: '100%' }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="absolute inset-y-0 w-1/2 bg-black"
                  />
              </div>
            </div>
        );
    }

    return (
        <div className="border border-black/10 bg-white min-h-[400px] flex flex-col relative group">
            <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <button onClick={() => refetch()} className="w-6 h-6 rounded border border-black/10 flex items-center justify-center hover:bg-black/5 bg-white">
                    <RefreshCw size={10} className="text-black/50" />
                </button>
            </div>

            <div className="p-0 flex-1 flex flex-col overflow-y-auto">
                <table className="w-full text-left text-[11px] font-mono">
                    <thead className="bg-black/5 border-b border-black/10 text-[9px] uppercase tracking-widest text-black/50">
                        <tr>
                            <th className="py-3 px-4 font-black">DeFi Protocol</th>
                            <th className="py-3 px-4 font-black text-right">Net Liquidity</th>
                            <th className="py-3 px-4 font-black text-right">Active Liabilities</th>
                            <th className="py-3 px-4 font-black text-right">System Health</th>
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
                                                <span className="text-[9px] text-black/50">{pos.asset} Reserve</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-4 text-right">
                                        <span className="font-black text-green-600 block">{Number(pos.supplied).toFixed(4)} {pos.asset}</span>
                                    </td>
                                    <td className="py-4 px-4 text-right">
                                        <span className="font-black text-red-600 block">{Number(pos.borrowed).toFixed(4)} {pos.asset}</span>
                                    </td>
                                    <td className="py-4 px-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {pos.risk === 'CRITICAL' ? <AlertTriangle size={12} className="text-red-500" /> : <ShieldCheck size={12} className="text-green-500" />}
                                            <span className={`font-black ${pos.risk === 'CRITICAL' ? 'text-red-500' : 'text-black'}`}>HF: {pos.healthFactor.toFixed(2)}</span>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={4} className="py-16">
                                    <div className="flex flex-col items-center justify-center text-center">
                                        <Landmark size={24} className="text-black/20 mb-3" />
                                        <p className="text-[10px] text-black/40 uppercase tracking-widest font-black mb-1">Zero Mathematical Exposure</p>
                                        <p className="text-[9px] text-black/30 max-w-[300px]">The institutional analytics engine found no active liquidity concentrated positions, options, or over-collateralized debt structures.</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="border-t border-black/10 p-3 bg-black/5 flex items-center justify-between">
                <div className="flex items-center gap-2 text-black/40">
                    <Activity size={12} className="text-black/60" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Institutional Analytics Engine Online</span>
                </div>
            </div>
        </div>
    );
}
