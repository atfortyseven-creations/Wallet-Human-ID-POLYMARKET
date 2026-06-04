"use client";

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowUpRight, ArrowDownLeft, RefreshCw, ExternalLink,
  ChevronDown, ChevronRight, Loader2, Hash, Clock, Fuel, XCircle, Repeat2
} from 'lucide-react';
import { useReadContract } from 'wagmi';
import { parseAbi, formatEther } from 'viem';

const BG     = "#FFFFFF";
const INK    = "#050505";
const MUTED  = "rgba(5,5,5,0.45)";
const BORDER = "rgba(5,5,5,0.08)";
const CARD   = "#FFFFFF";

//  Chain registry 
const CHAINS = [
  { id: 999999, name: "Humanity Ledger", slug: "humanity",  color: "#050505", symbol: "QDs", explorer: "https://basescan.org",               isQd: true  },
  { id: 1,      name: "Ethereum",        slug: "ethereum",  color: "#627EEA", symbol: "ETH", explorer: "https://etherscan.io",                isQd: false },
  { id: 8453,   name: "Base",            slug: "base",      color: "#0052FF", symbol: "ETH", explorer: "https://basescan.org",               isQd: false },
  { id: 42161,  name: "Arbitrum",        slug: "arbitrum",  color: "#12AAFF", symbol: "ETH", explorer: "https://arbiscan.io",                isQd: false },
  { id: 10,     name: "Optimism",        slug: "optimism",  color: "#FF0420", symbol: "ETH", explorer: "https://optimistic.etherscan.io",    isQd: false },
  { id: 137,    name: "Polygon",         slug: "polygon",   color: "#8247E5", symbol: "POL", explorer: "https://polygonscan.com",            isQd: false },
  { id: 480,    name: "World Chain",     slug: null,        color: "#000000", symbol: "ETH", explorer: "https://worldscan.org",              isQd: false },
];

//  Native transaction shape 
type NativeTx = {
  hash: string;
  from: string;
  to: string;
  value: string;       // wei
  timeStamp: string;
  isError: string;
  gasUsed: string;
  gasPrice: string;
  input: string;
  functionName?: string;
};

//  ERC-20 token transfer shape (tokentx endpoint) 
type TokenTx = {
  hash: string;
  from: string;
  to: string;
  value: string;        // raw amount (18 decimals)
  timeStamp: string;
  isError?: string;
  gasUsed: string;
  gasPrice: string;
  tokenSymbol: string;
  tokenDecimal: string;
  contractAddress: string;
};

//  Unified display type 
type DisplayTx = {
  hash: string;
  from: string;
  to: string;
  amount: string;       // pre-formatted
  symbol: string;
  timeStamp: string;
  isError: boolean;
  gasPrice: string;
  type: "send" | "receive" | "contract";
  explorer: string;
  // Core fields
  coreEntropy?: string;
  payloadHash?: string;
  advancedMetadata?: string;
  blockNumber?: string;
};

