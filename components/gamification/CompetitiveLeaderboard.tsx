"use client";

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, TrendingUp, Flame, Medal, Crown, Star } from 'lucide-react';

interface LeaderboardEntry {
  userId: string;
  username: string;
  rank: number;
  value: number;
  isCurrentUser?: boolean;
}

type LeaderboardMetric = 'PROFIT' | 'WIN_RATE' | 'STREAK';

export default function CompetitiveLeaderboard({ currentUserId }: { currentUserId: string }) {
  const [metric, setMetric] = useState<LeaderboardMetric>('PROFIT');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<LeaderboardEntry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();

    // Real-time updates every 5 minutes
    const interval = setInterval(fetchLeaderboard, 300000);
    return () => clearInterval(interval);
  }, [metric]);

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch(`/api/gamification/leaderboard?metric=${metric}`);
      const data = await response.json();
      
      setLeaderboard(data.leaderboard || []);
      setUserRank(data.userRank);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="text-yellow-500" size={24} />;
    if (rank === 2) return <Medal className="text-gray-400" size={24} />;
    if (rank === 3) return <Medal className="text-orange-600" size={24} />;
    return <span className="text-lg font-black text-[#1F1F1F]/50">#{rank}</span>;
  };

  const formatValue = (value: number) => {
    switch (metric) {
      case 'PROFIT':
        return `$${value.toLocaleString()}`;
      case 'WIN_RATE':
        return `${value.toFixed(1)}%`;
      case 'STREAK':
        return `${value} days`;
      default:
        return value.toString();
    }
  };

  const getMetricIcon = (metric: LeaderboardMetric) => {
    switch (metric) {
      case 'PROFIT': return <TrendingUp size={20} />;
      case 'WIN_RATE': return <Trophy size={20} />;
      case 'STREAK': return <Flame size={20} />;
    }
  };

  return (
    <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-[#1F1F1F]/10">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-black text-[#1F1F1F] flex items-center gap-2">
          <Trophy className="text-yellow-500" />
          Leaderboard
          <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse">
            LIVE
          </span>
        </h2>
      </div>

      {/* Metric Selector */}
      <div className="flex gap-2 mb-6 bg-[#1F1F1F]/5 p-2 rounded-xl">
        {(['PROFIT', 'WIN_RATE', 'STREAK'] as LeaderboardMetric[]).map((m) => (
          <button
            key={m}
            onClick={() => setMetric(m)}
            className={`flex-1 py-2 px-4 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${
              metric === m
                ? 'bg-[#1F1F1F] text-white shadow-lg'
                : 'text-[#1F1F1F]/70 hover:bg-white/80'
            }`}
          >
            {getMetricIcon(m)}
            <span className="hidden md:inline">
              {m === 'WIN_RATE' ? 'Win Rate' : m.charAt(0) + m.slice(1).toLowerCase()}
            </span>
          </button>
        ))}
      </div>

      {/* Leaderboard List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent" />
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {leaderboard.map((entry, index) => (
              <motion.div
                key={entry.userId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
                  entry.userId === currentUserId
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg scale-105'
                    : entry.rank <= 3
                    ? 'bg-gradient-to-r from-yellow-100 to-yellow-50 border border-yellow-200'
                    : 'bg-white/50 hover:bg-white/80'
                }`}
              >
                {/* Rank */}
                <div className="w-12 flex items-center justify-center">
                  {getRankIcon(entry.rank)}
                </div>

                {/* Username */}
                <div className="flex-1">
                  <div className={`font-black ${entry.userId === currentUserId ? 'text-white' : 'text-[#1F1F1F]'}`}>
                    {entry.username}
                    {entry.userId === currentUserId && (
                      <span className="ml-2 text-xs font-normal opacity-75">(You)</span>
                    )}
                  </div>
                </div>

                {/* Value */}
                <div className={`text-right ${entry.userId === currentUserId ? 'text-white' : 'text-[#1F1F1F]'}`}>
                  <div className="font-black text-lg">
                    {formatValue(entry.value)}
                  </div>
                </div>

                {/* Trophy for top 3 */}
                {entry.rank <= 3 && (
                  <motion.div
                    animate={{ rotate: [0, -10, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  >
                    <Star className="text-yellow-500 fill-current" size={20} />
                  </motion.div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* User Rank (if not in top 10) */}
      {userRank && userRank.rank > 10 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 pt-6 border-t border-[#1F1F1F]/10"
        >
          <div className="text-sm font-bold text-[#1F1F1F]/70 mb-2 uppercase">
            Your Rank
          </div>
          <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl">
            <div className="text-2xl font-black">#{userRank.rank}</div>
            <div className="flex-1 font-bold">{userRank.username}</div>
            <div className="text-lg font-black">{formatValue(userRank.value)}</div>
          </div>
        </motion.div>
      )}

      {/* Competitive Messaging */}
      <div className="mt-6 p-4 bg-gradient-to-r from-orange-100 to-yellow-100 rounded-xl border border-orange-200">
        <div className="text-sm font-bold text-[#1F1F1F] mb-1">
          🔥 Compete & Earn!
        </div>
        <div className="text-xs text-[#1F1F1F]/70">
          Top 3 traders each month win exclusive NFT badges and bonus XP!
        </div>
      </div>
    </div>
  );
}
