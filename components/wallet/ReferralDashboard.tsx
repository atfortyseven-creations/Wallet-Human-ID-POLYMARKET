"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Share2, Copy, Trophy, Users, TrendingUp, Gift, Loader2 } from 'lucide-react';
import { useAccount } from 'wagmi';
import useSWR from 'swr';
import { toast } from 'sonner';

interface ReferralStats {
    totalEarnings: string;
    weeklyEarnings: string;
    totalInvites: number;
    rank: string;
    nextTierProgress: number;
    inviteCode: string;
}

interface RecentInvite {
    id: string;
    walletAddress: string;
    earnings: string;
    status: string;
    createdAt: string;
}

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function ReferralDashboard() {
    const { address, isConnected } = useAccount();
    
    // Fetch real referral data from API
    const { data, error, isLoading } = useSWR(
        address ? `/api/referral/stats?address=${address}` : null,
        fetcher,
        { refreshInterval: 30000 } // Refresh every 30 seconds
    );

    const stats: ReferralStats = data?.stats || {
        totalEarnings: "0.00",
        weeklyEarnings: "0.00",
        totalInvites: 0,
        rank: "Bronze",
        nextTierProgress: 0,
        inviteCode: "HUMAN-XXXX"
    };

    const recentInvites: RecentInvite[] = data?.recentInvites || [];

    const handleCopy = () => {
        navigator.clipboard.writeText(`https://humandefi.pro/invite/${stats.inviteCode}`);
        toast.success('Invite link copied to clipboard!');
    };

    const handleShare = async () => {
        const shareData = {
            title: 'Whale Alert Network',
            text: 'Join me on Whale Alert Network and experience the future of decentralized analytics.',
            url: `https://humandefi.pro/invite/${stats.inviteCode}`
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

    // Show loading state
    if (!isConnected) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <p className="text-[#1F1F1F]/60">Connect your wallet to view referral stats</p>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-purple-500 mb-2" />
                <p className="text-[#1F1F1F]/60">Loading referral data...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <p className="text-red-500">Error loading referral data</p>
                <p className="text-xs text-[#1F1F1F]/40">{error.message}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            
            {/* HERO SECTION: EARNINGS */}
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
                        {parseFloat(stats.weeklyEarnings) > 0 && (
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/5 backdrop-blur-md">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-xs font-bold">+ ${stats.weeklyEarnings} this week</span>
                            </div>
                        )}
                        {parseFloat(stats.totalEarnings) === 0 && (
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/5 backdrop-blur-md">
                                <TrendingUp size={12} className="text-gray-400" />
                                <span className="text-xs font-bold text-white/60">Start inviting to earn!</span>
                            </div>
                        )}
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
                                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500" 
                                style={{ width: `${stats.nextTierProgress}%` }}
                            />
                        </div>
                        <div className="text-[10px] text-white/40 text-right">
                            {stats.nextTierProgress}% to next tier
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

            {/* RECENT INVITES */}
            <div className="bg-white/50 backdrop-blur-sm rounded-3xl p-6 border border-[#1F1F1F]/5">
                <h3 className="text-[#1F1F1F]/60 font-bold uppercase text-xs tracking-widest mb-6 flex items-center gap-2">
                    <Users size={14} />
                    Recent Invites ({stats.totalInvites})
                </h3>

                <div className="space-y-4">
                    {recentInvites.length === 0 ? (
                        <div className="text-center py-8 text-[#1F1F1F]/40">
                            <Users size={32} className="mx-auto mb-2 opacity-50" />
                            <p className="text-sm font-bold">No invites yet</p>
                            <p className="text-xs">Start sharing your link to earn rewards!</p>
                        </div>
                    ) : (
                        recentInvites.map((invite) => (
                            <div 
                                key={invite.id}
                                className="flex items-center justify-between p-4 bg-white rounded-2xl border border-[#1F1F1F]/5"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                                        <Users size={18} className="text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="font-mono text-sm font-bold text-[#1F1F1F]">
                                            {invite.walletAddress.slice(0, 6)}...{invite.walletAddress.slice(-4)}
                                        </p>
                                        <p className="text-xs text-[#1F1F1F]/40">
                                            {new Date(invite.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-green-600">
                                        +${invite.earnings}
                                    </p>
                                    <p className="text-xs text-[#1F1F1F]/40 capitalize">
                                        {invite.status.toLowerCase()}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

        </div>
    );
}


