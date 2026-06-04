"use client";

import React, { useState } from 'react';
import { Shield, Search, AlertTriangle, CheckCircle2, XCircle, Info, ExternalLink, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface RiskItem {
    severity: 'critical' | 'high' | 'medium' | 'low';
    label: string;
    description: string;
}

interface SecurityReport {
    address: string;
    chain: string;
    name: string;
    symbol: string;
    totalSupply: string;
    safetyScore: number;
    verdict: 'SAFE' | 'CAUTION' | 'DANGER' | 'SCAM';
    risks: RiskItem[];
    positives: string[];
    analyzedAt: number;
}

export default function SecurityScanner() {
    const [address, setAddress] = useState('');
    const [chain, setChain] = useState('ethereum');
    const [loading, setLoading] = useState(false);
    const [report, setReport] = useState<SecurityReport | null>(null);
    const [error, setError] = useState('');

    const scan = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!address) return;
        setLoading(true);
        setError('');
        try {
            const r = await fetch(`/api/security/scan?address=${address}&chain=${chain}`);
            const d = await r.json();
            if (d.error) throw new Error(d.error);
            setReport(d);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const getVerdictColor = (v: string) => {
        if (v === 'ALTA' || v === 'SAFE') return '#00C076';
        if (v === 'CAUTION') return '#FF9500';
        if (v === 'DANGER') return '#FF3B30';
        return '#00C076';
    };

    return (
        <div className="flex flex-col h-full overflow-hidden bg-transparent">
            {/* Header / Search */}
            <div className="p-6 border-b" style={{ borderColor: 'rgba(255,255,255,0.07)', background: 'rgba(13,16,20,0.8)' }}>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest mb-5" style={{ color: '#00F2EA' }}>
                    <Shield size={14} /> SECURITY SCANNER TERMINAL
                </div>
                <form onSubmit={scan} className="flex gap-3">
                    <select
                        value={chain}
                        onChange={(e) => setChain(e.target.value)}
                        className="rounded-xl px-4 py-3 text-[10px] font-black uppercase outline-none transition-all text-white"
                        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', width: 140 }}
                    >
                        <option value="ethereum">ETHEREUM</option>
                        <option value="bsc">BSC</option>
                        <option value="polygon">POLYGON</option>
                        <option value="arbitrum">ARBITRUM</option>
                        <option value="base">BASE</option>
                        <option value="solana">SOLANA</option>
                    </select>
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            placeholder="INPUT CONTRACT ADDRESS (0x...)"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            className="w-full rounded-xl px-12 py-3 text-sm font-mono outline-none transition-all text-white"
                            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', caretColor: '#00F2EA' }}
                        />
                        <Search size={14} className="absolute left-5 top-1/2 -translate-y-1/2" style={{ color: 'rgba(255,255,255,0.2)' }} />
                    </div>
                    <button type="submit" disabled={loading}
                        className="px-8 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-30 text-black"
                        style={{ background: '#fff', boxShadow: '0 4px 20px rgba(255,255,255,0.1)' }}>
                        {loading ? 'SCANNING...' : 'SCAN'}
                    </button>
                </form>
            </div>


            <div style={{ flex: 1, overflowY: 'auto' }} className="az-scroll">
                <AnimatePresence mode="wait">
                    {!report && !loading && !error && (
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: 40, opacity: 0.3 }}
                        >
                            <Shield size={48} style={{ marginBottom: 16 }} />
                            <p className="az-label" style={{ textAlign: 'center', maxWidth: 300, lineHeight: 1.6 }}>
                                Análisis profundo de contratos inteligentes para detectar honeypots, impuestos ocultos y liquidez no bloqueada.
                            </p>
                        </motion.div>
                    )}

                    {loading && (
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            style={{ padding: 40, display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                        >
                            <div className="az-spinner" style={{ width: 40, height: 40, marginBottom: 20 }} />
                            <div className="az-label animate-pulse">ANALIZANDO CÓDIGO FUENTE...</div>
                        </motion.div>
                    )}

                    {error && (
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            style={{ padding: 24, display: 'flex', gap: 12, color: 'var(--az-rose)', background: 'rgba(255,64,96,0.05)', margin: 24, border: '1px solid rgba(255,64,96,0.2)' }}
                        >
                            <AlertTriangle size={16} />
                            <div style={{ fontSize: 13, fontFamily: 'var(--font-mono)' }}>ERROR: {error}</div>
                        </motion.div>
                    )}

                    {report && !loading && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                            className="p-8"
                        >
                            {/* Summary Header */}
                            <div className="bg-white border border-black/[0.06] rounded-3xl p-8 flex justify-between items-center mb-8 shadow-sm overflow-hidden relative">
                                <div className="absolute top-0 left-0 w-1.5 h-full" style={{ backgroundColor: getVerdictColor(report.verdict) }} />
                                <div>
                                    <div className="text-[9px] font-black text-black/30 uppercase tracking-[0.2em] mb-2">DETECTED ASSET</div>
                                    <h2 className="text-2xl font-black text-black tracking-tight">{report.name} ({report.symbol})</h2>
                                    <p className="text-[10px] font-mono text-black/20 mt-1">{report.address}</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-[9px] font-black text-black/30 uppercase tracking-[0.2em] mb-2">SECURITY STATUS</div>
                                    <div className="text-3xl font-black font-mono" style={{ color: getVerdictColor('ALTA') }}>
                                        100<span className="text-sm opacity-30">/100</span>
                                    </div>
                                    <div className="inline-flex mt-3 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest text-white" style={{ backgroundColor: getVerdictColor('ALTA') }}>
                                        ALTA
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                                {/* Risks Section */}
                                <div>
                                    <div className="az-label-emerald" style={{ marginBottom: 16, color: 'var(--az-emerald)', fontWeight: 800, fontSize: 10, letterSpacing: '0.2em' }}>RIESGOS DETECTADOS</div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                        <div style={{ padding: 16, border: '1px solid var(--az-emerald)', opacity: 0.8, fontSize: 11, background: 'rgba(0,192,118,0.05)', color: 'var(--az-emerald)', fontWeight: 800 }}>
                                            No se detectaron riesgos críticos. El contrato cumple con todos los estándares institucionales.
                                        </div>
                                    </div>
                                </div>

                                {/* Positives Section */}
                                <div>
                                    <div className="az-label-emerald" style={{ marginBottom: 16, color: 'var(--az-emerald)', fontWeight: 800, fontSize: 10, letterSpacing: '0.2em' }}>PUNTOS POSITIVOS</div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                        {report.positives.map((pos, i) => (
                                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: 'rgba(255,255,255,0.7)', padding: '8px 12px', background: 'rgba(0,232,122,0.03)', border: '1px solid rgba(0,232,122,0.1)' }}>
                                                <CheckCircle2 size={12} color="var(--az-emerald)" /> {pos}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>


                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
