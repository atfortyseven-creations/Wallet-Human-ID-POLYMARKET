"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, ExternalLink, Code2, RefreshCw, FileText, Globe } from 'lucide-react';
import { toast } from 'sonner';

interface BRCModel {
    id: string;
    brcNumber: number;
    title: string;
    author: string;
    status: string;
    type: string;
    summary: string;
    content: string;
    githubUrl: string;
    updated: string;
}

export function BRCExplorerShell() {
    const [standards, setStandards] = useState<BRCModel[]>([]);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState<BRCModel | null>(null);

    const load = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/brc');
            const data = await res.json();
            if (data.success && data.standards) {
                setStandards(data.standards);
            }
        } catch {
            toast.error("Failed to load BRC Standards");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const triggerSync = async () => {
        if (syncing) return;
        setSyncing(true);
        const tid = toast.loading("Syncing GitHub repository...");
        try {
            const res = await fetch('/api/brc?action=sync');
            const data = await res.json();
            if (data.success) {
                toast.success(`Synced ${data.count} BRC standards natively.`, { id: tid });
                load();
            } else {
                toast.error("Sync Engine failure", { id: tid });
            }
        } catch (e) {
            toast.error("Network Error during Sync", { id: tid });
        } finally {
            setSyncing(false);
        }
    };

    const filtered = standards.filter(b => 
        b.title.toLowerCase().includes(search.toLowerCase()) || 
        b.brcNumber.toString().includes(search) ||
        (b.summary && b.summary.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div className="flex h-[calc(100vh-10px)] bg-[#FFFFFF] text-[#111111] overflow-hidden rounded-tl-3xl shadow-2xl border-l border-[#E5E5E5]">
            
            {/* Sidebar List */}
            <div className="w-[400px] flex flex-col border-r border-[#E5E5E5] bg-[#FFFFFF] shrink-0 h-full">
                <div className="p-6 border-b border-[#E5E5E5] bg-white">
                    <div className="flex justify-between items-center mb-5">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded bg-[#E2B33D]/10 flex items-center justify-center border border-[#E2B33D]/30">
                                <Code2 size={16} className="text-[#E2B33D]"/>
                            </div>
                            <div>
                                <h1 className="text-[13px] font-black text-[#111] uppercase tracking-widest">BRC Standards</h1>
                                <p className="text-[9px] font-mono text-[#888888]">Bitcoin SV Git Index Engine</p>
                            </div>
                        </div>
                        <button 
                            onClick={triggerSync} 
                            disabled={syncing}
                            className="p-2 border border-[#E5E5E5] rounded-xl hover:border-[#111] transition-colors bg-[#FFFFFF] text-[#111]"
                        >
                            <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />
                        </button>
                    </div>

                    <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#888]"/>
                        <input 
                            value={search} onChange={e => setSearch(e.target.value)}
                            placeholder="Search BRC index..." 
                            className="w-full bg-white border border-[#E5E5E5] rounded-xl pl-9 pr-3 py-2 text-[11px] font-mono outline-none focus:border-[#111] transition-all shadow-sm"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar bg-[#FFFFFF] p-4 space-y-2">
                    {loading && (
                        <div className="flex flex-col items-center justify-center p-12 text-[#888]">
                            <RefreshCw size={24} className="animate-spin mb-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Compiling BRCs...</span>
                        </div>
                    )}
                    {!loading && filtered.map((b) => (
                        <div 
                            key={b.brcNumber}
                            onClick={() => setSelected(b)}
                            className={`p-4 rounded-2xl border cursor-pointer transition-all ${selected?.brcNumber === b.brcNumber ? 'bg-white border-[#111] shadow-lg' : 'bg-white border-[#E5E5E5] hover:border-[#888] shadow-sm'}`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className={`text-[9px] font-black px-2 py-0.5 rounded border uppercase tracking-widest ${b.status.toLowerCase().includes('active') || b.status.toLowerCase().includes('final') ? 'bg-[#00C076]/10 text-[#00C076] border-[#00C076]/30' : 'bg-[#E5E5E5] text-[#888] border-transparent'}`}>
                                    {b.status || 'Draft'}
                                </span>
                                <span className="text-[10px] font-mono text-[#888]">BRC-{b.brcNumber.toString().padStart(4, '0')}</span>
                            </div>
                            <h3 className="text-xs font-black text-[#111] leading-snug break-words">{b.title}</h3>
                            <div className="mt-3 flex items-center justify-between text-[9px] font-mono text-[#888]">
                                <span>{b.author.slice(0, 20)}</span>
                                <span className="uppercase">{b.type}</span>
                            </div>
                        </div>
                    ))}
                    {!loading && filtered.length === 0 && (
                        <div className="text-center p-8 text-[#888] text-[10px] font-mono uppercase tracking-widest">
                            {standards.length === 0 ? 'No standards indexed. Click sync.' : 'No results found.'}
                        </div>
                    )}
                </div>
                
                <div className="p-4 border-t border-[#E5E5E5] bg-[#FFFFFF] flex justify-between text-[9px] font-black uppercase tracking-widest text-[#888]">
                    <span>Total Index: {standards.length}</span>
                    <span>Github Source Verified</span>
                </div>
            </div>

            {/* Content View */}
            <div className="flex-1 flex flex-col bg-white overflow-hidden relative">
                {!selected ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-[#888] bg-[url('/img/grid.svg')] bg-center bg-repeat opacity-50">
                        <FileText size={48} className="mb-6 opacity-20" />
                        <h2 className="text-xl font-black text-[#111] tracking-tighter uppercase mb-2">System Knowledge Base</h2>
                        <p className="text-[11px] font-mono font-bold max-w-sm text-center">Select a BRC standard from the topological index to view the on-chain specification.</p>
                    </div>
                ) : (
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        key={selected.brcNumber}
                        className="flex-1 flex flex-col h-full bg-white relative z-10"
                    >
                        <div className="p-10 border-b border-[#E5E5E5] bg-[#FFFFFF]">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="text-[11px] font-mono bg-[#111] text-white px-3 py-1 rounded font-black">BRC-{selected.brcNumber.toString().padStart(4, '0')}</span>
                                <span className="text-[10px] font-black uppercase tracking-widest text-[#888]">{selected.type}</span>
                                {selected.githubUrl && (
                                    <a href={selected.githubUrl} target="_blank" rel="noopener noreferrer" className="ml-auto flex items-center gap-1.5 text-[9px] font-black text-[#888] hover:text-[#111] border border-[#E5E5E5] px-3 py-1 rounded-md transition-colors bg-white shadow-sm">
                                        <Globe size={11} /> VIEW SOURCE
                                    </a>
                                )}
                            </div>
                            <h1 className="text-3xl font-black text-[#111] tracking-tighter leading-tight mb-6">{selected.title}</h1>
                            
                            <div className="grid grid-cols-3 gap-6 bg-white p-6 rounded-2xl border border-[#E5E5E5] shadow-sm relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#E5E5E5]/10 to-[#FFFFFF] block" />
                                <div className="relative z-10">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-[#888] mb-1">Author</p>
                                    <p className="text-[11px] font-mono text-[#111] font-bold">{selected.author}</p>
                                </div>
                                <div className="relative z-10 border-l border-[#E5E5E5] pl-6">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-[#888] mb-1">Status</p>
                                    <p className="text-[11px] font-mono text-[#111] font-bold">{selected.status}</p>
                                </div>
                                <div className="relative z-10 border-l border-[#E5E5E5] pl-6">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-[#888] mb-1">Created</p>
                                    <p className="text-[11px] font-mono text-[#111] font-bold">{selected.updated ? new Date(selected.updated).toLocaleDateString() : 'N/A'}</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-10 prose prose-sm max-w-none text-[#333] font-sans selection:bg-[#E2B33D]/20">
                            {/* We manually map the markdown as raw lines since no MD component is strictly wired in this standalone shell */}
                            <pre className="font-mono text-[11px] whitespace-pre-wrap leading-relaxed">
                                {selected.content || selected.summary}
                            </pre>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}

export default BRCExplorerShell;
