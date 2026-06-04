"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Globe, Info, Zap } from 'lucide-react';

interface MarketEntry {
    country: string;
    market: string;
    product: string;
    hours: string;
}

interface RegionData {
    id: string;
    label: string;
    markets: MarketEntry[];
}

const REGIONS: RegionData[] = [
    {
        id: 'na-global',
        label: 'North America & Global',
        markets: [
            { country: 'Canada', market: 'Toronto Stock Exchange', product: 'Stocks & ETFs', hours: '15:30-22:00' },
            { country: 'Canada', market: 'Toronto Ventures Exchange', product: 'Stocks & ETFs', hours: '15:30-22:00' },
            { country: 'United States', market: 'CBOE', product: 'Options', hours: '15:30-22:15' },
            { country: 'United States', market: 'CME', product: 'Futures', hours: '24:00-23:00' },
            { country: 'United States', market: 'CME', product: 'Options', hours: '24:00-23:00' },
            { country: 'United States', market: 'CBOT', product: 'Futures', hours: '24:00-23:00' },
            { country: 'United States', market: 'COMEX', product: 'Futures', hours: '24:00-23:00' },
            { country: 'United States', market: 'NASDAQ', product: 'Stocks & ETFs', hours: '15:30-22:00' },
            { country: 'United States', market: 'NYMEX', product: 'Futures', hours: '24:00-23:00' },
            { country: 'United States', market: 'NYSE', product: 'Stocks & ETFs', hours: '15:30-22:00' },
            { country: 'United States', market: 'NYSE American', product: 'Stocks & ETFs', hours: '15:30-22:00' },
            { country: 'United States', market: 'NYSE Arca', product: 'Stocks & ETFs', hours: '15:30-22:00' },
            { country: 'Global', market: 'Tradegate', product: 'Stocks & ETFs', hours: '07:30-22:00' },
        ]
    },
    {
        id: 'asia-oceania',
        label: 'Asia & Oceania',
        markets: [
            { country: 'Australia', market: 'ASX', product: 'Stocks & ETFs', hours: '24:00-06:00' },
            { country: 'Hong Kong', market: 'HKEX', product: 'Stocks & ETFs', hours: '03:30-09:00' },
            { country: 'Japan', market: 'TSE', product: 'Stocks & ETFs', hours: '02:00-04:30 & 05:30-08:00' },
            { country: 'Singapore', market: 'SGX', product: 'Stocks & ETFs', hours: '03:00-06:00 & 07:00-11:00' },
        ]
    },
    {
        id: 'uk-ireland',
        label: 'UK & Ireland',
        markets: [
            { country: 'Ireland', market: 'Euronext Dublin', product: 'Stocks & ETFs', hours: '09:00-17:30' },
            { country: 'United Kingdom', market: 'LSE', product: 'Stocks & ETFs', hours: '09:00-17:30' },
        ]
    },
    {
        id: 'europe-ag',
        label: 'Europe (A-G)',
        markets: [
            { country: 'Germany', market: 'Börse Frankfurt', product: 'Stocks & ETFs', hours: '08:00-22:00' },
            { country: 'Germany', market: 'Eurex', product: 'Futures', hours: '08:00-22:00' },
            { country: 'Germany', market: 'Eurex', product: 'Options', hours: '08:00-17:30' },
            { country: 'Germany', market: 'Xetra', product: 'Bonds', hours: '09:00-17:30' },
            { country: 'Germany', market: 'Xetra', product: 'Stocks & ETFs', hours: '09:00-17:30' },
            { country: 'Austria', market: 'Wiener Boerse AG', product: 'Stocks & ETFs', hours: '08:55-17:35' },
            { country: 'Belgium', market: 'Euronext Brussel', product: 'Bonds', hours: '09:00-17:30' },
            { country: 'Belgium', market: 'Euronext Brussel', product: 'Stocks & ETFs', hours: '09:00-17:30' },
            { country: 'Belgium', market: 'Derivatives Brussel', product: 'Futures', hours: '09:00-17:30' },
            { country: 'Belgium', market: 'Derivatives Brussel', product: 'Options', hours: '09:00-17:30' },
            { country: 'Denmark', market: 'Nasdaq Copenhagen', product: 'Futures', hours: '09:00-16:55' },
            { country: 'Denmark', market: 'Nasdaq Copenhagen', product: 'Options', hours: '09:00-16:55' },
            { country: 'Spain', market: 'Bolsa de Madrid', product: 'Stocks & ETFs', hours: '09:00-17:45' },
            { country: 'Spain', market: 'MEFF', product: 'Options', hours: '09:00-17:30' },
            { country: 'Spain', market: 'MEFF (IBEX 35)', product: 'Futures', hours: '08:00-22:00' },
            { country: 'Spain', market: 'MEFF (other)', product: 'Futures', hours: '09:00-17:30' },
            { country: 'Finland', market: 'Nasdaq Helsinki', product: 'Futures', hours: '09:00-17:25' },
            { country: 'Finland', market: 'Nasdaq Helsinki', product: 'Options', hours: '09:00-17:25' },
            { country: 'France', market: 'Derivatives Paris', product: 'Futures', hours: '08:00-22:00' },
            { country: 'France', market: 'Derivatives Paris', product: 'Options', hours: '09:00-17:30' },
            { country: 'France', market: 'Euronext Paris', product: 'Bonds', hours: '09:00-17:30' },
            { country: 'France', market: 'Euronext Paris', product: 'Stocks & ETFs', hours: '09:00-17:30' },
            { country: 'Greece', market: 'Athens Stock Exchange', product: 'Stocks & ETFs', hours: '09:15-16:20' },
        ]
    },
    {
        id: 'europe-hz',
        label: 'Europe (H-Z)',
        markets: [
            { country: 'Italy', market: 'Euronext Milan', product: 'Stocks & ETFs', hours: '09:00-17:30' },
            { country: 'Italy', market: 'Euronext Milan', product: 'Futures', hours: '08:00-20:00' },
            { country: 'Italy', market: 'Euronext Milan', product: 'Options', hours: '09:00-18:00' },
            { country: 'Norway', market: 'Euronext Oslo Bors', product: 'Stocks & ETFs', hours: '09:00-16:25' },
            { country: 'Netherlands', market: 'Euronext Amsterdam', product: 'Bonds', hours: '09:00-17:30' },
            { country: 'Netherlands', market: 'Euronext Amsterdam', product: 'Stocks & ETFs', hours: '09:00-17:30' },
            { country: 'Netherlands', market: 'Derivatives Amsterdam', product: 'Futures', hours: '08:00-22:00' },
            { country: 'Netherlands', market: 'Derivatives Amsterdam', product: 'Options', hours: '09:00-17:30' },
            { country: 'Poland', market: 'Warsaw Stock Exchange', product: 'Stocks & ETFs', hours: '09:00-16:50' },
            { country: 'Portugal', market: 'Euronext Lisbon', product: 'Bonds', hours: '09:00-17:30' },
            { country: 'Portugal', market: 'Euronext Lisbon', product: 'Stocks & ETFs', hours: '09:00-17:30' },
            { country: 'Czech Republic', market: 'Prague Stock Exchange', product: 'Stocks & ETFs', hours: '09:00-16:30' },
            { country: 'Sweden', market: 'Nasdaq Stockholm', product: 'Futures', hours: '09:00-17:25' },
            { country: 'Sweden', market: 'Nasdaq Stockholm', product: 'Options', hours: '09:00-17:25' },
            { country: 'Sweden', market: 'Nasdaq Stockholm', product: 'Stocks & ETFs', hours: '09:00-17:30' },
            { country: 'Switzerland', market: 'SIX Swiss Exchange', product: 'Stocks & ETFs', hours: '09:00-17:30' },
        ]
    }
];

