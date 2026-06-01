"use client";

import React, { useMemo, useState, useEffect } from 'react';
import { Database, ExternalLink, ArrowUpRight, ArrowDownRight, Send, Download, ArrowRightLeft, Route, Activity } from 'lucide-react';
import { safeToFixed } from '@/lib/utils/number-format';
import { QUANTUM_TOKENS } from '@/lib/config/tokens';
import { TOKEN_STATS_20260530, TOKEN_STATS_DATE } from '@/config/token-stats-snapshot';
import UnifiedWalletModal from '@/components/wallet/UnifiedWalletModal';
import { TokenLogo } from '@/components/ui/TokenLogo';
import { NETWORKS, NetworkId } from '@/lib/store/wallet-store';

export function QuantumHoldingsEngine({ address, activeNetwork, scannerBase, userAssets = [] }: { address: string, activeNetwork: string, scannerBase: string, userAssets?: any[] }) {
    
    const [actionState, setActionState] = useState<{ isOpen: boolean, type: 'SEND'|'RECEIVE'|'SWAP'|'BRIDGE', token?: any }>({ isOpen: false, type: 'SEND' });
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 8;

    // CRITICAL: Reset to page 1 whenever the user switches network.
    // Without this, switching from Ethereum (300+ tokens, many pages) to Celo (few tokens, 1 page)
    // leaves currentPage at 5 and renders a blank table.
    useEffect(() => {
        setCurrentPage(1);
    }, [activeNetwork]);

    const combinedAssets = useMemo(() => {
        const activeChainId = NETWORKS[activeNetwork as NetworkId]?.chainId;

        // Map user balances into our universal list, filtering by active network
        const assetMap = new Map();
        userAssets.forEach(a => {
            if (!activeChainId || Number(a.chainId) === Number(activeChainId)) {
                assetMap.set(a.symbol.toUpperCase(), a);
            }
        });
        
        const networkMap: Record<string, string> = {
          ethereum: 'ethereum', polygon: 'polygon', arbitrum: 'arbitrum',
          optimism: 'optimism', base: 'base', bsc: 'bsc', avalanche: 'avalanche',
          fantom: 'fantom', linea: 'linea', scroll: 'scroll', celo: 'celo'
        };
        const mappedNet = networkMap[activeNetwork] || activeNetwork;
        // Explicit parens fix operator precedence:
        // Without parens: (t.addresses && t.addresses[mappedNet]) || assetMap.has(...) -- correct but ambiguous
        // With parens: unambiguous, linter-safe, readable
        const validNetworkTokens = QUANTUM_TOKENS.filter(t =>
            (t.addresses && !!t.addresses[mappedNet]) || assetMap.has(t.symbol.toUpperCase())
        );
        const combined = validNetworkTokens.map(t => {
            const userOwned = assetMap.get(t.symbol.toUpperCase());
            assetMap.delete(t.symbol.toUpperCase());
            // Prefer user's real-time price, then fall back to our snapshot
            const snapshot = TOKEN_STATS_20260530[t.symbol.toUpperCase()];
            const price = userOwned?.price ?? snapshot?.price ?? 0;
            const change24h = userOwned?.change24h ?? snapshot?.change24h ?? 0;
            const balance = userOwned?.balanceNumeric || 0;
            const value = balance > 0 ? balance * price : 0;
            
            return {
                ...t,
                address: userOwned?.address || (t.addresses ? t.addresses[mappedNet] : undefined),
                chainId: userOwned?.chainId || activeChainId,
                balance,
                price,
                value,
                change24h,
                isOwned: !!userOwned && balance > 0,
                hasSnapshot: !!snapshot
            };
        });

        // Add any remaining assets the user owns that aren't in QUANTUM_TOKENS
        assetMap.forEach((userOwned, symbol) => {
            if (userOwned.balanceNumeric > 0) {
                combined.push({
                    symbol: userOwned.symbol,
                    name: userOwned.name || userOwned.symbol,
                    address: userOwned.address,
                    chainId: userOwned.chainId || activeChainId,
                    balance: userOwned.balanceNumeric,
                    price: userOwned.price || 0,
                    value: userOwned.balanceNumeric * (userOwned.price || 0),
                    change24h: userOwned.change24h || 0,
                    isOwned: true,
                    hasSnapshot: false,
                    logoPath: userOwned.logoURI || userOwned.logo || ''
                } as any);
            }
        });

        return combined.sort((a, b) => {
            if (a.isOwned && !b.isOwned) return -1;
            if (!a.isOwned && b.isOwned) return 1;
            if (a.balance > 0 && b.balance > 0) return b.value - a.value;
            // Major assets first in unowned section
            const aMajor = ['ETH','BTC','USDC','USDT','BNB','SOL','XRP'].includes(a.symbol) ? 1 : 0;
            const bMajor = ['ETH','BTC','USDC','USDT','BNB','SOL','XRP'].includes(b.symbol) ? 1 : 0;
            if (aMajor !== bMajor) return bMajor - aMajor;
            // Tokens with live stats before unknown ones
            if (a.hasSnapshot && !b.hasSnapshot) return -1;
            if (!a.hasSnapshot && b.hasSnapshot) return 1;
            return a.symbol.localeCompare(b.symbol);
        });
    }, [userAssets, activeNetwork]);

    const handleAction = (type: 'SEND'|'RECEIVE'|'SWAP'|'BRIDGE', token: any) => {
        setActionState({ isOpen: true, type, token });
    };

    const totalPages = Math.ceil(combinedAssets.length / ITEMS_PER_PAGE);
    const paginatedAssets = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return combinedAssets.slice(start, start + ITEMS_PER_PAGE);
    }, [combinedAssets, currentPage]);

    return (
        <div className="border border-black/10 bg-white flex flex-col min-h-[500px] overflow-hidden relative">
            
            {/* Modal Gateway for Action Execution */}
            {actionState.isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/90 backdrop-blur-sm" onClick={() => setActionState({ ...actionState, isOpen: false })}>
                    <div className="w-full max-w-5xl h-[90vh] bg-white border border-black/10 shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between px-8 py-5 border-b border-black/10 bg-black/5">
                            <h2 className="text-[12px] font-black uppercase tracking-[0.3em] text-black flex items-center gap-2">
                                <img src={actionState.token?.logoPath} alt="" className="w-5 h-5 rounded-full" />
                                {actionState.type} {actionState.token?.symbol}
                            </h2>
                            <button onClick={() => setActionState({ ...actionState, isOpen: false })} className="font-black text-[10px] uppercase tracking-widest text-black/50 hover:text-black hover:bg-black/5 transition-colors border border-black/10 px-4 py-2">[CLOSE]</button>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            <UnifiedWalletModal 
                                isOpen={actionState.isOpen} 
                                initialTab={actionState.type === 'RECEIVE' ? 'SEND' : actionState.type as any}
                                onClose={() => setActionState({ ...actionState, isOpen: false })} 
                                userAssets={userAssets}
                                forceToken={actionState.token?.symbol}
                                asEmbedded={true}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Live Stats Bar */}
            <div className="flex items-center justify-between px-6 py-2 border-b border-black/5 bg-black/[0.02]">
                <div className="flex items-center gap-2">
                    <span className="text-[9px] font-bold text-[#00C076] tracking-widest">{TOKEN_STATS_DATE}</span>
                </div>
                <span className="text-[9px] font-bold text-black/30 tracking-widest uppercase">{combinedAssets.length} Assets · {activeNetwork}</span>
            </div>

            <div className="p-0 flex-1 flex flex-col overflow-y-auto custom-scrollbar">
                <table className="w-full text-left text-[11px] font-mono">
                    <thead className="bg-black/5 border-b border-black/10 text-[9px] uppercase tracking-widest text-black/50 sticky top-0 z-10 backdrop-blur-md">
                        <tr>
                            <th className="py-4 px-6 font-black w-1/4">Asset ({combinedAssets.length})</th>
                            <th className="py-4 px-6 font-black text-right w-1/5">Balance / Price</th>
                            <th className="py-4 px-6 font-black text-right w-1/6">24h Δ</th>
                            <th className="py-4 px-6 font-black text-right">Actions</th>
                            <th className="py-4 px-6 font-black text-right w-1/6">Contract</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-black/5">
                        {paginatedAssets.length > 0 ? (
                            paginatedAssets.map((token, idx) => (
                                <tr key={`${token.symbol}-${idx}`} className="hover:bg-black/[0.03] transition-colors group/row">
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-4">
                                        <TokenLogo 
                                            symbol={token.symbol} 
                                            name={token.name}
                                            logoURI={token.logoPath} 
                                            className="w-8 h-8 rounded-full shadow-sm" 
                                            fallbackClassName="w-8 h-8 rounded-full bg-black/5 p-0.5 border border-black/10 flex items-center justify-center shrink-0 shadow-sm text-[8px] font-black" 
                                        />
                                            <div className="flex flex-col">
                                                <span className="font-black text-[13px] text-black tracking-wider flex items-center gap-2">
                                                    {token.symbol}
                                                    {token.isOwned && <span className="text-[7px] bg-[#00C076]/10 text-[#00C076] px-1.5 py-0.5 font-black uppercase tracking-widest rounded-sm">Owned</span>}
                                                </span>
                                                <span className="text-[10px] text-black/40 font-bold tracking-widest">{token.name}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        <div className="flex flex-col items-end">
                                            <span className={`font-black text-sm ${token.isOwned ? 'text-black' : 'text-black/30'}`}>
                                                {token.balance > 0 ? Number(token.balance).toFixed(6) : "0.00"}
                                            </span>
                                            {token.value > 0 && <span className="text-[10px] text-black/50 font-bold">${safeToFixed(token.value, 2)}</span>}
                                            {token.price > 0 && !token.isOwned && (
                                                <span className="text-[9px] text-black/30 font-bold font-mono">
                                                    ${token.price >= 1 ? safeToFixed(token.price, 2) : token.price >= 0.0001 ? token.price.toFixed(6) : token.price.toExponential(2)}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        <div className={`flex items-center justify-end gap-1.5 ${token.change24h >= 0 ? 'text-[#00C076]' : 'text-red-500'} ${!token.isOwned && 'opacity-60'}`}>
                                            {token.change24h >= 0 ? <ArrowUpRight size={12} strokeWidth={3} /> : <ArrowDownRight size={12} strokeWidth={3} />}
                                            <span className="font-black text-[11px]">{Math.abs(token.change24h).toFixed(2)}%</span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex items-center justify-end gap-2 opacity-30 group-hover/row:opacity-100 transition-opacity">
                                            <button onClick={() => handleAction('SEND', token)} className="p-1.5 border border-black/10 hover:bg-black hover:text-white transition-colors" title="Send">
                                                <Send size={12} />
                                            </button>
                                            <button onClick={() => handleAction('RECEIVE', token)} className="p-1.5 border border-black/10 hover:bg-black hover:text-white transition-colors" title="Receive">
                                                <Download size={12} />
                                            </button>
                                            <button onClick={() => handleAction('SWAP', token)} className="p-1.5 border border-black/10 hover:bg-black hover:text-white transition-colors" title="Swap">
                                                <ArrowRightLeft size={12} />
                                            </button>
                                            <button onClick={() => handleAction('BRIDGE', token)} className="p-1.5 border border-black/10 hover:bg-black hover:text-white transition-colors" title="Bridge">
                                                <Route size={12} />
                                            </button>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        {token.address === 'native' ? (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-black/[0.02] border border-black/5 rounded-sm text-[9px] text-black/30 uppercase tracking-[0.2em] font-black">
                                                Native Asset
                                            </span>
                                        ) : token.address && token.address !== '0x0000000000000000000000000000000000000000' && token.address.length > 20 ? (
                                            <a 
                                                href={`${scannerBase}/token/${token.address}`} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-black/5 border border-black/10 rounded-sm text-[10px] text-black/50 hover:text-black hover:border-black/30 hover:bg-white transition-all font-bold tracking-widest"
                                            >
                                                {token.address.slice(0,6)}...{token.address.slice(-4)}
                                                <ExternalLink size={10} />
                                            </a>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-sm text-[9px] text-blue-400 uppercase tracking-[0.2em] font-black">
                                                Multi-Chain
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="py-20">
                                    <div className="flex flex-col items-center justify-center text-center">
                                        <Database size={32} className="text-black/20 mb-4" />
                                        <p className="text-[12px] text-black/40 uppercase tracking-[0.2em] font-black mb-1">No Assets Found</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-black/10 bg-white sticky bottom-0 z-10 shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
                    <span className="text-[10px] font-black text-black/40 uppercase tracking-widest">
                        Page {currentPage} of {totalPages}
                    </span>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="px-4 py-2 border border-black/10 rounded-sm text-[10px] font-black uppercase tracking-widest text-black/60 hover:text-black hover:bg-black/5 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                        >
                            Previous
                        </button>
                        <button 
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 border border-black/10 rounded-sm text-[10px] font-black uppercase tracking-widest text-black/60 hover:text-black hover:bg-black/5 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

