"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, TrendingDown, Bell, Zap, Info, ChevronRight } from "lucide-react";

interface Unlock {
    tokenSymbol: string;
    tokenName: string;
    unlockDate: Date;
    amount: string;
    type: string;
    percentageOfSupply: number;
}

export default function DilutionTracker() {
    const [unlocks, setUnlocks] = useState<Unlock[]>([]);
    const [timeLeft, setTimeLeft] = useState<{ [key: string]: string }>({});
    const [isVipModalOpen, setIsVipModalOpen] = useState(false);
    const [email, setEmail] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubscribe = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await fetch('/api/alerts/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            if (res.ok) {
                setIsSuccess(true);
                setTimeout(() => {
                    setIsVipModalOpen(false);
                    setIsSuccess(false);
                    setEmail("");
                }, 3000);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        const timer = setInterval(() => {
            const newTimeLeft: { [key: string]: string } = {};
            unlocks.forEach(unlock => {
                const diff = unlock.unlockDate.getTime() - new Date().getTime();
                if (diff <= 0) {
                    newTimeLeft[unlock.tokenSymbol] = "UNLOCKED";
                } else {
                    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
                    newTimeLeft[unlock.tokenSymbol] = `${days}d ${hours}h ${minutes}m ${seconds}s`;
                }
            });
            setTimeLeft(newTimeLeft);
        }, 1000);

        return () => clearInterval(timer);
    }, [unlocks]);

    return (
        <section className="relative py-32 px-6">
            <div className="max-w-[2560px] mx-auto text-left">
                {/* TITLE & HEADER (ONLY TITLE AND TOOL AS REQUESTED) */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
                    <div>
                        <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-stone-900 leading-none mb-4">
                            Upcoming Dilution Analysis.
                        </h2>
                        <div className="flex items-center gap-3">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400">
                                Real-Time Supply Monitoring
                            </span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {unlocks.map((unlock, i) => (
                        <motion.div
                            key={unlock.tokenSymbol}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="group relative bg-white/40 backdrop-blur-2xl border border-white/40 p-10 rounded-[3rem] shadow-sm hover:shadow-xl hover:bg-white/60 transition-all overflow-hidden"
                        >
                            {/* Visual Intensity Gradient */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 blur-3xl group-hover:bg-red-500/10 transition-colors" />

                            <div className="flex justify-between items-start mb-12">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-10 h-10 rounded-full bg-stone-900 flex items-center justify-center text-white text-xs font-black">
                                            {unlock.tokenSymbol}
                                        </div>
                                        <h3 className="text-2xl font-black text-stone-900">{unlock.tokenName}</h3>
                                    </div>
                                    <span className="px-3 py-1 bg-stone-100 rounded-full text-[9px] font-black tracking-widest text-stone-500 uppercase border border-stone-200">
                                        {unlock.type} UNLOCK
                                    </span>
                                </div>
                                <div className="text-right">
                                    <div className="text-[10px] font-black uppercase text-stone-400 tracking-widest mb-1">Impacto</div>
                                    <div className="text-2xl font-black text-red-600">+{unlock.percentageOfSupply}%</div>
                                </div>
                            </div>

                            <div className="space-y-6 mb-12">
                                <div className="bg-stone-900/5 p-6 rounded-2xl border border-stone-900/5">
                                    <div className="flex items-center gap-2 mb-3 text-[10px] font-black uppercase tracking-widest text-stone-500">
                                        <Clock size={12} />
                                        Tiempo Restante
                                    </div>
                                    <div className="text-3xl font-black text-stone-900 font-mono tracking-tighter">
                                        {timeLeft[unlock.tokenSymbol] || 'CALCULANDO...'}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-black/5 p-4 rounded-xl border border-stone-100">
                                        <div className="text-[9px] font-black uppercase text-stone-400 mb-1">Monto</div>
                                        <div className="text-sm font-black text-stone-900">{unlock.amount}</div>
                                    </div>
                                    <div className="bg-black/5 p-4 rounded-xl border border-stone-100 text-right">
                                        <div className="text-[9px] font-black uppercase text-stone-400 mb-1">Estado</div>
                                        <div className="text-[10px] font-black text-stone-900 uppercase flex items-center justify-end gap-1">
                                            <Bell size={10} className="text-green-500" />
                                            Alertas On
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <motion.button 
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setIsVipModalOpen(true)}
                                className="w-full py-4 bg-stone-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-stone-900/20 flex items-center justify-center gap-2 group/btn"
                            >
                                ACTIVAR ALERTAS VIP
                                <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                            </motion.button>
                        </motion.div>
                    ))}
                </div>

                <div className="mt-20 p-8 border border-stone-200 rounded-[2rem] bg-black/5/50 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-white border border-stone-200 flex items-center justify-center animate-bounce">
                            <Zap size={20} className="text-yellow-500 fill-yellow-500" />
                        </div>
                        <div>
                            <p className="font-black text-stone-900 tracking-tight">Total Sync Detected.</p>
                            <p className="text-xs text-stone-500 font-light italic">All registered users will receive real-time notifications.</p>
                        </div>
                    </div>
                    <div className="flex -space-x-4">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-stone-200" />
                        ))}
                    </div>
                </div>

                {/* VIP SUBSCRIPTION MODAL */}
                <AnimatePresence>
                    {isVipModalOpen && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/40 backdrop-blur-xl">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                className="w-full max-w-lg bg-white border border-stone-200 rounded-[3rem] shadow-2xl overflow-hidden p-12"
                            >
                                {!isSuccess ? (
                                    <>
                                        <div className="flex justify-between items-start mb-8">
                                            <div>
                                                <h3 className="text-3xl font-black tracking-tighter text-stone-900">VIP Subscription.</h3>
                                                <p className="text-stone-500 text-sm mt-2 font-light">Receive alerts 24h before each dilution event.</p>
                                            </div>
                                            <button 
                                                onClick={() => setIsVipModalOpen(false)}
                                                className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center hover:bg-stone-200 transition-colors"
                                            >
                                                ×
                                            </button>
                                        </div>

                                        <form onSubmit={handleSubscribe} className="space-y-6">
                                            <div className="relative">
                                                <input
                                                    type="email"
                                                    required
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    placeholder="tu@correo.com"
                                                    className="w-full h-16 bg-black/5 border border-stone-200 rounded-2xl px-6 font-black text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900/20 transition-all"
                                                />
                                            </div>
                                            <button 
                                                disabled={isSubmitting}
                                                className="w-full h-16 bg-stone-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-stone-900/20 flex items-center justify-center gap-3"
                                            >
                                                {isSubmitting ? "CONECTANDO..." : "CONFIRMAR ACCESO VIP"}
                                                <Zap size={14} className="text-yellow-400 fill-yellow-400" />
                                            </button>
                                        </form>
                                    </>
                                ) : (
                                    <div className="text-center py-8">
                                        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                                            <Bell size={32} className="text-green-600" />
                                        </div>
                                        <h3 className="text-3xl font-black text-stone-900 mb-2">Subscribed Successfully!</h3>
                                        <p className="text-stone-500 font-light">Your identity has been linked to the alert node.</p>
                                    </div>
                                )}
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </section>
    );
}

