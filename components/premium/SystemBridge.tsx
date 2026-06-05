"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import QRCode from 'qrcode';
import { QrCode, RefreshCw, Loader, Smartphone } from 'lucide-react';

// Stable browser session ID  persisted in sessionStorage
function getSessionId(): string {
    if (typeof window === 'undefined') return 'ssr';
    let id = sessionStorage.getItem('_whale_sid');
    if (!id) {
        id = `sess-${Math.random().toString(36).slice(2)}-${Date.now().toString(36)}`;
        sessionStorage.setItem('_whale_sid', id);
    }
    return id;
}

type BridgeState = 'idle' | 'generating' | 'ready' | 'expired' | 'error' | 'success';

interface SystemBridgeProps {
    onClose?: () => void;
}

export function SystemBridge({ onClose }: SystemBridgeProps) {
    const [state, setState] = useState<BridgeState>('idle');
    const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
    const [expiresAt, setExpiresAt] = useState<Date | null>(null);
    const [countdown, setCountdown] = useState(300);
    const [errorMsg, setErrorMsg] = useState('');
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const clearTimer = () => {
        if (timerRef.current) clearInterval(timerRef.current);
    };

    useEffect(() => () => clearTimer(), []);

    const generateQR = async () => {
        clearTimer();
        setState('generating');
        setErrorMsg('');

        try {
            const sessionId = getSessionId();

            const res = await fetch('/api/bridge/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-session-id': sessionId,
                },
            });

            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error(body.error ?? `HTTP ${res.status}`);
            }

            const { token, linkUrl, expiresAt: exp } = await res.json();
            if (!token || !linkUrl) throw new Error('Invalid bridge response');

            const dataUrl = await QRCode.toDataURL(linkUrl, {
                width: 280,
                margin: 2,
                color: { dark: '#000000', light: '#ffffff' },
                errorCorrectionLevel: 'H',
            });

            setQrDataUrl(dataUrl);
            const expDate = new Date(exp);
            setExpiresAt(expDate);
            setCountdown(Math.floor((expDate.getTime() - Date.now()) / 1000));
            setState('ready');

            // Tick every second  token is captured in closure
            timerRef.current = setInterval(async () => {
                const remaining = Math.max(0, Math.floor((expDate.getTime() - Date.now()) / 1000));
                setCountdown(remaining);
                if (remaining === 0) {
                    clearTimer();
                    setState('expired');
                } else if (remaining % 2 === 0) {
                    // Poll status every 2 seconds using captured token
                    try {
                        const statusRes = await fetch(`/api/bridge/status?token=${token}`);
                        if (statusRes.ok) {
                            const data = await statusRes.json();
                            if (data.linked) {
                                clearTimer();
                                (setState as any)('success');
                                if (data.wallet) {
                                    document.cookie = `system_handshake=${data.wallet}; path=/; max-age=604800; SameSite=Lax`;
                                }
                                setTimeout(() => {
                                    if (onClose) {
                                        onClose();
                                        window.location.reload();
                                    } else {
                                        window.location.reload();
                                    }
                                }, 3000);
                            }
                        }
                    } catch (e) {
                        console.warn("Poll failed", e);
                    }
                }
            }, 1000);

        } catch (err: unknown) {
            console.error('[SystemBridge] Error:', err);
            setErrorMsg(err instanceof Error ? err.message : 'Unknown error generating QR');
            setState('error');
        }
    };

    const mins = Math.floor(countdown / 60);
    const secs = (countdown % 60).toString().padStart(2, '0');

    return (
        <div className="w-full flex flex-col items-center gap-5">
            <div className="text-center space-y-1.5">
                <div className="flex items-center justify-center gap-2 text-[#a855f7]">
                    <Smartphone size={15} />
                    <span className="font-mono text-[10px] uppercase tracking-[0.3em]">Device Bridge</span>
                </div>
                <p className="text-[11px] text-white/30 font-mono leading-relaxed">
                    Generate a QR on this PC.<br />Scan it with your mobile to link your session.
                </p>
            </div>

            <AnimatePresence mode="wait">
                {/* IDLE */}
                {state === 'idle' && (
                    <motion.button
                        key="idle"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        onClick={generateQR}
                        className="w-full py-3 rounded-xl bg-[#a855f7]/10 border border-[#a855f7]/25 text-[#a855f7] font-mono text-[11px] uppercase tracking-widest hover:bg-[#a855f7]/20 transition-colors flex items-center justify-center gap-2"
                    >
                        <QrCode size={14} /> Generate QR Code
                    </motion.button>
                )}

                {/* GENERATING */}
                {state === 'generating' && (
                    <motion.div key="generating" className="flex items-center gap-3 py-4 text-white/40">
                        <Loader size={18} className="animate-spin" />
                        <span className="font-mono text-[10px] uppercase tracking-widest">Generating</span>
                    </motion.div>
                )}

                {/* READY */}
                {state === 'ready' && qrDataUrl && (
                    <motion.div
                        key="ready"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center gap-4 w-full"
                    >
                        {/* QR Code */}
                        <div className="relative p-3 bg-[#0d0d0d] rounded-2xl border border-[#a855f7]/25 shadow-[0_0_30px_rgba(168,85,247,0.12)]">
                            <div className="p-2 bg-white rounded-xl">
                                <img src={qrDataUrl} alt="Bridge QR Code" className="w-52 h-52 rounded-lg" />
                            </div>
                            {/* Corner markers */}
                            {[
                                'top-1.5 left-1.5 border-t-2 border-l-2 rounded-tl-xl',
                                'top-1.5 right-1.5 border-t-2 border-r-2 rounded-tr-xl',
                                'bottom-1.5 left-1.5 border-b-2 border-l-2 rounded-bl-xl',
                                'bottom-1.5 right-1.5 border-b-2 border-r-2 rounded-br-xl',
                            ].map((cls, i) => (
                                <div key={i} className={`absolute ${cls} w-5 h-5 border-[#a855f7]`} />
                            ))}
                        </div>

                        {/* Timer */}
                        <div className="flex items-center gap-2">
                            <div className={`w-1.5 h-1.5 rounded-full ${countdown < 60 ? 'bg-red-400 animate-pulse' : 'bg-[#4ade80]'}`} />
                            <span className="font-mono text-[11px] text-white/40">
                                Expires in{' '}
                                <span className={`font-bold ${countdown < 60 ? 'text-red-400' : 'text-white'}`}>
                                    {mins}:{secs}
                                </span>
                            </span>
                        </div>

                        <button
                            onClick={generateQR}
                            className="flex items-center gap-1.5 text-[9px] font-mono uppercase tracking-widest text-white/20 hover:text-white/50 transition-colors"
                        >
                            <RefreshCw size={10} /> Refresh
                        </button>
                    </motion.div>
                )}

                {/* EXPIRED */}
                {state === 'expired' && (
                    <motion.div key="expired" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="flex flex-col items-center gap-3 text-center py-4">
                        <p className="text-xs text-orange-400/70 font-mono">QR expired. Generate a new one.</p>
                        <button onClick={generateQR}
                            className="px-4 py-2 rounded-lg bg-[#a855f7]/10 border border-[#a855f7]/20 text-[#a855f7] text-[10px] uppercase tracking-widest font-mono hover:bg-[#a855f7]/20 transition-colors flex items-center gap-2">
                            <RefreshCw size={11} /> New QR
                        </button>
                    </motion.div>
                )}

                {/* SUCCESS */}
                {state === 'success' && (
                    <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center gap-3 text-center py-6">
                        <div className="w-16 h-16 rounded-full bg-[#4ade80]/10 border border-[#4ade80]/30 flex items-center justify-center mb-2">
                            <Smartphone size={28} className="text-[#4ade80]" />
                        </div>
                        <h3 className="font-mono text-[14px] font-bold text-white uppercase tracking-widest">Bridge Connected</h3>
                        <p className="text-[11px] text-white/40 font-mono leading-relaxed max-w-[220px]">
                            Session successfully linked.
                        </p>
                    </motion.div>
                )}

                {/* ERROR */}
                {state === 'error' && (
                    <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="flex flex-col items-center gap-3 text-center py-2">
                        <p className="text-[11px] text-red-400/70 font-mono leading-relaxed max-w-[220px]">
                            {errorMsg || 'Failed to generate QR. Please try again.'}
                        </p>
                        <button onClick={generateQR}
                            className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white/40 text-[10px] uppercase tracking-widest font-mono hover:bg-white/10 transition-colors">
                            Try Again
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
