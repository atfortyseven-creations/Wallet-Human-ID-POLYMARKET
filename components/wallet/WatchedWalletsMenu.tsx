'use client';

import React from 'react';
import useSWR from 'swr';
import { useRouter } from 'next/navigation';
import { Wallet, Loader2, ArrowRight } from 'lucide-react';
import { useUIStore } from '@/lib/store/ui-store';

const fetcher = ([url, address]: [string, string]) => 
  fetch(url, {
    headers: { 'x-web3-address': address || '' }
  }).then((r) => r.json());

export function WatchedWalletsMenu({ onClose, userAddress }: { onClose?: () => void, userAddress?: string }) {
  const router = useRouter();
  // Poll every 5 seconds for "Real-time" feel as requested
  const { data, error, isLoading } = useSWR(
    userAddress ? ['/api/premium/watched-wallets', userAddress] : null, 
    fetcher, 
    {
      refreshInterval: 5000, 
    }
  );

  const wallets = data?.wallets || [];
  const count = data?.count || 0;

  const handleSelectWallet = (address: string) => {
    // Navigate to wallet view with specific address query or set context
    // For now, assume /wallet?view=address
    router.push(`/wallet?address=${address}`);
    if (onClose) onClose();
  };

  if (isLoading && wallets.length === 0) {
    return (
      <div className="p-4 flex items-center justify-center text-gray-500">
        <Loader2 className="animate-spin w-5 h-5" />
      </div>
    );
  }

  if (error) {
    return (
        <div className="p-4 text-xs text-red-400">
            Error loading wallets
        </div>
    );
  }

  if (wallets.length === 0) {
    return (
        <div className="p-4 text-center text-gray-500 text-sm">
            No watched wallets
        </div>
    );
  }

  return (
    <div className="py-2">
      <div className="px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
        Watched Wallets ({count})
      </div>
      <div className="space-y-1">
        {wallets.map((wallet: any) => (
          <button
            key={wallet.id}
            onClick={() => handleSelectWallet(wallet.address)}
            className="w-full px-4 py-2 text-left hover:bg-white/5 transition-colors flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
                <div className="p-1.5 bg-purple-500/10 rounded-lg group-hover:bg-purple-500/20 transition-colors">
                    <Wallet size={14} className="text-purple-400" />
                </div>
                <div>
                    <p className="text-sm font-medium text-gray-200 group-hover:text-white truncate max-w-[120px]">
                        {wallet.label || 'Unknown Wallet'}
                    </p>
                    <p className="text-[10px] text-gray-500 font-mono">
                        ${wallet.lastValue?.toLocaleString(undefined, { maximumFractionDigits: 0 }) || '0'}
                    </p>
                </div>
            </div>
            <ArrowRight size={14} className="text-gray-600 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
          </button>
        ))}
      </div>
    </div>
  );
}

