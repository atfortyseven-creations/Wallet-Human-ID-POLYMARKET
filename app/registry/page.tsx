"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { createPublicClient, http } from "viem";
import {
  mainnet,
  polygon,
  optimism,
  base,
  arbitrum,
  bsc,
  sepolia,
  baseSepolia,
  optimismSepolia,
  zkSync,
  polygonZkEvm,
  zkSyncSepoliaTestnet,
  polygonZkEvmCardona,
} from "viem/chains";
import { motion, AnimatePresence } from "framer-motion";
import {
  Copy,
  Search,
  RefreshCw,
  Sun,
  Moon,
  ChevronDown,
  ExternalLink,
  Activity,
  Shield,
  Database,
  Network,
  Wallet,
  CheckCircle2,
  Globe,
  Hash,
  Layers,
  ChevronLeft,
  ChevronRight,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { RealWorldMap } from "@/components/landing/RealWorldMap";
import { SystemFooter } from "@/components/landing/SystemFooter";

// ─── Chain Configurations ──────────────────────────────────────────────────────

const MAINNET_CHAINS = [
  {
    chain: mainnet,
    label: "Ethereum",
    badge: "ETH",
    color: "#000000",
    rpc: "https://eth-mainnet.g.alchemy.com/v2/p2MK6Y8eQyHPbS5gQZ7TU",
    explorer: "https://etherscan.io",
  },
  {
    chain: polygon,
    label: "Polygon",
    badge: "MATIC",
    color: "#000000",
    rpc: "https://polygon-mainnet.g.alchemy.com/v2/p2MK6Y8eQyHPbS5gQZ7TU",
    explorer: "https://polygonscan.com",
  },
  {
    chain: base,
    label: "Base",
    badge: "BASE",
    color: "#000000",
    rpc: "https://mainnet.base.org",
    explorer: "https://basescan.org",
  },
  {
    chain: optimism,
    label: "Optimism",
    badge: "OP",
    color: "#000000",
    rpc: "https://opt-mainnet.g.alchemy.com/v2/p2MK6Y8eQyHPbS5gQZ7TU",
    explorer: "https://optimistic.etherscan.io",
  },
  {
    chain: arbitrum,
    label: "Arbitrum",
    badge: "ARB",
    color: "#000000",
    rpc: "https://arb1.arbitrum.io/rpc",
    explorer: "https://arbiscan.io",
  },
  {
    chain: bsc,
    label: "BSC",
    badge: "BNB",
    color: "#000000",
    rpc: "https://bsc-dataseed.binance.org/",
    explorer: "https://bscscan.com",
  },
] as const;

const TESTNET_CHAINS = [
  {
    chain: sepolia,
    label: "Sepolia",
    badge: "SEP",
    color: "#000000",
    rpc: "https://eth-sepolia.g.alchemy.com/v2/tBBD_tGhqE9AOhsw9RIOZ",
    explorer: "https://sepolia.etherscan.io",
  },
  {
    chain: baseSepolia,
    label: "Base Sepolia",
    badge: "bSEP",
    color: "#000000",
    rpc: "https://sepolia.base.org",
    explorer: "https://sepolia.basescan.org",
  },
  {
    chain: optimismSepolia,
    label: "OP Sepolia",
    badge: "oSEP",
    color: "#000000",
    rpc: "https://opt-sepolia.g.alchemy.com/v2/tBBD_tGhqE9AOhsw9RIOZ",
    explorer: "https://sepolia-optimism.etherscan.io",
  },
] as const;

// ─── ZK Chains (real ZK proof data) ───────────────────────────────────────────
// These chains produce real SNARK/STARK proofs committed Network.
// zkSync Era: each block carries l1BatchNumber referencing the L1 proof batch.
// Polygon zkEVM: each block's stateRoot is the ZK-proven state commitment.

const ZK_MAINNET_CHAINS = [
  {
    chain: zkSync,
    label: "zkSync Era",
    badge: "ZKS",
    color: "#000000",
    rpc: "https://mainnet.era.zksync.io",
    explorer: "https://explorer.zksync.io",
    proofType: "SNARK" as const,
    l1Explorer: "https://etherscan.io",
  },
  {
    chain: polygonZkEvm,
    label: "Polygon zkEVM",
    badge: "zkEVM",
    color: "#000000",
    rpc: "https://zkevm-rpc.com",
    explorer: "https://zkevm.polygonscan.com",
    proofType: "SNARK" as const,
    l1Explorer: "https://etherscan.io",
  },
] as const;

const ZK_TESTNET_CHAINS = [
  {
    chain: zkSyncSepoliaTestnet,
    label: "zkSync Sepolia",
    badge: "ZKS-T",
    color: "#000000",
    rpc: "https://sepolia.era.zksync.dev",
    explorer: "https://sepolia.explorer.zksync.io",
    proofType: "SNARK" as const,
    l1Explorer: "https://sepolia.etherscan.io",
  },
  {
    chain: polygonZkEvmCardona,
    label: "zkEVM Cardona",
    badge: "zkC",
    color: "#000000",
    rpc: "https://rpc.cardona.zkevm-rpc.com",
    explorer: "https://cardona-zkevm.polygonscan.com",
    proofType: "SNARK" as const,
    l1Explorer: "https://sepolia.etherscan.io",
  },
] as const;

// ─── Types ─────────────────────────────────────────────────────────────────────

interface WalletEntry {
  address: string;
  chain: string;
  chainId: number;
  badge: string;
  color: string;
  txCount: number;
  blockNumber: number;
  timestamp: string;
  explorer: string;
  network: "mainnet" | "testnet";
  role: "sender" | "receiver" | "both";
}

interface BlockRoot {
  chain: string;
  badge: string;
  color: string;
  blockNumber: number;
  blockHash: string;
  parentHash: string;
  stateRoot: string;
  timestamp: string;
  txCount: number;
  gasUsedPct: number;
  network: "mainnet" | "testnet";
  isCurrent: boolean;
  explorer: string;
}

// Real ZK proof entry from zkSync Era / Polygon zkEVM
interface ZkEntry {
  chain: string;
  badge: string;
  color: string;
  proofType: "SNARK" | "STARK";
  blockNumber: number;
  // Real stateRoot from block header this IS the ZK-proven state commitment
  stateRoot: string;
  // Real block hash
  blockHash: string;
  // Real parent hash
  parentHash: string;
  // zkSync Era specific: L1 batch number referencing the Network proof
  l1BatchNumber: number | null;
  // Whether we got a non-empty stateRoot (i.e. proof was actually available)
  proofVerified: boolean;
  txCount: number;
  gasUsedPct: number;
  timestamp: string;
  network: "mainnet" | "testnet";
  isCurrent: boolean;
  explorer: string;
  l1Explorer: string;
}

type TabType = "map" | "wallets" | "block-roots" | "circuit-roots" | "overview";
type NetworkType = "mainnet" | "testnet";

const PER_PAGE = 30;
// 10 real blocks per chain enough data without timing out on slow RPCs
const SCAN_DEPTH = 10n;

// ─── Helpers ───────────────────────────────────────────────────────────────────

function truncate(str: string, head = 8, tail = 6) {
  if (!str) return "–";
  return str.length > head + tail + 3
    ? `${str.slice(0, head)}…${str.slice(-tail)}`
    : str;
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 5) return "just now";
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  return `${Math.floor(s / 3600)}h ago`;
}

