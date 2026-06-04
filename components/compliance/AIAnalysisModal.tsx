'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BrainCircuit, CheckCircle2, AlertTriangle } from 'lucide-react';

interface AIAnalysisProps {
    textToAnalyze: string;
}

export const AIAnalysisModal = ({ textToAnalyze }: AIAnalysisProps) => {
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState<'BULLISH' | 'BEARISH' | 'NEUTRAL' | null>(null);
    const [justification, setJustification] = useState<string | null>(null);

    const runSimulation = async () => {
        setAnalyzing(true);
        setResult(null);
        setJustification(null);

        try {
            const res = await fetch('/api/ai/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: textToAnalyze })
            });
            const data = await res.json();
            setResult(data.sentiment);
            setJustification(data.justification);
        } catch (e) {
            console.error("AI Analysis failed", e);
            setResult('NEUTRAL');
        } finally {
            setAnalyzing(false);
        }
    };

    return (
        <div className="mt-4">
            {!analyzing && !result && (
                <button
                    onClick={runSimulation}
                    className="flex items-center gap-2 text-xs font-mono text-[#00f2ea] hover:underline"
                >
                    <BrainCircuit size={14} /> RUN SENTIMENT ANALYSIS
                </button>
            )}

            {analyzing && (
                <div className="flex items-center gap-2 text-xs font-mono text-[#888899] animate-pulse">
                    <BrainCircuit size={14} className="animate-spin" />
                    PROCESSING MARKET DATA...
                </div>
            )}

            {result && (
                <div className="space-y-2">
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`inline-flex items-center gap-2 px-3 py-1 rounded border text-xs font-bold ${result === 'BULLISH'
                                ? 'bg-[#00ff9d]/10 border-[#00ff9d] text-[#00ff9d]'
                                : result === 'BEARISH'
                                ? 'bg-red-500/10 border-red-500 text-red-500'
                                : 'bg-gray-500/10 border-gray-500 text-gray-500'
                            }`}
                    >
                        {result === 'BULLISH' ? <CheckCircle2 size={12} /> : result === 'BEARISH' ? <AlertTriangle size={12} /> : null}
                        VERDICT: {result}
                    </motion.div>
                    {justification && (
                        <motion.p 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-[10px] font-mono text-white/40 italic leading-relaxed"
                        >
                            {justification}
                        </motion.p>
                    )}
                </div>
            )}
        </div>
    );
};

