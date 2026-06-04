"use client";

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ExternalLink, Activity, PlayCircle, Layers, Zap } from 'lucide-react';

interface ActionOption {
  label: string;
  desc: string;
  icon?: React.ReactNode;
  onClick: () => void;
  badge?: string;
}

interface LegendaryActionMenuProps {
  label: string;
  mainIcon: React.ReactNode;
  onMainClick: () => void;
  options: ActionOption[];
}

export default function LegendaryActionMenu({ label, mainIcon, onMainClick, options }: LegendaryActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`flex flex-col items-center justify-center gap-2 aspect-square w-[72px] rounded-[1.5rem] transition-all duration-300 ${isOpen ? 'bg-white text-[#1F1F1F] shadow-xl shadow-black/5 scale-105' : 'bg-[#1F1F1F]/5 text-[#1F1F1F]/60 hover:bg-white hover:text-[#1F1F1F] hover:shadow-lg hover:scale-105'}`}
      >
        <div className="relative">
             {mainIcon}
             {options.length > 0 && (
                <div className="absolute -bottom-1 -right-1">
                    <ChevronDown size={10} className={`text-[#1F1F1F]/40 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </div>
             )}
        </div>
        <span className="text-[8px] font-black uppercase tracking-[0.2em]">{label}</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 mt-3 w-64 bg-[#1F1F1F] p-2 rounded-[1.5rem] shadow-2xl shadow-black/20 z-50 border border-white/5 backdrop-blur-xl"
            style={{ marginLeft: '-80px' }} // Simple centering adjustment
          >
             <div className="flex flex-col gap-1">
                <div className="px-3 py-2 border-b border-white/5 mb-1 flex items-center justify-between">
                    <span className="text-[9px] font-black uppercase tracking-widest text-white/40">Select Action</span>
                    <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">Active</span>
                </div>

                {/* Primary Action */}
                <button 
                  onClick={() => { onMainClick(); setIsOpen(false); }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-left group"
                >
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                        <Zap size={14} />
                    </div>
                    <div>
                        <div className="text-xs font-black text-white uppercase tracking-wider">Standard {label}</div>
                        <div className="text-[9px] font-medium text-white/40">Default execution route</div>
                    </div>
                </button>

                {options.map((opt, i) => (
                    <button 
                        key={i}
                        onClick={() => { opt.onClick(); setIsOpen(false); }}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors text-left group"
                    >
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/60 group-hover:text-white group-hover:bg-white/10 transition-all">
                            {opt.icon || <Activity size={14} />}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center justify-between">
                                <div className="text-xs font-bold text-white/80 group-hover:text-white transition-colors">{opt.label}</div>
                                {opt.badge && (
                                    <span className="text-[8px] font-black bg-purple-500 text-white px-1.5 py-0.5 rounded uppercase tracking-wider">{opt.badge}</span>
                                )}
                            </div>
                            <div className="text-[9px] font-medium text-white/30 group-hover:text-white/50 transition-colors">{opt.desc}</div>
                        </div>
                    </button>
                ))}
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