export function GlobalMarketSessions() {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [activeTab, setActiveTab] = useState(REGIONS[0].id);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const activeRegion = REGIONS.find(r => r.id === activeTab) || REGIONS[0];

    return (
        <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-[2560px] mx-auto px-6 py-20 text-left"
        >
            <div className="flex flex-col items-center justify-center text-center space-y-12 mb-20">
                <div className="space-y-4">
                    <h2 className="text-sm font-black text-slate-600 uppercase tracking-[0.5em]">
                        Schedule
                    </h2>
                    <div className="flex items-center gap-4 px-6 py-3 bg-white/40 backdrop-blur-3xl rounded-[2rem] border border-white/20 shadow-xl">
                        <span className="text-xl font-mono font-black text-slate-950 tracking-tight">
                            {currentTime.getUTCHours().toString().padStart(2, '0')}:
                            {currentTime.getUTCMinutes().toString().padStart(2, '0')}:
                            {currentTime.getUTCSeconds().toString().padStart(2, '0')} UTC
                        </span>
                    </div>
                </div>

                {/* Tabs Navigation */}
                <div className="flex flex-wrap justify-center gap-2 p-1.5 bg-white/20 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 shadow-lg">
                    {REGIONS.map(region => (
                        <button
                            key={region.id}
                            onClick={() => setActiveTab(region.id)}
                            className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                                activeTab === region.id 
                                ? 'bg-white text-slate-950 shadow-md border border-slate-100 scale-105' 
                                : 'text-slate-700 hover:text-slate-950'
                            }`}
                        >
                            {region.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="relative">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.4 }}
                        className="bg-white/40 backdrop-blur-[60px] border border-white/30 rounded-[3rem] p-12 shadow-2xl shadow-black/5 relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--aave-purple)]/5 blur-[100px] -mr-32 -mt-32 rounded-full" />
                        
                        <div className="overflow-x-auto no-scrollbar">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-300">
                                        <th className="pb-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-600">Country</th>
                                        <th className="pb-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-600">Market</th>
                                        <th className="pb-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-600">Product</th>
                                        <th className="pb-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 text-right">Hours (UTC)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {activeRegion.markets.map((m, i) => (
                                        <tr key={i} className="group hover:bg-white/50 transition-colors">
                                            <td className="py-5 text-sm font-black text-slate-950 uppercase tracking-tighter pr-4">{m.country}</td>
                                            <td className="py-5 text-xs font-bold text-slate-700 pr-4">{m.market}</td>
                                            <td className="py-5 text-xs font-medium text-slate-600 pr-4">{m.product}</td>
                                            <td className="py-5 text-xs font-mono font-black text-slate-950 text-right">{m.hours}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Floating Disclaimer */}
                        <div className="mt-16 space-y-6">
                            <div className="p-8 bg-black/5 rounded-[2rem] border border-black/5 flex gap-6 items-start">
                                <Info size={20} className="text-[var(--aave-purple)] mt-1 flex-shrink-0" />
                                <p className="text-xs text-slate-500 leading-loose font-medium">
                                    Note: we only offer the main Xetra continuous trading hours (09:0017:30 CET). Pre-trading (08:0009:00 CET) and post-trading (17:3022:00 CET) mini-auction sessions are not included.
                                </p>
                            </div>
                            <div className="p-8 bg-[var(--aave-purple)]/5 rounded-[2rem] border border-[var(--aave-purple)]/10 flex gap-6 items-start">
                                <Zap size={20} className="text-[var(--aave-purple)] mt-1 flex-shrink-0" />
                                <p className="text-xs text-slate-700 leading-loose font-medium">
                                    Cryptocurrency trading is available 24/7. Note that this excludes mandatory server restarts around midnight and scheduled maintenance windows.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
        </motion.div>
    );
}
