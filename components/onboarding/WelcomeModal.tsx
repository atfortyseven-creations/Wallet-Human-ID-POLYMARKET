"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WhaleLogo } from "@/components/shared/WhaleLogo";
import { ChevronRight, ShieldCheck, Activity, BarChart3, X } from "lucide-react";
import { useWalletStore } from "@/lib/store/wallet-store";

const SEEN_ONBOARDING_KEY = "system_onboarding_completed";

export function WelcomeModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const hasSeen = localStorage.getItem(SEEN_ONBOARDING_KEY);
    if (!hasSeen) {
      // Small delay to allow the cosmic pattern to render first
      const timer = setTimeout(() => setIsOpen(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const completeOnboarding = () => {
    localStorage.setItem(SEEN_ONBOARDING_KEY, "true");
    setIsOpen(false);
  };

  const steps = [
    {
      title: "INSTITUTIONAL ON-CHAIN INTELLIGENCE",
      desc: "Welcome to the Humanity Ledger infrastructure. You now have direct access to real-time on-chain capital flow surveillance, large-position tracking, and cross-chain portfolio analytics at an institutional resolution.",
      icon: <WhaleLogo className="w-12 h-12" />,
      action: "BEGIN ORIENTATION"
    },
    {
      title: "PRIVACY-PRESERVING ARCHITECTURE",
      desc: "Your session is secured through MEV-protected routing and zero-knowledge proof primitives. Every dashboard interaction and transaction preview is cryptographically isolated from public mempool visibility.",
      icon: <ShieldCheck size={48} className="text-[#00F2EA]" strokeWidth={1} />,
      action: "CONFIRM & CONTINUE"
    },
    {
      title: "LIVE MARKET INTELLIGENCE FEED",
      desc: "The platform's data infrastructure processes millions of on-chain events per second across all major networks. You are now connected to a live feed of the most significant capital movements in global decentralised markets.",
      icon: <Activity size={48} className="text-[#00C076]" strokeWidth={1} />,
      action: "ACCESS DASHBOARD"
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <React.Fragment>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white/40 backdrop-blur-3xl z-[900]"
          />
          <div className="fixed inset-0 flex items-center justify-center z-[901] px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full max-w-xl bg-[#FFFFFF] border border-black/[0.08] rounded-[2.5rem] p-12 shadow-2xl relative overflow-hidden"
            >
              <button 
                onClick={completeOnboarding}
                className="absolute top-8 right-8 p-3 rounded-full hover:bg-black/5 transition-colors group"
                aria-label="Skip Tutorial"
              >
                <X size={20} className="text-black/30 group-hover:text-black transition-colors" />
              </button>

              <div className="text-center space-y-8 relative z-10 flex flex-col items-center">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  className="w-24 h-24 rounded-full bg-white shadow-xl border border-black/[0.04] flex items-center justify-center mb-4"
                >
                  {steps[step].icon}
                </motion.div>

                <div className="space-y-4 max-w-[400px]">
                  <motion.h2 
                    key={`title-${step}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-2xl font-black uppercase tracking-tighter text-black"
                  >
                    {steps[step].title}
                  </motion.h2>
                  <motion.p 
                    key={`desc-${step}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-[12px] font-bold uppercase tracking-widest text-black/40 leading-relaxed"
                  >
                    {steps[step].desc}
                  </motion.p>
                </div>

                <div className="flex flex-col items-center w-full gap-8 pt-4">
                  <div className="flex items-center gap-3">
                    {steps.map((_, i) => (
                      <div 
                        key={i} 
                        className={`transition-all duration-500 rounded-full ${i === step ? 'w-8 h-1.5 bg-black' : 'w-1.5 h-1.5 bg-black/10'}`}
                      />
                    ))}
                  </div>

                  <button
                    onClick={() => {
                      if (step < steps.length - 1) setStep(step + 1);
                      else completeOnboarding();
                    }}
                    className="w-full flex items-center justify-between px-8 py-5 bg-black text-white rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all group shadow-2xl shadow-black/20"
                  >
                    <span className="font-black text-[11px] uppercase tracking-[0.2em]">
                      {steps[step].action}
                    </span>
                    <ChevronRight size={18} className="text-white/50 group-hover:text-white transition-colors group-hover:translate-x-1" strokeWidth={2.5} />
                  </button>
                </div>
              </div>

              {/* Background gradient flares */}
              <div className="absolute -top-32 -left-32 w-64 h-64 bg-[#000]/3 blur-[120px] rounded-full pointer-events-none" />
              <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-[#000]/3 blur-[120px] rounded-full pointer-events-none" />
            </motion.div>
          </div>
        </React.Fragment>
      )}
    </AnimatePresence>
  );
}