//  Helpers 
function formatAge(ts: string) {
  const diff = Date.now() / 1000 - parseInt(ts);
  if (diff < 60)    return `${Math.floor(diff)}s ago`;
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function formatWei(wei: string) {
  const val = parseFloat(wei) / 1e18;
  if (val === 0) return "0";
  if (val < 0.0001) return "<0.0001";
  return val.toFixed(4);
}

function formatToken(raw: string, decimals: number) {
  const val = parseFloat(raw) / Math.pow(10, decimals);
  if (val === 0) return "0";
  if (val < 0.01) return val.toFixed(4);
  return val.toLocaleString('es-ES', { maximumFractionDigits: 2 });
}

function formatGwei(gasPrice: string) {
  const val = parseFloat(gasPrice) / 1e9;
  if (!val || isNaN(val)) return "";
  return val.toFixed(1) + " Gwei";
}

function shortHash(h: string) { return h.slice(0, 8) + "" + h.slice(-6); }
function shortAddr(a: string)  { return a.slice(0, 6) + "" + a.slice(-4); }

// Convert native txlist -> DisplayTx
function nativeToDisplay(tx: NativeTx, address: string, symbol: string, explorer: string): DisplayTx {
  let type: "send" | "receive" | "contract" = "contract";
  if (!tx.input || tx.input === "0x") {
    type = tx.from.toLowerCase() === address.toLowerCase() ? "send" : "receive";
  }
  return {
    hash: tx.hash,
    from: tx.from,
    to: tx.to,
    amount: formatWei(tx.value),
    symbol,
    timeStamp: tx.timeStamp,
    isError: tx.isError === "1",
    gasPrice: tx.gasPrice,
    type,
    explorer,
  };
}

// Convert ERC-20 tokentx -> DisplayTx  (no "contract" type  always send/receive)
function tokenToDisplay(tx: TokenTx, address: string, explorer: string): DisplayTx {
  const decimals = parseInt(tx.tokenDecimal) || 18;
  const type: "send" | "receive" = tx.from.toLowerCase() === address.toLowerCase() ? "send" : "receive";
  return {
    hash: tx.hash,
    from: tx.from,
    to: tx.to,
    amount: formatToken(tx.value, decimals),
    symbol: tx.tokenSymbol || "QDs",
    timeStamp: tx.timeStamp,
    isError: tx.isError === "1",
    gasPrice: tx.gasPrice,
    type,
    explorer,
  };
}

//  Single chain row 
function ChainRow({ chain, address }: { chain: typeof CHAINS[0]; address: string }) {
  const [open, setOpen]       = useState(false);
  const [txs, setTxs]         = useState<DisplayTx[]>([]);
  const [loading, setLoading] = useState(false);
  const [nativeBal, setNativeBal] = useState<string | null>(null);
  const [fetched, setFetched] = useState(false);

  // On-chain QD balance via wagmi (only for Humanity Ledger)
  const { data: qdBalanceRaw } = useReadContract({
    address: (process.env.NEXT_PUBLIC_TOKEN_CONTRACT_ADDRESS || "0x") as `0x${string}`,
    abi: parseAbi(['function balanceOf(address) view returns (uint256)']),
    functionName: 'balanceOf',
    args: [(address || "0x") as `0x${string}`],
    query: { enabled: chain.isQd && !!address },
  });

  const load = useCallback(async () => {
    if (!chain.slug || !address) return;
    setLoading(true);
    try {
      const base = `/api/portfolio/chain-activity?address=${address}&chain=${chain.slug}`;

      if (!chain.isQd) {
        // Native chains: fetch native balance + tx list
        const [balRes, txRes] = await Promise.all([
          fetch(`${base}&type=balance`),
          fetch(`${base}&type=txlist`),
        ]);
        const balData = await balRes.json();
        const txData  = await txRes.json();
        if (balData.status === '1') setNativeBal(balData.result);
        if (txData.status === '1' && Array.isArray(txData.result)) {
          setTxs(txData.result.map((t: NativeTx) => nativeToDisplay(t, address, chain.symbol, chain.explorer!)));
        }
      }
      setFetched(true);
    } catch (e) {
      console.warn(`[ChainActivity] ${chain.name}:`, e);
      setFetched(true);
    } finally {
      setLoading(false);
    }
  }, [chain, address]);

  // Core Receipts via wagmi (only for Humanity Ledger)
  const { data: qdReceiptsRaw, isLoading: loadingReceipts } = useReadContract({
    address: (process.env.NEXT_PUBLIC_TOKEN_CONTRACT_ADDRESS || "0x") as `0x${string}`,
    abi: parseAbi([
      'struct TransferReceipt { address from; address to; uint256 amount; uint256 timestamp; uint256 coreEntropy; bytes advancedMetadata; bytes32 payloadHash; uint256 blockNumber; uint256 gasCost; }',
      'function getUserReceipts(address) view returns (TransferReceipt[])'
    ]),
    functionName: 'getUserReceipts',
    args: [(address || "0x") as `0x${string}`],
    query: { enabled: chain.isQd && !!address && open },
  });

  useEffect(() => {
    if (chain.isQd && qdReceiptsRaw && Array.isArray(qdReceiptsRaw)) {
      try {
        const receipts = [...qdReceiptsRaw].reverse(); // newest first
        setTxs(receipts.map((r: any) => ({
          hash: r.payloadHash || "0x", // Use payloadHash as hash for explorer
          from: r.from || "0x",
          to: r.to || "0x",
          amount: r.amount ? formatToken(r.amount.toString(), 18) : "0",
          symbol: chain.symbol,
          timeStamp: r.timestamp ? r.timestamp.toString() : "0",
          isError: false,
          gasPrice: r.gasCost ? r.gasCost.toString() : "0",
          type: (r.from || "").toLowerCase() === (address || "").toLowerCase() ? "send" : "receive",
          explorer: chain.explorer!,
          coreEntropy: r.coreEntropy ? r.coreEntropy.toString() : "",
          payloadHash: r.payloadHash || "",
          advancedMetadata: r.advancedMetadata || "",
          blockNumber: r.blockNumber ? r.blockNumber.toString() : "0"
        })));
        setFetched(true);
      } catch (err) {
        console.error("Failed to parse Core Receipts", err);
        setTxs([]);
        setFetched(true);
      }
    } else if (chain.isQd && qdReceiptsRaw !== undefined) {
      setTxs([]);
      setFetched(true);
    }
  }, [qdReceiptsRaw, chain.isQd, chain.symbol, chain.explorer, address]);

  useEffect(() => {
    if (!chain.slug) { setFetched(true); return; }
    if (chain.isQd)  { setFetched(false); }          // reset so load fires on expand
    if (open && !fetched) load();
  }, [open, fetched, load, chain.slug, chain.isQd]);

  // Balance shown in the collapsed header row
  let displayBal = "";
  if (chain.isQd) {
    displayBal = qdBalanceRaw
      ? Number(formatEther(qdBalanceRaw as bigint)).toLocaleString('es-ES', { maximumFractionDigits: 2 })
      : "0";
  } else if (nativeBal !== null) {
    displayBal = formatWei(nativeBal);
  }

  const hasActivity = fetched && txs.length > 0;

  return (
    <div className="border rounded-2xl overflow-hidden" style={{ borderColor: BORDER, background: CARD }}>
      {/*  Collapsed header  */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-4 px-5 py-4 hover:bg-black/[0.02] transition-colors text-left"
      >
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-[10px] shrink-0 border"
          style={{ background: `${chain.color}14`, borderColor: `${chain.color}25`, color: chain.color }}
        >
          {chain.symbol}
        </div>

        <div className="flex-1 min-w-0">
          <div className="font-black text-sm" style={{ color: INK }}>{chain.name}</div>
          <div className="text-[10px] font-mono mt-0.5" style={{ color: MUTED }}>
            {chain.isQd ? "Quantum Dots · Ethereum L1" : `Chain ID: ${chain.id}`}
          </div>
        </div>

        <div className="text-right mr-3">
          <div className="font-black text-sm font-mono" style={{ color: INK }}>
            {displayBal} {chain.symbol}
          </div>
          {(fetched || chain.isQd) && (
            <div
              className="text-[9px] font-mono uppercase tracking-wider"
              style={{ color: hasActivity ? "#10b981" : MUTED }}
            >
              {hasActivity ? `${txs.length} txns` : "No activity"}
            </div>
          )}
        </div>

        {(loading || (chain.isQd && loadingReceipts))
          ? <Loader2 size={14} className="animate-spin shrink-0" style={{ color: MUTED }} />
          : open
            ? <ChevronDown size={14} className="shrink-0" style={{ color: MUTED }} />
            : <ChevronRight size={14} className="shrink-0" style={{ color: MUTED }} />
        }
      </button>

      {/*  Expanded transaction list  */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="border-t" style={{ borderColor: BORDER }}>
              {/* sub-header */}
              <div className="flex items-center justify-between px-5 py-3" style={{ background: BG }}>
                <span className="text-[9px] font-mono font-black uppercase tracking-widest" style={{ color: MUTED }}>
                  {chain.isQd ? "QDs Transactions · On-Chain" : "Recent Transactions"}
                </span>
                <div className="flex items-center gap-2">
                  <button onClick={load} className="p-1 rounded-lg hover:bg-black/5 transition-colors" style={{ color: MUTED }}>
                    <RefreshCw size={11} />
                  </button>
                  {chain.explorer && (
                    <a
                      href={`${chain.explorer}/address/${address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest hover:opacity-100 opacity-60 transition-opacity"
                      style={{ color: chain.color === "#050505" ? "#555" : chain.color }}
                    >
                      <ExternalLink size={10} />
                      {chain.isQd ? "BaseScan" : "Explorer"}
                    </a>
                  )}
                </div>
              </div>

              {/* loading */}
              {loading && (
                <div className="py-10 flex items-center justify-center gap-2" style={{ color: MUTED }}>
                  <Loader2 size={16} className="animate-spin" />
                  <span className="text-[11px] font-mono uppercase tracking-widest">
                    {chain.isQd ? "Fetching QDs history..." : "Fetching on-chain data..."}
                  </span>
                </div>
              )}

              {/* World Chain placeholder */}
              {!loading && !chain.slug && (
                <div className="py-10 text-center">
                  <p className="text-[11px] font-mono uppercase tracking-widest" style={{ color: MUTED }}>Explorer coming soon</p>
                </div>
              )}

              {/* no activity */}
              {!loading && fetched && txs.length === 0 && chain.slug && (
                <div className="py-10 text-center space-y-1">
                  <p className="text-[11px] font-mono uppercase tracking-widest" style={{ color: MUTED }}>
                    {chain.isQd ? "No QD transfers found" : "No transactions found"}
                  </p>
                  {chain.isQd && (
                    <p className="text-[9px] font-mono px-8 leading-relaxed" style={{ color: MUTED }}>
                      QD transfers will appear here once the contract is deployed and transactions are confirmed on Base.
                    </p>
                  )}
                </div>
              )}

              {/* transaction rows */}
              {!loading && txs.map((tx, i) => {
                const isErr   = tx.isError;
                const typeColor = tx.type === "send" ? "#f43f5e" : tx.type === "receive" ? "#10b981" : "#8247e5";
                const typeLabel = tx.type === "send" ? "Sent" : tx.type === "receive" ? "Received" : "Contract";
                const TypeIcon  = tx.type === "send" ? ArrowUpRight : tx.type === "receive" ? ArrowDownLeft : Repeat2;

                return (
                  <div
                    key={`${tx.hash}-${i}`}
                    className="flex items-center gap-3 px-5 py-3 border-t hover:bg-black/[0.02] transition-colors"
                    style={{ borderColor: BORDER }}
                  >
                    {/* icon */}
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: `${typeColor}14`, color: typeColor }}
                    >
                      {isErr ? <XCircle size={14} /> : <TypeIcon size={14} />}
                    </div>

                    {/* details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] font-black" style={{ color: isErr ? "#f43f5e" : typeColor }}>
                          {isErr ? "Failed" : typeLabel}
                        </span>
                        {!isErr && tx.amount !== "0" && (
                          <span className="text-[10px] font-mono font-black" style={{ color: INK }}>
                            {tx.amount} {tx.symbol}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="text-[9px] font-mono" style={{ color: MUTED }}>
                          {tx.type === "send" ? ` ${shortAddr(tx.to || "?")}` : ` ${shortAddr(tx.from || "?")}`}
                        </span>
                        <span className="text-[9px] font-mono" style={{ color: MUTED }}>·</span>
                        <span className="text-[9px] font-mono flex items-center gap-0.5" style={{ color: MUTED }}>
                          <Clock size={8} />
                          {formatAge(tx.timeStamp)}
                        </span>
                        {tx.gasPrice && tx.gasPrice !== "0" && (
                          <span className="text-[9px] font-mono hidden sm:flex items-center gap-0.5" style={{ color: MUTED }}>
                            <Fuel size={8} />
                            {formatGwei(tx.gasPrice)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* hash link */}
                    <div className="flex flex-col items-end shrink-0 gap-1">
                      <a
                        href={chain.isQd ? undefined : `${tx.explorer}/tx/${tx.hash}`}
                        target={chain.isQd ? undefined : "_blank"}
                        rel={chain.isQd ? undefined : "noopener noreferrer"}
                        className="text-[9px] font-mono hover:opacity-100 opacity-40 transition-opacity flex items-center gap-1"
                        style={{ color: INK, cursor: chain.isQd ? "default" : "pointer" }}
                        onClick={e => chain.isQd && e.stopPropagation()}
                      >
                        <Hash size={9} />
                        {shortHash(tx.hash)}
                        {!chain.isQd && <ExternalLink size={8} />}
                      </a>
                      
                      {tx.coreEntropy && (
                        <div className="flex flex-col items-end gap-0.5">
                          <span className="text-[7px] font-mono font-black uppercase" style={{ color: "#8247e5" }}>
                            ENTROPY: {shortHash(tx.coreEntropy)}
                          </span>
                          <span className="text-[7px] font-mono" style={{ color: MUTED }}>
                            BLK: {tx.blockNumber}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* footer */}
              {!loading && fetched && txs.length > 0 && chain.explorer && (
                <div className="px-5 py-3 border-t flex items-center justify-center" style={{ borderColor: BORDER, background: BG }}>
                  <a
                    href={`${chain.explorer}/address/${address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[9px] font-mono font-black uppercase tracking-widest flex items-center gap-1 opacity-50 hover:opacity-100 transition-opacity"
                    style={{ color: chain.color === "#050505" ? "#555" : chain.color }}
                  >
                    {chain.isQd ? "View all QD transfers on BaseScan" : `View all on ${chain.name} Explorer`}
                    <ExternalLink size={9} />
                  </a>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

//  Main exported component 
export function ChainActivityPanel({ address }: { address: string }) {
  return (
    <div className="rounded-3xl border overflow-hidden" style={{ borderColor: BORDER, background: CARD }}>
      <div className="px-6 py-5 border-b flex items-center gap-3" style={{ borderColor: BORDER }}>
        <div className="w-1 h-5 rounded-full" style={{ background: INK }} />
        <h2 className="font-black uppercase tracking-tight text-sm" style={{ color: INK }}>Chain Activity</h2>
        <span
          className="px-2 py-0.5 rounded-full text-[9px] font-mono font-black border"
          style={{ borderColor: BORDER, color: MUTED }}
        >
          {CHAINS.length} networks
        </span>
      </div>
      <div className="p-4 flex flex-col gap-2">
        {CHAINS.map(chain => (
          <ChainRow key={chain.id} chain={chain} address={address} />
        ))}
      </div>
    </div>
  );
}
