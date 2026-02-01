"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Lock, Unlock, MessageCircle, TrendingUp, DollarSign, Crown, ArrowRight, ShieldCheck } from 'lucide-react';

interface Group {
    id: string;
    name: string;
    leader: string;
    leaderAvatar: string;
    members: number;
    monthlyReturn: string;
    entryRequirement: string;
    isLocked: boolean;
}

const GROUPS: Group[] = [
    {
        id: '1',
        name: "Alpha Seekers DAO",
        leader: "0xWhale...88",
        leaderAvatar: "bg-blue-600",
        members: 428,
        monthlyReturn: "+145%",
        entryRequirement: "Hold 1000 HUMAN",
        isLocked: false
    },
    {
        id: '2',
        name: "Insiders Circle",
        leader: "0xElon...99",
        leaderAvatar: "bg-purple-600",
        members: 12,
        monthlyReturn: "+850%",
        entryRequirement: "Hold 1 HUMAN VIP NFT",
        isLocked: true
    },
    {
        id: '3',
        name: "Stable Farmers",
        leader: "0xSafe...22",
        leaderAvatar: "bg-green-600",
        members: 1502,
        monthlyReturn: "+12%",
        entryRequirement: "Open Access",
        isLocked: false
    }
];

export default function WhaleGroups() {
    const [activeGroup, setActiveGroup] = useState<Group | null>(null);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-[#1F1F1F]">Whale Groups</h2>
                    <p className="text-sm text-[#1F1F1F]/60">Token-gated communities. Copy trade the best.</p>
                </div>
                <div className="p-3 bg-white rounded-2xl shadow-sm border border-[#1F1F1F]/5">
                    <Crown className="text-yellow-500" size={24} />
                </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {GROUPS.map((group) => (
                    <motion.div 
                        key={group.id}
                        whileHover={{ y: -5 }}
                        className={`
                            relative overflow-hidden rounded-[32px] p-6 border transition-all cursor-pointer group
                            ${activeGroup?.id === group.id 
                                ? 'bg-[#1F1F1F] text-white border-transparent' 
                                : 'bg-white text-[#1F1F1F] border-[#1F1F1F]/5 hover:shadow-xl'}
                        `}
                        onClick={() => {
                            if (!group.isLocked) setActiveGroup(group);
                            else alert("Access Denied: You need the VIP NFT.");
                        }}
                    >
                        {/* Header */}
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-3">
                                <div className={`w-12 h-12 rounded-full ${group.leaderAvatar} flex items-center justify-center text-white font-bold shadow-lg`}>
                                    {group.leader[2]}
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg leading-tight">{group.name}</h3>
                                    <div className={`text-xs ${activeGroup?.id === group.id ? 'text-white/60' : 'text-[#1F1F1F]/50'}`}>Led by {group.leader}</div>
                                </div>
                            </div>
                            {group.isLocked ? (
                                <div className="bg-red-500/10 text-red-500 p-2 rounded-full">
                                    <Lock size={18} />
                                </div>
                            ) : (
                                <div className="bg-green-500/10 text-green-500 p-2 rounded-full">
                                    <Unlock size={18} />
                                </div>
                            )}
                        </div>

                        {/* Stats */}
                        <div className="space-y-3">
                            <div className={`p-3 rounded-2xl flex justify-between items-center ${activeGroup?.id === group.id ? 'bg-white/10' : 'bg-[#F5F5F0]'}`}>
                                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider opacity-60">
                                    <TrendingUp size={14} />
                                    Return (30d)
                                </div>
                                <div className="font-black text-green-500">{group.monthlyReturn}</div>
                            </div>
                            
                            <div className={`p-3 rounded-2xl flex justify-between items-center ${activeGroup?.id === group.id ? 'bg-white/10' : 'bg-[#F5F5F0]'}`}>
                                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider opacity-60">
                                    <ShieldCheck size={14} />
                                    Requirement
                                </div>
                                <div className="font-bold text-xs">{group.entryRequirement}</div>
                            </div>
                        </div>

                        {/* Hover Effect */}
                        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                    </motion.div>
                ))}
            </div>

            {/* CHAT/FEED AREA */}
            <AnimatePresence mode="wait">
                {activeGroup && (
                    <motion.div
                        key={activeGroup.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-white rounded-[40px] border border-[#1F1F1F]/5 overflow-hidden shadow-2xl mt-8 min-h-[500px] flex flex-col md:flex-row"
                    >
                        {/* Feed Side */}
                        <div className="flex-1 p-0 flex flex-col">
                            {/* Chat Header */}
                            <div className="p-6 border-b border-[#1F1F1F]/5 flex justify-between items-center bg-[#F5F5F0]/50 backdrop-blur-md sticky top-0 z-10">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                    <h3 className="font-bold text-[#1F1F1F]">Live Signals</h3>
                                </div>
                                <div className="text-xs font-bold text-[#1F1F1F]/40">{activeGroup.members} Members Online</div>
                            </div>

                            {/* Chat Messages */}
                            <div className="flex-1 p-6 space-y-6 bg-[#F5F5F0]/30 overflow-y-auto max-h-[500px]">
                                {/* Signal Message */}
                                <div className="flex gap-4">
                                    <div className={`w-10 h-10 rounded-full ${activeGroup.leaderAvatar} flex-shrink-0 flex items-center justify-center text-white text-xs font-bold shadow-md`}>
                                        LDR
                                    </div>
                                    <div className="space-y-2 max-w-[80%]">
                                        <div className="flex items-baseline gap-2">
                                            <span className="font-bold text-sm text-[#1F1F1F]">{activeGroup.leader}</span>
                                            <span className="text-[10px] text-[#1F1F1F]/40">Just now</span>
                                        </div>
                                        <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-[#1F1F1F]/5 text-sm text-[#1F1F1F] leading-relaxed relative overflow-hidden">
                                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500" />
                                            <p className="font-bold mb-2 text-green-600 flex items-center gap-2">
                                                <Zap className="fill-current" size={14} />
                                                BUY SIGNAL DETECTED
                                            </p>
                                            <p>Accumulating $PEPE heavily here. Breakout imminent. Target: +40%.</p>
                                            
                                            {/* COPY TRADE ACTION */}
                                            <div className="mt-4 pt-4 border-t border-[#1F1F1F]/5">
                                                <button className="w-full py-3 bg-[#1F1F1F] text-white rounded-xl font-bold text-sm shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2">
                                                    <DollarSign size={14} />
                                                    Copy Trade (Buy PEPE)
                                                </button>
                                                <div className="text-center mt-2 text-[10px] text-[#1F1F1F]/40">
                                                    Your available USDC: $2,450.00
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* User Message */}
                                <div className="flex gap-4 flex-row-reverse">
                                    <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center text-gray-500 text-xs font-bold">
                                        YOU
                                    </div>
                                    <div className="space-y-1 max-w-[70%] text-right">
                                        <div className="bg-blue-600 text-white p-3 rounded-2xl rounded-tr-none shadow-sm text-sm">
                                            Just bought in! 🚀
                                        </div>
                                        <span className="text-[10px] text-[#1F1F1F]/30">Sent</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity Sidebar */}
                        <div className="w-full md:w-80 border-l border-[#1F1F1F]/5 bg-white p-6 hidden md:block">
                            <h4 className="text-xs font-bold text-[#1F1F1F]/40 uppercase tracking-widest mb-6">Recent Copiers</h4>
                            <div className="space-y-4">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <div key={i} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-[#F5F5F0] flex items-center justify-center text-[10px] font-bold">
                                                0x{i}
                                            </div>
                                            <div className="text-xs font-medium">Copied <span className="font-bold">PEPE</span></div>
                                        </div>
                                        <div className="text-xs font-bold text-green-500">+$250</div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8 p-4 bg-purple-50 rounded-2xl border border-purple-100">
                                <h5 className="font-bold text-purple-900 text-sm mb-1">Performance Fee</h5>
                                <p className="text-xs text-purple-700/80 leading-relaxed">
                                    You pay 10% of profits only if the trade is successful. No management fees.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function Zap({ className, size, fill }: { className?: string, size?: number, fill?: string }) {
    return (
        <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width={size} 
            height={size} 
            viewBox="0 0 24 24" 
            fill={fill || "none"} 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className={className}
        >
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
        </svg>
    )
}
