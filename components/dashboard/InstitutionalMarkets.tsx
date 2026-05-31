"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { getParsedMarkets, RAW_NETWORKS } from '@/lib/data/markets-data';

import { motion, AnimatePresence } from 'framer-motion';
import { TokenLogo } from '@/components/ui/TokenLogo';

export function InstitutionalMarkets() {
    const [tokens, setTokens] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [filterChain, setFilterChain] = useState<string | null>(null);
    const [sortCol, setSortCol] = useState<string | null>(null);
    const [sortDesc, setSortDesc] = useState(true);
    const [showChainDropdown, setShowChainDropdown] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 8;

    useEffect(() => {
        setTokens(getParsedMarkets());
    }, []);

    const parseNum = (val: string) => {
        const cleaned = val.replace(/[^0-9.-]/g, '');
        let num = parseFloat(cleaned);
        if (val.includes('B')) num *= 1e9;
        if (val.includes('M')) num *= 1e6;
        if (val.includes('T')) num *= 1e12;
        if (val.includes('K')) num *= 1e3;
        return isNaN(num) ? 0 : num;
    };

    const sortedAndFiltered = useMemo(() => {
        let result = tokens;

        // Apply chain filter
        if (filterChain) {
            result = result.filter(t => t.network === filterChain);
        }

        // Apply search
        if (search.trim()) {
            const term = search.toLowerCase();
            result = result.filter(t => 
                t.name.toLowerCase().includes(term) || 
                t.ticker.toLowerCase().includes(term)
            );
        }

        // Apply sorting
        if (sortCol) {
            result = [...result].sort((a, b) => {
                let aVal: number, bVal: number;
                switch(sortCol) {
                    case 'Price':
                        aVal = parseNum(a.price);
                        bVal = parseNum(b.price);
                        break;
                    case '24h change':
                        aVal = parseNum(a.change24h);
                        bVal = parseNum(b.change24h);
                        break;
                    case 'Market cap':
                        aVal = parseNum(a.mcap);
                        bVal = parseNum(b.mcap);
                        break;
                    case 'Circulation':
                        aVal = parseNum(a.circulation);
                        bVal = parseNum(b.circulation);
                        break;
                    default:
                        aVal = 0; bVal = 0;
                }
                if (aVal < bVal) return sortDesc ? 1 : -1;
                if (aVal > bVal) return sortDesc ? -1 : 1;
                return 0;
            });
        }

        return result;
    }, [tokens, search, filterChain, sortCol, sortDesc]);

    const handleSort = (col: string) => {
        if (sortCol === col) {
            setSortDesc(!sortDesc);
        } else {
            setSortCol(col);
            setSortDesc(true);
        }
    };

    const isNegative = (chg: string) => chg.startsWith('-');

    const totalPages = Math.ceil(sortedAndFiltered.length / ITEMS_PER_PAGE);
    const paginatedAssets = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return sortedAndFiltered.slice(start, start + ITEMS_PER_PAGE);
    }, [sortedAndFiltered, currentPage]);

    return (
        <div className="w-full h-full min-h-0 flex flex-col p-4 md:p-8 bg-white  text-[#050505]  font-mono overflow-hidden transition-colors">
            
            {/* Header section  Search & Filter only */}
            <div className="max-w-[1400px] mx-auto w-full flex-shrink-0">
                {/* Search and Filter Row */}
                <div className="flex flex-col md:flex-row gap-4 mt-2 relative z-20">
                    <div className="relative flex-1 group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <span className="font-mono text-[10px] font-black text-[#888888]">[SCH]</span>
                        </div>
                        <input 
                            type="text" 
                            className="block w-full pl-11 pr-4 py-3 bg-[#F9F9F9]  border border-[#E5E5E5]  rounded-xl text-[13px] text-[#050505]  focus:outline-none focus:ring-1 focus:ring-[#050505]  transition-all font-mono"
                            placeholder="Filter by name, ticker, or contract address"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <button 
                                onClick={() => setShowChainDropdown(!showChainDropdown)}
                                className="flex items-center gap-2 px-5 py-3 bg-[#F9F9F9]  border border-[#E5E5E5]  rounded-xl text-[13px] font-bold text-[#050505]  hover:bg-[#E5E5E5]  transition-colors"
                            >
                                {filterChain ? filterChain : 'Blockchain'}
                                <span className="font-mono text-[10px] font-black opacity-50">[v]</span>
                            </button>

                            <AnimatePresence>
                                {showChainDropdown && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="absolute left-0 md:left-auto md:right-0 top-full mt-2 w-64 max-h-[300px] overflow-y-auto bg-white  border border-[#E5E5E5]  shadow-2xl rounded-xl z-50 py-2"
                                    >
                                        <div className="px-4 py-2 border-b border-[#E5E5E5]  sticky top-0 bg-white  font-black text-[10px] text-[#888888] tracking-widest uppercase">Select Network</div>
                                        {RAW_NETWORKS.map(net => (
                                            <button
                                                key={net}
                                                onClick={() => { setFilterChain(net); setShowChainDropdown(false); }}
                                                className={`w-full text-left px-4 py-2 text-[12px] hover:bg-[#F0F0F0]  transition-colors ${filterChain === net ? 'font-bold bg-[#F9F9F9] ' : ''}`}
                                            >
                                                {net}
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                        <button 
                            onClick={() => { setFilterChain(null); setSearch(''); }}
                            className="flex items-center justify-center p-3 text-[#888888] hover:text-[#050505]  bg-[#F9F9F9]  border border-[#E5E5E5]  rounded-xl transition-colors group"
                            title="Reset filters"
                        >
                            <span className="font-mono text-[10px] font-black group-hover:scale-110 transition-transform duration-500">[RST]</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Data Table */}
            <div className="max-w-[1400px] mx-auto w-full flex-1 flex flex-col min-h-0 mt-6 md:mt-8 border border-[#E5E5E5]  rounded-2xl overflow-hidden bg-white  shadow-sm relative z-10">
                {/* Table Header */}
                <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_1fr] px-6 py-4 border-b border-[#E5E5E5]  bg-[#F9F9F9]  text-[11px] font-black text-[#888888] uppercase tracking-widest sticky top-0 z-10">
                    <div className="cursor-pointer hover:text-[#050505]  flex items-center" onClick={() => handleSort('Token')}>Token <span className="font-mono text-[9px] font-black opacity-50 ml-2">[^v]</span></div>
                    <div className="cursor-pointer hover:text-[#050505]  flex items-center justify-end text-right" onClick={() => handleSort('Price')}>Price <span className="font-mono text-[9px] font-black opacity-50 ml-2">[^v]</span></div>
                    <div className="cursor-pointer hover:text-[#050505]  flex items-center justify-end text-right" onClick={() => handleSort('24h change')}>24h change <span className="font-mono text-[9px] font-black opacity-50 ml-2">[^v]</span></div>
                    <div className="cursor-pointer hover:text-[#050505]  flex items-center justify-end text-right" onClick={() => handleSort('Market cap')}>Market cap <span className="font-mono text-[9px] font-black opacity-50 ml-2">[^v]</span></div>
                    <div className="cursor-pointer hover:text-[#050505]  flex items-center justify-end text-right" onClick={() => handleSort('Circulation')}>Circulation <span className="font-mono text-[9px] font-black opacity-50 ml-2">[^v]</span></div>
                </div>

                {/* Table Body */}
                <div className="flex-1 overflow-y-auto">
                    {paginatedAssets.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-[12px] text-[#888888] uppercase tracking-widest font-black">
                            NO ASSETS FOUND FOR SELECTED CRITERIA
                        </div>
                    ) : (
                        paginatedAssets.map((t, idx) => (
                            <div key={idx} className="flex flex-col md:grid md:grid-cols-[2fr_1fr_1fr_1fr_1fr] p-4 md:px-6 md:py-4 border-b border-[#F0F0F0]  hover:bg-[#F9F9F9]  transition-colors md:items-center gap-3 md:gap-0">
                                {/* Mobile Top Row / Desktop Col 1 */}
                                <div className="flex items-center justify-between md:justify-start gap-4 min-w-0">
                                    <div className="flex items-center gap-3 md:gap-4 min-w-0">
                                        <TokenLogo 
                                            symbol={t.ticker} 
                                            name={t.name}
                                            className="w-8 h-8 md:w-10 md:h-10 rounded-full shadow-inner shrink-0" 
                                            fallbackClassName="w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#E5E5E5] flex items-center justify-center text-[12px] md:text-[14px] font-black shrink-0 text-[#050505] shadow-inner"
                                        />
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-[14px] md:text-[15px] font-bold truncate text-[#050505] ">{t.name}</span>
                                            <span className="text-[11px] text-[#888888]  uppercase tracking-wide">{t.ticker}</span>
                                        </div>
                                    </div>
                                    
                                    {/* Mobile Only Price & Change */}
                                    <div className="flex flex-col items-end md:hidden">
                                        <div className="text-right text-[14px] font-bold text-[#050505] ">
                                            {t.price} <span className="text-[10px] text-[#888888] font-normal">{t.currencyPrice}</span>
                                        </div>
                                        <div className={`text-right text-[12px] font-bold ${isNegative(t.change24h) ? 'text-black opacity-60' : 'text-black'}`}>
                                            {t.change24h}
                                        </div>
                                    </div>
                                </div>

                                {/* Desktop Price (Hidden on Mobile) */}
                                <div className="hidden md:block text-right text-[14px] font-bold text-[#050505] ">
                                    {t.price} <span className="text-[10px] text-[#888888] font-normal">{t.currencyPrice}</span>
                                </div>

                                {/* Desktop 24h change (Hidden on Mobile) */}
                                <div className={`hidden md:block text-right text-[14px] font-bold ${isNegative(t.change24h) ? 'text-black opacity-60' : 'text-black'}`}>
                                    {t.change24h}
                                </div>

                                {/* Market cap & Circulation - Row 2 on mobile, Col 4 & 5 on desktop */}
                                <div className="flex items-center justify-between md:hidden pt-3 border-t border-[#F0F0F0] ">
                                    <div className="flex flex-col">
                                        <span className="text-[9px] text-[#888888] uppercase font-black tracking-widest mb-0.5">Market Cap</span>
                                        <div className="text-[13px] font-bold text-[#050505] ">
                                            {t.mcap} <span className="text-[9px] text-[#888888] font-normal">{t.mcapCurrency}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-[9px] text-[#888888] uppercase font-black tracking-widest mb-0.5">Circulation</span>
                                        <div className="text-[13px] font-bold text-[#050505] ">
                                            {t.circulation}
                                        </div>
                                    </div>
                                </div>

                                {/* Desktop MCap */}
                                <div className="hidden md:block text-right text-[14px] font-bold text-[#050505] ">
                                    {t.mcap} <span className="text-[10px] text-[#888888] font-normal">{t.mcapCurrency}</span>
                                </div>

                                {/* Desktop Circulation */}
                                <div className="hidden md:block text-right text-[14px] font-bold text-[#050505] ">
                                    {t.circulation}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 mt-4 bg-[#F9F9F9] border border-[#E5E5E5] rounded-xl max-w-[1400px] mx-auto w-full flex-shrink-0">
                    <span className="text-[10px] font-black text-black/40 uppercase tracking-widest">
                        Page {currentPage} of {totalPages}
                    </span>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="px-4 py-2 border border-[#E5E5E5] bg-white rounded-lg text-[10px] font-black uppercase tracking-widest text-[#050505]/60 hover:text-[#050505] disabled:opacity-30 disabled:pointer-events-none transition-colors"
                        >
                            Previous
                        </button>
                        <button 
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 border border-[#E5E5E5] bg-white rounded-lg text-[10px] font-black uppercase tracking-widest text-[#050505]/60 hover:text-[#050505] disabled:opacity-30 disabled:pointer-events-none transition-colors"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
