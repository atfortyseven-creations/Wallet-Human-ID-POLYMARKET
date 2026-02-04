"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet, TrendingUp, CreditCard, Gift, ChevronDown, ArrowRight, Code, Cpu, Shield, Globe } from "lucide-react";
import { FloatingImmersiveBackground } from "@/components/landing/FloatingImmersiveBackground";

export default function DeveloperPage() {
    const [openItem, setOpenItem] = useState<string | null>("wallet");

    const toggleItem = (id: string) => {
        setOpenItem(openItem === id ? null : id);
    };

    return (
        <main className="min-h-screen bg-[#EAEADF] text-[#1F1F1F] font-sans overflow-hidden relative selection:bg-[#1F1F1F] selection:text-[#EAEADF]">
            {/* Immersive Background */}
            <div className="fixed inset-0 z-0 opacity-40 pointer-events-none">
                <FloatingImmersiveBackground />
            </div>

            <div className="relative z-10 max-w-5xl mx-auto px-6 py-24">
                {/* Header Section */}
                <motion.div 
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="mb-24 text-center md:text-left"
                >
                    <div className="inline-block mb-4 px-4 py-1.5 rounded-full bg-[#1F1F1F] text-[#EAEADF] text-xs font-bold tracking-widest uppercase">
                        Engineering Trust
                    </div>
                    <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] mb-8 text-[#1F1F1F]">
                        HUMAN <br/> DEFI
                    </h1>
                    <p className="text-xl md:text-2xl font-medium max-w-2xl opacity-60 leading-relaxed">
                        No vendemos hype, vendemos arquitectura verificable. 
                        <span className="block mt-2 text-sm opacity-50 uppercase tracking-widest font-bold">Build v4.0 // CEO 2030 Vision</span>
                    </p>
                </motion.div>

                {/* Stackable Accordion Section */}
                <div className="flex flex-col gap-4">
                    <StackItem 
                        id="wallet"
                        isOpen={openItem === "wallet"}
                        onClick={() => toggleItem("wallet")}
                        title="OBTENER WALLET"
                        subtitle="Protocolo: Capa de Abstracción de Cuenta ERC-4337"
                        icon={<Wallet size={32} />}
                    >
                        <div className="grid md:grid-cols-2 gap-8 items-center">
                            <div className="space-y-4">
                                <h3 className="text-2xl font-bold">El fin de la era de la frase semilla</h3>
                                <p className="opacity-70 leading-relaxed">
                                    Creamos una bóveda de seguridad biométrica que elimina el riesgo humano. 
                                    Tu rostro es tu llave privada. Sharding criptográfico distribuido en 3 nodos seguros.
                                </p>
                                <div className="flex gap-2 pt-4">
                                    <Badge>Smart Contract Wallets</Badge>
                                    <Badge>Social Recovery</Badge>
                                    <Badge>Gasless</Badge>
                                </div>
                            </div>
                            <div className="h-48 bg-[#1F1F1F]/5 rounded-2xl border border-[#1F1F1F]/10 flex items-center justify-center relative overflow-hidden group">
                                <Code size={64} className="opacity-10 group-hover:scale-110 transition-transform duration-500" />
                                <div className="absolute inset-0 bg-gradient-to-tr from-transparent to-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                        </div>
                    </StackItem>

                    <StackItem 
                        id="predict"
                        isOpen={openItem === "predict"}
                        onClick={() => toggleItem("predict")}
                        title="PREDECIR"
                        subtitle="Mercados de Predicción de Baja Latencia"
                        icon={<TrendingUp size={32} />}
                    >
                         <div className="grid md:grid-cols-2 gap-8 items-center">
                            <div className="space-y-4">
                                <h3 className="text-2xl font-bold">Oráculos Sub-Segundo</h3>
                                <p className="opacity-70 leading-relaxed">
                                    Infraestructura de trading propietaria. Ejecución atómica en Polymarket. 
                                    Datos resueltos matemáticamente sin intermediarios. La verdad es el único activo.
                                </p>
                                <div className="flex gap-2 pt-4">
                                    <Badge>CTF Exchange</Badge>
                                    <Badge>Optimistic Oracle</Badge>
                                </div>
                            </div>
                            <div className="h-48 bg-[#1F1F1F]/5 rounded-2xl border border-[#1F1F1F]/10 flex items-center justify-center relative overflow-hidden group">
                                <Globe size={64} className="opacity-10 group-hover:rotate-180 transition-transform duration-700 ease-in-out" />
                            </div>
                        </div>
                    </StackItem>

                    <StackItem 
                        id="buy"
                        isOpen={openItem === "buy"}
                        onClick={() => toggleItem("buy")}
                        title="COMPRAR / GANAR / CANJEAR"
                        subtitle="Ciclo Financiero Completo"
                        icon={<CreditCard size={32} />}
                    >
                         <div className="grid md:grid-cols-2 gap-8 items-center">
                             <div className="space-y-4">
                                <h3 className="text-2xl font-bold">Soberanía Financiera Vertical</h3>
                                <p className="opacity-70 leading-relaxed">
                                    Integración directa con redes bancarias globales (SEPA/SWIFT) y staking nativo on-chain.
                                    Tus rendimientos provienen de la utilidad de la red, no de la inflación.
                                </p>
                                <div className="flex gap-2 pt-4">
                                    <Badge>Fiat On-Ramp</Badge>
                                    <Badge>Liquid Staking</Badge>
                                    <Badge>Instant Settlement</Badge>
                                </div>
                            </div>
                             <div className="h-48 bg-[#1F1F1F]/5 rounded-2xl border border-[#1F1F1F]/10 flex items-center justify-center relative overflow-hidden group">
                                <Cpu size={64} className="opacity-10 group-hover:pulse transition-all" />
                            </div>
                        </div>
                    </StackItem>

                    <StackItem 
                        id="rewards"
                        isOpen={openItem === "rewards"}
                        onClick={() => toggleItem("rewards")}
                        title="RECOMPENSAS"
                        subtitle="Incentivos Algorítmicos"
                        icon={<Gift size={32} />}
                    >
                        <div className="grid md:grid-cols-2 gap-8 items-center">
                            <div className="space-y-4">
                                <h3 className="text-2xl font-bold">Tokenomics Sustentables</h3>
                                <p className="opacity-70 leading-relaxed">
                                    Un sistema de lealtad programable. Gana participando en la gobernanza, 
                                    proveyendo liquidez o simplemente utilizando la Human Card.
                                </p>
                                <div className="flex gap-2 pt-4">
                                    <Badge>Governance</Badge>
                                    <Badge>Yield Farming</Badge>
                                </div>
                            </div>
                             <div className="h-48 bg-[#1F1F1F]/5 rounded-2xl border border-[#1F1F1F]/10 flex items-center justify-center relative overflow-hidden group">
                                <Shield size={64} className="opacity-10 group-hover:scale-110 transition-transform" />
                            </div>
                        </div>
                    </StackItem>
                </div>

                <div className="mt-24 border-t border-[#1F1F1F]/10 pt-8 flex justify-between items-end opacity-50 text-xs font-mono uppercase">
                    <div>
                        Human DeFi Architecture<br/>
                        San Francisco, CA // Singapore
                    </div>
                    <div className="text-right">
                        System Status: <span className="text-green-600">Operational</span><br/>
                        Latency: 12ms
                    </div>
                </div>
            </div>
        </main>
    );
}

