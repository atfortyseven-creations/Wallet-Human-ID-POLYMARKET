"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function LoadingScreen({ onComplete }: { onComplete: () => void }) {
    const [videoEnded, setVideoEnded] = useState(false);

    // Auto-complete after video duration if onEnded fails (fallback)
    useEffect(() => {
        const timer = setTimeout(() => {
            setVideoEnded(true);
            setTimeout(onComplete, 1000); // Wait for fade out
        }, 8000); // 8 seconds max
        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <AnimatePresence>
            {!videoEnded && (
                <motion.div 
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1 }}
                    className="fixed inset-0 z-[1000] bg-black flex items-center justify-center overflow-hidden"
                >
                    <video 
                        autoPlay 
                        muted 
                        playsInline
                        className="w-full h-full object-cover"
                        onEnded={() => {
                            setVideoEnded(true);
                            onComplete(); 
                        }}
                    >
                        <source src="/Video_Inmersivo_Para_Pantalla_De_Carga.mp4" type="video/mp4" />
                    </video>
                    
                    <div className="absolute inset-x-0 bottom-20 text-center z-20">
                        <motion.h1 
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.5, duration: 1 }}
                            className="text-white text-4xl md:text-6xl font-black tracking-tighter uppercase drop-shadow-2xl mix-blend-overlay"
                        >
                            Human DeFi
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1, duration: 1 }}
                            className="text-white/50 font-mono text-sm mt-2 tracking-widest"
                        >
                            INITIALIZING SOVEREIGN INTELLIGENCE...
                        </motion.p>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
