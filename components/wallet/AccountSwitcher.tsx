"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Plus, Wallet, Eye, Check, Settings } from 'lucide-react';
import { getAccountColor, type WalletAccount } from '@/lib/wallet/accounts';

interface AccountSwitcherProps {
  currentAddress: string;
  onSwitch: (address: string) => void;
  onAddAccount: () => void;
  onAddWatchOnly: () => void;
  onDeleteAccount: (address: string) => void;
  accounts: WalletAccount[];
}

export default function AccountSwitcher({ 
  currentAddress, 
  onSwitch, 
  onAddAccount, 
  onAddWatchOnly,
  onDeleteAccount,
  accounts 
}: AccountSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedAccount = accounts.find(a => a.address === currentAddress) || accounts[0];

  if (!selectedAccount) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1.5 pr-3 bg-white/50 hover:bg-white/80 rounded-full transition-all border border-[#1F1F1F]/10"
      >
        <div 
          className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs"
          style={{ background: getAccountColor(selectedAccount.address) }}
        >
          {selectedAccount.name[0].toUpperCase()}
        </div>
        <div className="text-left hidden md:block">
          <div className="text-xs font-bold text-[#1F1F1F] leading-tight">{selectedAccount.name}</div>
          <div className="text-[10px] text-[#1F1F1F]/60 font-mono">
            {selectedAccount.address.slice(0, 6)}...{selectedAccount.address.slice(-4)}
          </div>
        </div>
        <Users size={14} className="text-[#1F1F1F]/50" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px]" 
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="absolute top-12 left-0 w-80 bg-[#EAEADF] rounded-2xl shadow-2xl border border-[#1F1F1F]/10 z-50 overflow-hidden"
            >
              <div className="p-3 border-b border-[#1F1F1F]/10 bg-white/30 flex justify-between items-center">
                <span className="text-sm font-black text-[#1F1F1F]">My Accounts</span>
              </div>

              <div className="max-h-[60vh] overflow-y-auto p-2 space-y-1 custom-scrollbar">
                {accounts.map((account) => (
                  <div key={account.address} className="flex items-center gap-1">
                    <button
                      key={account.address}
                      onClick={() => {
                        onSwitch(account.address);
                        setIsOpen(false);
                      }}
                      className={`flex-1 p-2 flex items-center gap-3 rounded-xl transition-all ${
                        account.address === currentAddress
                          ? 'bg-white shadow-sm'
                          : 'hover:bg-white/50'
                      }`}
                    >
                      <div 
                        className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm shrink-0"
                        style={{ background: getAccountColor(account.address) }}
                      >
                        {account.name[0].toUpperCase()}
                      </div>
                      
                      <div className="flex-1 text-left min-w-0">
                        <div className="text-sm font-bold text-[#1F1F1F] truncate flex items-center gap-1">
                          {account.name}
                          {account.type === 'WATCH_ONLY' && (
                            <Eye size={10} className="text-[#1F1F1F]/50" />
                          )}
                        </div>
                        <div className="text-[10px] text-[#1F1F1F]/50 font-mono truncate">
                          {account.address.slice(0, 10)}...{account.address.slice(-8)}
                        </div>
                      </div>

                      {account.address === currentAddress && (
                        <Check size={14} className="text-green-600 shrink-0" />
                      )}
                    </button>

                    {account.type !== 'PRIMARY' && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteAccount(account.address);
                        }}
                        className="p-2 text-red-500/30 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        title="Delete account"
                      >
                         <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="p-2 border-t border-[#1F1F1F]/10 bg-white/30 grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    onAddAccount();
                    setIsOpen(false);
                  }}
                  className="p-2 flex items-center justify-center gap-2 rounded-xl hover:bg-white/50 transition-all text-xs font-bold text-[#1F1F1F]"
                >
                  <Plus size={14} />
                  New Account
                </button>
                <button
                  onClick={() => {
                    onAddWatchOnly();
                    setIsOpen(false);
                  }}
                  className="p-2 flex items-center justify-center gap-2 rounded-xl hover:bg-white/50 transition-all text-xs font-bold text-[#1F1F1F]"
                >
                  <Eye size={14} />
                  Watch Wallet
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
