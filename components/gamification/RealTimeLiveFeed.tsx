"use client";

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, TrendingUp, TrendingDown, ArrowRight, Zap, Bell } from 'lucide-react';
import { useSound } from '@/hooks/useSound';

interface LiveActivity {
  id: string;
  walletLabel: string;
  walletAddress: string;
  type: 'BUY' | 'SELL' | 'TRANSFER';
  token: string;
  amount: number;
  usdValue: number;
  timestamp: Date;
  isNew?: boolean;
}

export default function RealTimeLiveFeed({ isPremium }: { isPremium: boolean }) {
  const [activities, setActivities] = useState<LiveActivity[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const { playSound } = useSound();
  const feedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isPremium) return;

    // Connect to WebSocket for real-time updates
    const ws = connectWebSocket();

    return () => {
      ws?.close();
    };
  }, [isPremium]);

  const connectWebSocket = () => {
    if (typeof window === 'undefined') return null;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${window.location.host}`);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'whale-activity') {
        addActivity(data.activity);
      }
    };

    ws.onerror = (error) => {
      console.error('[WebSocket] Error:', error);
    };

    return ws;
  };

  const addActivity = (activity: LiveActivity) => {
    // Play sound notification
    if (soundEnabled) {
      if (activity.usdValue > 1000000) {
        playSound('whale-alert'); // Critical
      } else {
        playSound('activity'); // Normal
      }
    }

    // Add with "new" flag for animation
    setActivities(prev => [
      { ...activity, isNew: true },
      ...prev.slice(0, 49), // Keep last 50
    ]);

    // Remove "new" flag after animation
    setTimeout(() => {
      setActivities(prev =>
        prev.map(a => a.id === activity.id ? { ...a, isNew: false } : a)
      );
    }, 3000);

    // Show browser notification if critical
    if (activity.usdValue > 5000000 && Notification.permission === 'granted') {
      new Notification('🐋 Whale Alert!', {
        body: `${activity.walletLabel} ${activity.type} $${(activity.usdValue / 1000000).toFixed(1)}M worth of ${activity.token}`,
        icon: '/whale-icon.png',
      });
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  };

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  if (!isPremium) {
    return (
      <div className="p-12 text-center bg-white/30 rounded-2xl border-2 border-dashed border-[#1F1F1F]/20">
        <Activity size={64} className="mx-auto mb-4 text-[#1F1F1F]/30" />
        <h3 className="text-2xl font-black text-[#1F1F1F] mb-2">Live Activity Feed</h3>
        <p className="text-[#1F1F1F]/70 mb-6">
          Watch whale movements happen in real-time. Never miss a trade.
        </p>
        <button className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:shadow-lg transition-all">
          Upgrade to See Live Feed
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-[#1F1F1F]/10">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Activity className="text-blue-600" />
          <h2 className="text-2xl font-black text-[#1F1F1F]">Live Feed</h2>
          <motion.span
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full"
          >
            LIVE
          </motion.span>
        </div>

        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className={`p-2 rounded-lg transition-all ${
            soundEnabled ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
          }`}
          title={soundEnabled ? 'Sound ON' : 'Sound OFF'}
        >
          <Bell size={20} />
        </button>
      </div>

      {/* Feed Container */}
      <div
        ref={feedRef}
        className="space-y-2 max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-[#1F1F1F]/20 scrollbar-track-transparent"
      >
        <AnimatePresence mode="popLayout">
          {activities.map((activity, index) => (
            <ActivityCard
              key={activity.id}
              activity={activity}
              index={index}
            />
          ))}
        </AnimatePresence>

        {activities.length === 0 && (
          <div className="text-center py-12 text-[#1F1F1F]/50">
            <Zap size={48} className="mx-auto mb-4 opacity-50" />
            <p className="font-bold">Waiting for whale activity...</p>
            <p className="text-sm mt-2">Live updates will appear here instantly</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ActivityCard({ activity, index }: { activity: LiveActivity; index: number }) {
  const isCritical = activity.usdValue > 1000000;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -50, scale: 0.9 }}
      animate={{
        opacity: 1,
        x: 0,
        scale: activity.isNew ? 1.02 : 1,
      }}
      exit={{ opacity: 0, x: 50, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      className={`p-4 rounded-xl border-l-4 ${
        isCritical
          ? 'bg-gradient-to-r from-red-50 to-orange-50 border-red-500 shadow-lg'
          : activity.type === 'BUY'
          ? 'bg-gradient-to-r from-green-50 to-green-100/50 border-green-500'
          : activity.type === 'SELL'
          ? 'bg-gradient-to-r from-red-50 to-red-100/50 border-red-500'
          : 'bg-gradient-to-r from-blue-50 to-blue-100/50 border-blue-500'
      } ${activity.isNew ? 'ring-2 ring-yellow-400 ring-offset-2' : ''}`}
    >
      <div className="flex items-start justify-between gap-4">
        {/* Left: Activity Info */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {isCritical && (
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="text-2xl"
              >
                🐋
              </motion.span>
            )}
            <span className="font-black text-[#1F1F1F]">
              {activity.walletLabel}
            </span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
              activity.type === 'BUY' ? 'bg-green-200 text-green-800' :
              activity.type === 'SELL' ? 'bg-red-200 text-red-800' :
              'bg-blue-200 text-blue-800'
            }`}>
              {activity.type}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm text-[#1F1F1F]/70">
            <span className="font-bold">{activity.amount.toLocaleString()} {activity.token}</span>
            <ArrowRight size={14} />
            <span className="font-bold text-[#1F1F1F]">
              ${(activity.usdValue / 1000000).toFixed(2)}M
            </span>
          </div>

          <div className="text-xs text-[#1F1F1F]/50 mt-2">
            {new Date(activity.timestamp).toLocaleTimeString()}
          </div>
        </div>

        {/* Right: Action Icon */}
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
          activity.type === 'BUY' ? 'bg-green-500' :
          activity.type === 'SELL' ? 'bg-red-500' :
          'bg-blue-500'
        }`}>
          {activity.type === 'BUY' && <TrendingUp className="text-white" size={24} />}
          {activity.type === 'SELL' && <TrendingDown className="text-white" size={24} />}
          {activity.type === 'TRANSFER' && <ArrowRight className="text-white" size={24} />}
        </div>
      </div>
    </motion.div>
  );
}
