"use client";

import { motion } from 'framer-motion';
import { Zap, Clock, TrendingUp } from 'lucide-react';
import { type GasEstimate } from '@/lib/wallet/gas';

interface GasSelectorProps {
  gasEstimate: GasEstimate;
  selected: 'slow' | 'normal' | 'fast';
  onSelect: (speed: 'slow' | 'normal' | 'fast') => void;
}

export default function GasSelector({ gasEstimate, selected, onSelect }: GasSelectorProps) {
  const options = [
    {
      speed: 'slow' as const,
      icon: Clock,
      label: 'Slow',
      color: '#64748b',
    },
    {
      speed: 'normal' as const,
      icon: Zap,
      label: 'Normal',
      color: '#1F1F1F',
    },
    {
      speed: 'fast' as const,
      icon: TrendingUp,
      label: 'Fast',
      color: '#10b981',
    },
  ];

  return (
    <div className="bg-[#EAEADF] rounded-2xl p-4 space-y-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold text-[#1F1F1F] text-sm">Gas Fee</h3>
        <span className="text-xs text-[#1F1F1F]/70">Choose speed</span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {options.map(({ speed, icon: Icon, label, color }) => {
          const isSelected = selected === speed;
          const estimate = gasEstimate[speed];

          return (
            <motion.button
              key={speed}
              onClick={() => onSelect(speed)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`
                relative p-4 rounded-xl transition-all
                ${isSelected 
                  ? 'bg-[#1F1F1F] text-[#EAEADF] shadow-lg' 
                  : 'bg-white/50 hover:bg-white/80 text-[#1F1F1F]'
                }
              `}
            >
              {/* Selection Indicator */}
              {isSelected && (
                <motion.div
                  layoutId="gas-selector"
                  className="absolute inset-0 bg-[#1F1F1F] rounded-xl"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}

              <div className="relative z-10 space-y-2">
                {/* Icon */}
                <Icon 
                  size={20} 
                  className="mx-auto"
                  style={{ color: isSelected ? '#EAEADF' : color }}
                />

                {/* Label */}
                <div className="font-bold text-sm">{label}</div>

                {/* Time */}
                <div className={`text-xs ${isSelected ? 'opacity-80' : 'opacity-60'}`}>
                  {estimate.estimatedTime}
                </div>

                {/* Cost */}
                <div className="font-black text-sm">
                  ${estimate.totalCostUSD}
                </div>

                {/* ETH Cost */}
                <div className={`text-xs ${isSelected ? 'opacity-70' : 'opacity-50'}`}>
                  {parseFloat(estimate.totalCost).toFixed(6)} ETH
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Info Text */}
      <div className="text-xs text-[#1F1F1F]/60 text-center pt-2">
        Gas prices update in real-time based on network conditions
      </div>
    </div>
  );
}

// Compact version for inline use
export function GasSelectorCompact({ gasEstimate, selected, onSelect }: GasSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-[#1F1F1F]/70">Gas:</span>
      <div className="flex gap-1">
        {(['slow', 'normal', 'fast'] as const).map((speed) => (
          <button
            key={speed}
            onClick={() => onSelect(speed)}
            className={`
              px-3 py-1.5 rounded-lg text-xs font-bold transition-all
              ${selected === speed
                ? 'bg-[#1F1F1F] text-[#EAEADF]'
                : 'bg-white/50 hover:bg-white/80 text-[#1F1F1F]'
              }
            `}
          >
            ${gasEstimate[speed].totalCostUSD}
          </button>
        ))}
      </div>
    </div>
  );
}
