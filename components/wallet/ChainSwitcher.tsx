"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';
import { SUPPORTED_CHAINS, getChainById, type ChainConfig } from '@/lib/wallet/chains';

interface ChainSwitcherProps {
  selectedChainId: number;
  onSwitchChain: (chainId: number) => void;
  compact?: boolean;
}

export default function ChainSwitcher({ selectedChainId, onSwitchChain, compact = false }: ChainSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedChain = getChainById(selectedChainId);

  if (compact) {
    return (
      <ChainSwitcherCompact
        selectedChain={selectedChain}
        isOpen={isOpen}
        onToggle={() => setIsOpen(!isOpen)}
        onSelect={(chainId) => {
          onSwitchChain(chainId);
          setIsOpen(false);
        }}
      />
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-3 bg-white/50 backdrop-blur-sm rounded-2xl font-bold hover:bg-white/80 transition-all flex items-center gap-3 border border-[#1F1F1F]/10"
      >
        {selectedChain && (
          <>
            <div 
              className="w-6 h-6 rounded-full"
              style={{ backgroundColor: selectedChain.color }}
            />
            <span className="text-[#1F1F1F]">{selectedChain.name}</span>
          </>
        )}
        <ChevronDown size={18} className={`text-[#1F1F1F] transition-transform ${isOpen && 'rotate-180'}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 mt-2 w-72 bg-[#EAEADF] rounded-2xl shadow-2xl p-2 z-50 border-2 border-[#1F1F1F]/10"
            >
              <div className="space-y-1">
                {Object.values(SUPPORTED_CHAINS).map((chain) => (
                  <ChainOption
                    key={chain.id}
                    chain={chain}
                    isSelected={chain.id === selectedChainId}
                    onClick={() => {
                      onSwitchChain(chain.id);
                      setIsOpen(false);
                    }}
                  />
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// Chain Option Component
function ChainOption({ 
  chain, 
  isSelected, 
  onClick 
}: { 
  chain: ChainConfig; 
  isSelected: boolean; 
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full p-3 rounded-xl transition-all flex items-center justify-between
        ${isSelected 
          ? 'bg-[#1F1F1F] text-[#EAEADF]' 
          : 'hover:bg-white/50 text-[#1F1F1F]'
        }
      `}
    >
      <div className="flex items-center gap-3">
        <div 
          className="w-8 h-8 rounded-full flex-shrink-0"
          style={{ backgroundColor: chain.color }}
        />
        <div className="text-left">
          <div className="font-bold">{chain.name}</div>
          <div className={`text-xs ${isSelected ? 'opacity-70' : 'opacity-50'}`}>
            {chain.nativeCurrency.symbol}
          </div>
        </div>
      </div>

      {isSelected && <Check size={20} />}
    </button>
  );
}

// Compact Version for Header
function ChainSwitcherCompact({
  selectedChain,
  isOpen,
  onToggle,
  onSelect,
}: {
  selectedChain: ChainConfig | undefined;
  isOpen: boolean;
  onToggle: () => void;
  onSelect: (chainId: number) => void;
}) {
  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className="p-2 rounded-xl bg-white/50 hover:bg-white/80 transition-all flex items-center gap-2"
      >
        {selectedChain && (
          <div 
            className="w-6 h-6 rounded-full"
            style={{ backgroundColor: selectedChain.color }}
          />
        )}
        <ChevronDown size={16} className={`transition-transform ${isOpen && 'rotate-180'}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-40"
              onClick={onToggle}
            />

            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full right-0 mt-2 w-56 bg-[#EAEADF] rounded-xl shadow-2xl p-2 z-50"
            >
              {Object.values(SUPPORTED_CHAINS).map((chain) => (
                <button
                  key={chain.id}
                  onClick={() => {
                    onSelect(chain.id);
                    onToggle();
                  }}
                  className="w-full p-2 rounded-lg hover:bg-white/50 transition-all flex items-center gap-2 text-left"
                >
                  <div 
                    className="w-6 h-6 rounded-full"
                    style={{ backgroundColor: chain.color }}
                  />
                  <span className="text-sm font-bold">{chain.name}</span>
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// Visual Grid Version for Settings
export function ChainSwitcherGrid({ 
  selectedChainId, 
  onSwitchChain 
}: ChainSwitcherProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {Object.values(SUPPORTED_CHAINS).map((chain) => {
        const isSelected = chain.id === selectedChainId;
        
        return (
          <motion.button
            key={chain.id}
            onClick={() => onSwitchChain(chain.id)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`
              p-4 rounded-2xl transition-all border-2
              ${isSelected 
                ? 'bg-[#1F1F1F] text-[#EAEADF] border-[#1F1F1F]' 
                : 'bg-white/50 hover:bg-white/80 border-[#1F1F1F]/10'
              }
            `}
          >
            <div className="flex items-center gap-3 mb-2">
              <div 
                className="w-10 h-10 rounded-full"
                style={{ backgroundColor: chain.color }}
              />
              <div className="text-left flex-1">
                <div className="font-bold text-sm">{chain.name}</div>
                <div className={`text-xs ${isSelected ? 'opacity-70' : 'opacity-50'}`}>
                  {chain.nativeCurrency.symbol}
                </div>
              </div>
              {isSelected && <Check size={20} />}
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
