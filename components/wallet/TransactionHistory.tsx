"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, ArrowDownLeft, ArrowLeftRight, Filter, Download, ExternalLink, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { getTransactionHistory, exportTransactionsToCSV, type TransactionType, type TransactionStatus } from '@/lib/wallet/transactions';
import { getChainName, getExplorerTxUrl } from '@/lib/wallet/chains';

interface TransactionHistoryProps {
  authUserId: string;
}

export default function TransactionHistory({ authUserId }: TransactionHistoryProps) {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<TransactionType | 'ALL'>('ALL');
  const [filterChain, setFilterChain] = useState<number | 'ALL'>('ALL');

  useEffect(() => {
    loadTransactions();
  }, [authUserId, filterType, filterChain]);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const txs = await getTransactionHistory(authUserId, {
        type: filterType !== 'ALL' ? filterType : undefined,
        chainId: filterChain !== 'ALL' ? filterChain : undefined,
        limit: 50,
      });
      setTransactions(txs);
    } catch (error) {
      console.error('Error loading transactions:', error);
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

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-[#1F1F1F]">Transaction History</h2>
        
        <div className="flex gap-2">
          <FilterButton
            active={filterType !== 'ALL'}
            onClick={() => setFilterType('ALL')}
          />

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
      <div className="flex gap-2 overflow-x-auto pb-2">
        <TypeFilterButton label="All" active={filterType === 'ALL'} onClick={() => setFilterType('ALL')} />
        <TypeFilterButton label="Send" active={filterType === 'SEND'} onClick={() => setFilterType('SEND' as TransactionType)} />
        <TypeFilterButton label="Receive" active={filterType === 'RECEIVE'} onClick={() => setFilterType('RECEIVE' as TransactionType)} />
        <TypeFilterButton label="Swap" active={filterType === 'SWAP'} onClick={() => setFilterType('SWAP' as TransactionType)} />
        <TypeFilterButton label="NFT" active={filterType === 'NFT_TRANSFER'} onClick={() => setFilterType('NFT_TRANSFER' as TransactionType)} />
      </div>

      {/* Transaction List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#1F1F1F] border-t-transparent" />
        </div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-[#1F1F1F]/70">No transactions found</p>
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {transactions.map((tx, index) => (
              <TransactionCard
                key={tx.id}
                transaction={tx}
                index={index}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

// Transaction Card Component
function TransactionCard({ transaction, index }: { transaction: any; index: number }) {
  const getTypeIcon = () => {
    switch (transaction.type) {
      case 'SEND':
        return <ArrowUpRight size={20} className="text-red-500" />;
      case 'RECEIVE':
        return <ArrowDownLeft size={20} className="text-green-500" />;
      case 'SWAP':
        return <ArrowLeftRight size={20} className="text-blue-500" />;
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
    
    if (transaction.type === 'SEND') {
      return `-${value.toFixed(6)} ${symbol}`;
    } else if (transaction.type === 'RECEIVE') {
      return `+${value.toFixed(6)} ${symbol}`;
    }
    return `${value.toFixed(6)} ${symbol}`;
  };

  const formatDate = () => {
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ delay: index * 0.05 }}
      className="p-4 bg-white/50 backdrop-blur-sm rounded-2xl border border-[#1F1F1F]/10 hover:bg-white/80 transition-all"
    >
      <div className="flex items-center justify-between">
        {/* Type & Info */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
            {getTypeIcon()}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#1F1F1F] capitalize">{transaction.type.toLowerCase()}</span>
              {getStatusIcon()}
            </div>
            <div className="text-sm text-[#1F1F1F]/70">{getChainName(transaction.chainId)}</div>
          </div>
        </div>

        {/* Value & Date */}
        <div className="text-right">
          <div className={`font-black text-[#1F1F1F] ${
            transaction.type === 'SEND' ? 'text-red-600' : 
            transaction.type === 'RECEIVE' ? 'text-green-600' : ''
          }`}>
            {formatValue()}
          </div>
          <div className="text-sm text-[#1F1F1F]/70">{formatDate()}</div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="mt-3 pt-3 border-t border-[#1F1F1F]/10 flex items-center justify-between">
        <div className="text-xs font-mono text-[#1F1F1F]/70">
          {transaction.hash.slice(0, 10)}...{transaction.hash.slice(-8)}
        </div>

        <a
          href={explorerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs font-bold text-[#1F1F1F] hover:text-[#1F1F1F]/70 transition-colors"
        >
          View
          <ExternalLink size={12} />
        </a>
      </div>
    </motion.div>
  );
}

// Filter Button Component
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

// Type Filter Button
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
      className={`px-4 py-2 rounded-xl font-bold whitespace-nowrap transition-all ${
        active
          ? 'bg-[#1F1F1F] text-[#EAEADF]'
          : 'bg-white/50 hover:bg-white/80'
      }`}
    >
      {label}
    </button>
  );
}
