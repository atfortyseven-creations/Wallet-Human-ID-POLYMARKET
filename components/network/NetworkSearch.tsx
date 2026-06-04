"use client";

import { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export function NetworkSearch() {
    const [query, setQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const router = useRouter();

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setIsSearching(true);
        const q = query.trim();

        try {
            // Block Height
            if (/^\d+$/.test(q) && parseInt(q) < 5000000) {
                 router.push(`/network/blocks/${q}`);
                 return;
            }

            // Block Hash or TXID
            if (/^[0-9a-fA-F]{64}$/.test(q)) {
                 if (q.startsWith('00000')) {
                     router.push(`/network/blocks/${q}`);
                 } else {
                     router.push(`/network/tx/${q}`);
                 }
                 return;
            }

            // Address
            if (/^(1|3|bc1)/.test(q)) {
                router.push(`/network/address/${q}`);
                return;
            }

            router.push(`/network/address/${q}`);
        } catch (error) {
            toast.error("Security verification failed: Invalid search parameter.");
        } finally {
            setIsSearching(false);
        }
    };

    return (
        <form onSubmit={handleSearch} className="relative w-full max-w-2xl group">
            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-slate-950 transition-colors z-10">
                {isSearching ? <Loader2 size={20} className="animate-spin" /> : <Search size={20} strokeWidth={3} />}
            </div>
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by address, identifier or block index..."
                className="w-full bg-white border-2 border-slate-100 rounded-3xl py-5 pl-16 pr-6 text-slate-950 placeholder:text-slate-300 focus:outline-none focus:border-slate-950 focus:ring-0 transition-all font-black uppercase tracking-widest text-[10px] shadow-sm group-hover:border-slate-200"
            />
        </form>
    );
}

