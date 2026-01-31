"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, TrendingUp, TrendingDown, Eye, EyeOff, X } from 'lucide-react';
import { discoverTokens, searchTokens, getPopularTokens, type Token, type TokenMetadata } from '@/lib/wallet/tokens';

interface TokenManagerProps {
  walletAddress: string;
  chainId: number;
  onSelectToken?: (token: Token) => void;
}

export default function TokenManager({ walletAddress, chainId, onSelectToken }: TokenManagerProps) {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<TokenMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [hideSmallBalances, setHideSmallBalances] = useState(false);
  const [showAddTokenDialog, setShowAddTokenDialog] = useState(false);

  useEffect(() => {
    loadTokens();
  }, [walletAddress, chainId]);

  useEffect(() => {
    if (searchQuery.length > 2) {
      handleSearch();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const loadTokens = async () => {
    setLoading(true);
    try {
      const discovered = await discoverTokens(walletAddress, chainId);
      setTokens(discovered);
    } catch (error) {
      console.error('Error loading tokens:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      const results = await searchTokens(searchQuery, chainId);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching tokens:', error);
    }
  };

  const filteredTokens = hideSmallBalances
    ? tokens.filter(t => (t.valueUSD || 0) >= 1)
    : tokens;

  const totalValue = tokens.reduce((sum, t) => sum + (t.valueUSD || 0), 0);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-[#1F1F1F]">Tokens</h2>
          <p className="text-sm text-[#1F1F1F]/70">Total Value: ${totalValue.toFixed(2)}</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setHideSmallBalances(!hideSmallBalances)}
            className="p-2 rounded-xl bg-white/50 hover:bg-white/80 transition-all"
            title={hideSmallBalances ? 'Show all' : 'Hide small balances'}
          >
            {hideSmallBalances ? <Eye size={20} /> : <EyeOff size={20} />}
          </button>

          <button
            onClick={() => setShowAddTokenDialog(true)}
            className="px-4 py-2 bg-[#1F1F1F] text-[#EAEADF] rounded-xl font-bold hover:bg-[#1F1F1F]/90 transition-all flex items-center gap-2"
          >
            <Plus size={20} />
            Add Token
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1F1F1F]/50" size={20} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search tokens..."
          className="w-full pl-12 pr-4 py-3 bg-white/50 backdrop-blur-sm rounded-2xl outline-none focus:bg-white/80 transition-all"
        />
      </div>

      {/* Token List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#1F1F1F] border-t-transparent" />
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {filteredTokens.map((token, index) => (
              <TokenCard
                key={token.address}
                token={token}
                index={index}
                onClick={() => onSelectToken?.(token)}
              />
            ))}
          </AnimatePresence>

          {filteredTokens.length === 0 && (
            <div className="text-center py-12 text-[#1F1F1F]/70">
              <p>No tokens found</p>
              <button
                onClick={() => setShowAddTokenDialog(true)}
                className="mt-4 px-6 py-2 bg-[#1F1F1F] text-[#EAEADF] rounded-xl font-bold hover:bg-[#1F1F1F]/90 transition-all"
              >
                Add Custom Token
              </button>
            </div>
          )}
        </div>
      )}

      {/* Add Token Dialog */}
      <AnimatePresence>
        {showAddTokenDialog && (
          <AddTokenDialog
            chainId={chainId}
            onClose={() => setShowAddTokenDialog(false)}
            onAdd={loadTokens}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Token Card Component
function TokenCard({ 
  token, 
  index, 
  onClick 
}: { 
  token: Token; 
  index: number;
  onClick: () => void;
}) {
  const priceChange = Math.random() * 10 - 5; // Mock price change
  const isPositive = priceChange >= 0;

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ delay: index * 0.05 }}
      onClick={onClick}
      className="w-full p-4 bg-white/50 backdrop-blur-sm rounded-2xl hover:bg-white/80 transition-all border border-[#1F1F1F]/10 text-left"
    >
      <div className="flex items-center justify-between">
        {/* Token Info */}
        <div className="flex items-center gap-3">
          {token.logoURI ? (
            <img src={token.logoURI} alt={token.symbol} className="w-10 h-10 rounded-full" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-[#1F1F1F] flex items-center justify-center">
              <span className="text-[#EAEADF] font-bold text-sm">{token.symbol[0]}</span>
            </div>
          )}

          <div>
            <div className="font-bold text-[#1F1F1F]">{token.symbol}</div>
            <div className="text-sm text-[#1F1F1F]/70">{token.name}</div>
          </div>
        </div>

        {/* Balance & Value */}
        <div className="text-right">
          <div className="font-black text-[#1F1F1F]">{parseFloat(token.balanceFormatted || '0').toFixed(4)}</div>
          <div className="text-sm text-[#1F1F1F]/70">${(token.valueUSD || 0).toFixed(2)}</div>
          
          {/* Price Change */}
          <div className={`text-xs flex items-center justify-end gap-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {Math.abs(priceChange).toFixed(2)}%
          </div>
        </div>
      </div>
    </motion.button>
  );
}

// Add Token Dialog
function AddTokenDialog({
  chainId,
  onClose,
  onAdd,
}: {
  chainId: number;
  onClose: () => void;
  onAdd: () => void;
}) {
  const [tokenAddress, setTokenAddress] = useState('');
  const [popularTokens, setPopularTokens] = useState<TokenMetadata[]>([]);

  useEffect(() => {
    loadPopularTokens();
  }, [chainId]);

  const loadPopularTokens = async () => {
    const tokens = await getPopularTokens(chainId);
    setPopularTokens(tokens);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-md bg-[#EAEADF] rounded-3xl shadow-2xl p-6 mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-[#1F1F1F]/10 transition-colors"
        >
          <X size={24} className="text-[#1F1F1F]" />
        </button>

        <h2 className="text-2xl font-black text-[#1F1F1F] mb-4">Add Token</h2>

        {/* Custom Token Input */}
        <div className="mb-6">
          <label className="block text-sm font-bold text-[#1F1F1F] mb-2">Token Contract Address</label>
          <input
            type="text"
            value={tokenAddress}
            onChange={(e) => setTokenAddress(e.target.value)}
            placeholder="0x..."
            className="w-full px-4 py-3 bg-white/50 rounded-xl outline-none focus:bg-white/80 transition-all"
          />
          <button
            onClick={() => {
              // Add custom token logic
              onAdd();
              onClose();
            }}
            className="w-full mt-2 py-3 bg-[#1F1F1F] text-[#EAEADF] rounded-xl font-bold hover:bg-[#1F1F1F]/90 transition-all"
          >
            Add Custom Token
          </button>
        </div>

        {/* Popular Tokens */}
        <div>
          <h3 className="font-bold text-[#1F1F1F] mb-3">Popular Tokens</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {popularTokens.map((token) => (
              <button
                key={token.address}
                onClick={() => {
                  // Add popular token logic
                  onAdd();
                  onClose();
                }}
                className="w-full p-3 bg-white/50 rounded-xl hover:bg-white/80 transition-all flex items-center gap-3 text-left"
              >
                <div className="w-8 h-8 rounded-full bg-[#1F1F1F] flex items-center justify-center">
                  <span className="text-[#EAEADF] font-bold text-sm">{token.symbol[0]}</span>
                </div>
                <div>
                  <div className="font-bold text-[#1F1F1F]">{token.symbol}</div>
                  <div className="text-xs text-[#1F1F1F]/70">{token.name}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
