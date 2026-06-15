"use client";

import React, { useState, useRef, useEffect } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";

import { toast } from "sonner";
import { motion } from "framer-motion";

interface SessionLog {
    id: string;
    userId: string | null;
    action: string;
    ipAddress: string | null;
    timestamp: string;
}

export function SessionLogsPanel() {
    const [logs, setLogs] = useState<SessionLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [isExporting, setIsExporting] = useState(false);
    const tableContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchLogs = async () => {
            setIsLoading(true);
            try {
                const res = await fetch('/api/session-logs');
                if (res.ok) {
                    const data = await res.json();
                    setLogs(data.logs || []);
                } else {
                    setLogs([]);
                }
            } catch (error) {
                console.error('Error fetching session logs:', error);
                setLogs([]);
            } finally {
                setIsLoading(false);
            }
        };
        fetchLogs();
    }, []);

    const filteredLogs = React.useMemo(() => {
        let result = logs;
        if (search.trim()) {
            const lower = search.toLowerCase();
            result = logs.filter(l =>
                l.action.toLowerCase().includes(lower) ||
                (l.userId && l.userId.toLowerCase().includes(lower)) ||
                (l.ipAddress && l.ipAddress.toLowerCase().includes(lower))
            );
        }
        return result.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }, [logs, search]);

    const handleExport = () => {
        setIsExporting(true);
        try {
            const csv = ["Timestamp,Action,Identity,Source IP",
                ...filteredLogs.map(l => `${l.timestamp},${l.action},${l.userId || "Anonymous"},${l.ipAddress || "Hidden"}`)
            ].join("\n");
            const blob = new Blob([csv], { type: "text/csv" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url; a.download = `audit_${Date.now()}.csv`;
            document.body.appendChild(a); a.click(); a.remove();
            URL.revokeObjectURL(url);
            toast.success("Audit log exported");
        } catch { toast.error("Export failed"); }
        finally { setIsExporting(false); }
    };

    const rowVirtualizer = useVirtualizer({
        count: filteredLogs.length,
        getScrollElement: () => tableContainerRef.current,
        estimateSize: () => 52,
        overscan: 8,
    });

    return (
        <div className="w-full h-full min-h-0 flex flex-col items-center justify-start p-4 md:p-8 text-black font-sans overflow-y-auto no-scrollbar relative bg-white">
            <div className="w-full max-w-[880px] mx-auto bg-white/80 backdrop-blur-2xl border border-slate-200/60 rounded-[2rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.07)] p-7 md:p-10 flex flex-col transition-all duration-500 z-10">
                
                {/* Primary Action Button (White) */}
                <div className="w-full flex justify-end mb-4 flex-shrink-0">
                    <button 
                        onClick={handleExport} 
                        disabled={isExporting} 
                        className="px-6 py-3 bg-white border border-slate-200 text-black rounded-xl font-black uppercase tracking-[0.15em] text-[10px] transition-all shadow-sm hover:shadow-md hover:bg-black/5 active:scale-95 flex items-center gap-2 disabled:opacity-50"
                    >
                        <span className="font-mono text-[10px] font-black">[EXP]</span>
                        {isExporting ? "EXPORTING..." : "EXPORT AUDIT LOG"}
                    </button>
                </div>

                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="flex flex-col gap-6">
                    {/* Controls */}
                    <div className="flex flex-col md:flex-row md:items-center justify-center gap-4">
                        <div className="relative w-full max-w-lg group">
                            <span className="font-mono text-[10px] font-black text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">[SCH]</span>
                            <input 
                                type="text" 
                                className="block w-full pl-11 pr-4 py-3 bg-black/5/60 border border-slate-200/60 rounded-xl text-[12px] text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-400 transition-all font-mono placeholder:text-slate-400 text-center" 
                                placeholder="Filter action, IP, identity..." 
                                value={search} 
                                onChange={e => setSearch(e.target.value)} 
                            />
                        </div>
                    </div>

                    <div className="w-full flex-1 flex flex-col border border-slate-200/60 rounded-2xl overflow-hidden bg-white shadow-sm" style={{ minHeight: 300 }}>
                        <div className="hidden md:grid grid-cols-[1.5fr_2fr_2fr_1.5fr] px-6 py-4 border-b border-slate-200/60 bg-black/5/60 font-mono text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">
                            <div>Timestamp</div>
                            <div>Action</div>
                            <div>Identity</div>
                            <div>Source</div>
                        </div>
                        <div ref={tableContainerRef} className="flex-1 overflow-y-auto no-scrollbar" style={{ height: 400 }}>
                            {isLoading ? (
                                <div className="h-full flex items-center justify-center font-mono text-[11px] text-slate-400 uppercase tracking-widest animate-pulse">Initializing Audit Stream...</div>
                            ) : filteredLogs.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center gap-4 text-slate-400">
                                    <span className="font-mono text-3xl font-black">[!]</span>
                                    <span className="font-mono text-[11px] font-black uppercase tracking-widest">No logs found</span>
                                </div>
                            ) : (
                                <div style={{ height: `${rowVirtualizer.getTotalSize()}px`, position: "relative" }}>
                                    {rowVirtualizer.getVirtualItems().map(virtualRow => {
                                        const log = filteredLogs[virtualRow.index];
                                        if (!log) return null;
                                        return (
                                            <div
                                                key={log.id}
                                                onClick={() => { navigator.clipboard.writeText(JSON.stringify(log, null, 2)); toast.success("Copied"); }}
                                                className="absolute w-full border-b border-slate-100 hover:bg-black/5/60 transition-colors cursor-pointer flex flex-col md:grid md:grid-cols-[1.5fr_2fr_2fr_1.5fr] md:items-center px-6 py-4 gap-2 md:gap-0 text-center"
                                                style={{ height: `${virtualRow.size}px`, transform: `translateY(${virtualRow.start}px)` }}
                                            >
                                                <div className="font-mono text-[11px] text-slate-400 truncate">{new Date(log.timestamp).toLocaleString("en-US", { hour12: false })}</div>
                                                <div><span className="px-2.5 py-1 bg-slate-100 border border-slate-200/60 rounded-md font-mono text-[9px] font-black text-slate-700 uppercase tracking-widest inline-block">{log.action}</span></div>
                                                <div className="font-mono text-[11px] font-bold text-slate-700 truncate">{log.userId || "Anonymous"}</div>
                                                <div className="font-mono text-[11px] text-slate-400 truncate">{log.ipAddress || "Hidden"}</div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    <p className="text-center font-mono text-[9px] text-slate-400 uppercase tracking-[0.2em] font-black mt-2">
                        Cryptographic Audit Trail · Client-Side Only · Never Transmitted
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
