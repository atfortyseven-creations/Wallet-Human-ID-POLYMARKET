"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Target, Zap, Waves, Box, Terminal as TerminalIcon } from 'lucide-react';
import { ForensicAnalysis } from '@/lib/services/ai-types';

interface ForensicTerminalProps {
    analysis: ForensicAnalysis;
    address: string;
}

export function ForensicTerminal({ analysis, address }: ForensicTerminalProps) {
    const [displayedSummary, setDisplayedSummary] = useState('');
    const [isThinking, setIsThinking] = useState(true);

    useEffect(() => {
        setIsThinking(true);
        setDisplayedSummary('');
        
        const timeout = setTimeout(() => {
            setIsThinking(false);
            let i = 0;
            const interval = setInterval(() => {
                setDisplayedSummary(analysis.summary.slice(0, i));
                i++;
                if (i > analysis.summary.length) clearInterval(interval);
            }, 30);
            return () => clearInterval(interval);
        }, 1500);

        return () => clearTimeout(timeout);
    }, [analysis]);

    return (
        <div className="w-full relative py-8">
            <div className="max-w-4xl mx-auto px-6">
                <div className="min-h-[60px] border-l border-slate-200 pl-8">
                    <p className="text-xl md:text-2xl font-medium leading-relaxed text-slate-900 tracking-tight italic">
                        {isThinking ? (
                            <motion.span
                                animate={{ opacity: [1, 0.4, 1] }}
                                transition={{ duration: 1, repeat: Infinity }}
                                className="text-slate-200"
                            >
                                Deciphering Sequence DNA
                            </motion.span>
                        ) : (
                            displayedSummary
                        )}
                        {!isThinking && displayedSummary.length < analysis.summary.length && (
                            <motion.span animate={{ opacity: [1, 0, 1] }} transition={{ duration: 0.8, repeat: Infinity }} className="inline-block w-2 h-5 bg-slate-900 ml-2" />
                        )}
                    </p>
                </div>
            </div>
        </div>
    );
}
