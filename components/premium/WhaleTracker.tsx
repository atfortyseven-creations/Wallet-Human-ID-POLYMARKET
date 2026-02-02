"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, Waves, AlertCircle, Star, Eye, Bell, Download, Upload, Filter, Search, BarChart3, Copy, CheckCircle, X } from 'lucide-react';
import useSWR, { mutate } from 'swr';
import { useAccount } from 'wagmi';
import ChainSelector from './ChainSelector';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export interface WatchedWallet {
  id: string;
  address: string;
  label: string;
  note?: string;
  tags: string[];
  isWhale: boolean;
  isSmart: boolean;
  totalValue: number;
  change24h: number;
  lastActive: Date;
  alertsEnabled: boolean;
}

export interface WhaleActivity {
  id: string;
  walletAddress: string;
  walletLabel: string;
  type: 'BUY' | 'SELL' | 'TRANSFER' | 'SWAP';
  token: string;
  amount: number;
  usdValue: number;
  timestamp: Date;
  txHash: string;
}

interface WhaleTrackerProps {
  isPremium: boolean;
  onUpgrade: () => void;
  onWalletsUpdate?: (wallets: WatchedWallet[]) => void;
}

export default function WhaleTracker({ isPremium: _propIsPremium, onUpgrade, onWalletsUpdate }: WhaleTrackerProps) {
  const isPremium = true; // FORCE UNLOCK FOR FULL VIP EXPERIENCE
  const { address: currentUserAddress } = useAccount();
  
  // Real Data Fetching (Persistent)
  const { data: watchedData, isLoading: isLoadingWallets } = useSWR(
    currentUserAddress ? `/api/user/watched-wallets?address=${currentUserAddress}` : null,
    fetcher
  );

  const [activities, setActivities] = useState<WhaleActivity[]>([]);
  const [filter, setFilter] = useState<'all' | 'whales' | 'smart' | 'alerts'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddWallet, setShowAddWallet] = useState(false);
  const [showBatchImport, setShowBatchImport] = useState(false);
  const [selectedChains, setSelectedChains] = useState<string[]>(['bitcoin', 'base', 'ethereum', 'polygon', 'arbitrum', 'optimism']);

  const watchedWallets: WatchedWallet[] = watchedData?.watchedWallets || [];

  // Fetch real activities
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await fetch('/api/whale/activities');
        if (response.ok) {
            const data = await response.json();
            setActivities(data.activities || []);
        }
      } catch (error) {
        console.error("Failed to fetch whale activities", error);
      }
    };

    fetchActivities();
    const interval = setInterval(fetchActivities, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleAddWallet = async (address: string, label: string) => {
    if (!currentUserAddress) return;
    
    try {
        const res = await fetch('/api/user/watched-wallets', {
            method: 'POST',
            body: JSON.stringify({
                userId: currentUserAddress,
                address,
                label: label || address,
                tags: ['Custom']
            })
        });
        if (res.ok) {
            mutate(`/api/user/watched-wallets?address=${currentUserAddress}`);
            setShowAddWallet(false);
        }
    } catch (e) {
        console.error("Error adding wallet:", e);
    }
  };

  const handleToggleAlerts = async (walletId: string, currentState: boolean) => {
    try {
        const res = await fetch('/api/user/watched-wallets', {
            method: 'PATCH',
            body: JSON.stringify({
                id: walletId,
                alertsEnabled: !currentState
            })
        });
        if (res.ok) {
            mutate(`/api/user/watched-wallets?address=${currentUserAddress}`);
        }
    } catch (e) {
        console.error("Error toggling alerts:", e);
    }
  };

  const handleDeleteWallet = async (walletId: string) => {
    try {
        const res = await fetch(`/api/user/watched-wallets?id=${walletId}`, {
            method: 'DELETE'
        });
        if (res.ok) {
            mutate(`/api/user/watched-wallets?address=${currentUserAddress}`);
        }
    } catch (e) {
        console.error("Error deleting wallet:", e);
    }
  };

  const handleBatchImport = async (text: string) => {
    const lines = text.split('\n');
    for (const line of lines) {
        const [address, label] = line.split(',').map(s => s.trim());
        // Validation now supports non-0x addresses (e.g. BTC)
        if (address && address.length > 20) {
            await handleAddWallet(address, label);
        }
    }
    setShowBatchImport(false);
  };

  const filteredWallets = (watchedWallets || []).filter(w => {
    if (filter === 'whales' && !w.isWhale) return false;
    if (filter === 'smart' && !w.isSmart) return false;
    if (filter === 'alerts' && !w.alertsEnabled) return false;
    if (searchQuery && !w.label.toLowerCase().includes(searchQuery.toLowerCase()) 
        && !w.address.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const formatValue = (val: number) => {
    if (val >= 1e9) return `$${(val / 1e9).toFixed(2)}B`;
    if (val >= 1e6) return `$${(val / 1e6).toFixed(2)}M`;
    if (val >= 1e3) return `$${(val / 1e3).toFixed(2)}K`;
    return `$${val.toFixed(2)}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
          <h1 className="text-3xl font-black text-[#1F1F1F] flex items-center gap-3">
            <Waves className="text-blue-500" />
            Whale Tracker
          </h1>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard icon={<Eye />} label="Watched" value={watchedWallets.length} />
        <StatCard icon={<Waves />} label="Whales" value={watchedWallets.filter(w => w.isWhale).length} />
        <StatCard icon={<Star />} label="Smart Money" value={watchedWallets.filter(w => w.isSmart).length} />
        <StatCard icon={<Bell />} label="Alerts" value={watchedWallets.filter(w => w.alertsEnabled).length} />
      </div>

      {/* Actions Bar */}
      <div className="flex flex-wrap gap-3">
        <ChainSelector 
          selectedChains={selectedChains}
          onChainToggle={(chainKey) => {
            setSelectedChains(prev => 
              prev.includes(chainKey) 
                ? prev.filter(k => k !== chainKey)
                : [...prev, chainKey]
            );
          }}
          showStats={true}
        />

        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1F1F1F]/50" size={20} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search wallets..."
            className="w-full pl-12 pr-4 py-3 bg-white/50 backdrop-blur-sm rounded-2xl outline-none focus:bg-white/80 transition-all"
          />
        </div>

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
          className="px-4 py-3 bg-white/50 rounded-2xl outline-none focus:bg-white/80 transition-all font-bold"
        >
          <option value="all">All Wallets</option>
          <option value="whales">Whales Only</option>
          <option value="smart">Smart Money</option>
          <option value="alerts">With Alerts</option>
        </select>

        <button
          onClick={() => setShowAddWallet(true)}
          className="px-4 py-3 bg-[#1F1F1F] text-white rounded-2xl font-bold hover:bg-[#1F1F1F]/90 transition-all flex items-center gap-2"
        >
          <Eye size={20} />
          Add Wallet
        </button>

        <button
          onClick={() => setShowBatchImport(true)}
          className="px-4 py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all flex items-center gap-2"
        >
          <Upload size={20} />
          Batch Import
        </button>
      </div>

      {/* Watched Wallets Grid */}
      <div className="space-y-3">
        <h2 className="text-xl font-black text-[#1F1F1F]">Watched Wallets</h2>
        {filteredWallets.length === 0 ? (
          <div className="text-center py-12 text-[#1F1F1F]/70">
            <p className="text-lg font-bold">No wallets found matching your filter</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            <AnimatePresence>
              {filteredWallets.map((wallet, index) => (
                <WalletCard 
                  key={wallet.id} 
                  wallet={wallet} 
                  index={index} 
                  formatValue={formatValue} 
                  onToggleAlerts={() => handleToggleAlerts(wallet.id, wallet.alertsEnabled)}
                  onDelete={() => handleDeleteWallet(wallet.id)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Recent Whale Activity */}
      <div className="space-y-3">
        <h2 className="text-xl font-black text-[#1F1F1F] flex items-center gap-2">
            <AlertCircle className="text-orange-500" />
            Recent Whale Activity
        </h2>
        <div className="space-y-2">
            <AnimatePresence>
                {activities.map((activity, index) => (
                    <ActivityCard key={activity.id} activity={activity} index={index} />
                ))}
            </AnimatePresence>
        </div>
      </div>

      {/* Modals */}
      <AddWalletModal isOpen={showAddWallet} onClose={() => setShowAddWallet(false)} onAdd={handleAddWallet} />
      <BatchImportModal isOpen={showBatchImport} onClose={() => setShowBatchImport(false)} onImport={handleBatchImport} />
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode, label: string, value: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-white/50 backdrop-blur-sm rounded-2xl border border-[#1F1F1F]/10">
      <div className="flex items-center gap-3 mb-2">
        <div className="text-[#1F1F1F]/70">{icon}</div>
        <span className="text-xs font-bold text-[#1F1F1F]/70 uppercase">{label}</span>
      </div>
      <div className="text-2xl font-black text-[#1F1F1F]">{value}</div>
    </motion.div>
  );
}

function WalletCard({ wallet, index, formatValue, onToggleAlerts, onDelete }: { wallet: WatchedWallet, index: number, formatValue: (v: number) => string, onToggleAlerts: () => void, onDelete: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }} className="p-4 bg-white/50 backdrop-blur-sm rounded-2xl border border-[#1F1F1F]/10 hover:bg-white/80 transition-all group/card">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-black text-[#1F1F1F] truncate">{wallet.label}</h3>
            {wallet.isWhale && <Waves size={16} className="text-blue-500" />}
            {wallet.isSmart && <Star size={16} className="text-yellow-500 fill-current" />}
            
            {/* ALERT BELL - TOGGLEABLE */}
            <button 
                onClick={onToggleAlerts}
                className={`p-1 rounded-full transition-all ${wallet.alertsEnabled ? 'text-green-500 bg-green-50' : 'text-gray-300 hover:text-green-400'}`}
                title={wallet.alertsEnabled ? "Alerts Enabled" : "Enable Alerts"}
            >
                <Bell size={16} className={wallet.alertsEnabled ? "fill-current" : ""} />
            </button>
          </div>
          <div className="text-xs font-mono text-[#1F1F1F]/60 mb-2 truncate">{wallet.address}</div>
          <div className="flex flex-wrap gap-1">
            {wallet.tags.map(tag => <span key={tag} className="px-2 py-0.5 bg-[#1F1F1F]/10 rounded-full text-xs font-bold text-[#1F1F1F]">{tag}</span>)}
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="text-right">
              <div className="text-xl font-black text-[#1F1F1F] mb-1">{formatValue(wallet.totalValue)}</div>
              <div className={`text-sm font-bold flex items-center gap-1 justify-end ${wallet.change24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {wallet.change24h >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {Math.abs(wallet.change24h).toFixed(2)}%
              </div>
          </div>
          
          {/* DELETE BUTTON - VISIBLE ON HOVER */}
          <button 
            onClick={onDelete}
            className="p-1.5 rounded-full bg-red-50 text-red-500 opacity-0 group-hover/card:opacity-100 transition-all hover:bg-red-100"
            title="Remove Wallet"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function ActivityCard({ activity, index }: { activity: WhaleActivity, index: number }) {
    const getTypeColor = (type: string) => {
        switch(type) {
            case 'BUY': return 'text-green-600 bg-green-100';
            case 'SELL': return 'text-red-600 bg-red-100';
            default: return 'text-blue-600 bg-blue-100';
        }
    };
    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-[#1F1F1F]/10">
            <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-1 rounded-lg text-xs font-bold ${getTypeColor(activity.type)}`}>{activity.type}</span>
                        <span className="font-bold text-[#1F1F1F]">{activity.walletLabel}</span>
                    </div>
                    <div className="text-sm text-[#1F1F1F]/70">{activity.amount.toLocaleString()} {activity.token} (${(activity.usdValue / 1e6).toFixed(2)}M)</div>
                </div>
                <div className="text-xs text-[#1F1F1F]/50 font-mono">{new Date(activity.timestamp).toLocaleTimeString()}</div>
            </div>
        </motion.div>
    );
}

function AddWalletModal({ isOpen, onClose, onAdd }: { isOpen: boolean, onClose: () => void, onAdd: (address: string, label: string) => void }) {
    const [address, setAddress] = useState('');
    const [label, setLabel] = useState('');
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#EAEADF] w-full max-w-md rounded-3xl p-8 shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-black text-[#1F1F1F]">Add Whale Wallet</h2>
                    <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full"><X size={24} /></button>
                </div>
                <div className="space-y-4">
                    <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="0x..." className="w-full px-4 py-3 bg-white rounded-xl outline-none" />
                    <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Label" className="w-full px-4 py-3 bg-white rounded-xl outline-none" />
                    <button onClick={() => { if(address) onAdd(address, label); }} className="w-full py-4 bg-[#1F1F1F] text-white rounded-2xl font-black">Track Wallet</button>
                </div>
            </motion.div>
        </div>
    );
}

function BatchImportModal({ isOpen, onClose, onImport }: { isOpen: boolean, onClose: () => void, onImport: (text: string) => void }) {
    const [text, setText] = useState('');
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#EAEADF] w-full max-w-2xl rounded-3xl p-8 shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-black text-[#1F1F1F]">Batch Import</h2>
                    <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full"><X size={24} /></button>
                </div>
                <textarea value={text} onChange={(e) => setText(e.target.value)} rows={10} placeholder="0xAddress, Label" className="w-full px-4 py-3 bg-white rounded-xl outline-none font-mono mb-6" />
                <button onClick={() => { if(text) onImport(text); }} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black">Process Import</button>
            </motion.div>
        </div>
    );
}
