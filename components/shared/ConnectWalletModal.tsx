"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Cpu, Zap, QrCode, ChevronRight, Loader2, CheckCircle2, Wallet, Radio, Terminal, Lock } from 'lucide-react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useAppKit } from '@reown/appkit/react';
import { useUIStore } from '@/lib/store/ui-store';


export function ConnectWalletModal() {
    const { isConnectModalOpen, closeConnectModal } = useUIStore();
    const { isConnected, address } = useAccount();
    const { connect, connectors, connectAsync } = useConnect();
    const { open: openAppKit } = useAppKit();
    const { disconnect, disconnectAsync } = useDisconnect();
    const [view, setView] = useState<'selection' | 'qr' | 'ledger'>('selection');
    const [qrData, setQrData] = useState<string | null>(null);
    const [isPolling, setIsPolling] = useState(false);
    const [ledgerLoading, setLedgerLoading] = useState(false);

    useEffect(() => {
        if (isConnected && isConnectModalOpen) closeConnectModal();
    }, [isConnected, isConnectModalOpen, closeConnectModal]);

    useEffect(() => {
        if (!isConnectModalOpen) {
            setTimeout(() => {
                setView('selection');
                setQrData(null);
                setIsPolling(false);
                setLedgerLoading(false);
            }, 300);
        }
    }, [isConnectModalOpen]);

    //  [Enterprise MANDATE] QR Handshake Completion Listener 
    // This event is only fired by WalletConnectionBridge when the SSE
    // auth-complete event is received (i.e. a QR scan was completed on
    // a connected mobile device). We close the modal but do NOT force
    // any navigation  the user stays where they are and navigates manually.
    useEffect(() => {
        const handleAuthSuccess = () => {
             console.log('[ConnectModal] System handshake confirmed. Closing modal.');
             setView('selection');
             closeConnectModal();
             //  NO forced navigation. The user is in control.
        };
        window.addEventListener('system:auth_success', handleAuthSuccess);
        return () => window.removeEventListener('system:auth_success', handleAuthSuccess);
    }, [closeConnectModal]);

    if (!isConnectModalOpen) return null;

    const handleAppKitConnect = () => {
        closeConnectModal();
        setTimeout(() => openAppKit({ view: 'Connect' }), 50);
    };

    // \u2500\u2500 Smart connector detector \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
    // Priority: exact SDK ID > injected window.ethereum > AppKit fallback
    const connectViaExtension = async (ids: string[]) => {
        if (typeof window === 'undefined') return;

        // Clear any stale Wagmi/AppKit state before connecting
        if (isConnected || address) {
            try {
                await disconnectAsync();
            } catch (e) {
                disconnect();
            }
        }

        const hasEthereum = typeof (window as any).ethereum !== 'undefined';
        const found = connectors.find(c => ids.includes(c.id));
        if (found) { 
            try { await connectAsync({ connector: found }); return; } catch(e) {}
        }
        // Try injected if window.ethereum exists (extension active in this tab)
        if (hasEthereum) {
            const injected = connectors.find(c => c.id === 'injected');
            if (injected) { 
                try { await connectAsync({ connector: injected }); return; } catch(e) {}
            }
        }
        // Nothing found locally  fall back to AppKit (QR/WalletConnect flow)
        openAppKit({ view: 'Connect' });
    };

    const handleMetaMask = () => connectViaExtension(['io.metamask', 'metaMaskSDK', 'metaMask']);
    const handleCoinbase = () => connectViaExtension(['coinbaseWalletSDK', 'coinbaseWallet']);
    const handleRainbow  = () => connectViaExtension(['rainbow', 'me.rainbow']);
    const handleHumanityLedger = () => { window.location.href = "/sign-up"; };

    const handleMobileSync = async () => {
        setView('qr');
        setIsPolling(true);
        try {
            const { generateX25519KeyPair } = await import('@/lib/web-crypto');
            const pair = await generateX25519KeyPair();
            const sessId = typeof crypto !== 'undefined' && crypto.randomUUID 
                ? crypto.randomUUID() 
                : Array.from(crypto.getRandomValues(new Uint8Array(16))).map(b => b.toString(16).padStart(2, '0')).join('') + '-' + Date.now().toString(36);
            
            const payload = JSON.stringify({ 
                uuid: sessId, 
                ephemeralPub: pair.publicKey, 
                isECDH: pair.isECDH, 
                expires: Date.now() + 300000 
            });
            setQrData(payload);
        } catch (e) {
            console.error('Failed to get QR session', e);
            setIsPolling(false);
        }
    };

    const handleLedger = async () => {
        setView('ledger');
        setLedgerLoading(true);
        setTimeout(() => {
            closeConnectModal();
            setTimeout(() => openAppKit({ view: 'Connect' }), 50);
            setLedgerLoading(false);
        }, 800);
    };

    return (
        <AnimatePresence>
            {isConnectModalOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 font-sans">
                {/* Clean Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={closeConnectModal}
                    className="absolute inset-0 bg-[#050505]/40 backdrop-blur-md"
                />

                {/* Modal Container */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.98, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98, y: 15 }}
                    className="relative w-full sm:max-w-[440px] max-h-[92dvh] bg-[#FFFFFF] border border-[#050505]/10 rounded-[24px] overflow-hidden flex flex-col shadow-2xl"
                >
                    {/* Header Bar */}
                    <div className="flex items-center justify-between px-6 py-5 border-b border-[#050505]/10 bg-[#FFFFFF]">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full border border-[#050505]/10 flex items-center justify-center bg-white shadow-sm">
                                <Terminal size={14} className="text-[#050505]" />
                            </div>
                            <div>
                                <div className="text-[12px] font-black text-[#050505] uppercase tracking-widest leading-none">Authentication</div>
                                <div className="text-[9px] font-mono text-black/50 uppercase tracking-widest mt-1">Network Node Access</div>
                            </div>
                        </div>
                        <button onClick={closeConnectModal} className="text-black/40 hover:text-black hover:bg-black/5 transition-colors p-2 rounded-full">
                            <X size={18} />
                        </button>
                    </div>

                    {/* Content  scrollable interior so header/footer stay fixed */}
                    <div className="px-4 py-4 sm:px-6 sm:py-6 relative overflow-y-auto flex-1">

                        <AnimatePresence mode="wait">
                            {/*  SELECTION VIEW  */}
                            {view === 'selection' && (
                                <motion.div key="selection" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6 relative z-10">
                                    <div className="space-y-0.5 text-center px-2">
                                        <h2 className="text-[18px] sm:text-[22px] font-black text-[#050505] uppercase tracking-tighter">
                                            Select Provider
                                        </h2>
                                        <p className="text-[10px] sm:text-[11px] text-black/60 font-sans leading-relaxed">
                                            Connect your wallet to access institutional tools and on-chain analytics.
                                        </p>
                                    </div>

                                    <div className="space-y-3 pt-2">
                                        {/* QUICK ACCESS GRID  compact */}
                                        <div className="grid grid-cols-2 gap-2">
                                            {[
                                                { id: 'metamask', name: 'MetaMask', logo: '/wallets/metamask.svg', handler: handleMetaMask },
                                                { id: 'coinbase', name: 'Coinbase', logo: '/wallets/coinbase.png', handler: handleCoinbase },
                                                { id: 'rainbow', name: 'Rainbow', logo: '/wallets/rainbow.png', handler: handleRainbow },
                                                { id: 'humanity', name: 'Humanity Ledger', logo: '/system-shots/connect/Gemini_Generated_Image_dzte5edzte5edzte (1).png', handler: handleHumanityLedger },
                                            ].map((w) => (
                                                <button 
                                                    key={w.id}
                                                    onClick={w.handler}
                                                    className="group relative flex flex-col items-center justify-center p-3 sm:p-5 border border-[#050505]/10 hover:border-[#050505] bg-[#FFFFFF] rounded-xl transition-all shadow-sm shadow-black/5 hover:shadow-md active:scale-[0.96]"
                                                >
                                                    <div className="w-8 h-8 sm:w-10 sm:h-10 mb-1.5 sm:mb-2.5 relative flex items-center justify-center transition-transform group-hover:scale-110 duration-300">
                                                        <img 
                                                            src={w.logo} 
                                                            alt={w.name} 
                                                            className="max-w-full max-h-full object-contain"
                                                        />
                                                    </div>
                                                    <span className="text-[8px] sm:text-[10px] font-black text-[#050505] uppercase tracking-widest transition-colors text-center leading-tight">
                                                        {w.name}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>

                                        <div className="flex items-center gap-3 my-1 opacity-50">
                                            <div className="flex-1 h-[1px] bg-black/10" />
                                            <span className="text-[8px] font-black text-[#050505] uppercase tracking-[0.2em]">OR</span>
                                            <div className="flex-1 h-[1px] bg-black/10" />
                                        </div>

                                        {/* WALLET_CONNECT & LEDGER  compact on mobile */}
                                        <div className="space-y-1.5">
                                            <button onClick={handleAppKitConnect} className="group w-full flex items-center justify-between px-3 py-2.5 sm:p-4 border border-[#050505]/10 hover:border-[#050505] bg-[#FFFFFF] rounded-xl transition-all">
                                                <div className="flex items-center gap-2.5">
                                                    <Wallet size={14} className="text-[#050505]" />
                                                    <span className="text-[11px] font-black text-[#050505] uppercase tracking-wide">All Wallets</span>
                                                </div>
                                                <ChevronRight size={13} className="text-black/40 group-hover:text-black" />
                                            </button>

                                            <button onClick={handleMobileSync} className="group w-full flex items-center justify-between px-3 py-2.5 sm:p-4 border border-[#050505] bg-[#050505] hover:bg-[#222] rounded-xl transition-all shadow-md">
                                                <div className="flex items-center gap-3 text-white">
                                                    <QrCode size={15} />
                                                    <div className="text-left">
                                                        <div className="text-[11px] font-black uppercase tracking-wide">Direct Sync</div>
                                                        <div className="text-[8px] text-white/60 font-mono uppercase tracking-widest">Session Synchronization</div>
                                                    </div>
                                                </div>
                                                <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] shrink-0" />
                                            </button>

                                            <button onClick={handleLedger} className="group w-full flex items-center justify-between px-3 py-2.5 sm:p-4 border border-[#050505]/10 hover:border-[#050505] bg-[#FFFFFF] rounded-xl transition-all">
                                                <div className="flex items-center gap-2.5">
                                                    <Cpu size={14} className="text-[#050505]" />
                                                    <span className="text-[11px] font-black text-[#050505] uppercase tracking-wide">Hardware Wallet</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-[8px] font-black text-black/40 uppercase tracking-widest hidden sm:block">Cold Storage</span>
                                                    <ChevronRight size={13} className="text-black/40 group-hover:text-black" />
                                                </div>
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/*  QR VIEW  */}
                            {view === 'qr' && (
                                <motion.div key="qr" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center py-4 space-y-8 relative z-10">
                                    <div className="text-center space-y-2">
                                        <h3 className="text-2xl font-black text-[#050505] tracking-tighter uppercase">SCAN IT</h3>
                                        <p className="text-[11px] text-black/60 leading-relaxed max-w-[280px]">
                                            Scan this QR code with the designated mobile application to synchronize sessions.
                                        </p>
                                    </div>

                                    <div className="relative p-6 bg-white border border-[#050505]/10 rounded-[32px] shadow-sm">
                                            {qrData ? (
                                                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}&color=050505&bgcolor=FFFFFF`} alt="QR" className="w-[200px] h-[200px] object-contain" />
                                            ) : (
                                                <div className="flex flex-col items-center gap-3 opacity-50">
                                                    <Loader2 className="text-[#050505] animate-spin" size={32} />
                                                </div>
                                            )}
                                        </div>

                                    {/* Console Log */}
                                    {isPolling && (
                                        <div className="w-full bg-[#FFFFFF] border border-[#050505]/10 p-3 rounded-xl text-center">
                                            <p className="text-[10px] text-[#050505] font-black uppercase tracking-[0.1em] flex items-center justify-center gap-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-black"/> AWAITING HANDSHAKE...
                                            </p>
                                        </div>
                                    )}

                                    <button onClick={() => setView('selection')} className="text-[11px] font-black text-black/40 uppercase tracking-[0.2em] hover:text-[#050505] transition-colors py-2 px-6">
                                        CANCEL
                                    </button>
                                </motion.div>
                            )}

                            {/*  LEDGER VIEW  */}
                            {view === 'ledger' && (
                                <motion.div key="ledger" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center py-8 space-y-6 relative z-10">
                                    <div className="w-20 h-20 rounded-full border border-[#050505]/10 bg-[#FFFFFF] flex items-center justify-center shadow-sm">
                                        {ledgerLoading ? <Loader2 size={24} className="text-[#050505] animate-spin" /> : <CheckCircle2 size={28} className="text-[#050505]" />}
                                    </div>

                                    <div className="text-center space-y-2">
                                        <h3 className="text-xl font-black text-[#050505] tracking-tighter uppercase">
                                            {ledgerLoading ? 'INITIALIZING...' : 'DEVICE READY'}
                                        </h3>
                                    </div>

                                    <div className="w-full bg-[#FFFFFF] border border-[#050505]/10 rounded-2xl p-5 flex flex-col gap-3 text-[11px] font-bold text-black/60">
                                        <div className="flex items-center gap-3"><Zap size={14} className="text-[#050505]" /><span>Secure Connection Active</span></div>
                                        <div className="flex items-center gap-3"><Lock size={14} className="text-[#050505]" /><span>Hardware Protected Session</span></div>
                                    </div>

                                    <button onClick={() => setView('selection')} className="text-[11px] font-black text-black/40 uppercase tracking-[0.2em] hover:text-[#050505] transition-colors mt-6 py-2 px-6">
                                        GO BACK
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>
            </div>
            )}
        </AnimatePresence>
    );
}
