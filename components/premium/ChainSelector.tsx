"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronDown, Search } from 'lucide-react';
import { SUPPORTED_CHAINS, ChainConfig } from '@/lib/chains';

interface ChainSelectorProps {
  selectedChains: string[];
  onChainToggle: (chainKey: string) => void;
  showStats?: boolean;
}

export default function ChainSelector({ selectedChains, onChainToggle, showStats = false }: ChainSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const chains = Object.entries(SUPPORTED_CHAINS);
  
  const filteredChains = chains.filter(([key, chain]) => 
    chain.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chain.shortName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedCount = selectedChains.length;
  const allSelected = selectedCount === chains.length;

  const handleToggleAll = () => {
    if (allSelected) {
      // Deselect all
      selectedChains.forEach(chainKey => onChainToggle(chainKey));
    } else {
      // Select all
      chains.forEach(([key]) => {
        if (!selectedChains.includes(key)) {
          onChainToggle(key);
        }
      });
    }
  };

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-3 bg-white/50 backdrop-blur-sm rounded-2xl hover:bg-white/80 transition-all border border-[#1F1F1F]/10"
      >
        <div className="flex -space-x-2">
          {selectedChains.slice(0, 3).map(chainKey => {
            const chain = SUPPORTED_CHAINS[chainKey];
            return (
              <div
                key={chainKey}
                className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold"
                style={{ backgroundColor: chain.color }}
              >
                <span className="text-white text-[10px]">{chain.shortName[0]}</span>
              </div>
            );
          })}
          {selectedCount > 3 && (
            <div className="w-6 h-6 rounded-full border-2 border-white bg-[#1F1F1F] flex items-center justify-center text-xs font-bold text-white">
              +{selectedCount - 3}
            </div>
          )}
        </div>
        <span className="font-bold text-[#1F1F1F]">
          {selectedCount === 0 ? 'Select Chains' : 
           allSelected ? 'All Chains' : 
           `${selectedCount} Chain${selectedCount > 1 ? 's' : ''}`}
        </span>
        <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)}
            />
            
            {/* Dropdown Content */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full mt-2 left-0 w-80 bg-white rounded-2xl shadow-2xl border border-[#1F1F1F]/10 z-50 overflow-hidden"
            >
              {/* Search */}
              <div className="p-3 border-b border-[#1F1F1F]/10">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#1F1F1F]/50" size={16} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search chains..."
                    className="w-full pl-10 pr-3 py-2 bg-[#EAEADF]/30 rounded-xl text-sm outline-none focus:bg-[#EAEADF]/50 transition-colors"
                  />
                </div>
              </div>

              {/* Select All */}
              <div className="p-2 border-b border-[#1F1F1F]/10">
                <button
                  onClick={handleToggleAll}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[#EAEADF]/30 transition-colors"
                >
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                    allSelected 
                      ? 'bg-purple-500 border-purple-500' 
                      : 'border-[#1F1F1F]/30'
                  }`}>
                    {allSelected && <Check size={14} className="text-white" />}
                  </div>
                  <span className="font-bold text-[#1F1F1F]">
                    {allSelected ? 'Deselect All' : 'Select All'}
                  </span>
                </button>
              </div>

              {/* Chain List */}
              <div className="max-h-80 overflow-y-auto">
                {filteredChains.length === 0 ? (
                  <div className="p-6 text-center text-[#1F1F1F]/70">
                    No chains found
                  </div>
                ) : (
                  filteredChains.map(([key, chain]) => {
                    const isSelected = selectedChains.includes(key);
                    return (
                      <ChainItem
                        key={key}
                        chainKey={key}
                        chain={chain}
                        isSelected={isSelected}
                        onToggle={() => onChainToggle(key)}
                        showStats={showStats}
                      />
                    );
                  })
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function ChainItem({ 
  chainKey, 
  chain, 
  isSelected, 
  onToggle,
  showStats 
}: { 
  chainKey: string;
  chain: ChainConfig;
  isSelected: boolean;
  onToggle: () => void;
  showStats: boolean;
}) {
  return (
    <button
      onClick={onToggle}
      className="w-full flex items-center gap-3 p-3 hover:bg-[#EAEADF]/30 transition-colors"
    >
      {/* Checkbox */}
      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
        isSelected 
          ? 'border-purple-500 bg-purple-500' 
          : 'border-[#1F1F1F]/30'
      }`}>
        {isSelected && <Check size={14} className="text-white" />}
      </div>

      {/* Chain Icon */}
      <div 
        className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
        style={{ backgroundColor: chain.color }}
      >
        {chain.shortName[0]}
      </div>

      {/* Chain Info */}
      <div className="flex-1 text-left">
        <div className="font-bold text-[#1F1F1F]">{chain.name}</div>
        <div className="text-xs text-[#1F1F1F]/70">{chain.shortName}</div>
      </div>

      {/* Stats (if enabled) */}
      {showStats && isSelected && (
        <div className="text-xs text-[#1F1F1F]/70">
          Live
        </div>
      )}
    </button>
  );
}