function StackItem({ id, isOpen, onClick, title, subtitle, icon, children }: any) {
    return (
        <motion.div 
            layout 
            onClick={onClick}
            className={`
                group cursor-pointer relative overflow-hidden
                ${isOpen ? 'bg-[#1F1F1F] text-[#EAEADF]' : 'bg-white hover:bg-white/80'}
                backdrop-blur-xl border border-[#1F1F1F]/5 hover:border-[#1F1F1F]/20
                rounded-[32px] transition-colors duration-500 ease-out shadow-lg
            `}
        >
            <div className="p-8 md:p-10 flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <div className={`
                        w-16 h-16 rounded-2xl flex items-center justify-center transition-colors duration-500
                        ${isOpen ? 'bg-[#EAEADF] text-[#1F1F1F]' : 'bg-[#1F1F1F] text-[#EAEADF]'}
                    `}>
                        {icon}
                    </div>
                    <div>
                        <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight">{title}</h2>
                        <div className={`mt-1 font-mono text-xs uppercase tracking-widest font-bold ${isOpen ? 'text-[#EAEADF]/50' : 'text-blue-600'}`}>
                            {subtitle}
                        </div>
                    </div>
                </div>
                <motion.div 
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    className={`p-2 rounded-full border ${isOpen ? 'border-[#EAEADF]/20' : 'border-[#1F1F1F]/10'}`}
                >
                    <ChevronDown size={24} />
                </motion.div>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <div className="px-8 md:px-10 pb-10 pt-2 border-t border-[#EAEADF]/10">
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

function Badge({ children }: { children: React.ReactNode }) {
    return (
        <span className="px-3 py-1 rounded-full border border-current text-[10px] font-bold uppercase tracking-wider opacity-60">
            {children}
        </span>
    );
}
