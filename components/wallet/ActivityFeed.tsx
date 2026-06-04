"use client";

import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownLeft, Clock, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: number;
  asset: string;
  category: string;
  blockNum: string;
  direction: 'IN' | 'OUT';
  chainId: number;
}

export default function ActivityFeed({ history }: { history: Transaction[] }) {
  if (!history || history.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-[#1F1F1F]/40 border border-dashed border-[#1F1F1F]/10 rounded-[2.5rem]">
            <Clock size={48} className="mb-4 opacity-50" />
            <p className="font-black uppercase tracking-widest text-xs">No Recent Activity</p>
        </div>
    );
  }

  return (
    <div className="space-y-4">
      {history.map((tx, i) => {
         const isOut = tx.direction === 'OUT';
         return (
            <motion.div
               key={tx.hash + i}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: i * 0.05 }}
               className="flex items-center justify-between p-5 bg-white border border-transparent hover:border-[#1F1F1F]/5 rounded-[2rem] hover:shadow-lg hover:shadow-black/[0.02] transition-all group"
            >
               <div className="flex items-center gap-4">
                 <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isOut ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                    {isOut ? <ArrowUpRight size={20} /> : <ArrowDownLeft size={20} />}
                 </div>
                 <div>
                    <div className="text-sm font-black text-[#1F1F1F]">
                        {isOut ? 'Sent' : 'Received'} {tx.asset}
                    </div>
                    <div className="text-[10px] font-bold text-[#1F1F1F]/40 uppercase tracking-widest">
                        {isOut ? `To: ${tx.to.slice(0,6)}...${tx.to.slice(-4)}` : `From: ${tx.from.slice(0,6)}...${tx.from.slice(-4)}`}
                    </div>
                 </div>
               </div>

               <div className="text-right">
                  <div className={`text-sm font-black ${isOut ? 'text-[#1F1F1F]' : 'text-emerald-600'}`}>
                     {isOut ? '-' : '+'}{parseFloat(tx.value?.toString() || '0').toFixed(4)} {tx.asset}
                  </div>
                  <a 
                    href={`https://etherscan.io/tx/${tx.hash}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center justify-end gap-1 text-[10px] font-bold text-[#1F1F1F]/30 uppercase hover:text-purple-600 transition-colors"
                  >
                    View Tx <ExternalLink size={8} />
                  </a>
               </div>
            </motion.div>
         );
      })}
    </div>
  );
}

