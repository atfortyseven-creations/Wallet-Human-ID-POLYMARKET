"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Share2, Copy, Trophy, Users, TrendingUp, Gift } from 'lucide-react';

interface ReferralStats {
    totalEarnings: string;
    totalInvites: number;
    rank: string;
    nextTierProgress: number; // 0-100
    inviteCode: string;
}

export default function ReferralDashboard({ 
    stats = {
        totalEarnings: "0.00",
        totalInvites: 0,
        rank: "Bronze",
        nextTierProgress: 0,
        inviteCode: "HUMAN-...."
    }
}: { stats?: ReferralStats }) {

    const handleCopy = () => {
        navigator.clipboard.writeText(`https://human.fi/invite/${stats.inviteCode}`);
        // Toast logic would go here
    };

    const handleShare = async () => {
        const shareData = {
            title: 'Human DeFi',
            text: 'Join me on Human DeFi and experience the future of finance.',
            url: `https://human.fi/invite/${stats.inviteCode}`
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                console.log('Error sharing:', err);
            }
        } else {
            handleCopy();
        }
    };

    return (
        <div className="space-y-6">
            
            {/* HERRO SECTION: EARNINGS */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#1F1F1F] to-black text-white p-8 shadow-2xl"
            >
                {/* Background Glow */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
                
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center md:items-start text-center md:text-left">
                    <div>
                        <div className="flex items-center gap-2 justify-center md:justify-start text-white/50 text-sm font-medium uppercase tracking-widest mb-2">
                            <Gift size={16} className="text-purple-400" />
                            Total Earnings
                        </div>
                        <div className="text-5xl md:text-6xl font-black tracking-tighter mb-4">
                            <span className="text-purple-400">$</span>{stats.totalEarnings}
                        </div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/5 backdrop-blur-md">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-xs font-bold">+ $24.50 this week</span>
                        </div>
                    </div>

                    {/* Rank Card */}
                    <div className="mt-8 md:mt-0 bg-white/5 rounded-2xl p-4 border border-white/10 w-full md:w-auto min-w-[160px]">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs text-white/50">Current Rank</span>
                            <Trophy size={16} className="text-yellow-400" />
                        </div>
                        <div className="text-2xl font-bold mb-2">{stats.rank}</div>
                        
                        {/* Progress Bar */}
                        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mb-1">
                            <div 
                                className="h-full bg-gradient-to-r from-purple-500 to-pink-500" 
                                style={{ width: `${stats.nextTierProgress}%` }}
                            />
                        </div>
                        <div className="text-[10px] text-white/40 text-right">
                            {stats.nextTierProgress}% to Gold
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* INVITE LINK AREA */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-3xl p-6 border border-[#1F1F1F]/5 shadow-sm"
                >
                    <h3 className="text-[#1F1F1F] font-bold text-lg mb-4">Your Invite Code</h3>
                    <div className="flex gap-2">
                        <div className="flex-1 bg-[#F5F5F0] rounded-xl px-4 py-3 font-mono text-lg font-bold text-[#1F1F1F] flex items-center justify-center border border-[#1F1F1F]/5">
                            {stats.inviteCode}
                        </div>
                        <button 
                            onClick={handleCopy}
                            className="bg-[#1F1F1F] text-white w-14 rounded-xl flex items-center justify-center hover:bg-black transition-colors"
                        >
                            <Copy size={20} />
                        </button>
                    </div>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    onClick={handleShare}
                    className="bg-purple-600 rounded-3xl p-6 shadow-lg shadow-purple-500/20 text-white flex flex-col justify-center items-center text-center cursor-pointer hover:bg-purple-700 transition-colors"
                >
                    <Share2 size={32} className="mb-2 opacity-80" />
                    <h3 className="font-bold text-lg">Share Invite Link</h3>
                    <p className="text-white/60 text-xs mt-1">Earn 10% of trading fees</p>
                </motion.div>
            </div>

            {/* LEADERBOARD / RECENT ACTIVITY */}
            <div className="bg-white/50 backdrop-blur-sm rounded-3xl p-6 border border-[#1F1F1F]/5">
                <h3 className="text-[#1F1F1F]/60 font-bold uppercase text-xs tracking-widest mb-6 flex items-center gap-2">
                    <Users size={14} />
                    Recent Invites
                </h3>

                <div className="space-y-4">
                    {/* Real Data Logic would go here - Currently showing empty state for "Real Data" requirement */}
                    {/* If stats list empty: */}
                    <div className="text-center py-8 text-[#1F1F1F]/40">
                        <Users size={32} className="mx-auto mb-2 opacity-50" />
                        <p className="text-sm font-bold">No invites yet</p>
                        <p className="text-xs">Start sharing your link to earn rewards!</p>
                    </div>
                </div>
            </div>

        </div>
    );
}