function copyToClipboard(text: string, label: string) {
  navigator.clipboard.writeText(text).catch(() => {});
  toast.success(`${label} copied`);
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function RegistryPage() {
  // ── UI State
  const [activeTab, setActiveTab] = useState<TabType>("map");
  const [network, setNetwork] = useState<NetworkType>("mainnet");
  const [isDark, setIsDark] = useState(false);
  const [netDropOpen, setNetDropOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);

  // ── Data State
  const [wallets, setWallets] = useState<WalletEntry[]>([]);
  const [blockRoots, setBlockRoots] = useState<BlockRoot[]>([]);
  // Real ZK proof entries from zkSync Era + Polygon zkEVM
  const [zkEntries, setZkEntries] = useState<ZkEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [zkLoading, setZkLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [stats, setStats] = useState({
    totalWallets: 0,
    totalChains: 0,
    latestBlock: 0,
    totalTxs: 0,
    senders: 0,
    receivers: 0,
  });

  const abortRef = useRef<boolean>(false);
  const netDropRef = useRef<HTMLDivElement>(null);
  const autoRefreshRef = useRef<NodeJS.Timeout | null>(null);

  // ── Dark mode: toggle class on <html>
  useEffect(() => {
    const html = document.documentElement;
    if (isDark) {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }
  }, [isDark]);

  // Close dropdown on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (netDropRef.current && !netDropRef.current.contains(e.target as Node)) {
        setNetDropOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Real ZK Proof Indexer ─────────────────────────────────────────────────
  // Fetches actual block data from zkSync Era and Polygon zkEVM.
  // Both chains produce real ZK proofs: each block's stateRoot is the
  // cryptographic commitment proven by a SNARK before L1 finalization.
  // zkSync Era also exposes l1BatchNumber linking each block to the
  // Network Ethereum proof batch.

  const runZkIndexer = useCallback(async (selectedNetwork: NetworkType) => {
    setZkLoading(true);
    const zkChains = selectedNetwork === "mainnet" ? ZK_MAINNET_CHAINS : ZK_TESTNET_CHAINS;
    const entries: ZkEntry[] = [];

    for (const cfg of zkChains) {
      try {
        const client = createPublicClient({
          chain: cfg.chain as any,
          transport: http(cfg.rpc, { timeout: 20_000 }),
        });

        const latestBlockNum = await client.getBlockNumber();

        // Fetch last 5 blocks from each ZK chain
        for (let depth = 0n; depth < 5n; depth++) {
          try {
            const block = await client.getBlock({
              blockNumber: latestBlockNum - depth,
              includeTransactions: true,
            }) as any;

            const txs = (block.transactions || []) as any[];
            // stateRoot is the real ZK-proven state commitment
            const stateRoot: string = block.stateRoot || "";
            // zkSync Era specific field: links block to L1 proof batch
            const l1BatchNumber: number | null =
              typeof block.l1BatchNumber === "bigint"
                ? Number(block.l1BatchNumber)
                : typeof block.l1BatchNumber === "number"
                ? block.l1BatchNumber
                : null;

            entries.push({
              chain: cfg.label,
              badge: cfg.badge,
              color: cfg.color,
              proofType: cfg.proofType,
              blockNumber: Number(block.number),
              stateRoot,
              blockHash: block.hash || "",
              parentHash: block.parentHash || "",
              l1BatchNumber,
              // proofVerified = true when we got a non-empty stateRoot from the node
              proofVerified: stateRoot.length > 10,
              txCount: txs.length,
              gasUsedPct:
                block.gasLimit > 0n
                  ? Number((block.gasUsed * 10000n) / block.gasLimit) / 100
                  : 0,
              timestamp: new Date(Number(block.timestamp) * 1000).toISOString(),
              network: selectedNetwork,
              isCurrent: depth === 0n,
              explorer: cfg.explorer,
              l1Explorer: cfg.l1Explorer,
            });
          } catch (blockErr) {
            console.warn(`[ZK] Block error on ${cfg.label}:`, blockErr);
          }
        }
      } catch (chainErr) {
        console.warn(`[ZK] Chain ${cfg.label} connection failed:`, chainErr);
      }
    }

    setZkEntries(entries.sort((a, b) => b.blockNumber - a.blockNumber));
    setZkLoading(false);
  }, []);

  // ── Network Indexer (Wallets + Block Roots) ──────────────────────────────

  const runIndexer = useCallback(async (selectedNetwork: NetworkType) => {
    abortRef.current = true;
    await new Promise((r) => setTimeout(r, 50));
    abortRef.current = false;

    setLoading(true);
    setProgress(0);
    setWallets([]);
    setBlockRoots([]);
    setPage(1);

    const chains = selectedNetwork === "mainnet" ? MAINNET_CHAINS : TESTNET_CHAINS;
    const walletMap = new Map<string, WalletEntry>();
    const roots: BlockRoot[] = [];
    let totalTxs = 0;

    // ── FETCH REAL CONNECTED ACCOUNTS ─────────────────────────────────────────
    // This correctly articulates all accounts connected since February, ensuring no simulations.
    try {
      const res = await fetch("/api/registry/real-users");
      if (res.ok) {
        const { users } = await res.json();
        for (const u of users) {
          const key = `real-${u.walletAddress.toLowerCase()}`;
          walletMap.set(key, {
            address: u.walletAddress,
            chain: "Real Person connected",
            chainId: 1,
            badge: "REAL",
            color: "#000000",
            txCount: 1,
            blockNumber: 0,
            timestamp: u.createdAt,
            explorer: "https://etherscan.io",
            network: selectedNetwork,
            role: "both",
          });
        }
      }
    } catch (e) {
      console.warn("[Registry] Failed to fetch real users", e);
    }

    for (let ci = 0; ci < chains.length; ci++) {
      if (abortRef.current) break;
      const cfg = chains[ci];
      setProgress(Math.round(((ci + 0.1) / chains.length) * 90));

      try {
        const client = createPublicClient({
          chain: cfg.chain as any,
          transport: http(cfg.rpc, { timeout: 15_000 }),
        });

        const latestBlockNum = await client.getBlockNumber();

        for (let depth = 0n; depth < SCAN_DEPTH; depth++) {
          if (abortRef.current) break;
          const blockNum = latestBlockNum - depth;

          try {
            const block = await client.getBlock({
              blockNumber: blockNum,
              includeTransactions: true,
            });

            const txs = (block.transactions || []) as any[];
            totalTxs += txs.length;

            for (const tx of txs) {
              if (tx.from) {
                const key = `${tx.from.toLowerCase()}-${cfg.chain.id}`;
                const existing = walletMap.get(key);
                if (existing) {
                  existing.txCount++;
                  if (existing.role === "receiver") existing.role = "both";
                } else {
                  walletMap.set(key, {
                    address: tx.from,
                    chain: cfg.label,
                    chainId: cfg.chain.id,
                    badge: cfg.badge,
                    color: cfg.color,
                    txCount: 1,
                    blockNumber: Number(block.number),
                    timestamp: new Date(Number(block.timestamp) * 1000).toISOString(),
                    explorer: cfg.explorer,
                    network: selectedNetwork,
                    role: "sender",
                  });
                }
              }

              if (tx.to) {
                const key = `${tx.to.toLowerCase()}-${cfg.chain.id}`;
                const existing = walletMap.get(key);
                if (existing) {
                  existing.txCount++;
                  if (existing.role === "sender") existing.role = "both";
                } else {
                  walletMap.set(key, {
                    address: tx.to,
                    chain: cfg.label,
                    chainId: cfg.chain.id,
                    badge: cfg.badge,
                    color: cfg.color,
                    txCount: 1,
                    blockNumber: Number(block.number),
                    timestamp: new Date(Number(block.timestamp) * 1000).toISOString(),
                    explorer: cfg.explorer,
                    network: selectedNetwork,
                    role: "receiver",
                  });
                }
              }
            }

            roots.push({
              chain: cfg.label,
              badge: cfg.badge,
              color: cfg.color,
              blockNumber: Number(block.number),
              blockHash: (block.hash as string) || "",
              parentHash: block.parentHash || "",
              // stateRoot may be empty on some chains we show "–" in UI
              stateRoot: (block as any).stateRoot || "",
              timestamp: new Date(Number(block.timestamp) * 1000).toISOString(),
              txCount: txs.length,
              gasUsedPct:
                block.gasLimit > 0n
                  ? Number((block.gasUsed * 10000n) / block.gasLimit) / 100
                  : 0,
              network: selectedNetwork,
              isCurrent: depth === 0n,
              explorer: cfg.explorer,
            });
          } catch (blockErr) {
            console.warn(`[Registry] Block ${blockNum} on ${cfg.label}:`, blockErr);
          }
        }
      } catch (chainErr) {
        console.warn(`[Registry] Chain ${cfg.label} connection failed:`, chainErr);
      }

      setProgress(Math.round(((ci + 1) / chains.length) * 90));
    }

    if (!abortRef.current) {
      const finalWallets = Array.from(walletMap.values()).sort(
        (a, b) => b.blockNumber - a.blockNumber
      );

      const senders = finalWallets.filter(
        (w) => w.role === "sender" || w.role === "both"
      ).length;
      const receivers = finalWallets.filter(
        (w) => w.role === "receiver" || w.role === "both"
      ).length;

      setWallets(finalWallets);
      setBlockRoots(roots.sort((a, b) => b.blockNumber - a.blockNumber));
      
      // Zero-Mock Mandate: totalWallets = only real on-chain + DB users. No padding.
      let syncedTotal = finalWallets.length;
      try {
        const resMap = await fetch("/api/network/wallet-connections");
        if (resMap.ok) {
          const dataMap = await resMap.json();
          if (dataMap.total) {
            syncedTotal = dataMap.total;
          }
        }
      } catch (e) {}

      setStats({
        totalWallets: syncedTotal,
        totalChains: chains.length,
        latestBlock: Math.max(...roots.map((r) => r.blockNumber), 0),
        totalTxs: totalTxs, // Real tx count from on-chain scan only. Zero-Mock Mandate.
        senders,
        receivers,
      });
      setProgress(100);
      setLastRefreshed(new Date());
    }

    setLoading(false);
  }, []);

  const runAll = useCallback((net: NetworkType) => {
    runIndexer(net);
    runZkIndexer(net);
  }, [runIndexer, runZkIndexer]);

  // Initial load + re-run on network change
  useEffect(() => {
    runAll(network);
  }, [network, runAll]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (autoRefreshRef.current) clearInterval(autoRefreshRef.current);
    autoRefreshRef.current = setInterval(() => {
      runAll(network);
    }, 30_000);
    return () => {
      if (autoRefreshRef.current) clearInterval(autoRefreshRef.current);
    };
  }, [network, runAll]);

  // ── Filtered + Paginated wallets ──────────────────────────────────────────

  const filteredWallets = wallets.filter((w) => {
    const q = searchQuery.toLowerCase();
    return (
      !q ||
      w.address.toLowerCase().includes(q) ||
      w.chain.toLowerCase().includes(q) ||
      w.badge.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filteredWallets.length / PER_PAGE));
  const paginatedWallets = filteredWallets.slice(
    (page - 1) * PER_PAGE,
    page * PER_PAGE
  );

  // ── Tab config ────────────────────────────────────────────────────────────

  const TABS: { id: TabType; label: string }[] = [
    { id: "map", label: "Network Map"},
    { id: "wallets", label: "Wallets"},
    { id: "block-roots", label: "Block Roots"},
    { id: "circuit-roots", label: "Circuit Roots"},
    { id: "overview", label: "Overview"},
  ];

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div
      className="min-h-full w-full flex flex-col transition-colors duration-300"
      style={{
        backgroundColor: isDark ? "#09090f" : "#ffffff",
        color: isDark ? "#e2e8f0" : "#0f172a",
      }}
    >
      {/* ── Registry Header ─────────────────────────────────────────────── */}
      <div
        className="sticky top-0 z-40 w-full"
        style={{
          backgroundColor: isDark
            ? "rgba(9,9,15,0.96)"
            : "rgba(255,255,255,0.97)",
          borderBottom: isDark
            ? "1px solid rgba(255,255,255,0.07)"
            : "1px solid rgba(0,0,0,0.07)",
          backdropFilter: "blur(20px)",
        }}
      >
        <div className="w-full px-4 min-h-[52px] py-2 flex flex-wrap items-center justify-between gap-3 sm:py-0">

          {/* Logo */}
          <div className="flex items-center gap-2.5 shrink-0">
            <img
              src="/system-shots/PARTNERS/pngtree-3d-silver-atom-symbol-matter-quantum-fiction-photo-picture-image_3222092.jpg"
              alt="Atom"
              className="w-7 h-7 rounded-lg object-cover shadow-sm"
            />
            <div className="hidden sm:block">
              <span
                className="text-[12px] font-black uppercase tracking-[0.12em]"
                style={{ color: isDark ? "#fff" : "#0f172a" }}
              >
                Registry
              </span>
              <span
                className="text-[11px] font-medium ml-1.5"
                style={{ color: isDark ? "rgba(255,255,255,0.8)" : "rgba(0,0,0,0.4)" }}
              >
                Explorer
              </span>
            </div>
          </div>

          {/* Center Tabs */}
          <nav className="flex flex-1 items-center justify-center gap-1 overflow-x-auto no-scrollbar px-2 max-w-full">
            {TABS.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="flex flex-1 sm:flex-none justify-center items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-[0.08em] transition-all duration-150 whitespace-nowrap"
                  style={{
                    backgroundColor: active
                      ? isDark
                        ? "rgba(255,255,255,0.15)"
                        : "rgba(0,0,0,0.08)"
                      : "transparent",
                    color: active
                      ? isDark
                        ? "#ffffff"
                        : "#0f172a"
                      : isDark
                      ? "rgba(255,255,255,0.85)"
                      : "rgba(0,0,0,0.55)",
                  }}
                >
                  
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Controls */}
          <div className="flex items-center gap-2 shrink-0">

            {/* Network Selector */}
            <div className="relative" ref={netDropRef}>
              <button
                onClick={() => setNetDropOpen((p) => !p)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-[0.08em] transition-all"
                style={{
                  border: isDark
                    ? "1px solid rgba(255,255,255,0.1)"
                    : "1px solid rgba(0,0,0,0.1)",
                  backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "#fff",
                  color: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.7)",
                }}
              >
                <div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{
                    backgroundColor:
                      network === "mainnet" ? "#10b981" : "#f59e0b",
                  }}
                />
                {network === "mainnet" ? "Mainnet" : "Testnet"}
                <ChevronDown
                  size={11}
                  className="transition-transform duration-150"
                  style={{ transform: netDropOpen ? "rotate(180deg)" : "none" }}
                />
              </button>

              <AnimatePresence>
                {netDropOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.96 }}
                    transition={{ duration: 0.1 }}
                    className="absolute right-0 top-full mt-1 w-40 rounded-xl overflow-hidden z-50 shadow-2xl"
                    style={{
                      border: isDark
                        ? "1px solid rgba(255,255,255,0.1)"
                        : "1px solid rgba(0,0,0,0.1)",
                      backgroundColor: isDark ? "#111118" : "#fff",
                    }}
                  >
                    {(["mainnet", "testnet"] as NetworkType[]).map((n) => (
                      <button
                        key={n}
                        onClick={() => {
                          setNetwork(n);
                          setNetDropOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-3 text-[11px] font-bold uppercase tracking-[0.08em] transition-colors"
                        style={{
                          backgroundColor:
                            network === n
                              ? isDark
                                ? "rgba(255,255,255,0.06)"
                                : "rgba(0,0,0,0.04)"
                              : "transparent",
                          color:
                            network === n
                              ? isDark
                                ? "#fff"
                                : "#0f172a"
                              : isDark
                              ? "rgba(255,255,255,0.9)"
                              : "rgba(0,0,0,0.5)",
                        }}
                      >
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{
                            backgroundColor:
                              n === "mainnet" ? "#10b981" : "#f59e0b",
                          }}
                        />
                        {n === "mainnet" ? "Mainnet" : "Testnet"}
                        {network === n && (
                          <CheckCircle2
                            size={11}
                            className="ml-auto"
                            style={{ color: "#000000" }}
                          />
                        )}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Refresh + last refreshed */}
            <div className="flex items-center gap-2">
              {lastRefreshed && !loading && (
                <span
                  className="text-[9px] font-mono hidden lg:block"
                  style={{ color: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.3)" }}
                >
                  {timeAgo(lastRefreshed.toISOString())}
                </span>
              )}
              <button
                onClick={() => runAll(network)}
                disabled={loading || zkLoading}
                title="Refresh all Network data (wallets + ZK proofs)"
                className="p-2 rounded-lg transition-all disabled:opacity-40"
                style={{
                  border: isDark
                    ? "1px solid rgba(255,255,255,0.1)"
                    : "1px solid rgba(0,0,0,0.1)",
                  backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "#fff",
                  color: isDark ? "rgba(255,255,255,0.9)" : "rgba(0,0,0,0.55)",
                }}
              >
                <RefreshCw
                  size={13}
                  className={(loading || zkLoading) ? "animate-spin" : ""}
                />
              </button>
            </div>

            {/* Dark / Light Toggle */}
            <button
              onClick={() => setIsDark((p) => !p)}
              title={isDark ? "Switch to light mode" : "Switch to dark mode"}
              className="p-2 rounded-lg transition-all"
              style={{
                border: isDark
                  ? "1px solid rgba(255,255,255,0.1)"
                  : "1px solid rgba(0,0,0,0.1)",
                backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "#fff",
                color: isDark ? "rgba(255,255,255,0.9)" : "rgba(0,0,0,0.55)",
              }}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider">{isDark ? "DARK" : "LIGHT"}</span>
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full h-[2px] relative overflow-hidden"
              style={{
                backgroundColor: isDark
                  ? "rgba(255,255,255,0.05)"
                  : "rgba(0,0,0,0.05)",
              }}
            >
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full"
                style={{
                  background:
                    "linear-gradient(90deg, #627EEA, #8247E5, #10b981)",
                }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Page Content ────────────────────────────────────────────────── */}
      <div className="flex-1 w-full px-5 py-6">
        <AnimatePresence mode="wait">

          {/* ══════════════════════════════════════════════════════════════
              TAB: MAP
          ══════════════════════════════════════════════════════════════ */}
          {activeTab === "map" && (
            <motion.div
              key="map"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="w-full"
            >
              <div className="mb-5">
                <h1
                  className="text-[20px] font-black tracking-tight"
                  style={{ color: isDark ? "#fff" : "#0f172a" }}
                >
                  Global Network Activity
                </h1>
                <p
                  className="text-[12px] mt-0.5"
                  style={{
                    color: isDark
                      ? "rgba(255,255,255,0.85)"
                      : "rgba(0,0,0,0.45)",
                  }}
                >
                  Real-time geographical visualization of incoming connections and active nodes across the network.
                </p>
              </div>
              <div className="w-full h-[calc(100vh-140px)] min-h-[400px] rounded-2xl overflow-hidden relative" style={{ border: isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.07)", backgroundColor: isDark ? "#0d0d17" : "#fff" }}>
                <RealWorldMap fullPage={true} isDark={isDark} />
              </div>
            </motion.div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              TAB: WALLETS
          ══════════════════════════════════════════════════════════════ */}
          {activeTab === "wallets" && (
            <motion.div
              key="wallets"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
            >
              {/* Header row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                <div>
                  <h1
                    className="text-[20px] font-black tracking-tight"
                    style={{ color: isDark ? "#fff" : "#0f172a" }}
                  >
                    Wallet Registry
                  </h1>
                  <p
                    className="text-[12px] mt-0.5"
                    style={{
                      color: isDark
                        ? "rgba(255,255,255,0.85)"
                        : "rgba(0,0,0,0.45)",
                    }}
                  >
                    {loading
                      ? `Scanning ${network} chains…`
                      : `${filteredWallets.length.toLocaleString()} wallets indexed across ${stats.totalChains} chains live Network`}
                  </p>
                </div>

                {/* Search */}
                <div className="relative shrink-0">
                  <Search
                    size={13}
                    className="absolute left-3 top-1/2 -translate-y-1/2"
                    style={{
                      color: isDark
                        ? "rgba(255,255,255,0.7)"
                        : "rgba(0,0,0,0.3)",
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Search address or chain…"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setPage(1);
                    }}
                    className="pl-9 pr-4 py-2 rounded-lg text-[12px] w-full sm:w-64 focus:outline-none transition-all"
                    style={{
                      border: isDark
                        ? "1px solid rgba(255,255,255,0.1)"
                        : "1px solid rgba(0,0,0,0.1)",
                      backgroundColor: isDark
                        ? "rgba(255,255,255,0.04)"
                        : "#fff",
                      color: isDark ? "#e2e8f0" : "#0f172a",
                    }}
                  />
                </div>
              </div>

              {/* Table */}
              <div
                className="w-full rounded-2xl overflow-hidden"
                style={{
                  border: isDark
                    ? "1px solid rgba(255,255,255,0.07)"
                    : "1px solid rgba(0,0,0,0.07)",
                  backgroundColor: isDark ? "#0d0d17" : "#fff",
                }}
              >
                <div className="w-full overflow-x-auto">
                  <table
                    className="w-full text-left border-collapse"
                    style={{ minWidth: 720 }}
                  >
                    {/* THEAD */}
                    <thead>
                      <tr
                        style={{
                          borderBottom: isDark
                            ? "1px solid rgba(255,255,255,0.06)"
                            : "1px solid rgba(0,0,0,0.06)",
                          backgroundColor: isDark
                            ? "rgba(255,255,255,0.02)"
                            : "rgba(0,0,0,0.02)",
                        }}
                      >
                        {["#", "Address", "Chain", "Block", "Txns", "Role", "Indexed", "Explorer"].map((h) => (
                          <th
                            key={h}
                            className={`px-5 py-3.5 text-[9px] font-black uppercase tracking-[0.15em] ${
                              ["Block", "Txns"].includes(h) ? "text-right" : ""
                            }`}
                            style={{
                              color: isDark
                                ? "rgba(255,255,255,0.75)"
                                : "rgba(0,0,0,0.35)",
                            }}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    {/* TBODY */}
                    <tbody>
                      {loading && paginatedWallets.length === 0
                        ? Array.from({ length: 10 }).map((_, i) => (
                            <tr
                              key={i}
                              className="animate-pulse"
                              style={{
                                borderBottom: isDark
                                  ? "1px solid rgba(255,255,255,0.04)"
                                  : "1px solid rgba(0,0,0,0.04)",
                              }}
                            >
                              {[52, 200, 60, 80, 28, 55, 60, 40].map((w, j) => (
                                <td key={j} className="px-5 py-4">
                                  <div
                                    className="h-3 rounded"
                                    style={{
                                      width: w,
                                      backgroundColor: isDark
                                        ? "rgba(255,255,255,0.07)"
                                        : "rgba(0,0,0,0.07)",
                                    }}
                                  />
                                </td>
                              ))}
                            </tr>
                          ))
                        : paginatedWallets.length === 0
                        ? (
                          <tr>
                            <td
                              colSpan={8}
                              className="px-5 py-20 text-center text-[12px]"
                              style={{
                                color: isDark
                                  ? "rgba(255,255,255,0.75)"
                                  : "rgba(0,0,0,0.35)",
                              }}
                            >
                              {searchQuery
                                ? "No wallets match your search."
                                : "No wallets indexed yet click Refresh."}
                            </td>
                          </tr>
                        )
                        : paginatedWallets.map((w, i) => (
                          <motion.tr
                            key={`${w.address}-${w.chainId}-${i}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: i * 0.008 }}
                            className="group transition-colors"
                            style={{
                              borderBottom: isDark
                                ? "1px solid rgba(255,255,255,0.04)"
                                : "1px solid rgba(0,0,0,0.04)",
                            }}
                            onMouseEnter={(e) => {
                              (e.currentTarget as HTMLElement).style.backgroundColor = isDark
                                ? "rgba(255,255,255,0.025)"
                                : "rgba(0,0,0,0.018)";
                            }}
                            onMouseLeave={(e) => {
                              (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
                            }}
                          >
                            {/* # */}
                            <td className="px-5 py-4">
                              <span
                                className="text-[10px] font-mono"
                                style={{
                                  color: isDark
                                    ? "rgba(255,255,255,0.2)"
                                    : "rgba(0,0,0,0.2)",
                                }}
                              >
                                {(page - 1) * PER_PAGE + i + 1}
                              </span>
                            </td>

                            {/* Address */}
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[8px] font-black"
                                  style={{
                                    backgroundColor: isDark ? "#fff" : "#000" + "20",
                                    border: `1px solid ${w.color}35`,
                                    color: w.color,
                                  }}
                                >
                                  W
                                </div>
                                <span
                                  className="text-[11px] font-mono"
                                  style={{
                                    color: isDark ? "#e2e8f0" : "#0f172a",
                                  }}
                                >
                                  {truncate(w.address, 10, 8)}
                                </span>
                                <button
                                  onClick={() => copyToClipboard(w.address, "Address")}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                                  style={{
                                    color: isDark
                                      ? "rgba(255,255,255,0.7)"
                                      : "rgba(0,0,0,0.3)",
                                  }}
                                >
                                  
                                </button>
                              </div>
                            </td>

                            {/* Chain badge */}
                            <td className="px-5 py-4">
                              <span
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-[0.1em]"
                                style={{
                                  backgroundColor: isDark ? "#fff" : "#000" + "18",
                                  color: w.color,
                                  border: `1px solid ${w.color}30`,
                                }}
                              >
                                {w.badge}
                              </span>
                            </td>

                            {/* Block */}
                            <td className="px-5 py-4 text-right">
                              <span
                                className="text-[11px] font-mono"
                                style={{
                                  color: isDark
                                    ? "rgba(255,255,255,0.9)"
                                    : "rgba(0,0,0,0.5)",
                                }}
                              >
                                {w.blockNumber > 0 ? `#${w.blockNumber.toLocaleString()}` : "–"}
                              </span>
                            </td>

                            {/* Txns */}
                            <td className="px-5 py-4 text-right">
                              <span
                                className="text-[11px] font-mono font-bold"
                                style={{
                                  color: isDark ? "#fff" : "#0f172a",
                                }}
                              >
                                {w.txCount}
                              </span>
                            </td>

                            {/* Role */}
                            <td className="px-5 py-4">
                              <span
                                className="text-[9px] font-black uppercase tracking-[0.08em] px-1.5 py-0.5 rounded"
                                style={{
                                  backgroundColor:
                                    w.role === "both"
                                      ? isDark
                                        ? "rgba(99,102,241,0.15)"
                                        : "rgba(99,102,241,0.1)"
                                      : w.role === "sender"
                                      ? isDark
                                        ? "rgba(16,185,129,0.15)"
                                        : "rgba(16,185,129,0.1)"
                                      : isDark
                                      ? "rgba(245,158,11,0.15)"
                                      : "rgba(245,158,11,0.1)",
                                  color:
                                    w.role === "both"
                                      ? "#6366f1"
                                      : w.role === "sender"
                                      ? "#10b981"
                                      : "#f59e0b",
                                }}
                              >
                                {w.role}
                              </span>
                            </td>

                            {/* Timestamp */}
                            <td className="px-5 py-4">
                              <span
                                className="text-[11px]"
                                style={{
                                  color: isDark
                                    ? "rgba(255,255,255,0.8)"
                                    : "rgba(0,0,0,0.4)",
                                }}
                              >
                                {timeAgo(w.timestamp)}
                              </span>
                            </td>

                            {/* Explorer link */}
                            <td className="px-5 py-4">
                              <a
                                href={`${w.explorer}/address/${w.address}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="opacity-0 group-hover:opacity-100 inline-flex items-center gap-1 text-[10px] font-bold transition-opacity"
                                style={{ color: "#000000" }}
                              >
                                View 
                              </a>
                            </td>
                          </motion.tr>
                        ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {!loading && totalPages > 1 && (
                  <div
                    className="px-5 py-3.5 flex items-center justify-between"
                    style={{
                      borderTop: isDark
                        ? "1px solid rgba(255,255,255,0.06)"
                        : "1px solid rgba(0,0,0,0.06)",
                    }}
                  >
                    <span
                      className="text-[11px]"
                      style={{
                        color: isDark
                          ? "rgba(255,255,255,0.75)"
                          : "rgba(0,0,0,0.35)",
                      }}
                    >
                      {(page - 1) * PER_PAGE + 1}–
                      {Math.min(page * PER_PAGE, filteredWallets.length)} of{" "}
                      {filteredWallets.length.toLocaleString()}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="p-1.5 rounded-lg transition-all disabled:opacity-30"
                        style={{
                          border: isDark
                            ? "1px solid rgba(255,255,255,0.1)"
                            : "1px solid rgba(0,0,0,0.1)",
                          color: isDark
                            ? "rgba(255,255,255,0.6)"
                            : "rgba(0,0,0,0.6)",
                        }}
                      >
                        
                      </button>

                      {Array.from(
                        { length: Math.min(7, totalPages) },
                        (_, i) => {
                          const start =
                            page <= 4
                              ? 1
                              : page >= totalPages - 3
                              ? totalPages - 6
                              : page - 3;
                          const pg = Math.max(1, start) + i;
                          if (pg > totalPages) return null;
                          const active = pg === page;
                          return (
                            <button
                              key={pg}
                              onClick={() => setPage(pg)}
                              className="w-7 h-7 rounded-lg text-[11px] font-bold transition-all"
                              style={{
                                backgroundColor: active
                                  ? isDark
                                    ? "#fff"
                                    : "#0f172a"
                                  : "transparent",
                                color: active
                                  ? isDark
                                    ? "#0f172a"
                                    : "#fff"
                                  : isDark
                                  ? "rgba(255,255,255,0.9)"
                                  : "rgba(0,0,0,0.5)",
                                border: active
                                  ? "none"
                                  : isDark
                                  ? "1px solid rgba(255,255,255,0.1)"
                                  : "1px solid rgba(0,0,0,0.1)",
                              }}
                            >
                              {pg}
                            </button>
                          );
                        }
                      )}

                      <button
                        onClick={() =>
                          setPage((p) => Math.min(totalPages, p + 1))
                        }
                        disabled={page === totalPages}
                        className="p-1.5 rounded-lg transition-all disabled:opacity-30"
                        style={{
                          border: isDark
                            ? "1px solid rgba(255,255,255,0.1)"
                            : "1px solid rgba(0,0,0,0.1)",
                          color: isDark
                            ? "rgba(255,255,255,0.6)"
                            : "rgba(0,0,0,0.6)",
                        }}
                      >
                        
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              TAB: BLOCK ROOTS
          ══════════════════════════════════════════════════════════════ */}
          {activeTab === "block-roots" && (
            <motion.div
              key="block-roots"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
            >
              <div className="mb-5">
                <h1
                  className="text-[20px] font-black tracking-tight"
                  style={{ color: isDark ? "#fff" : "#0f172a" }}
                >
                  Block Roots
                </h1>
                <p
                  className="text-[12px] mt-0.5"
                  style={{
                    color: isDark
                      ? "rgba(255,255,255,0.85)"
                      : "rgba(0,0,0,0.45)",
                  }}
                >
                  Historical block roots indexed across all{" "}
                  {network === "mainnet" ? "mainnet" : "testnet"} chains
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {loading && blockRoots.length === 0
                  ? Array.from({ length: 6 }).map((_, i) => (
                      <div
                        key={i}
                        className="rounded-2xl p-5 animate-pulse"
                        style={{
                          border: isDark
                            ? "1px solid rgba(255,255,255,0.07)"
                            : "1px solid rgba(0,0,0,0.07)",
                          backgroundColor: isDark ? "#0d0d17" : "#fff",
                        }}
                      >
                        {[140, 200, 180, 160, 100].map((w, j) => (
                          <div
                            key={j}
                            className="h-3 rounded mb-3"
                            style={{
                              width: w,
                              backgroundColor: isDark
                                ? "rgba(255,255,255,0.07)"
                                : "rgba(0,0,0,0.07)",
                            }}
                          />
                        ))}
                      </div>
                    ))
                  : blockRoots.map((root, i) => (
                      <motion.div
                        key={`${root.chain}-${root.blockNumber}-${i}`}
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="rounded-2xl p-5 transition-all"
                        style={{
                          border: isDark
                            ? "1px solid rgba(255,255,255,0.07)"
                            : "1px solid rgba(0,0,0,0.07)",
                          backgroundColor: isDark ? "#0d0d17" : "#fff",
                        }}
                      >
                        {/* Card top */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <span
                              className="text-[9px] font-black uppercase tracking-[0.12em] px-2 py-0.5 rounded-full"
                              style={{
                                backgroundColor: root.color + "18",
                                color: root.color,
                                border: `1px solid ${root.color}30`,
                              }}
                            >
                              {root.badge}
                            </span>
                            {root.isCurrent && (
                              <span
                                className="text-[9px] font-black uppercase tracking-[0.1em] px-2 py-0.5 rounded-full"
                                style={{
                                  backgroundColor: isDark
                                    ? "rgba(16,185,129,0.12)"
                                    : "rgba(16,185,129,0.08)",
                                  color: "#000000",
                                  border: "1px solid rgba(16,185,129,0.25)",
                                }}
                              >
                                Latest
                              </span>
                            )}
                          </div>
                          <span
                            className="text-[10px] font-mono"
                            style={{
                              color: isDark
                                ? "rgba(255,255,255,0.75)"
                                : "rgba(0,0,0,0.35)",
                            }}
                          >
                            {timeAgo(root.timestamp)}
                          </span>
                        </div>

                        {/* Block num */}
                        <div className="mb-4">
                          <div
                            className="text-[9px] font-black uppercase tracking-[0.12em] mb-1"
                            style={{
                              color: isDark
                                ? "rgba(255,255,255,0.7)"
                                : "rgba(0,0,0,0.3)",
                            }}
                          >
                            Block
                          </div>
                          <div
                            className="text-[15px] font-black font-mono"
                            style={{ color: isDark ? "#fff" : "#0f172a" }}
                          >
                            #{root.blockNumber.toLocaleString()}
                          </div>
                        </div>

                        {/* Hash fields */}
                        {[
                          { label: "Block Hash", value: root.blockHash },
                          { label: "State Root", value: root.stateRoot },
                          { label: "Parent Hash", value: root.parentHash },
                        ].map(({ label, value }) => (
                          <div key={label} className="mb-3">
                            <div className="flex items-center justify-between mb-0.5">
                              <span
                                className="text-[9px] font-black uppercase tracking-[0.1em]"
                                style={{
                                  color: isDark
                                    ? "rgba(255,255,255,0.28)"
                                    : "rgba(0,0,0,0.28)",
                                }}
                              >
                                {label}
                              </span>
                              <button
                                onClick={() => copyToClipboard(value, label)}
                                className="transition-opacity"
                                style={{
                                  color: isDark
                                    ? "rgba(255,255,255,0.25)"
                                    : "rgba(0,0,0,0.25)",
                                }}
                              >
                                
                              </button>
                            </div>
                            <span
                              className="text-[10px] font-mono break-all leading-relaxed"
                              style={{
                                color: isDark
                                  ? "rgba(255,255,255,0.9)"
                                  : "rgba(0,0,0,0.5)",
                              }}
                            >
                              {truncate(value || "–", 16, 10)}
                            </span>
                          </div>
                        ))}

                        {/* Stats */}
                        <div
                          className="flex items-center justify-between mt-4 pt-3"
                          style={{
                            borderTop: isDark
                              ? "1px solid rgba(255,255,255,0.06)"
                              : "1px solid rgba(0,0,0,0.06)",
                          }}
                        >
                          <div>
                            <div
                              className="text-[9px] font-black uppercase tracking-[0.1em]"
                              style={{
                                color: isDark
                                  ? "rgba(255,255,255,0.7)"
                                  : "rgba(0,0,0,0.3)",
                              }}
                            >
                              Txns
                            </div>
                            <div
                              className="text-[14px] font-black font-mono"
                              style={{ color: isDark ? "#fff" : "#0f172a" }}
                            >
                              {root.txCount}
                            </div>
                          </div>
                          <div className="text-right">
                            <div
                              className="text-[9px] font-black uppercase tracking-[0.1em]"
                              style={{
                                color: isDark
                                  ? "rgba(255,255,255,0.7)"
                                  : "rgba(0,0,0,0.3)",
                              }}
                            >
                              Gas
                            </div>
                            <div
                              className="text-[14px] font-black font-mono"
                              style={{ color: isDark ? "#fff" : "#0f172a" }}
                            >
                              {root.gasUsedPct.toFixed(1)}%
                            </div>
                          </div>
                          <a
                            href={`${root.explorer}/block/${root.blockNumber}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-[10px] font-bold hover:underline"
                            style={{ color: "#000000" }}
                          >
                            View 
                          </a>
                        </div>
                      </motion.div>
                    ))}
              </div>
            </motion.div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              TAB: ZK CIRCUIT ROOTS REAL DATA
              Source: zkSync Era (chainId 324) + Polygon zkEVM (chainId 1101)
              stateRoot = ZK-proven state commitment from block header
              l1BatchNumber = link to the Ethereum Network proof batch
          ══════════════════════════════════════════════════════════════ */}
          {activeTab === "circuit-roots" && (
            <motion.div
              key="circuit-roots"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
            >
              {/* Header */}
              <div className="mb-5 flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <h1
                    className="text-[20px] font-black tracking-tight flex items-center gap-2"
                    style={{ color: isDark ? "#fff" : "#0f172a" }}
                  >
                    
                    ZK State Commitments
                  </h1>
                  <p
                    className="text-[12px] mt-1 max-w-2xl"
                    style={{ color: isDark ? "rgba(255,255,255,0.85)" : "rgba(0,0,0,0.45)" }}
                  >
                    Live Network SNARK proofs from{" "}
                    <strong style={{ color: "#000000" }}>zkSync Era</strong> and{" "}
                    <strong style={{ color: "#000000" }}>Polygon zkEVM</strong>.
                    The <code className="text-[10px] font-mono">stateRoot</code> in each block is the real
                    ZK-proven cryptographic commitment to all account state. On zkSync Era,{" "}
                    <code className="text-[10px] font-mono">l1BatchNumber</code> links directly to the
                    Ethereum proof batch that verified this state.
                  </p>
                </div>
                <div className="flex gap-2 flex-wrap shrink-0">
                  {(network === "mainnet" ? ZK_MAINNET_CHAINS : ZK_TESTNET_CHAINS).map((cfg) => (
                    <a
                      key={cfg.chain.id}
                      href={cfg.explorer}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.1em] transition-opacity hover:opacity-80"
                      style={{
                        backgroundColor: cfg.color + "18",
                        color: cfg.color,
                        border: `1px solid ${cfg.color}35`,
                      }}
                    >
                      
                      {cfg.label}
                      
                    </a>
                  ))}
                </div>
              </div>

              {/* Loading skeleton */}
              {zkLoading && zkEntries.length === 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="rounded-2xl p-5 animate-pulse"
                      style={{
                        border: isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.07)",
                        backgroundColor: isDark ? "#0d0d17" : "#fff",
                      }}
                    >
                      {[120, 200, 180, 160, 100, 80].map((w, j) => (
                        <div key={j} className="h-3 rounded mb-3"
                          style={{ width: w, backgroundColor: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)" }} />
                      ))}
                    </div>
                  ))}
                </div>
              )}

              {/* Empty state RPC unreachable */}
              {!zkLoading && zkEntries.length === 0 && (
                <div
                  className="rounded-2xl p-12 text-center"
                  style={{
                    border: isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.07)",
                    backgroundColor: isDark ? "#0d0d17" : "#fff",
                  }}
                >
                  
                  <p className="text-[12px]" style={{ color: isDark ? "rgba(255,255,255,0.75)" : "rgba(0,0,0,0.35)" }}>
                    ZK RPC nodes are unreachable check your connection or try refreshing.
                  </p>
                  <button
                    onClick={() => runZkIndexer(network)}
                    className="mt-4 px-4 py-2 rounded-xl text-[11px] font-bold transition-all"
                    style={{
                      backgroundColor: "#1E69FF18",
                      color: "#000000",
                      border: "1px solid #1E69FF30",
                    }}
                  >
                    Retry ZK fetch
                  </button>
                </div>
              )}

              {/* Real ZK entries */}
              {zkEntries.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {zkEntries.map((entry, i) => (
                    <motion.div
                      key={`${entry.chain}-${entry.blockNumber}-zk-${i}`}
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.025 }}
                      className="rounded-2xl p-5 transition-all"
                      style={{
                        border: isDark ? `1px solid ${entry.color}22` : `1px solid ${entry.color}18`,
                        backgroundColor: isDark ? "#0d0d17" : "#fff",
                      }}
                    >
                      {/* Card top */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className="text-[9px] font-black uppercase tracking-[0.12em] px-2 py-0.5 rounded-full flex items-center gap-1"
                            style={{ backgroundColor: isDark ? "#fff" : "#000" + "18", color: entry.color, border: `1px solid ${entry.color}30` }}
                          >
                            {entry.badge}
                          </span>
                          <span
                            className="text-[9px] font-black uppercase tracking-[0.1em] px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: isDark ? "rgba(99,102,241,0.12)" : "rgba(99,102,241,0.08)", color: "#6366f1", border: "1px solid rgba(99,102,241,0.22)" }}
                          >
                            {entry.proofType}
                          </span>
                          {entry.isCurrent && (
                            <span
                              className="text-[9px] font-black uppercase tracking-[0.1em] px-2 py-0.5 rounded-full"
                              style={{ backgroundColor: isDark ? "rgba(16,185,129,0.12)" : "rgba(16,185,129,0.08)", color: "#000000", border: "1px solid rgba(16,185,129,0.25)" }}
                            >
                              Latest
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-mono" style={{ color: isDark ? "rgba(255,255,255,0.75)" : "rgba(0,0,0,0.35)" }}>
                          {timeAgo(entry.timestamp)}
                        </span>
                      </div>

                      {/* Block + L1 batch numbers */}
                      <div className="flex items-start gap-5 mb-4">
                        <div>
                          <div className="text-[9px] font-black uppercase tracking-[0.12em] mb-1"
                            style={{ color: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.3)" }}>Block</div>
                          <div className="text-[15px] font-black font-mono" style={{ color: isDark ? "#fff" : "#0f172a" }}>
                            #{entry.blockNumber.toLocaleString()}
                          </div>
                        </div>
                        {entry.l1BatchNumber !== null && (
                          <div>
                            <div className="text-[9px] font-black uppercase tracking-[0.12em] mb-1"
                              style={{ color: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.3)" }}>L1 Batch</div>
                            <div className="text-[13px] font-black font-mono" style={{ color: entry.color }}>
                              #{entry.l1BatchNumber.toLocaleString()}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Cryptographic fields 100% real Network data */}
                      {[
                        { label: "State Root", value: entry.stateRoot, accent: true },
                        { label: "Block Hash", value: entry.blockHash, accent: false },
                        { label: "Parent Hash", value: entry.parentHash, accent: false },
                      ].map(({ label, value, accent }) => (
                        <div key={label} className="mb-3">
                          <div className="flex items-center justify-between mb-0.5">
                            <span
                              className="text-[9px] font-black uppercase tracking-[0.1em]"
                              style={{ color: accent ? entry.color : isDark ? "rgba(255,255,255,0.28)" : "rgba(0,0,0,0.28)" }}
                            >
                              {label}
                            </span>
                            <button
                              onClick={() => copyToClipboard(value || "–", label)}
                              className="opacity-40 hover:opacity-100 transition-opacity"
                              style={{ color: isDark ? "rgba(255,255,255,0.9)" : "rgba(0,0,0,0.5)" }}
                            >
                              
                            </button>
                          </div>
                          <span
                            className="text-[10px] font-mono break-all leading-relaxed"
                            style={{ color: accent ? entry.color : isDark ? "rgba(255,255,255,0.9)" : "rgba(0,0,0,0.5)" }}
                          >
                            {value ? truncate(value, 18, 10) : "–"}
                          </span>
                        </div>
                      ))}

                      {/* Bottom stats */}
                      <div
                        className="flex items-center justify-between mt-4 pt-3 gap-2 flex-wrap"
                        style={{ borderTop: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.06)" }}
                      >
                        {/* Proof status computed from real stateRoot presence */}
                        <div>
                          <div className="text-[9px] font-black uppercase tracking-[0.1em] mb-0.5"
                            style={{ color: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.3)" }}>State</div>
                          <div
                            className="text-[11px] font-black font-mono flex items-center gap-1"
                            style={{ color: entry.proofVerified ? "#10b981" : "#f59e0b" }}
                          >
                            <div className="w-1.5 h-1.5 rounded-full"
                              style={{ backgroundColor: entry.proofVerified ? "#10b981" : "#f59e0b" }} />
                            {entry.proofVerified ? "Committed" : "Pending"}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-[9px] font-black uppercase tracking-[0.1em] mb-0.5"
                            style={{ color: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.3)" }}>Gas</div>
                          <div className="text-[13px] font-black font-mono" style={{ color: isDark ? "#fff" : "#0f172a" }}>
                            {entry.gasUsedPct.toFixed(1)}%
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-[9px] font-black uppercase tracking-[0.1em] mb-0.5"
                            style={{ color: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.3)" }}>Txns</div>
                          <div className="text-[13px] font-black font-mono" style={{ color: isDark ? "#fff" : "#0f172a" }}>
                            {entry.txCount}
                          </div>
                        </div>
                        <a
                          href={`${entry.explorer}/block/${entry.blockNumber}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-[10px] font-bold hover:underline ml-auto"
                          style={{ color: entry.color }}
                        >
                          View 
                        </a>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}


          {/* ══════════════════════════════════════════════════════════════
              TAB: OVERVIEW
          ══════════════════════════════════════════════════════════════ */}
          {activeTab === "overview" && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
            >
              <div className="mb-6">
                <h1
                  className="text-[20px] font-black tracking-tight"
                  style={{ color: isDark ? "#fff" : "#0f172a" }}
                >
                  Registry Overview
                </h1>
                <p
                  className="text-[12px] mt-0.5"
                  style={{
                    color: isDark
                      ? "rgba(255,255,255,0.85)"
                      : "rgba(0,0,0,0.45)",
                  }}
                >
                  {network === "mainnet" ? "Mainnet" : "Testnet"} registry live Network statistics
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
                {[
                  {
                    label: "Wallets",
                    value: stats.totalWallets.toLocaleString(),
                    
                    color: "#000000",
                  },
                  {
                    label: "Chains",
                    value: stats.totalChains.toString(),
                    
                    color: "#000000",
                  },
                  {
                    label: "Latest Block",
                    value: stats.latestBlock
                      ? `#${stats.latestBlock.toLocaleString()}`
                      : "–",
                    
                    color: "#000000",
                  },
                  {
                    label: "Txns Scanned",
                    value: stats.totalTxs.toLocaleString(),
                    
                    color: "#000000",
                  },
                  {
                    label: "Senders",
                    value: stats.senders.toLocaleString(),
                    
                    color: "#000000",
                  },
                  {
                    label: "Receivers",
                    value: stats.receivers.toLocaleString(),
                    
                    color: "#000000",
                  },
                ].map((s: any, i) => (
                  <motion.div
                    key={s.label}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="rounded-2xl p-4"
                    style={{
                      border: isDark
                        ? "1px solid rgba(255,255,255,0.07)"
                        : "1px solid rgba(0,0,0,0.07)",
                      backgroundColor: isDark ? "#0d0d17" : "#fff",
                    }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span
                        className="text-[9px] font-black uppercase tracking-[0.12em]"
                        style={{
                          color: isDark
                            ? "rgba(255,255,255,0.75)"
                            : "rgba(0,0,0,0.35)",
                        }}
                      >
                        {s.label}
                      </span>
                      <div
                        className="p-1.5 rounded-lg"
                        style={{
                          backgroundColor: s.color + "18",
                          color: s.color,
                        }}
                      >
                        {s.icon}
                      </div>
                    </div>
                    {loading ? (
                      <div
                        className="h-7 w-16 rounded-lg animate-pulse"
                        style={{
                          backgroundColor: isDark
                            ? "rgba(255,255,255,0.07)"
                            : "rgba(0,0,0,0.07)",
                        }}
                      />
                    ) : (
                      <div
                        className="text-[22px] font-black tracking-tight leading-none"
                        style={{ color: isDark ? "#fff" : "#0f172a" }}
                      >
                        {s.value}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Chain Breakdown Table */}
              <div
                className="rounded-2xl overflow-hidden mb-6"
                style={{
                  border: isDark
                    ? "1px solid rgba(255,255,255,0.07)"
                    : "1px solid rgba(0,0,0,0.07)",
                  backgroundColor: isDark ? "#0d0d17" : "#fff",
                }}
              >
                <div
                  className="px-5 py-4"
                  style={{
                    borderBottom: isDark
                      ? "1px solid rgba(255,255,255,0.06)"
                      : "1px solid rgba(0,0,0,0.06)",
                  }}
                >
                  <h2
                    className="text-[11px] font-black uppercase tracking-[0.12em]"
                    style={{
                      color: isDark
                        ? "rgba(255,255,255,0.9)"
                        : "rgba(0,0,0,0.5)",
                    }}
                  >
                    Chain Breakdown
                  </h2>
                </div>

                {(network === "mainnet" ? MAINNET_CHAINS : TESTNET_CHAINS).map(
                  (cfg, i) => {
                    const chainWallets = wallets.filter(
                      (w) => w.chainId === cfg.chain.id
                    );
                    const chainRoot = blockRoots.find(
                      (r) => r.chain === cfg.label && r.isCurrent
                    );
                    return (
                      <motion.div
                        key={cfg.chain.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.04 }}
                        className="px-5 py-4 flex items-center justify-between transition-colors"
                        style={{
                          borderBottom: isDark
                            ? "1px solid rgba(255,255,255,0.04)"
                            : "1px solid rgba(0,0,0,0.04)",
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLElement).style.backgroundColor = isDark
                            ? "rgba(255,255,255,0.02)"
                            : "rgba(0,0,0,0.015)";
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
                        }}
                      >
                        {/* Chain Info */}
                        <div className="flex items-center gap-3">
                          <div
                            className="w-9 h-9 rounded-full flex items-center justify-center text-[9px] font-black shrink-0"
                            style={{
                              backgroundColor: cfg.color + "18",
                              border: `1px solid ${cfg.color}30`,
                              color: cfg.color,
                            }}
                          >
                            {cfg.badge}
                          </div>
                          <div>
                            <div
                              className="text-[13px] font-bold"
                              style={{ color: isDark ? "#fff" : "#0f172a" }}
                            >
                              {cfg.label}
                            </div>
                            <div
                              className="text-[10px] font-mono"
                              style={{
                                color: isDark
                                  ? "rgba(255,255,255,0.75)"
                                  : "rgba(0,0,0,0.35)",
                              }}
                            >
                              Chain ID: {cfg.chain.id}
                            </div>
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="flex items-center gap-8">
                          <div className="text-right hidden sm:block">
                            <div
                              className="text-[9px] font-black uppercase tracking-[0.1em] mb-0.5"
                              style={{
                                color: isDark
                                  ? "rgba(255,255,255,0.7)"
                                  : "rgba(0,0,0,0.3)",
                              }}
                            >
                              Wallets
                            </div>
                            <div
                              className="text-[13px] font-black font-mono"
                              style={{ color: isDark ? "#fff" : "#0f172a" }}
                            >
                              {chainWallets.length.toLocaleString()}
                            </div>
                          </div>
                          <div className="text-right hidden md:block">
                            <div
                              className="text-[9px] font-black uppercase tracking-[0.1em] mb-0.5"
                              style={{
                                color: isDark
                                  ? "rgba(255,255,255,0.7)"
                                  : "rgba(0,0,0,0.3)",
                              }}
                            >
                              Latest Block
                            </div>
                            <div
                              className="text-[13px] font-black font-mono"
                              style={{ color: isDark ? "#fff" : "#0f172a" }}
                            >
                              {chainRoot
                                ? `#${chainRoot.blockNumber.toLocaleString()}`
                                : "–"}
                            </div>
                          </div>
                          <div className="text-right">
                            <div
                              className="text-[9px] font-black uppercase tracking-[0.1em] mb-0.5"
                              style={{
                                color: isDark
                                  ? "rgba(255,255,255,0.7)"
                                  : "rgba(0,0,0,0.3)",
                              }}
                            >
                              Status
                            </div>
                            <div className="flex items-center gap-1.5 justify-end">
                              <div
                                className="w-2 h-2 rounded-full"
                                style={{
                                  backgroundColor: chainRoot
                                    ? "#10b981"
                                    : loading
                                    ? "#f59e0b"
                                    : isDark
                                    ? "rgba(255,255,255,0.2)"
                                    : "rgba(0,0,0,0.2)",
                                  animation: chainRoot
                                    ? "pulse 2s infinite"
                                    : "none",
                                }}
                              />
                              <span
                                className="text-[11px] font-bold"
                                style={{ color: isDark ? "#fff" : "#0f172a" }}
                              >
                                {chainRoot
                                  ? "Live"
                                  : loading
                                  ? "Syncing…"
                                  : "—"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  }
                )}
              </div>

              {/* Registry Metadata */}
              <div
                className="rounded-2xl p-5"
                style={{
                  border: isDark
                    ? "1px solid rgba(255,255,255,0.07)"
                    : "1px solid rgba(0,0,0,0.07)",
                  backgroundColor: isDark ? "#0d0d17" : "#fff",
                }}
              >
                <h2
                  className="text-[11px] font-black uppercase tracking-[0.12em] mb-5"
                  style={{
                    color: isDark
                      ? "rgba(255,255,255,0.8)"
                      : "rgba(0,0,0,0.4)",
                  }}
                >
                  Registry Metadata
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                  {[
                    {
                      label: "Network Mode",
                      value:
                        network === "mainnet" ? "Production" : "Testnet",
                    },
                    { label: "Scan Depth", value: `${SCAN_DEPTH} blocks / chain` },
                    {
                      label: "Index Method",
                      value: "Tx participants (from + to)",
                    },
                    {
                      label: "Deduplication",
                      value: "Address × Chain ID",
                    },
                    { label: "Data Source", value: "Network (Live)" },
                    { label: "Update Mode", value: "On-demand refresh" },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <div
                        className="text-[9px] font-black uppercase tracking-[0.1em] mb-1"
                        style={{
                          color: isDark
                            ? "rgba(255,255,255,0.7)"
                            : "rgba(0,0,0,0.3)",
                        }}
                      >
                        {label}
                      </div>
                      <div
                        className="text-[12px] font-bold"
                        style={{ color: isDark ? "#fff" : "#0f172a" }}
                      >
                        {value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <SystemFooter />
      </div>
    </div>
  );
}