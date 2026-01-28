import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, ShieldCheck, Activity, Siren } from 'lucide-react';
import { cn } from '@/lib/utils'; // Assuming standard utils

type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

interface RiskBadgeProps {
    level: RiskLevel;
    confidenceScore?: number;
    className?: string;
}

const RISK_CONFIG = {
    LOW: {
        color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
        icon: ShieldCheck,
        label: 'SECURE',
        pulse: false
    },
    MEDIUM: {
        color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
        icon: Activity,
        label: 'WATCH',
        pulse: false
    },
    HIGH: {
        color: 'bg-orange-600/20 text-orange-400 border-orange-500/40',
        icon: AlertTriangle,
        label: 'WARNING',
        pulse: true
    },
    CRITICAL: {
        color: 'bg-red-600/30 text-red-400 border-red-500/50',
        icon: Siren,
        label: 'HALTED',
        pulse: true
    }
};

export function RiskBadge({ level, confidenceScore, className }: RiskBadgeProps) {
    const config = RISK_CONFIG[level] || RISK_CONFIG.LOW;
    const Icon = config.icon;

    return (
        <div className={cn("relative inline-flex items-center gap-2", className)}>
            {/* Dynamic Glow Background for High Risk */}
            {config.pulse && (
                <motion.div
                    animate={{ opacity: [0.2, 0.6, 0.2] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className={cn("absolute inset-0 rounded-full blur-xl", config.color.split(' ')[0])}
                />
            )}

            {/* Glass Badge */}
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={cn(
                    "relative flex items-center gap-2 px-3 py-1 rounded-full border backdrop-blur-md shadow-sm transition-all",
                    config.color
                )}
            >
                <Icon className="w-4 h-4" />
                <span className="text-xs font-bold tracking-wider">{config.label}</span>

                {confidenceScore !== undefined && (
                    <div className="flex items-center gap-1 pl-2 border-l border-white/10 opacity-80">
                        <span className="text-[10px] uppercase text-white/60">AI CONF</span>
                        <span className="text-xs font-mono">{confidenceScore}%</span>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
