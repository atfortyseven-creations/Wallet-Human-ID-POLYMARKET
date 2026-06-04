"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * ShortcutVisualizer
 *
 * Pure visual indicator only  shows the Shift+Alt+W key combo on screen
 * when any of those keys are pressed. Does NOT trigger wallet creation.
 *
 * Wallet creation is handled EXCLUSIVELY by the Portfolio page,
 * ensuring the shortcut only fires in the correct context.
 */
export function ShortcutVisualizer() {
    const [keys, setKeys] = useState({
        shift: false,
        alt: false,
        w: false
    });

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const key = e.key.toLowerCase();
            if (e.shiftKey) setKeys(prev => ({ ...prev, shift: true }));
            if (e.altKey) setKeys(prev => ({ ...prev, alt: true }));
            if (key === 'w') setKeys(prev => ({ ...prev, w: true }));
            // NO action triggered here  only the /portfolio page handles the combo.
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            const key = e.key.toLowerCase();
            if (!e.shiftKey) setKeys(prev => ({ ...prev, shift: false }));
            if (!e.altKey) setKeys(prev => ({ ...prev, alt: false }));
            if (key === 'w') setKeys(prev => ({ ...prev, w: false }));
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    const isAnyPressed = keys.shift || keys.alt || keys.w;

    return (
        <AnimatePresence>
            {isAnyPressed && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 10 }}
                    className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[1000] flex items-center gap-4 p-4 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] pointer-events-none"
                >
                    <KeyTile label="SHIFT" active={keys.shift} />
                    <KeyTile label="ALT" active={keys.alt} />
                    <KeyTile label="W" active={keys.w} />
                    
                    <div className="ml-4 pl-4 border-l border-white/10 flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">System Trigger</span>
                        <span className="text-[11px] font-bold text-white tracking-tight">Generate Identity</span>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

function KeyTile({ label, active }: { label: string, active: boolean }) {
    return (
        <motion.div
            animate={{ 
                scale: active ? 0.95 : 1,
                backgroundColor: active ? 'rgba(255, 255, 255, 1)' : 'rgba(255, 255, 255, 0.05)',
                color: active ? '#000' : 'rgba(255, 255, 255, 0.4)'
            }}
            className={`w-14 h-14 flex items-center justify-center rounded-2xl border border-white/10 font-black text-[10px] tracking-widest transition-colors duration-200`}
        >
            {label}
        </motion.div>
    );
}
