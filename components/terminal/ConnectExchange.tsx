"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Link2, Shield, Lock, ChevronRight, 
    ArrowRightLeft, ExternalLink, Zap, Key
} from 'lucide-react';

interface Exchange {
    id: string;
    name: string;
    icon: string;
    description: string;
    status: 'OPTIMIZED' | 'STABLE' | 'BETA';
}

const EXCHANGES: Exchange[] = [
    { id: 'binance', name: 'Binance', icon: 'bnc', description: 'Institutional API Bridge via EdDSA/ECDSA signature verification.', status: 'OPTIMIZED' },
    { id: 'okx', name: 'OKX', icon: 'okx', description: 'Low-latency V5 API integration with sub-ms trade execution.', status: 'OPTIMIZED' },
    { id: 'bybit', name: 'Bybit', icon: 'bbt', description: 'Unified Trading Account support with cross-margin telemetry.', status: 'STABLE' },
    { id: 'coinbase', name: 'Coinbase Pro', icon: 'cbp', description: 'Enterprise-grade custody bridge with direct fiat settlement.', status: 'BETA' }
];

export default function ConnectExchange() {
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [apiKey, setApiKey] = useState('');
    const [apiSecret, setApiSecret] = useState('');

    const handleConnect = () => {
        // Logic for exchange connection
    };

    return (
        <div className="h-full w-full min-h-0 flex flex-col p-6 gap-6 font-sans overflow-y-auto">

            {/*  HEADER  */}
            <div className="rounded-2xl p-7 flex items-center justify-between relative overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-3" style={{ color: '#00F2EA' }}>
                        <Link2 size={20} />
                        <span className="text-[11px] font-black uppercase tracking-[0.2em]">Exchange Bridge</span>
                    </div>
                    <h1 className="text-3xl font-black text-white uppercase tracking-tighter leading-none mb-3">
                        Connect <span style={{ color: 'rgba(255,255,255,0.2)' }}>Liquidity</span>
                    </h1>
                    <p className="text-[11px] font-bold tracking-widest max-w-xl leading-relaxed" style={{ color: 'rgba(255,255,255,0.35)' }}>
                        API keys encrypted locally · Never transit our servers.
                    </p>
                </div>
                <div className="hidden md:flex flex-col items-end">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: 'rgba(0,192,118,0.1)', border: '1px solid rgba(0,192,118,0.2)' }}>
                        <Lock size={11} style={{ color: '#00C076' }} />
                        <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: '#00C076' }}>AES-256 Encrypted</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">

                {/*  EXCHANGE SELECTOR  */}
                <div className="space-y-3">
                    <div className="text-[9px] font-black uppercase tracking-[0.3em] ml-1 mb-3" style={{ color: 'rgba(255,255,255,0.2)' }}>Available Nodes</div>
                    {EXCHANGES.map((ex) => (
                        <button
                            key={ex.id}
                            onClick={() => setSelectedId(ex.id)}
                            className="w-full text-left p-5 rounded-2xl border transition-all duration-200 group"
                            style={{
                                background: selectedId === ex.id ? 'rgba(0,242,234,0.07)' : 'rgba(255,255,255,0.03)',
                                border: selectedId === ex.id ? '1px solid rgba(0,242,234,0.25)' : '1px solid rgba(255,255,255,0.07)',
                            }}
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-lg font-black transition-all"
                                    style={{
                                        background: selectedId === ex.id ? '#00F2EA' : 'rgba(255,255,255,0.06)',
                                        color: selectedId === ex.id ? '#0B0E11' : 'rgba(255,255,255,0.4)',
                                    }}>
                                    {ex.name[0]}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <h3 className="text-sm font-black uppercase text-white">{ex.name}</h3>
                                        <span className="text-[8px] font-black px-2 py-0.5 rounded-full"
                                            style={{
                                                background: ex.status === 'OPTIMIZED' ? 'rgba(0,242,234,0.12)' : 'rgba(255,255,255,0.06)',
                                                color: ex.status === 'OPTIMIZED' ? '#00F2EA' : 'rgba(255,255,255,0.3)',
                                                border: ex.status === 'OPTIMIZED' ? '1px solid rgba(0,242,234,0.25)' : '1px solid rgba(255,255,255,0.1)',
                                            }}>
                                            {ex.status}
                                        </span>
                                    </div>
                                    <p className="text-[10px] font-medium leading-relaxed" style={{ color: 'rgba(255,255,255,0.35)' }}>{ex.description}</p>
                                </div>
                                <ChevronRight size={16} className="transition-transform duration-200"
                                    style={{ color: selectedId === ex.id ? '#00F2EA' : 'rgba(255,255,255,0.15)', transform: selectedId === ex.id ? 'translateX(2px)' : 'none' }} />
                            </div>
                        </button>
                    ))}
                </div>

                {/*  CONNECTION FORM  */}
                <AnimatePresence mode="wait">
                    {selectedId ? (
                        <motion.div key="form" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}
                            className="rounded-2xl p-7 space-y-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-11 h-11 rounded-xl flex items-center justify-center font-black text-lg text-black" style={{ background: '#00F2EA' }}>
                                    {EXCHANGES.find(e => e.id === selectedId)?.name[0]}
                                </div>
                                <div>
                                    <h2 className="text-base font-black text-white uppercase tracking-tight">Setup {EXCHANGES.find(e => e.id === selectedId)?.name}</h2>
                                    <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#00F2EA' }}>Awaiting API Payload</p>
                                </div>
                            </div>
                            {[{ label: 'API Access Key', value: apiKey, setter: setApiKey, icon: Key, ph: 'Enter Public Key' },
                              { label: 'API Signature Secret', value: apiSecret, setter: setApiSecret, icon: Lock, ph: 'Enter Secret Key' }].map(f => (
                                <div key={f.label} className="space-y-1.5">
                                    <label className="text-[9px] font-black uppercase tracking-[0.2em]" style={{ color: 'rgba(255,255,255,0.3)' }}>{f.label}</label>
                                    <div className="relative">
                                        <input type="password" value={f.value} onChange={e => f.setter(e.target.value)} placeholder={f.ph}
                                            className="w-full rounded-xl px-11 py-3 text-sm font-mono outline-none text-white transition-all"
                                            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
                                        <f.icon size={13} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'rgba(255,255,255,0.2)' }} />
                                    </div>
                                </div>
                            ))}
                            <div className="flex items-start gap-3 p-4 rounded-xl" style={{ background: 'rgba(0,242,234,0.05)', border: '1px solid rgba(0,242,234,0.12)' }}>
                                <Zap size={13} className="mt-0.5 shrink-0" style={{ color: '#00F2EA' }} />
                                <p className="text-[9px] font-bold tracking-widest leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>
                                    Disable &quot;Withdrawal&quot; permissions. Terminal only requires Read &amp; Trade access.
                                </p>
                            </div>
                            <button onClick={handleConnect}
                                className="w-full py-4 rounded-xl font-black uppercase tracking-widest text-[11px] text-black transition-all hover:scale-[1.02] flex items-center justify-center gap-3"
                                style={{ background: '#fff', boxShadow: '0 8px 32px rgba(255,255,255,0.1)' }}>
                                Initialize Secure Connection <ArrowRightLeft size={15} />
                            </button>
                        </motion.div>
                    ) : (
                        <div className="min-h-[300px] flex flex-col items-center justify-center text-center p-10 rounded-2xl"
                            style={{ border: '1px dashed rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.01)' }}>
                            <ExternalLink size={28} className="mb-4" style={{ color: 'rgba(255,255,255,0.06)' }} />
                            <h3 className="text-sm font-black uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.15)' }}>Awaiting Selection</h3>
                            <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.15)' }}>Select an exchange node to begin</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
