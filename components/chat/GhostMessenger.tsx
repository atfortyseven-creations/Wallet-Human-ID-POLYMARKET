"use client";

import React from 'react';
import { MessageSquare, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export function GhostMessenger() {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="fixed bottom-8 right-8 z-[100]"
    >
      <Link href="/chat">
        <div className="group relative flex items-center justify-center">
          {/* Pulse Effect */}
          <div className="absolute inset-0 rounded-full bg-[#9945FF]/20 animate-ping group-hover:animate-none opacity-40" />
          
          {/* Main Button */}
          <div className="relative w-16 h-16 bg-[#0a0a0a] rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(153,69,255,0.3)] border border-[#9945FF]/30 transition-all group-hover:scale-110 group-hover:border-[#9945FF] overflow-hidden">
            {/* Glossy Overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10" />
            
            <MessageSquare size={24} className="text-white group-hover:text-[#9945FF] transition-colors" />
            
            {/* Notification Badge */}
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#9945FF] rounded-full border-2 border-[#0a0a0a] flex items-center justify-center">
              <Shield size={10} className="text-white fill-white" />
            </div>
          </div>

          {/* Hover Tooltip */}
          <div className="absolute right-full mr-4 px-4 py-2 bg-[#0a0a0a] border border-white/10 rounded-xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none translate-x-4 group-hover:translate-x-0">
             <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white whitespace-nowrap">
               Open Whale Chat <span className="text-[#9945FF]">E2E</span>
             </p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
