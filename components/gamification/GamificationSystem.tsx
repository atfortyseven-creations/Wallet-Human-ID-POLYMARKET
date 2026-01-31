"use client";

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, TrendingUp, Zap, Target, Award, Crown, Star, Flame, Medal } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Achievement {
  id: string;
  type: string;
  tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'DIAMOND';
  unlockedAt: Date;
  metadata?: any;
}

interface UserStats {
  totalProfitUSD: number;
  copyTradeWinRate: number;
  currentStreak: number;
  longestStreak: number;
  experiencePoints: number;
  level: number;
  totalCopyTrades: number;
  totalAlerts: number;
}

export default function GamificationSystem({ userId }: { userId: string }) {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [showAchievement, setShowAchievement] = useState<Achievement | null>(null);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    fetchStats();
    fetchAchievements();
    
    // Listen for real-time achievements
    if (typeof window !== 'undefined') {
      const handleNewAchievement = (event: CustomEvent) => {
        const newAchievements = event.detail;
        newAchievements.forEach((ach: Achievement) => {
          showAchievementPopup(ach);
        });
        fetchAchievements();
      };

      window.addEventListener('achievement-unlocked', handleNewAchievement as EventListener);
      return () => {
        window.removeEventListener('achievement-unlocked', handleNewAchievement as EventListener);
      };
    }
  }, [userId]);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/gamification/stats');
      const data = await response.json();
      setStats(data.stats);
      setStreak(data.stats.currentStreak);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const fetchAchievements = async () => {
    try {
      const response = await fetch('/api/gamification/achievements');
      const data = await response.json();
      setAchievements(data.achievements);
    } catch (error) {
      console.error('Failed to fetch achievements:', error);
    }
  };

  const showAchievementPopup = (achievement: Achievement) => {
    setShowAchievement(achievement);
    
    // Confetti celebration!
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: getTierColors(achievement.tier),
    });

    // Play sound (optional)
    if (typeof Audio !== 'undefined') {
      const audio = new Audio('/sounds/achievement.mp3');
      audio.volume = 0.5;
      audio.play().catch(() => {});
    }

    setTimeout(() => setShowAchievement(null), 5000);
  };

  const getTierColors = (tier: string) => {
    switch (tier) {
      case 'BRONZE': return ['#CD7F32', '#A0522D'];
      case 'SILVER': return ['#C0C0C0', '#808080'];
      case 'GOLD': return ['#FFD700', '#FFA500'];
      case 'DIAMOND': return ['#B9F2FF', '#00CED1'];
      default: return ['#FFD700'];
    }
  };

  const getTierGradient = (tier: string) => {
    switch (tier) {
      case 'BRONZE': return 'from-orange-600 to-orange-400';
      case 'SILVER': return 'from-gray-400 to-gray-200';
      case 'GOLD': return 'from-yellow-500 to-yellow-300';
      case 'DIAMOND': return 'from-cyan-400 to-blue-400';
      default: return 'from-purple-600 to-pink-600';
    }
  };

  const calculateProgress = () => {
    if (!stats) return 0;
    const xpForNextLevel = stats.level * 1000;
    const xpInCurrentLevel = stats.experiencePoints % 1000;
    return (xpInCurrentLevel / xpForNextLevel) * 100;
  };

  if (!stats) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Achievement Popup */}
      <AnimatePresence>
        {showAchievement && (
          <motion.div
            initial={{ y: -100, opacity: 0, scale: 0.8 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -100, opacity: 0, scale: 0.8 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50"
          >
            <div className={`bg-gradient-to-r ${getTierGradient(showAchievement.tier)} p-1 rounded-2xl shadow-2xl`}>
              <div className="bg-[#EAEADF] rounded-2xl p-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                    <Trophy size={32} className="text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-[#1F1F1F]/70 uppercase">
                      Achievement Unlocked!
                    </div>
                    <div className="text-xl font-black text-[#1F1F1F]">
                      {getAchievementTitle(showAchievement)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Level & XP Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-purple-600 to-pink-600 p-1 rounded-2xl"
      >
        <div className="bg-[#EAEADF] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm font-bold text-[#1F1F1F]/70 uppercase mb-1">
                Your Level
              </div>
              <div className="text-4xl font-black text-[#1F1F1F] flex items-center gap-2">
                <Crown className="text-yellow-500" size={32} />
                Level {stats.level}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-[#1F1F1F]/70">
                {stats.experiencePoints} XP
              </div>
              <div className="text-xs text-[#1F1F1F]/60">
                {stats.level * 1000 - (stats.experiencePoints % 1000)} to next level
              </div>
            </div>
          </div>

          {/* XP Progress Bar */}
          <div className="h-4 bg-[#1F1F1]/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${calculateProgress()}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-purple-600 to-pink-600"
            />
          </div>
        </div>
      </motion.div>

      {/* Streak Card */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-[#1F1F1F]/10"
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-bold text-[#1F1F1F]/70 uppercase mb-2">
              Daily Streak
            </div>
            <div className="flex items-center gap-2">
              <Flame className="text-orange-500" size={40} />
              <span className="text-4xl font-black text-[#1F1F1F]">
                {stats.currentStreak}
              </span>
              <span className="text-xl font-bold text-[#1F1F1F]/70">days</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-[#1F1F1F]/60 mb-1">Best Streak</div>
            <div className="text-2xl font-black text-[#1F1F1F]">
              {stats.longestStreak}
            </div>
          </div>
        </div>

        {/* Streak Milestones */}
        <div className="mt-4 pt-4 border-t border-[#1F1F1F]/10">
          <div className="flex items-center justify-between text-sm">
            <div className={stats.currentStreak >= 7 ? 'text-green-600 font-bold' : 'text-[#1F1F1F]/50'}>
              ✓ 7 days
            </div>
            <div className={stats.currentStreak >= 30 ? 'text-green-600 font-bold' : 'text-[#1F1F1F]/50'}>
              ✓ 30 days
            </div>
            <div className={stats.currentStreak >= 100 ? 'text-green-600 font-bold' : 'text-[#1F1F1F]/50'}>
              ✓ 100 days
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard
          icon={<TrendingUp className="text-green-600" />}
          label="Total Profit"
          value={`$${stats.totalProfitUSD.toLocaleString()}`}
        />
        <StatCard
          icon={<Target className="text-blue-600" />}
          label="Win Rate"
          value={`${stats.copyTradeWinRate.toFixed(1)}%`}
        />
        <StatCard
          icon={<Zap className="text-yellow-600" />}
          label="Copy Trades"
          value={stats.totalCopyTrades.toString()}
        />
        <StatCard
          icon={<Trophy className="text-purple-600" />}
          label="Achievements"
          value={achievements.length.toString()}
        />
      </div>

      {/* Achievements Grid */}
      <div>
        <h3 className="text-lg font-black text-[#1F1F1F] mb-4">Achievements</h3>
        <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
          {achievements.map((achievement, index) => (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className={`aspect-square bg-gradient-to-br ${getTierGradient(achievement.tier)} p-1 rounded-xl hover:scale-110 transition-transform cursor-pointer`}
              title={getAchievementTitle(achievement)}
            >
              <div className="bg-[#EAEADF] rounded-lg h-full flex items-center justify-center">
                <Award className="text-[#1F1F1F]" size={32} />
              </div>
            </motion.div>
          ))}
          
          {/* Locked achievements */}
          {[...Array(Math.max(0, 15 - achievements.length))].map((_, i) => (
            <div
              key={`locked-${i}`}
              className="aspect-square bg-[#1F1F1F]/10 rounded-xl flex items-center justify-center"
            >
              <Award className="text-[#1F1F1F]/30" size={32} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-[#1F1F1F]/10">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-xs font-bold text-[#1F1F1F]/70 uppercase">{label}</span>
      </div>
      <div className="text-2xl font-black text-[#1F1F1F]">{value}</div>
    </div>
  );
}

function getAchievementTitle(achievement: Achievement): string {
  const titles: Record<string, string> = {
    FIRST_TRADE: '🎯 First Trade',
    WEEK_STREAK: '🔥 Week Warrior',
    MONTH_STREAK: '💎 Monthly Master',
    LEGEND_STREAK: '👑 Streak Legend',
    PROFIT_1K: '💰 First $1K',
    PROFIT_10K: '🚀 $10K Club',
    PROFIT_100K: '🏆 $100K Master',
    PERFECT_TRADER: '⭐ Perfect Trader',
    PRO_TRADER: '💪 Pro Trader',
  };

  return titles[achievement.type] || 'Achievement';
}
