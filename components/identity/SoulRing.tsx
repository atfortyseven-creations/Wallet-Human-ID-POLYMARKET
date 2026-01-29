'use client';

import { motion } from 'framer-motion';
import { useHumanScore } from '@/hooks/useHumanScore';
import { Sparkles, Trophy, Shield, Clock, Activity, Zap } from 'lucide-react';

export function SoulRing({ children }: { children: React.ReactNode }) {
    const { totalScore, rank, breakdown, isLoading } = useHumanScore();

    // Color Logic based on Rank/Score
    const getColors = () => {
        if (totalScore >= 80) return { ring: '#ef4444', glow: '#ef4444', text: 'text-red-500' }; // Titan (Red)
        if (totalScore >= 60) return { ring: '#facc15', glow: '#facc15', text: 'text-yellow-400' }; // Whale (Gold)
        if (totalScore >= 40) return { ring: '#00f2ea', glow: '#00f2ea', text: 'text-cyan-400' }; // Veteran (Cyan)
        return { ring: '#52525b', glow: '#52525b', text: 'text-zinc-500' }; // Novice (Gray)
    };

    const colors = getColors();
    const radius = 28;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (totalScore / 100) * circumference;

    return (
        <div className="relative group cursor-help">
            {/* --- RING SVG --- */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[68px] h-[68px] pointer-events-none z-10">
                <svg className="w-full h-full -rotate-90">
                    {/* Background Ring */}
                    <circle
                        cx="34" cy="34" r={radius}
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth="3"
                        fill="transparent"
                    />
                    {/* Progress Ring */}
                    {!isLoading && (
                        <motion.circle
                            initial={{ strokeDashoffset: circumference }}
                            animate={{ strokeDashoffset }}
                            transition={{ duration: 2, ease: "easeOut" }}
                            cx="34" cy="34" r={radius}
                            stroke={colors.ring}
                            strokeWidth="3"
                            fill="transparent"
                            strokeDasharray={circumference}
                            strokeLinecap="round"
                            className="drop-shadow-[0_0_4px_rgba(0,0,0,0.5)]"
                        />
                    )}
                </svg>
            </div>

            {/* --- AVATAR CONTAINER --- */}
            <div className="relative z-0">
                {children}
            </div>

            {/* --- LEVEL BADGE (Bottom Right) --- */}
            {!isLoading && (
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 1.5, type: 'spring' }}
                    className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#0D0D12] border border-white/10 flex items-center justify-center text-[10px] font-bold ${colors.text} shadow-lg z-20`}
                >
                    {totalScore}
                </motion.div>
            )}

            {/* --- HOVER TOOLTIP (The Soul Card) --- */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all duration-300 translate-y-2 group-hover:translate-y-0 z-50 w-64">
                <div className="bg-[#0D0D12]/95 backdrop-blur-xl border border-white/10 rounded-xl p-4 shadow-2xl relative overflow-hidden">
                    {/* Background Glow */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
                    <div className={`absolute top-0 left-0 w-full h-1 bg-[${colors.glow}] shadow-[0_0_10px_${colors.glow}]`} />

                    {/* Header */}
                    <div className="flex justify-between items-start mb-3 relative z-10">
                        <div>
                            <h4 className={`text-sm font-bold ${colors.text} tracking-wider flex items-center gap-2`}>
                                {rank.toUpperCase()}
                                <Sparkles size={12} className="animate-pulse" />
                            </h4>
                            <p className="text-[10px] text-zinc-500 font-mono">SOULBOUND SCORE</p>
                        </div>
                        <div className="text-2xl font-bold text-white">{totalScore}</div>
                    </div>

                    {/* Config Stats */}
                    <div className="space-y-2 relative z-10">
                        <StatRow icon={Clock} label="Account Age" value={breakdown.age} max={30} color={colors.text} />
                        <StatRow icon={Activity} label="Activity" value={breakdown.activity} max={20} color={colors.text} />
                        <StatRow icon={Zap} label="Blue Chip" value={breakdown.blueChip} max={20} color={colors.text} />
                        <StatRow icon={Trophy} label="Identity" value={breakdown.identity + breakdown.ens} max={30} color={colors.text} />
                    </div>

                    {/* Footer */}
                    <div className="mt-3 pt-3 border-t border-white/10 text-[10px] text-zinc-600 text-center font-mono">
                        ID: {isLoading ? 'CALCULATING...' : 'VERIFIED'}
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatRow({ icon: Icon, label, value, max, color }: any) {
    return (
        <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-zinc-400">
                <Icon size={12} />
                <span>{label}</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="w-16 h-1 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${(value / max) * 100}%` }}
                        className={`h-full ${color.replace('text-', 'bg-')}`}
                    />
                </div>
                <span className="text-white font-mono w-4 text-right">{value}</span>
            </div>
        </div>
    );
}
