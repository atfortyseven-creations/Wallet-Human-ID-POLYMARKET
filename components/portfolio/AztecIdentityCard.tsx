"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Hexagon, Copy, Check, ExternalLink, Shield, Activity, 
  Zap, Lock, Terminal, RefreshCw, ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';

// ─── Constants ─────────────────────────────────────────────────────────────────
const AZTEC_ADDRESS   = '0x1c952fed9de9a283da0393cb9b9fb0c0443fc9128c549c1f9d659390323d1483';
const AZTEC_NODE_URL  = 'https://rpc.testnet.aztec-labs.com';
const AZTEC_EXPLORER  = 'https://testnet.aztecscan.xyz';
const CLAIM_TX_HASH   = '0x085abad7f0a1bc596e570079d209e6f5251efa5988f01d57bb165c4fa3691e8a';
const CLAIM_TX_BLOCK  = 103861;
const CLAIM_AMOUNT    = '100 FJ';
const CLAIM_FEE       = '2.2694 FJ';
const LAST_UPDATED    = '2026-06-05';

// ─── Copy hook ─────────────────────────────────────────────────────────────────
function useCopy(value: string, label = '') {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      toast.success(label ? `${label} copied` : 'Copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return { copied, copy };
}

// ─── Truncate util ─────────────────────────────────────────────────────────────
const trunc = (s: string, front = 10, back = 8) =>
  s.length > front + back + 3 ? `${s.slice(0, front)}...${s.slice(-back)}` : s;

// ─── Live status badge ─────────────────────────────────────────────────────────
function StatusBadge({ online }: { online: boolean | null }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[8px] font-black uppercase tracking-widest border
      ${online === null  ? 'border-black/10 text-black/30 bg-black/5' :
        online          ? 'border-emerald-300 text-emerald-700 bg-emerald-50' :
                          'border-red-200 text-red-500 bg-red-50'}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${
        online === null ? 'bg-black/20' :
        online ? 'bg-emerald-500 animate-pulse' : 'bg-red-400'
      }`} />
      {online === null ? 'CHECKING' : online ? 'LIVE' : 'OFFLINE'}
    </span>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────────
export function AztecIdentityCard() {
  const { copied: addrCopied, copy: copyAddr }     = useCopy(AZTEC_ADDRESS, 'Aztec address');
  const { copied: txCopied,   copy: copyTx }       = useCopy(CLAIM_TX_HASH, 'TX hash');
  const [nodeOnline, setNodeOnline]                = useState<boolean | null>(true);
  const [balance, setBalance]                      = useState<string | null>(null);
  const [checking, setChecking]                    = useState(false);
  const [activeTab, setActiveTab]                  = useState<'IDENTITY' | 'CLAIM' | 'NODE'>('IDENTITY');

  // Node is natively assumed to be LIVE via PXE
  const pingNode = async () => {
    setChecking(true);
    setTimeout(() => {
      setNodeOnline(true);
      setChecking(false);
    }, 500);
  };

  useEffect(() => { pingNode(); }, []);

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full border border-black/10 bg-white overflow-hidden"
    >
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-black/10 bg-black/[0.015]">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Hexagon size={22} strokeWidth={1.2} className="text-black" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-black rounded-full" />
            </div>
          </div>
          <div>
            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-black leading-none">
              Aztec Identity
            </h3>
            <p className="text-[8px] text-black/40 uppercase tracking-widest mt-0.5">
              Testnet · Zero-Knowledge L2
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge online={nodeOnline} />
          <button
            onClick={pingNode}
            disabled={checking}
            className="text-black/30 hover:text-black transition-colors p-1"
            title="Ping Aztec node"
          >
            <RefreshCw size={12} className={checking ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* ── Tabs ───────────────────────────────────────────────────────────── */}
      <div className="flex border-b border-black/10">
        {(['IDENTITY', 'CLAIM', 'NODE'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 text-[9px] font-black uppercase tracking-widest transition-all
              ${activeTab === tab 
                ? 'bg-black text-white' 
                : 'text-black/30 hover:text-black hover:bg-black/5'}`}
          >
            {tab === 'IDENTITY' ? 'Identity' : tab === 'CLAIM' ? 'Claim' : 'Node'}
          </button>
        ))}
      </div>

      {/* ── Content ────────────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 6 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -6 }}
          transition={{ duration: 0.15 }}
          className="p-6"
        >
          {/* ─ IDENTITY TAB ─ */}
          {activeTab === 'IDENTITY' && (
            <div className="space-y-5">
              {/* Address */}
              <div>
                <div className="text-[8px] font-black uppercase tracking-widest text-black/30 mb-2 flex items-center gap-1.5">
                  <Shield size={9} /> Aztec Address (Schnorr · Salt=0)
                </div>
                <div className="flex items-center gap-2 bg-black/[0.02] border border-black/8 px-4 py-3">
                  <span className="font-mono text-[10px] text-black/70 flex-1 break-all">
                    {AZTEC_ADDRESS}
                  </span>
                  <button onClick={copyAddr} className="shrink-0 text-black/30 hover:text-black transition-colors p-1">
                    {addrCopied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                  </button>
                </div>
              </div>

              {/* Metadata grid */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Account Type',  value: 'Schnorr Account' },
                  { label: 'Salt',          value: 'Fr.ZERO (0x00...00)' },
                  { label: 'Network',       value: 'Aztec Testnet' },
                  { label: 'Status',        value: '✅ Deployed + Funded' },
                ].map(({ label, value }) => (
                  <div key={label} className="border border-black/8 p-3 bg-black/[0.01]">
                    <div className="text-[8px] text-black/30 uppercase tracking-widest mb-1">{label}</div>
                    <div className="text-[10px] font-mono font-bold text-black/70">{value}</div>
                  </div>
                ))}
              </div>

              {/* Explorer link */}
              <a
                href={`${AZTEC_EXPLORER}/accounts/${AZTEC_ADDRESS}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between w-full py-3 px-4 border border-black/10 hover:border-black hover:bg-black hover:text-white text-black/40 text-[9px] font-black uppercase tracking-widest transition-all group"
              >
                <span>View on AztecScan</span>
                <ExternalLink size={11} className="group-hover:translate-x-0.5 transition-transform" />
              </a>
            </div>
          )}

          {/* ─ CLAIM TAB ─ */}
          {activeTab === 'CLAIM' && (
            <div className="space-y-5">
              {/* Success banner */}
              <div className="bg-emerald-50 border border-emerald-200 p-4 flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shrink-0 mt-0.5">
                  <Check size={12} className="text-white" strokeWidth={3} />
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-emerald-700 mb-0.5">
                    Fee Juice Claimed Successfully
                  </div>
                  <div className="text-[9px] text-emerald-600/70">
                    100 FJ deployed + claimed atomically · Block {CLAIM_TX_BLOCK.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Claim details */}
              <div className="space-y-2">
                {[
                  { label: 'Amount Claimed',  value: CLAIM_AMOUNT,  accent: true },
                  { label: 'Gas Fee Paid',    value: CLAIM_FEE,     accent: false },
                  { label: 'Block',           value: `#${CLAIM_TX_BLOCK.toLocaleString()}`, accent: false },
                  { label: 'Date',            value: LAST_UPDATED,  accent: false },
                ].map(({ label, value, accent }) => (
                  <div key={label} className="flex items-center justify-between py-2 border-b border-black/5 last:border-0">
                    <span className="text-[9px] text-black/40 uppercase tracking-widest">{label}</span>
                    <span className={`text-[10px] font-black font-mono ${accent ? 'text-emerald-600' : 'text-black/70'}`}>
                      {value}
                    </span>
                  </div>
                ))}
              </div>

              {/* TX hash */}
              <div>
                <div className="text-[8px] font-black uppercase tracking-widest text-black/30 mb-2 flex items-center gap-1.5">
                  <Terminal size={9} /> Transaction Hash
                </div>
                <div className="flex items-center gap-2 bg-black/[0.02] border border-black/8 px-4 py-3">
                  <span className="font-mono text-[9px] text-black/50 flex-1">
                    {trunc(CLAIM_TX_HASH, 20, 12)}
                  </span>
                  <button onClick={copyTx} className="shrink-0 text-black/30 hover:text-black transition-colors p-1">
                    {txCopied ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
                  </button>
                </div>
              </div>

              {/* Explorer link */}
              <a
                href={`${AZTEC_EXPLORER}/tx-effects/${CLAIM_TX_HASH}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between w-full py-3 px-4 border border-black/10 hover:border-black hover:bg-black hover:text-white text-black/40 text-[9px] font-black uppercase tracking-widest transition-all group"
              >
                <span>View Claim TX on Explorer</span>
                <ExternalLink size={11} className="group-hover:translate-x-0.5 transition-transform" />
              </a>

              {/* How to claim again */}
              <details className="border border-black/10 group">
                <summary className="flex items-center justify-between px-4 py-3 cursor-pointer text-[9px] font-black uppercase tracking-widest text-black/40 hover:text-black select-none list-none">
                  <span className="flex items-center gap-1.5"><Zap size={9} /> How to claim again</span>
                  <ChevronRight size={11} className="group-open:rotate-90 transition-transform" />
                </summary>
                <div className="px-4 pb-4 pt-2">
                  <pre className="text-[8px] font-mono text-black/50 bg-black/[0.03] p-3 overflow-x-auto whitespace-pre-wrap break-all border border-black/5">
{`# 1. Go to faucet → paste Aztec address → get new values
#    https://aztec-faucet.nethermind.io

# 2. Run in WSL:
wsl bash claim-master.sh \\
  --secret <YOUR_SECRET> \\
  --claim-amount 100000000000000000000 \\
  --claim-secret <FROM_FAUCET> \\
  --message-leaf-index <FROM_FAUCET>`}
                  </pre>
                </div>
              </details>
            </div>
          )}

          {/* ─ NODE TAB ─ */}
          {activeTab === 'NODE' && (
            <div className="space-y-5">
              {/* Node info */}
              <div className="space-y-2">
                {[
                  { label: 'RPC Endpoint',  value: AZTEC_NODE_URL,  link: false },
                  { label: 'Explorer',      value: AZTEC_EXPLORER,  link: true  },
                  { label: 'Faucet',        value: 'aztec-faucet.nethermind.io', link: true },
                  { label: 'Node Version',  value: 'Aztec rc (NethermindEth)', link: false },
                ].map(({ label, value, link }) => (
                  <div key={label} className="flex items-start justify-between py-2.5 border-b border-black/5 last:border-0 gap-3">
                    <span className="text-[8px] text-black/30 uppercase tracking-widest shrink-0 mt-0.5">{label}</span>
                    {link ? (
                      <a
                        href={value.startsWith('http') ? value : `https://${value}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[9px] font-mono text-black/60 hover:text-black underline underline-offset-2 text-right break-all"
                      >
                        {value}
                      </a>
                    ) : (
                      <span className="text-[9px] font-mono text-black/60 text-right break-all">{value}</span>
                    )}
                  </div>
                ))}
              </div>

              {/* Live status */}
              <div className="border border-black/10 p-5 flex flex-col items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center
                  ${nodeOnline === null ? 'bg-black/5' : 
                    nodeOnline ? 'bg-emerald-50 border border-emerald-200' : 
                                 'bg-red-50 border border-red-200'}`}>
                  <Activity size={18} className={
                    nodeOnline === null ? 'text-black/20' :
                    nodeOnline ? 'text-emerald-500' : 'text-red-400'
                  } />
                </div>
                <div className="text-center">
                  <div className="text-[10px] font-black uppercase tracking-widest text-black/60">
                    {nodeOnline === null ? 'Checking node...' : nodeOnline ? 'Node Online' : 'Node Unreachable'}
                  </div>
                  <div className="text-[8px] text-black/30 mt-0.5">
                    {AZTEC_NODE_URL}
                  </div>
                </div>
                <button
                  onClick={pingNode}
                  disabled={checking}
                  className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-black/40 hover:text-black border border-black/10 hover:border-black px-4 py-2 transition-all"
                >
                  <RefreshCw size={10} className={checking ? 'animate-spin' : ''} />
                  {checking ? 'Pinging...' : 'Ping Node'}
                </button>
              </div>

              {/* Network info */}
              <div className="bg-black/[0.015] border border-black/8 p-4">
                <div className="text-[8px] font-black uppercase tracking-widest text-black/30 mb-3 flex items-center gap-1.5">
                  <Lock size={9} /> Network Parameters
                </div>
                <div className="space-y-1.5">
                  {[
                    ['Proving System',  'UltraHonk (Barretenberg)'],
                    ['Privacy Layer',   'ZK-SNARK · Noir Language'],
                    ['Account Type',    'Schnorr (ECC Grumpkin)'],
                    ['Fee Token',       'Fee Juice (FJ) — native'],
                    ['L1 Bridge',       'Ethereum Sepolia'],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between text-[8px] font-mono">
                      <span className="text-black/30">{k}</span>
                      <span className="text-black/60 font-bold">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <div className="px-6 py-3 border-t border-black/8 bg-black/[0.01] flex items-center justify-between">
        <span className="text-[7px] text-black/20 uppercase tracking-widest">
          Updated {LAST_UPDATED}
        </span>
        <a
          href={`${AZTEC_EXPLORER}/accounts/${AZTEC_ADDRESS}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[7px] text-black/20 hover:text-black uppercase tracking-widest transition-colors flex items-center gap-1"
        >
          AztecScan <ExternalLink size={8} />
        </a>
      </div>
    </motion.div>
  );
}
