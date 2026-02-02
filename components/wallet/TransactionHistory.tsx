"use client";

import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, ArrowDownLeft, ArrowLeftRight, Filter, Download, ExternalLink, CheckCircle2, Clock, XCircle, Globe } from 'lucide-react';
import { exportTransactionsToCSV, type TransactionType, type TransactionStatus } from '@/lib/wallet/transactions';
import { getChainName, getExplorerTxUrl } from '@/lib/wallet/chains';
import { StealthText } from '@/components/ui/stealth-text';

interface TransactionHistoryProps {
  authUserId: string;
}

export default function TransactionHistory({ authUserId }: TransactionHistoryProps) {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<TransactionType | 'ALL'>('ALL');
  const [filterChain, setFilterChain] = useState<number | 'ALL'>('ALL');

  // Custom Virtualization State
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);

  // Constants
  const ITEM_HEIGHT = 100;
  const GAP = 12;
  const TOTAL_ITEM_HEIGHT = ITEM_HEIGHT + GAP;

  // Resize Observer for Container
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Initial size
    setContainerHeight(containerRef.current.clientHeight);

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
         setContainerHeight(entry.contentRect.height);
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [containerRef]);

  // Handle Scroll
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
      setScrollTop(e.currentTarget.scrollTop);
  };

  useEffect(() => {
    if (authUserId) {
        loadTransactions();
    }
  }, [authUserId, filterType, filterChain]);

  const loadTransactions = async () => {
    setLoading(true);
    try {
        const params = new URLSearchParams({
            authUserId: authUserId, // Passing wallet address as ID
            limit: '1000'
        });
        
        if (filterType !== 'ALL') params.append('type', filterType);
        if (filterChain !== 'ALL') params.append('chainId', filterChain.toString());

        const response = await fetch(`/api/wallet/history/enriched?userAddress=${authUserId}`);
        if (!response.ok) throw new Error('Failed to fetch transactions');
        
        const data = await response.json();
        setTransactions(data.activities || []);
    } catch (error) {
      console.error('Error loading transactions:', error);
      // Fallback to empty
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const csv = exportTransactionsToCSV(transactions);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Virtualization Math
  const totalContentHeight = transactions.length * TOTAL_ITEM_HEIGHT;
  const startIndex = Math.max(0, Math.floor(scrollTop / TOTAL_ITEM_HEIGHT) - 2); // Buffer top
  const endIndex = Math.min(
      transactions.length - 1,
      Math.floor((scrollTop + containerHeight) / TOTAL_ITEM_HEIGHT) + 2 // Buffer bottom
  );

  const visibleItems = [];
  for (let i = startIndex; i <= endIndex; i++) {
      visibleItems.push({
          index: i,
          item: transactions[i],
          offsetY: i * TOTAL_ITEM_HEIGHT
      });
  }

  return (
    <div className="space-y-4 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <h2 className="text-2xl font-black text-[#1F1F1F]">Transaction History</h2>
        
        <div className="flex gap-2">
            
          <button
            onClick={handleExport}
            disabled={transactions.length === 0}
            className="px-4 py-2 bg-[#1F1F1F] text-[#EAEADF] rounded-xl font-bold hover:bg-[#1F1F1F]/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Download size={18} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 shrink-0 scrollbar-hide">
        <TypeFilterButton label="All" active={filterType === 'ALL'} onClick={() => setFilterType('ALL')} />
        <TypeFilterButton label="Send" active={filterType === 'SEND'} onClick={() => setFilterType('SEND' as TransactionType)} />
        <TypeFilterButton label="Receive" active={filterType === 'RECEIVE'} onClick={() => setFilterType('RECEIVE' as TransactionType)} />
        <TypeFilterButton label="Swap" active={filterType === 'SWAP'} onClick={() => setFilterType('SWAP' as TransactionType)} />
        <TypeFilterButton label="NFT" active={filterType === 'NFT_TRANSFER'} onClick={() => setFilterType('NFT_TRANSFER' as TransactionType)} />
      </div>

      {/* Virtualized Transaction List */}
      <div 
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 min-h-[400px] bg-[#1F1F1F]/5 rounded-3xl overflow-y-auto border border-[#1F1F1F]/5 relative scrollbar-hide"
      >
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="flex flex-col items-center gap-2">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#1F1F1F] border-t-transparent" />
                <span className="text-xs font-bold text-[#1F1F1F]/50">Loading History...</span>
             </div>
          </div>
        ) : transactions.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center text-[#1F1F1F]/50 font-medium">
            No transactions found
          </div>
        ) : (
            <div style={{ height: totalContentHeight, position: 'relative' }}>
                {visibleItems.map(({ index, item, offsetY }) => (
                    <div
                        key={item.id || index}
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: '1%',
                            width: '98%',
                            height: ITEM_HEIGHT,
                            transform: `translateY(${offsetY}px)`,
                        }}
                    >
                        <TransactionCard transaction={item} />
                    </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
}

// Transaction Card Component
function TransactionCard({ transaction }: { transaction: any }) {
  const getTypeIcon = () => {
    switch (transaction.type) {
      case 'SEND':
      case 'SELL':
        return <ArrowUpRight size={20} className="text-red-500" />;
      case 'RECEIVE':
      case 'DEPOSIT':
        return <ArrowDownLeft size={20} className="text-green-500" />;
      case 'SWAP':
        return <ArrowLeftRight size={20} className="text-blue-500" />;
      case 'BRIDGE':
        return <Globe size={20} className="text-purple-500" />;
      default:
        return <ArrowLeftRight size={20} className="text-[#1F1F1F]" />;
    }
  };

  const getStatusIcon = () => {
    switch (transaction.status) {
      case 'CONFIRMED':
        return <CheckCircle2 size={16} className="text-green-500" />;
      case 'PENDING':
        return <Clock size={16} className="text-yellow-500 animate-pulse" />;
      case 'FAILED':
        return <XCircle size={16} className="text-red-500" />;
    }
  };

  const formatValue = () => {
    const value = parseFloat(transaction.value);
    const symbol = transaction.tokenSymbol || 'ETH';
     // Handle NaN gracefully
    if (isNaN(value)) return `0.00 ${symbol}`;

    if (transaction.type === 'SEND') {
      return `-${value.toFixed(6)} ${symbol}`;
    } else if (transaction.type === 'RECEIVE') {
      return `+${value.toFixed(6)} ${symbol}`;
    }
    return `${value.toFixed(6)} ${symbol}`;
  };

  const formatDate = () => {
    if (!transaction.timestamp) return 'Recently';
    const date = new Date(transaction.timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const explorerUrl = getExplorerTxUrl(transaction.chainId, transaction.hash);

  return (
    <div className="h-full p-4 bg-white/60 backdrop-blur-md rounded-2xl border border-white/40 hover:bg-white/80 transition-colors shadow-sm flex flex-col justify-between">
      <div className="flex items-center justify-between">
        {/* Type & Info */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
            {getTypeIcon()}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#1F1F1F] capitalize text-sm">{transaction.type.toLowerCase()}</span>
              {transaction.platform && (
                 <span className="text-[10px] bg-[#1F1F1F]/5 px-1.5 py-0.5 rounded-md text-[#1F1F1F]/60 font-bold uppercase">Via {transaction.platform}</span>
              )}
            </div>
            <div className="text-xs text-[#1F1F1F]/60 font-medium">{getChainName(transaction.chainId)}</div>
          </div>
        </div>

        {/* Value & Date */}
        <div className="text-right">
          <div className={`font-black text-sm ${
            transaction.type === 'SEND' ? 'text-red-600' : 
            transaction.type === 'RECEIVE' ? 'text-green-600' : 'text-[#1F1F1F]'
          }`}>
            <StealthText>{formatValue()}</StealthText>
          </div>
          <div className="text-[10px] text-[#1F1F1F]/50 font-bold uppercase">{formatDate()}</div>
        </div>
      </div>
    </div>
  );
}

// Filter Button Components (Unchanged logic, minor style tweaks)
function FilterButton({ active, onClick }: { active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`p-2 rounded-xl transition-all ${
        active
          ? 'bg-[#1F1F1F] text-[#EAEADF]'
          : 'bg-white/50 hover:bg-white/80'
      }`}
    >
      <Filter size={18} />
    </button>
  );
}

function TypeFilterButton({ 
  label, 
  active, 
  onClick 
}: { 
  label: string; 
  active: boolean; 
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-xl font-bold whitespace-nowrap transition-all text-sm ${
        active
          ? 'bg-[#1F1F1F] text-[#EAEADF] shadow-lg'
          : 'bg-white/50 hover:bg-white/80 border border-[#1F1F1F]/5'
      }`}
    >
      {label}
    </button>
  );
}
