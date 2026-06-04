"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Shield, Activity, Search, Database, FileText, AlertTriangle } from "lucide-react";

interface ForensicCase {
    id: string;
    title: string;
    date: string;
    status: string;
    threat: string;
    summary: string;
    metrics: { label: string; value: string }[];
}

export function HistoricalForensicSection() {
  const [cases, setCases] = useState<ForensicCase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCases = async () => {
        try {
            const res = await fetch('/api/network/forensics');
            const data = await res.json();
            if (data.cases) {
                setCases(data.cases);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };
    fetchCases();
  }, []);

  return (
    <section className="relative py-32 px-6 bg-white overflow-hidden">
      <div className="max-w-[2560px] mx-auto relative z-10 text-left">
        <div className="mb-20 text-center">
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-slate-900 mb-6 uppercase">
                Forensic <span className="text-slate-200">Case Studies</span>
            </h2>
            <p className="text-slate-500 max-w-2xl mx-auto text-lg leading-relaxed">
                The platform's analytical infrastructure does not merely track — it performs structured forensic analysis. Review the historical data points that defined market pivots, detected and documented ahead of broader market awareness.
            </p>
        </div>

        {loading ? (
             <div className="flex justify-center py-20">
                 <Activity className="animate-spin text-slate-200" size={32} />
             </div>
        ) : (
            <div className="grid md:grid-cols-2 gap-8">
                {cases.map((caseData, i) => (
                    <motion.div
                        key={caseData.id}
                        initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: i * 0.1 }}
                        className="group bg-black/5 border border-slate-100 rounded-[2.5rem] p-8 md:p-12 hover:border-slate-300 hover:bg-slate-100 transition-all relative overflow-hidden shadow-2xl shadow-slate-200/50"
                    >
                        {/* Folder Aesthetic Accent */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 blur-3xl -z-10" />
                        
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <div className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">{caseData.id} / LIVE ARCHIVE</div>
                                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{caseData.title}</h3>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                                caseData.threat === 'CRITICAL' ? 'border-rose-500/50 text-rose-600 bg-rose-50' : 'border-indigo-500/50 text-indigo-600 bg-indigo-50'
                            }`}>
                                {caseData.threat}
                            </div>
                        </div>

                        <p className="text-slate-500 text-sm leading-relaxed mb-10 pb-10 border-b border-slate-100">
                            {caseData.summary}
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            {caseData.metrics.map((m, mi) => (
                                <div key={mi} className="space-y-1">
                                    <div className="text-[8px] font-black text-slate-300 uppercase tracking-widest">{m.label}</div>
                                    <div className="text-sm font-black text-slate-900 font-mono">{m.value}</div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-10 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Database size={12} className="text-slate-300" />
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{caseData.date}</span>
                            </div>
                            <button className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-indigo-600 transition-colors flex items-center gap-2">
                                Full Investigation <Search size={12} />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>
        )}
      </div>

      {/* Background Grid Accent */}
      <div className="absolute bottom-0 left-0 w-full h-64 bg-gradient-to-t from-slate-50 to-transparent pointer-events-none" />
    </section>
  );
}
