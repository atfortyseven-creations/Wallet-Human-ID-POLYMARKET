import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWalletStore } from '@/lib/store/wallet-store';
import { ArrowDownToLine, ArrowRightLeft, ArrowUpRight, Maximize, QrCode, Link2, Settings2, ShieldCheck, X } from 'lucide-react';
import dynamic from 'next/dynamic';

// Dynamically import the actual functional modals
const UniversalSendModal = dynamic(() => import('@/components/wallet/UniversalSendModal').then(mod => mod.default || mod.UniversalSendModal), { ssr: false });
const SwapModal = dynamic(() => import('@/components/wallet/SwapModal').then(mod => mod.default || mod.SwapModal), { ssr: false });
const ReceiveModal = dynamic(() => import('@/components/wallet/ReceiveModal').then(mod => mod.default || mod.ReceiveModal), { ssr: false });
const UniversalScanModal = dynamic(() => import('@/components/scan/UniversalScanModal').then(mod => mod.default || mod.UniversalScanModal), { ssr: false });

export function SettingsView({ onClose }: { onClose: () => void }) {
    const { address, activeNetwork } = useWalletStore();
    const [view, setView] = useState<'ACTIONS' | 'CONFIG'>('ACTIONS');
    const [activeModal, setActiveModal] = useState<'SEND' | 'RECEIVE' | 'SWAP' | 'BRIDGE' | 'SCAN' | null>(null);

    const ActionButton = ({ icon: Icon, label, onClick }: { icon: any, label: string, onClick: () => void }) => (
        <button 
            onClick={onClick}
            className="flex flex-col items-center justify-center gap-3 bg-zinc-50 border border-zinc-200/60 rounded-2xl p-6 hover:bg-zinc-100 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
            <div className="w-12 h-12 bg-white shadow-sm rounded-full flex items-center justify-center text-black">
                <Icon size={20} strokeWidth={2} />
            </div>
            <span className="text-[12px] font-bold text-zinc-900 tracking-wide uppercase">{label}</span>
        </button>
    );

    return (
        <>
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="fixed inset-0 z-[90] md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[600px] md:min-h-[500px] bg-white md:rounded-3xl shadow-2xl overflow-hidden flex flex-col font-sans"
            >
                <header className="h-[70px] border-b border-zinc-100 flex items-center justify-between px-8 bg-white shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-white">
                            {view === 'ACTIONS' ? <Maximize size={18} /> : <Settings2 size={18} />}
                        </div>
                        <div>
                            <h2 className="text-[15px] font-black tracking-tight text-zinc-900">
                                {view === 'ACTIONS' ? 'Portfolio Actions' : 'System Configuration'}
                            </h2>
                            <p className="text-[11px] text-zinc-500 font-medium">
                                {activeNetwork?.name || 'Mainnet'} • {address ? (address.slice(0, 6) + '...' + address.slice(-4)) : 'Not Connected'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => setView(view === 'ACTIONS' ? 'CONFIG' : 'ACTIONS')}
                            className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600 hover:bg-zinc-200 transition-colors"
                        >
                            {view === 'ACTIONS' ? <Settings2 size={16} /> : <Maximize size={16} />}
                        </button>
                        <button onClick={onClose} className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600 hover:bg-zinc-200 transition-colors">
                            <X size={18} />
                        </button>
                    </div>
                </header>

                <div className="flex-1 p-8 bg-white overflow-y-auto">
                    <AnimatePresence mode="wait">
                        {view === 'ACTIONS' ? (
                            <motion.div 
                                key="actions"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="grid grid-cols-2 md:grid-cols-3 gap-4"
                            >
                                <ActionButton icon={ArrowDownToLine} label="Receive" onClick={() => setActiveModal('RECEIVE')} />
                                <ActionButton icon={ArrowUpRight} label="Send" onClick={() => setActiveModal('SEND')} />
                                <ActionButton icon={ArrowRightLeft} label="Swap" onClick={() => setActiveModal('SWAP')} />
                                <ActionButton icon={Link2} label="Bridge" onClick={() => setActiveModal('BRIDGE')} />
                                <ActionButton icon={QrCode} label="Scan QR" onClick={() => setActiveModal('SCAN')} />
                                <ActionButton icon={ShieldCheck} label="Verify" onClick={() => alert('Verification Module Active')} />
                            </motion.div>
                        ) : (
                            <motion.div 
                                key="config"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="flex flex-col gap-6"
                            >
                                <div className="p-6 rounded-2xl border border-zinc-200/60 bg-zinc-50 text-center">
                                    <h3 className="text-[13px] font-black uppercase tracking-widest text-zinc-900 mb-2">Advanced Security</h3>
                                    <p className="text-[12px] text-zinc-500 mb-4">Manage RPC endpoints, local vault encryption, and contact addresses.</p>
                                    <button className="px-6 py-2.5 bg-black text-white text-[11px] font-bold uppercase tracking-widest rounded-xl hover:bg-zinc-800 transition-colors">
                                        Manage Settings
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>

            {/* Modals rendering above the Action Hub */}
            <AnimatePresence>
                {activeModal === 'SEND' && <UniversalSendModal onClose={() => setActiveModal(null)} />}
                {activeModal === 'RECEIVE' && <ReceiveModal onClose={() => setActiveModal(null)} />}
                {activeModal === 'SWAP' && <SwapModal onClose={() => setActiveModal(null)} />}
                {activeModal === 'SCAN' && <UniversalScanModal onClose={() => setActiveModal(null)} />}
                {activeModal === 'BRIDGE' && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
                        <div className="bg-white p-8 rounded-2xl max-w-sm text-center shadow-2xl">
                            <h3 className="text-lg font-black text-black mb-2">Omnichain Bridge</h3>
                            <p className="text-sm text-black/60 mb-6">The decentralized bridge router is currently syncing with Layer 2 networks.</p>
                            <button onClick={() => setActiveModal(null)} className="px-6 py-2 bg-black text-white rounded-xl text-xs font-bold uppercase">Close</button>
                        </div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
