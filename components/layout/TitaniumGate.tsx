
'use client';

import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { SignIn } from '@clerk/nextjs';
import { SafeErrorBoundary } from '@/components/ui/SafeErrorBoundary';
import { createContext, useContext } from 'react';
import { useAuth } from '@/hooks/useAuth';

type GateState = 'INTRO' | 'AUTH' | 'APP';

interface GateContextType {
    state: GateState;
    hasPlayedIntro: boolean;
}

const GateStateContext = createContext<GateContextType>({ state: 'INTRO', hasPlayedIntro: false });
export const useGateState = () => useContext(GateStateContext);

interface TitaniumGateProps {
    children: React.ReactNode;
}

export function TitaniumGate({ children }: TitaniumGateProps) {
    const { isAuthenticated, isLoading } = useAuth();
    const [state, setState] = useState<GateState>('AUTH'); // Start at AUTH directly (Clerk First)
    // Removed hasPlayedIntro as we skip intro for now based on user request "Clerk first screen"
    
    useEffect(() => {
        if (!isLoading) {
            if (isAuthenticated) {
                setState('APP');
            } else {
                setState('AUTH');
            }
        }
    }, [isAuthenticated, isLoading]);

    // Loader
    if (isLoading) {
        return (
            <div className="fixed inset-0 bg-black flex items-center justify-center">
                 <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <GateStateContext.Provider value={{ state, hasPlayedIntro: true }}>
            <AnimatePresence mode="wait">
                {/* 2. AUTHENTICATION GATE (First Screen) */}
                {state === 'AUTH' && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black flex items-center justify-center p-4"
                    >
                         <div className="w-full max-w-md">
                             <div className="flex flex-col items-center mb-8 gap-4">
                                <img 
                                    src="/apple-icon.jpg" 
                                    alt="Human DeFi Icon" 
                                    className="w-32 h-32 rounded-3xl shadow-2xl"
                                />
                                 <h1 className="text-4xl font-black text-center tracking-tighter text-white">
                                    HUMAN <span className="text-gray-400">DeFi</span>
                                </h1>
                                <p className="text-center text-sm font-bold text-neutral-400 max-w-[280px] leading-relaxed">
                                    Billetera Soberana Inteligente: IA, Privacidad zkSNARKs y Control Total de tus Activos.
                                </p>
                             </div>
                            <div className="flex justify-center">
                                <SignIn 
                                    appearance={{
                                        elements: {
                                            rootBox: "w-full",
                                            card: "shadow-xl border-none rounded-3xl",
                                            headerTitle: "text-xl font-bold",
                                            headerSubtitle: "text-neutral-500",
                                            formButtonPrimary: "bg-black text-white hover:bg-gray-800",
                                            formFieldInput: "rounded-xl border-gray-200",
                                            footerActionLink: "text-black font-bold"
                                        }
                                    }}
                                    routing="hash" 
                                />
                            </div>
                         </div>
                    </motion.div>
                )}

                {/* 3. THE APPLICATION */}
                {state === 'APP' && (
                    <motion.div 
                        key="app"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="relative z-10"
                    >
                        <SafeErrorBoundary>
                            {children}
                        </SafeErrorBoundary>
                    </motion.div>
                )}
            </AnimatePresence>
        </GateStateContext.Provider>
    );
}
