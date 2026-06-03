"use client";

import React, { useMemo, useState, useEffect } from 'react';
import { Database, ExternalLink, ArrowUpRight, ArrowDownRight, Send, Download, ArrowRightLeft, Route, Activity, X, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { safeToFixed } from '@/lib/utils/number-format';
import { QUANTUM_TOKENS } from '@/lib/config/tokens';
import { TOKEN_STATS_20260530, TOKEN_STATS_DATE } from '@/config/token-stats-snapshot';
import UnifiedWalletModal from '@/components/wallet/UnifiedWalletModal';
import ReceiveHub from '@/components/wallet/ReceiveHub';
import { TokenLogo } from '@/components/ui/TokenLogo';
import { NETWORKS, NetworkId } from '@/lib/store/wallet-store';

export function QuantumHoldingsEngine({ address, activeNetwork, scannerBase, userAssets = [] }: { address: string, activeNetwork: string, scannerBase: string, userAssets?: any[] }) {
    
    const [actionState, setActionState] = useState<{ isOpen: boolean, type: 'SEND'|'RECEIVE'|'SWAP'|'BRIDGE'|null, token: any }>({ isOpen: false, type: null, token: null });
    const [selectedToken, setSelectedToken] = useState<any | null>(null);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [importAddress, setImportAddress] = useState('');
    const [isImporting, setIsImporting] = useState(false);
    const [showSpam, setShowSpam] = useState(false);
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
                const value = userOwned.balanceNumeric * (userOwned.price || 0);
                const isSpam = !userOwned.price || (userOwned.price < 0.0001 && value < 1.00);

                combined.push({
                    symbol: userOwned.symbol,
                    name: userOwned.name || userOwned.symbol,
                    address: userOwned.address,
                    chainId: userOwned.chainId || activeChainId,
                    balance: userOwned.balanceNumeric,
                    price: userOwned.price || 0,
                    value: value,
                    change24h: userOwned.change24h || 0,
                    isOwned: true,
                    hasSnapshot: false,
                    isSpam: isSpam,
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

    const legitimateAssets = useMemo(() => combinedAssets.filter(a => !a.isSpam), [combinedAssets]);
    const spamAssets = useMemo(() => combinedAssets.filter(a => a.isSpam), [combinedAssets]);
    const displayAssets = showSpam ? spamAssets : legitimateAssets;

    const totalPages = Math.ceil(displayAssets.length / ITEMS_PER_PAGE);
    const paginatedAssets = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return displayAssets.slice(start, start + ITEMS_PER_PAGE);
    }, [displayAssets, currentPage]);

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
                            {actionState.type === 'RECEIVE' ? (
                                <div className="p-4 flex items-center justify-center min-h-[60vh]">
                                    <ReceiveHub addresses={[{
                                        network: activeNetwork,
                                        address: address,
                                        token: actionState.token?.symbol || 'ETH',
                                        iconPath: actionState.token?.logoPath
                                    }]} />
                                </div>
                            ) : (
                                <UnifiedWalletModal 
                                    isOpen={actionState.isOpen} 
                                    initialTab={actionState.type as any}
                                    onClose={() => setActionState({ ...actionState, isOpen: false })} 
                                    userAssets={userAssets}
                                    forceToken={actionState.token?.symbol}
                                    asEmbedded={true}
                                />
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Import Token Modal */}
            <AnimatePresence>
                {isImportModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white w-full max-w-md border border-black/10 shadow-2xl overflow-hidden flex flex-col">
                            <div className="p-6 border-b border-black/5 flex items-center justify-between">
                                <span className="font-black text-sm uppercase tracking-widest">Import Custom Token</span>
                                <button onClick={() => setIsImportModalOpen(false)} className="text-black/30 hover:text-black transition-colors"><X size={18} /></button>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="bg-blue-500/10 border border-blue-500/20 p-4 flex items-start gap-3 rounded-[12px]">
                                    <span className="font-black text-[10px] text-blue-600 shrink-0 mt-0.5">[INFO]</span>
                                    <p className="text-[10px] text-blue-700 font-bold uppercase tracking-widest leading-relaxed">
                                        Anyone can create a token, including fake versions of existing tokens. Learn about scams and security risks.
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-black/40 uppercase tracking-widest">Token Contract Address</label>
                                    <input 
                                        type="text" 
                                        value={importAddress} 
                                        onChange={(e) => setImportAddress(e.target.value)} 
                                        placeholder="0x..." 
                                        className="w-full bg-black/[0.02] border border-black/10 p-4 font-mono text-sm focus:outline-none focus:border-black/30 transition-colors"
                                    />
                                </div>
                                <button 
                                    disabled={importAddress.length !== 42 || isImporting}
                                    onClick={() => {
                                        setIsImporting(true);
                                        setTimeout(() => {
                                            setIsImporting(false);
                                            setIsImportModalOpen(false);
                                            setImportAddress('');
                                        }, 1500);
                                    }}
                                    className="w-full py-4 bg-black text-white font-black text-[11px] uppercase tracking-[0.2em] hover:bg-black/80 transition-colors disabled:opacity-30 flex justify-center"
                                >
                                    {isImporting ? <Activity size={16} className="animate-pulse" /> : 'Import'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Token Detail Slide-Over Panel */}
            <AnimatePresence>
                {selectedToken && (
                    <TokenDetailPanel 
                        token={selectedToken} 
                        onClose={() => setSelectedToken(null)}
                        onAction={(type) => {
                            setSelectedToken(null);
                            handleAction(type, selectedToken);
                        }}
                    />
                )}
            </AnimatePresence>

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
                                <tr 
                                    key={`${token.symbol}-${idx}`} 
                                    className="hover:bg-black/[0.03] transition-colors group/row cursor-pointer"
                                    onClick={() => setSelectedToken(token)}
                                >
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
                                        <div className="flex flex-col items-end gap-1">
                                            <div className={`flex items-center justify-end gap-1.5 ${token.change24h >= 0 ? 'text-[#00C076]' : 'text-red-500'} ${!token.isOwned && 'opacity-60'}`}>
                                                {token.change24h >= 0 ? <ArrowUpRight size={12} strokeWidth={3} /> : <ArrowDownRight size={12} strokeWidth={3} />}
                                                <span className="font-black text-[11px]">{Math.abs(token.change24h).toFixed(2)}%</span>
                                            </div>
                                            <Sparkline isPositive={token.change24h >= 0} />
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex items-center justify-end gap-2 opacity-30 group-hover/row:opacity-100 transition-opacity">
                                            <button onClick={(e) => { e.stopPropagation(); handleAction('SEND', token); }} className="p-1.5 border border-black/10 hover:bg-black hover:text-white transition-colors" title="Send">
                                                <Send size={12} />
                                            </button>
                                            <button onClick={(e) => { e.stopPropagation(); handleAction('RECEIVE', token); }} className="p-1.5 border border-black/10 hover:bg-black hover:text-white transition-colors" title="Receive">
                                                <Download size={12} />
                                            </button>
                                            <button onClick={(e) => { e.stopPropagation(); handleAction('SWAP', token); }} className="p-1.5 border border-black/10 hover:bg-black hover:text-white transition-colors" title="Swap">
                                                <ArrowRightLeft size={12} />
                                            </button>
                                            <button onClick={(e) => { e.stopPropagation(); handleAction('BRIDGE', token); }} className="p-1.5 border border-black/10 hover:bg-black hover:text-white transition-colors" title="Bridge">
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
                                                onClick={(e) => e.stopPropagation()}
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
                        {spamAssets.length > 0 && !showSpam && (
                            <tr>
                                <td colSpan={5} className="py-4 text-center border-t border-black/5 bg-black/[0.01]">
                                    <button onClick={() => { setShowSpam(true); setCurrentPage(1); }} className="text-[10px] font-black uppercase tracking-widest text-black/40 hover:text-black transition-colors">
                                        Show {spamAssets.length} Hidden Spam Tokens
                                    </button>
                                </td>
                            </tr>
                        )}
                        {showSpam && (
                            <tr>
                                <td colSpan={5} className="py-4 text-center border-t border-red-500/10 bg-red-500/5">
                                    <button onClick={() => { setShowSpam(false); setCurrentPage(1); }} className="text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-700 transition-colors">
                                        Hide Spam Tokens
                                    </button>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination & Import Controls */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-black/10 bg-white sticky bottom-0 z-10 shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
                <button onClick={() => setIsImportModalOpen(true)} className="text-[10px] font-black uppercase tracking-widest text-[#0376c9] hover:text-black transition-colors flex items-center gap-1">
                    <span className="text-[14px] leading-none">+</span> Import tokens
                </button>
                
                {totalPages > 1 && (
                    <div className="flex items-center gap-4">
                        <span className="text-[10px] font-black text-black/40 uppercase tracking-widest">
                            Page {currentPage} of {totalPages}
                        </span>
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1.5 border border-black/10 text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-colors disabled:opacity-30"
                            >
                                Prev
                            </button>
                            <button 
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1.5 border border-black/10 text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-colors disabled:opacity-30"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function Sparkline({ isPositive }: { isPositive: boolean }) {
    // Generate a simple, stable-ish pseudo-random sparkline
    const points = React.useMemo(() => {
        let current = 50;
        const pts = [];
        for (let i = 0; i < 20; i++) {
            pts.push(current);
            const move = (Math.random() - 0.5) * 10;
            current += isPositive ? move + 1 : move - 1; 
        }
        
        // normalize to 0-100 for SVG
        const min = Math.min(...pts);
        const max = Math.max(...pts);
        return pts.map((p, i) => {
            const x = (i / 19) * 40;
            const y = 20 - ((p - min) / (max - min || 1)) * 20;
            return `${x},${y}`;
        }).join(" ");
    }, [isPositive]);

    return (
        <svg width="40" height="20" viewBox="0 0 40 20" className="opacity-50">
            <polyline
                fill="none"
                stroke={isPositive ? "#00C076" : "#ef4444"}
                strokeWidth="1.5"
                points={points}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function TokenDetailPanel({ token, onClose, onAction }: { token: any, onClose: () => void, onAction: (type: 'SEND'|'RECEIVE'|'SWAP'|'BRIDGE') => void }) {
    const [isRevoking, setIsRevoking] = useState(false);
    const [allowanceCleared, setAllowanceCleared] = useState(false);

    const handleRevoke = () => {
        setIsRevoking(true);
        setTimeout(() => {
            setIsRevoking(false);
            setAllowanceCleared(true);
        }, 1800);
    };
    return (
        <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute inset-y-0 right-0 w-full md:w-[450px] bg-white border-l border-black/10 shadow-2xl z-50 flex flex-col"
        >
            <div className="flex items-center justify-between p-6 border-b border-black/5">
                <div className="flex items-center gap-3">
                    <TokenLogo 
                        symbol={token.symbol} 
                        name={token.name}
                        logoURI={token.logoPath} 
                        className="w-10 h-10 rounded-full shadow-sm" 
                        fallbackClassName="w-10 h-10 rounded-full bg-black/5 p-1 border border-black/10 flex items-center justify-center shrink-0 shadow-sm text-[10px] font-black" 
                    />
                    <div className="flex flex-col">
                        <span className="font-black text-xl text-black">{token.name}</span>
                        <span className="text-[10px] text-black/40 font-bold tracking-widest">{token.symbol}</span>
                    </div>
                </div>
                <button onClick={onClose} className="p-2 text-black/40 hover:text-black hover:bg-black/5 transition-colors">
                    <X size={20} />
                </button>
            </div>

            <div className="p-8 flex-1 overflow-y-auto">
                <div className="mb-8">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-black/30 mb-2 block">Your Balance</span>
                    <div className="flex flex-col">
                        <span className="text-4xl font-light tracking-tighter text-black">
                            {token.balance > 0 ? Number(token.balance).toFixed(4) : "0.00"} <span className="text-xl text-black/40">{token.symbol}</span>
                        </span>
                        {token.value > 0 && <span className="text-sm font-mono text-black/50 mt-1">${safeToFixed(token.value, 2)} USD</span>}
                    </div>
                </div>

                <div className="grid grid-cols-4 gap-2 mb-10">
                    <button onClick={() => onAction('SEND')} className="flex flex-col items-center justify-center p-4 bg-black/[0.02] hover:bg-black hover:text-white border border-black/5 hover:border-black transition-all group">
                        <Send size={16} className="mb-2 opacity-50 group-hover:opacity-100" />
                        <span className="text-[9px] font-black uppercase tracking-widest">Send</span>
                    </button>
                    <button onClick={() => onAction('RECEIVE')} className="flex flex-col items-center justify-center p-4 bg-black/[0.02] hover:bg-black hover:text-white border border-black/5 hover:border-black transition-all group">
                        <Download size={16} className="mb-2 opacity-50 group-hover:opacity-100" />
                        <span className="text-[9px] font-black uppercase tracking-widest">Receive</span>
                    </button>
                    <button onClick={() => onAction('SWAP')} className="flex flex-col items-center justify-center p-4 bg-black/[0.02] hover:bg-black hover:text-white border border-black/5 hover:border-black transition-all group">
                        <ArrowRightLeft size={16} className="mb-2 opacity-50 group-hover:opacity-100" />
                        <span className="text-[9px] font-black uppercase tracking-widest">Swap</span>
                    </button>
                    <button onClick={() => onAction('BRIDGE')} className="flex flex-col items-center justify-center p-4 bg-black/[0.02] hover:bg-black hover:text-white border border-black/5 hover:border-black transition-all group">
                        <Route size={16} className="mb-2 opacity-50 group-hover:opacity-100" />
                        <span className="text-[9px] font-black uppercase tracking-widest">Bridge</span>
                    </button>
                </div>

                <div className="p-6 border border-black/10 bg-black/[0.02] mb-6">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-black/30 mb-6 block">Performance 24h</span>
                    <div className="flex items-center justify-between mb-4">
                        <span className="font-mono text-xl">${token.price >= 1 ? safeToFixed(token.price, 2) : token.price >= 0.0001 ? token.price.toFixed(6) : token.price.toExponential(2)}</span>
                        <div className={`flex items-center gap-1 px-3 py-1.5 ${token.change24h >= 0 ? 'bg-[#00C076]/10 text-[#00C076]' : 'bg-red-500/10 text-red-500'}`}>
                            {token.change24h >= 0 ? <ArrowUpRight size={14} strokeWidth={3} /> : <ArrowDownRight size={14} strokeWidth={3} />}
                            <span className="font-black text-sm">{Math.abs(token.change24h).toFixed(2)}%</span>
                        </div>
                    </div>
                    <div className="h-[80px] w-full mt-4 flex items-center justify-center border-t border-black/5 pt-4">
                        {/* We reuse the simple sparkline but larger */}
                        <svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 100 40" className="opacity-80">
                            <polyline
                                fill="none"
                                stroke={token.change24h >= 0 ? "#00C076" : "#ef4444"}
                                strokeWidth="2"
                                points={React.useMemo(() => {
                                    let current = 20;
                                    const pts = [];
                                    for (let i = 0; i < 30; i++) {
                                        pts.push(current);
                                        const move = (Math.random() - 0.5) * 5;
                                        current += token.change24h >= 0 ? move + 0.5 : move - 0.5;
                                    }
                                    const min = Math.min(...pts);
                                    const max = Math.max(...pts);
                                    return pts.map((p, i) => {
                                        const x = (i / 29) * 100;
                                        const y = 40 - ((p - min) / (max - min || 1)) * 40;
                                        return `${x},${y}`;
                                    }).join(" ");
                                }, [token.change24h])}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </div>
                </div>

                {!token.isNative && (
                    <div className="p-6 border border-black/10 bg-white mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-black/30 block">Smart Contract Permissions</span>
                            <Shield size={14} className="text-black/20" />
                        </div>
                        <div className="flex items-center justify-between border-b border-black/5 pb-3 mb-3">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black uppercase tracking-widest text-black/80">Uniswap Router</span>
                                <span className="text-[9px] font-bold text-black/40 font-mono">Unlimited Allowance</span>
                            </div>
                            {allowanceCleared ? (
                                <span className="text-[9px] font-black uppercase tracking-widest text-[#00C076] bg-[#00C076]/10 px-2 py-1">Revoked</span>
                            ) : (
                                <button onClick={handleRevoke} disabled={isRevoking} className="text-[9px] font-black uppercase tracking-widest text-red-500 bg-red-500/10 hover:bg-red-500 hover:text-white px-3 py-1.5 transition-colors disabled:opacity-50">
                                    {isRevoking ? 'Revoking...' : 'Revoke'}
                                </button>
                            )}
                        </div>
                        <p className="text-[9px] font-bold text-black/40 leading-relaxed">
                            Revoking unlimited spending approvals protects your wallet from being drained if a protocol is compromised.
                        </p>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
