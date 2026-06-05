"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Newspaper, RefreshCw } from 'lucide-react';
import useSWR from 'swr';

interface NewsItem {
    id: string;
    title: string;
    body: string;
}

function decodeHTMLEntities(text: string): string {
    if (!text) return '';
    return text
        .replace(/&amp;/g, '&').replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'").replace(/&apos;/g, "'")
        .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
        .replace(/&#8217;/g, '').replace(/&#8216;/g, '')
        .replace(/&#8220;/g, '').replace(/&#8221;/g, '')
        .replace(/&#8211;/g, '').replace(/&#8212;/g, '')
        .replace(/&#39;/g, "'")
        .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(Number(dec)))
        .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
}

const fetcher = async (url: string) => {
    const res = await fetch(url);
    const json = await res.json();
    return json?.Data?.slice(0, 50).map((n: any) => ({
        id: n.id,
        title: decodeHTMLEntities(n.title),
        body: decodeHTMLEntities(n.body)
    })) || [];
};

export function EliteAnalyticsNews() {
    const { data: news = [], mutate, isValidating } = useSWR('https://min-api.cryptocompare.com/data/v2/news/?lang=EN', fetcher, {
        refreshInterval: 60000,
        revalidateOnFocus: true
    });

    return (
        <div className="flex flex-col h-full bg-black/5/30 border border-slate-200/50 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] overflow-hidden rounded-[2rem]">
            {/* Minimalist Header */}
            <div className="flex items-center justify-between px-8 py-6 bg-white border-b border-slate-100">
                <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                    <span className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-800">Global Intel Feed</span>
                </div>
                <button 
                    onClick={() => mutate()}
                    className="p-2.5 bg-black/5 border border-slate-200 rounded-full hover:bg-slate-100 transition-all active:scale-95 shadow-sm"
                >
                    <RefreshCw size={13} className={`text-slate-500 ${isValidating ? 'animate-spin text-[var(--aave-purple)]' : ''}`} />
                </button>
            </div>

            {/* News Stack */}
            <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-4">
                <AnimatePresence mode="popLayout">
                    {news.map((item: NewsItem, i: number) => (
                        <motion.div
                            key={item.id}
                            layout
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ 
                                type: "spring", stiffness: 400, damping: 30, opacity: { duration: 0.2 }, delay: i * 0.03 
                            }}
                            className="group flex flex-col gap-3 relative bg-white border border-slate-100 hover:border-slate-300 p-8 rounded-[1.5rem] transition-all shadow-sm hover:shadow-xl hover:-translate-y-1"
                        >
                            <h3 className="text-[1.3rem] font-black text-slate-900 leading-[1.1] group-hover:text-[var(--aave-purple)] transition-colors uppercase tracking-tight">
                                {item.title}
                            </h3>
                            <p className="text-[14px] text-slate-700 font-medium leading-relaxed">
                                {item.body.substring(0, 300)}{item.body.length > 300 ? '...' : ''}
                            </p>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {news.length === 0 && !isValidating && (
                    <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
                        <Newspaper size={40} className="text-slate-300 mb-4" />
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600">Awaiting Oracle Synchronization</p>
                    </div>
                )}
            </div>
            <div className="p-4 border-t border-slate-100 bg-white flex justify-center">
                 <div className="w-10 h-1 bg-slate-200 rounded-full" />
            </div>
        </div>
    );
}
