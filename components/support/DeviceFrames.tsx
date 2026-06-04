import React from 'react';
import { motion } from 'framer-motion';

export const CSSiPhoneFrame = () => {
    return (
        <div className="relative mx-auto w-[320px] h-[650px] bg-black rounded-[3rem] border-[14px] border-slate-950 shadow-2xl overflow-hidden flex flex-col font-sans">
            {/* Dynamic Island / Notch */}
            <div className="absolute top-0 inset-x-0 h-7 w-32 bg-slate-950 mx-auto rounded-b-3xl z-30 flex justify-between items-center px-4">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500/50" />
                <div className="w-2 h-2 rounded-full bg-slate-800" />
            </div>
            
            {/* Real Screenshot Content */}
            <div className="flex-1 w-full h-full relative overflow-hidden bg-[var(--aztec-ink)]">
                <img 
                    src="/support/iphone_dashboard.png" 
                    alt="iPhone Terminal" 
                    className="w-full h-full object-cover p-2 rounded-[2.5rem]"
                />
            </div>

            {/* Simulated Bottom Indicator */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/20 rounded-full" />
        </div>
    );
};

export const CSSMacbookFrame = () => {
    return (
        <div className="relative mx-auto w-full max-w-4xl font-sans perspective-1000 mt-10">
            {/* Screen Assembly */}
            <motion.div 
                initial={{ rotateX: 10 }}
                whileInView={{ rotateX: 0 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                style={{ transformStyle: 'preserve-3d', transformOrigin: "bottom" }}
                className="relative z-20"
            >
                {/* Thin Bezel Screen */}
                <div className="aspect-[16/10] bg-slate-950 rounded-t-3xl border-[12px] border-slate-950 shadow-2xl overflow-hidden relative flex flex-col">
                    {/* Webcam notch */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-950 rounded-b-xl z-30 flex justify-center items-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                        <div className="w-1 h-1 rounded-full bg-indigo-500/30 ml-2" />
                    </div>
                    
                    {/* Browser UI + Screenshot */}
                    <div className="h-6 w-full bg-slate-900/50 flex items-center px-4 gap-4 z-20 text-[10px] text-slate-400 font-bold border-b border-slate-800">
                        <div className="flex gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                            <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                        </div>
                    </div>

                    <div className="flex-1 bg-[var(--aztec-ink)] overflow-hidden relative">
                        <img 
                            src="/support/macbook_dashboard.png" 
                            alt="Macbook Terminal" 
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>
            </motion.div>

            {/* Keyboard Deck & Trackpad */}
            <div className="relative z-10 w-[110%] -ml-[5%] perspective-deck">
                <div className="h-6 bg-gradient-to-b from-slate-200 to-slate-400 rounded-b-2xl shadow-2xl relative flex flex-col items-center">
                    <div className="w-[80%] h-2 bg-slate-300 rounded-b-md mx-auto" />
                    {/* Trackpad Hint */}
                     <div className="w-24 h-1 absolute bottom-1 bg-slate-400/30 rounded-full" />
                </div>
                {/* Lip Shadow */}
                <div className="absolute -bottom-10 inset-x-10 h-10 bg-black/20 blur-2xl rounded-full" />
            </div>

            <style dangerouslySetInnerHTML={{__html: `
                .perspective-deck {
                    transform: perspective(600px) rotateX(15deg) translateY(-5px);
                    transform-origin: top;
                }
            `}} />
        </div>
    );
};
