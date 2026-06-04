"use client";

import { ArrowUpRight, ArrowDownLeft, Clock, ExternalLink, Globe, Zap } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { safeToLocaleString } from '@/lib/utils/number-format';
import { getExplorerUrl } from '@/lib/chains';

interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: number;
  asset: string;
  type: 'SEND' | 'RECEIVE' | 'SWAP' | 'BRIDGE';
  status: 'PENDING' | 'CONFIRMED' | 'FAILED';
  chainId: number;
  timestamp: Date;
}

export function LegendaryActivityFeed({ history }: { history: Transaction[] }) {
  if (!history || history.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center py-16 bg-transparent">
            <Clock size={32} className="mb-3 text-zinc-600" />
            <p className="font-medium text-sm text-zinc-500">No recent transactions</p>
        </div>
    );
  }

  return (
    <div className="divide-y divide-white/5">
      {history.map((tx, i) => {
         const isOut = tx.type === 'SEND' || tx.type === 'SWAP' || tx.type === 'BRIDGE';
         const statusColor = tx.status === 'CONFIRMED' ? 'text-emerald-500' : tx.status === 'FAILED' ? 'text-red-500' : 'text-yellow-500';
         
         return (
            <div
               key={tx.hash + i}
               className="group flex items-center justify-between p-4 bg-transparent hover:bg-white/5 transition-colors"
            >
               <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-white/5 border border-white/10 ${isOut ? 'text-zinc-300' : 'text-emerald-400'}`}>
                     {tx.type === 'SWAP' ? <Zap size={16} /> : tx.type === 'BRIDGE' ? <Globe size={16} /> : isOut ? <ArrowUpRight size={16} /> : <ArrowDownLeft size={16} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-bold tracking-tight text-white uppercase drop-shadow-md">
                            {tx.type} {tx.asset}
                        </span>
                        {tx.status === 'PENDING' && <LoaderPulse />}
                    </div>
                    <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5">
                        {tx.chainId === 1 ? 'Mainnet' : tx.chainId === 137 ? 'Polygon' : tx.chainId === 8453 ? 'Base' : tx.chainId === 480 ? 'WorldChain' : tx.chainId === 42161 ? 'Arbitrum' : 'Optimism'}  {formatDistanceToNow(new Date(tx.timestamp))}
                    </div>
                  </div>
               </div>

               <div className="text-right">
                  <div className={`text-sm font-bold tracking-tight drop-shadow-md ${isOut ? 'text-white' : 'text-emerald-400'}`}>
                     {isOut ? '-' : '+'}{safeToLocaleString(tx.value, { minimumFractionDigits: 2, maximumFractionDigits: 4 })} {tx.asset}
                  </div>
                  <div className="flex items-center justify-end gap-1.5 mt-1">
                      <span className={`text-[9px] font-bold uppercase tracking-widest ${statusColor} drop-shadow-sm`}>
                          {tx.status}
                      </span>
                       <a 
                         href={getExplorerUrl(tx.chainId, tx.hash, 'tx')} 
                         target="_blank" 
                         rel="noreferrer"
                         className="text-zinc-600 hover:text-white transition-colors"
                       >
                         <ExternalLink size={12} />
                       </a>
                  </div>
               </div>
            </div>
         );
      })}
    </div>
  );
}

function LoaderPulse() {
    return (
        <span className="flex h-1.5 w-1.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-yellow-500"></span>
        </span>
    );
}

