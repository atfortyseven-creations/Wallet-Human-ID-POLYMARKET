"use client";

/**
 * ============================================================
 * HD ACCOUNT MANAGER — BIP-44 Multi-Account View
 * ============================================================
 * Full UI for deriving, scanning, and switching between
 * HD wallet accounts. Real ethers HDNodeWallet. No mocks.
 */

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { ethers } from 'ethers';
import {
  Users, Plus, RefreshCw, Check, ChevronRight, Layers, Search
} from 'lucide-react';
import { useWalletStore, NETWORKS, NetworkId } from '@/lib/store/wallet-store';
import {
  deriveAccountsFromMnemonic,
  scanActiveAccounts,
  DerivedAccount,
} from '@/lib/hd-wallet-engine';

export function HDAccountManager({ onBack }: { onBack: () => void }) {
  const mnemonic = useWalletStore(s => s.mnemonic);
  const address = useWalletStore(s => s.address);
  const activeNetwork = useWalletStore(s => s.activeNetwork);
  const switchAccount = useWalletStore(s => s.switchAccount);
  const addContact = useWalletStore(s => s.addContact);
  const [derived, setDerived] = useState<(DerivedAccount & { balanceEth?: string })[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [isFetchingBalances, setIsFetchingBalances] = useState(false);
  const [showCount, setShowCount] = useState(10);
  const [activeDerivation, setActiveDerivation] = useState<'ethereum' | 'aztecAlpha'>('ethereum');

  const networkInfo = NETWORKS[activeNetwork as NetworkId] || NETWORKS.polygon;

  const deriveAndFetchBalances = useCallback(async (count: number = 10) => {
    if (!mnemonic) {
      toast.error("No seed phrase available. Import a wallet with mnemonic first.");
      return;
    }
    setIsScanning(true);
    setDerived([]);

    try {
      const accounts = deriveAccountsFromMnemonic(mnemonic, count, activeDerivation);
      setDerived(accounts.map(a => ({ ...a })));
      setIsFetchingBalances(true);

      const provider = new ethers.JsonRpcProvider(networkInfo.rpc);

      const withBalances = await Promise.all(
        accounts.map(async (acc) => {
          try {
            const raw = await provider.getBalance(acc.address);
            return {
              ...acc,
              balanceEth: parseFloat(ethers.formatEther(raw)).toFixed(4),
            };
          } catch {
            return { ...acc, balanceEth: '?' };
          }
        })
      );
      setDerived(withBalances);
    } catch (e: any) {
      toast.error("Derivation failed", { description: e.message });
    } finally {
      setIsScanning(false);
      setIsFetchingBalances(false);
    }
  }, [mnemonic, activeDerivation, networkInfo.rpc]);

  const scanForActive = useCallback(async () => {
    if (!mnemonic) {
      toast.error("No seed phrase available.");
      return;
    }
    setIsScanning(true);
    toast.loading("Scanning blockchain for active accounts...", { id: 'scan' });
    try {
      const provider = new ethers.JsonRpcProvider(networkInfo.rpc);
      const active = await scanActiveAccounts(mnemonic, provider, 5, 30);
      if (active.length === 0) {
        toast.info("No active accounts found within gap limit.", { id: 'scan' });
      } else {
        toast.success(`Found ${active.length} active account(s)`, { id: 'scan' });
      }
      const withBalances = await Promise.all(
        active.map(async (acc) => {
          try {
            const raw = await provider.getBalance(acc.address);
            return { ...acc, balanceEth: parseFloat(ethers.formatEther(raw)).toFixed(4) };
          } catch {
            return { ...acc, balanceEth: '?' };
          }
        })
      );
      setDerived(withBalances);
    } catch (e: any) {
      toast.error("Scan failed", { description: e.message, id: 'scan' });
    } finally {
      setIsScanning(false);
    }
  }, [mnemonic, networkInfo.rpc]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex flex-col max-w-3xl mx-auto w-full pt-8 px-6 pb-20 font-mono min-h-[600px]"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-black/10">
        <div className="flex items-center gap-3">
          <Users size={18} className="text-black" strokeWidth={1.5} />
          <div>
            <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-black">HD Account Manager</h2>
            <p className="text-[9px] text-black/40 uppercase tracking-widest">BIP-32 / BIP-39 / BIP-44</p>
          </div>
        </div>
        <button onClick={onBack} className="text-[9px] uppercase tracking-widest font-bold text-black/40 hover:text-black border border-black/10 px-3 py-1.5 hover:border-black transition-all">
          CLOSE
        </button>
      </div>

      {/* Derivation Path Selector */}
      <div className="flex gap-1 mb-6">
        {(['ethereum', 'aztecAlpha'] as const).map(path => (
          <button
            key={path}
            onClick={() => { setActiveDerivation(path); setDerived([]); }}
            className={`px-4 py-2 text-[9px] font-black uppercase tracking-widest border transition-all ${
              activeDerivation === path ? 'bg-black text-white border-black' : 'border-black/10 text-black/40 hover:border-black'
            }`}
          >
            {path === 'ethereum' ? "m/44'/60'/0'" : "Aztec m/44'/60'/1'"}
          </button>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => deriveAndFetchBalances(showCount)}
          disabled={isScanning || !mnemonic}
          className="flex items-center gap-2 px-5 py-3 bg-black text-white text-[9px] font-black uppercase tracking-widest hover:bg-black/80 disabled:opacity-30 transition-all"
        >
          {isScanning ? <RefreshCw size={11} className="animate-spin" /> : <Layers size={11} />}
          Derive {showCount} Accounts
        </button>
        <button
          onClick={scanForActive}
          disabled={isScanning || !mnemonic}
          className="flex items-center gap-2 px-5 py-3 border border-black/10 text-[9px] font-black uppercase tracking-widest hover:border-black text-black disabled:opacity-30 transition-all"
        >
          <Search size={11} /> Auto-Scan Active
        </button>
        <select
          value={showCount}
          onChange={e => setShowCount(Number(e.target.value))}
          className="border border-black/10 px-3 py-2 text-[9px] font-bold uppercase tracking-widest outline-none bg-transparent cursor-pointer hover:border-black transition-all"
        >
          {[5, 10, 20, 50].map(n => <option key={n} value={n}>{n} accounts</option>)}
        </select>
      </div>

      {!mnemonic && (
        <div className="border border-amber-200 bg-amber-50 p-5 text-[10px] font-bold uppercase tracking-widest text-amber-700">
          ATTENTION Seed phrase not available in current session. Unlock vault or import wallet with mnemonic.
        </div>
      )}

      {/* Account List */}
      <div className="space-y-1.5">
        <AnimatePresence>
          {derived.map((acc, i) => (
            <motion.div
              key={acc.path}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 border transition-all ${
                acc.address.toLowerCase() === address?.toLowerCase()
                  ? 'border-black bg-black/[0.02]'
                  : 'border-black/10 hover:border-black/30'
              }`}
            >
              <div className="flex items-center gap-3">
                {acc.address.toLowerCase() === address?.toLowerCase() && (
                  <Check size={12} className="text-emerald-500 shrink-0" />
                )}
                <div>
                  <div className="text-[9px] text-black/40 uppercase tracking-widest">Account {acc.index} · {acc.path}</div>
                  <div className="text-[11px] font-mono text-black mt-0.5">{acc.address}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 mt-2 sm:mt-0">
                <div className="text-right">
                  <div className="text-[9px] text-black/40 uppercase tracking-widest">Balance</div>
                  <div className="text-[11px] font-bold">
                    {isFetchingBalances && !acc.balanceEth ? (
                      <RefreshCw size={10} className="animate-spin" />
                    ) : (
                      `${acc.balanceEth ?? '0'} ${networkInfo.currency}`
                    )}
                  </div>
                </div>
                {acc.address.toLowerCase() !== address?.toLowerCase() && (
                  <button
                    onClick={() => {
                      switchAccount(acc.address);
                      toast.success(`Switched to Account ${acc.index}`);
                    }}
                    className="text-[8px] font-black uppercase tracking-widest border border-black/10 px-3 py-1.5 hover:bg-black hover:text-white hover:border-black transition-all flex items-center gap-1"
                  >
                    USE <ChevronRight size={9} />
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {derived.length === 0 && !isScanning && mnemonic && (
        <div className="flex flex-col items-center justify-center py-16 text-black/20 gap-3">
          <Users size={28} strokeWidth={0.8} />
          <span className="text-[9px] uppercase tracking-widest">Click "Derive Accounts" to begin</span>
        </div>
      )}
    </motion.div>
  );
}
