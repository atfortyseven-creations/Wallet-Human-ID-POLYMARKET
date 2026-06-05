"use client";

/**
 * CommandPalette  Global Search and Navigation (Cmd+K / Ctrl+K)
 *
 * Provides instant access to:
 *   - All 16 dashboard modules
 *   - Wallet address search
 *   - Transaction hash lookup (open Etherscan)
 *   - Akashic Ledger entries
 *   - Quick actions (Connect wallet, QR bridge, etc.)
 *
 * Keyboard contract:
 *   Open:  Cmd+K (Mac) / Ctrl+K (Windows/Linux)
 *   Close: Escape or click outside
 *   Nav:   Arrow Up / Arrow Down
 *   Select: Enter
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, X, Hash, Wallet, Activity, Globe, Shield, Database,
  TrendingUp, Plus, Terminal, Cpu, GraduationCap, Link2, Zap,
  LayoutDashboard, RefreshCw, QrCode, ArrowRight, Clock,
  AlertTriangle, BookOpen
} from "lucide-react";

//  Types 

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: React.ReactNode;
  category: string;
  action: () => void;
  keywords?: string[];
}

interface CommandPaletteProps {
  onNavigate: (tab: string) => void;
  onBridgeOpen: () => void;
}

//  Constants 

const SIGNAL_TEAL = "#00F2EA";
const CATEGORY_ORDER = ["Navigation", "Analytics", "Vault", "Academy", "Membership", "Actions"];

//  Hook 

export function useCommandPalette() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(prev => !prev);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return { open, setOpen };
}

//  Recent searches (localStorage) 

function getRecent(): string[] {
  try {
    return JSON.parse(localStorage.getItem("cmd_recent") || "[]");
  } catch { return []; }
}

function addRecent(label: string) {
  try {
    const recent = getRecent().filter(r => r !== label).slice(0, 4);
    localStorage.setItem("cmd_recent", JSON.stringify([label, ...recent]));
  } catch {}
}

//  Main Component 

export function CommandPalette({ onNavigate, onBridgeOpen }: CommandPaletteProps) {
  const { open, setOpen } = useCommandPalette();
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const [recent, setRecent] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setQuery("");
      setCursor(0);
      setRecent(getRecent());
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const navigate = useCallback((tab: string, label: string) => {
    onNavigate(tab);
    addRecent(label);
    setRecent(getRecent());
    setOpen(false);
  }, [onNavigate, setOpen]);

  const COMMANDS: CommandItem[] = useMemo(() => [
    // Navigation
    { id: "explorer",       label: "Block Explorer",      description: "Search blocks, addresses, transactions",   icon: <Search size={15}/>,         category: "Navigation", action: () => navigate("explorer", "Block Explorer"),       keywords: ["block", "search", "explorer"] },
    { id: "alerts",         label: "Active Alerts",         description: "Real-time whale movement feed",            icon: <Activity size={15}/>,       category: "Navigation", action: () => navigate("alerts", "Active Alerts"),            keywords: ["alerts", "live", "feed"] },
    { id: "live-txs",       label: "Active Transactions",   description: "Unconfirmed transaction stream",           icon: <RefreshCw size={15}/>,      category: "Navigation", action: () => navigate("live-txs", "Active Transactions"),   keywords: ["transactions", "mempool", "live"] },
    // Analytics
    { id: "tracker",        label: "Whale Tracker",       description: "Track major wallet movements",             icon: <Globe size={15}/>,          category: "Analytics", action: () => navigate("tracker", "Whale Tracker"),       keywords: ["whale", "tracker", "wallet"] },
    { id: "new-pairs",      label: "New Pairs",           description: "Newly launched token pairs on DEXs",       icon: <Plus size={15}/>,           category: "Analytics", action: () => navigate("new-pairs", "New Pairs"),         keywords: ["pairs", "dex", "new", "tokens"] },
    { id: "gainers-losers", label: "Gainers & Losers",    description: "24h market performance leaders",           icon: <TrendingUp size={15}/>,     category: "Analytics", action: () => navigate("gainers-losers", "Gainers & Losers"), keywords: ["gainers", "losers", "performance"] },
    { id: "topography",     label: "Visual Graph",        description: "Network topology visualization",           icon: <LayoutDashboard size={15}/>, category: "Analytics", action: () => navigate("topography", "Visual Graph"),    keywords: ["graph", "topology", "visual"] },
    { id: "api",            label: "API Terminal",        description: "Direct API access and testing",            icon: <Terminal size={15}/>,       category: "Analytics", action: () => navigate("api", "API Terminal"),           keywords: ["api", "terminal", "developer"] },
    { id: "akashic",        label: "Akashic Ledger",      description: "Permanent $50M+ movement registry",        icon: <Database size={15}/>,       category: "Analytics", action: () => navigate("akashic", "Akashic Ledger"),     keywords: ["akashic", "ledger", "registry", "movements"] },
    { id: "mass-transfer",  label: "Mass Transfers",      description: "Coordinated capital flow detection",       icon: <AlertTriangle size={15}/>,  category: "Analytics", action: () => navigate("mass-transfer", "Mass Transfers"), keywords: ["mass", "transfer", "coordinated", "capital"] },
    // Vault
    { id: "portfolio",      label: "My Portfolio",        description: "Wallet assets and performance",            icon: <Wallet size={15}/>,         category: "Vault",        action: () => navigate("portfolio", "My Portfolio"),     keywords: ["portfolio", "wallet", "assets", "balance"] },
    { id: "security",       label: "Security Center",     description: "Vault security and session management",    icon: <Shield size={15}/>,         category: "Vault",        action: () => navigate("security", "Security Center"),   keywords: ["security", "vault", "session", "protection"] },
    // Academy
    { id: "bitcoin-net",    label: "Bitcoin Network",     description: "Bitcoin protocol fundamentals",            icon: <Cpu size={15}/>,            category: "Academy",      action: () => navigate("bitcoin-net", "Bitcoin Network"), keywords: ["bitcoin", "network", "protocol", "learn"] },
    { id: "support",        label: "Support Center",      description: "Documentation and help resources",         icon: <GraduationCap size={15}/>,  category: "Academy",      action: () => navigate("support", "Support Center"),    keywords: ["support", "help", "docs"] },
    { id: "exchange",       label: "Connect Exchange",    description: "Link centralized exchange accounts",       icon: <Link2 size={15}/>,          category: "Academy",      action: () => navigate("exchange", "Connect Exchange"), keywords: ["exchange", "cex", "connect", "binance"] },
    // Membership
    { id: "gold-whale",     label: "Gold Whale Network",  description: "Institutional membership tier",            icon: <Zap size={15} style={{ color: "#D4AF37" }}/>, category: "Membership", action: () => navigate("gold-whale", "Gold Whale Network"), keywords: ["gold", "membership", "premium", "vip"] },
    // Actions
    { id: "qr-bridge",      label: "Open Device Bridge",  description: "Scan QR to link mobile wallet",           icon: <QrCode size={15}/>,         category: "Actions",      action: () => { onBridgeOpen(); setOpen(false); },       keywords: ["qr", "bridge", "mobile", "scan"] },
  ], [navigate, onBridgeOpen, setOpen]);

  // Filter
  const filtered = useMemo(() => {
    if (!query.trim()) return COMMANDS;
    const q = query.toLowerCase();
    return COMMANDS.filter(cmd =>
      cmd.label.toLowerCase().includes(q) ||
      cmd.description?.toLowerCase().includes(q) ||
      cmd.keywords?.some(k => k.includes(q))
    );
  }, [query, COMMANDS]);

  // Grouped
  const grouped = useMemo(() => {
    const groups: Record<string, CommandItem[]> = {};
    filtered.forEach(cmd => {
      if (!groups[cmd.category]) groups[cmd.category] = [];
      groups[cmd.category].push(cmd);
    });
    return CATEGORY_ORDER.filter(c => groups[c]?.length).map(c => ({ category: c, items: groups[c] }));
  }, [filtered]);

  // Flat list for keyboard nav
  const flat = useMemo(() => grouped.flatMap(g => g.items), [grouped]);

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") { e.preventDefault(); setCursor(c => Math.min(c + 1, flat.length - 1)); }
      if (e.key === "ArrowUp")   { e.preventDefault(); setCursor(c => Math.max(c - 1, 0)); }
      if (e.key === "Enter" && flat[cursor]) { flat[cursor].action(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, flat, cursor]);

  // Scroll active item into view
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-cursor="${cursor}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [cursor]);

  // Reset cursor on filter change
  useEffect(() => setCursor(0), [query]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[500]"
            style={{ background: "rgba(5,5,5,0.55)", backdropFilter: "blur(6px)" }}
            onClick={() => setOpen(false)}
          />

          {/* Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -16 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="fixed z-[501] left-1/2 top-[15vh] w-full max-w-2xl rounded-3xl overflow-hidden"
            style={{
              transform: "translateX(-50%)",
              background: "#FFFFFF",
              border: "1px solid rgba(0,0,0,0.08)",
              boxShadow: "0 40px 100px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.04)",
            }}
          >
            {/* Search input */}
            <div
              className="flex items-center gap-3 px-5 py-4 border-b"
              style={{ borderColor: "rgba(0,0,0,0.06)" }}
            >
              <Search size={18} style={{ color: "rgba(0,0,0,0.3)", flexShrink: 0 }} />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search modules, wallets, transactions..."
                className="flex-1 bg-transparent outline-none text-sm font-medium"
                style={{ color: "#050505", caretColor: SIGNAL_TEAL }}
              />
              {query && (
                <button onClick={() => setQuery("")}>
                  <X size={14} style={{ color: "rgba(0,0,0,0.3)" }} />
                </button>
              )}
              <kbd
                className="text-[9px] font-mono px-2 py-1 rounded-lg font-black"
                style={{
                  background: "rgba(0,0,0,0.05)",
                  color: "rgba(0,0,0,0.3)",
                  border: "1px solid rgba(0,0,0,0.08)",
                }}
              >
                ESC
              </kbd>
            </div>

            {/* Results */}
            <div
              ref={listRef}
              className="overflow-y-auto scrollbar-hide"
              style={{ maxHeight: "60vh" }}
            >
              {/* Recent searches  only when query is empty */}
              {!query && recent.length > 0 && (
                <div className="p-3">
                  <div className="px-2 pb-2 text-[9px] font-black uppercase tracking-widest" style={{ color: "rgba(0,0,0,0.2)" }}>
                    Recent
                  </div>
                  {recent.map(r => {
                    const cmd = COMMANDS.find(c => c.label === r);
                    if (!cmd) return null;
                    return (
                      <button
                        key={r}
                        onClick={cmd.action}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left hover:bg-[rgba(0,0,0,0.04)]"
                      >
                        <Clock size={13} style={{ color: "rgba(0,0,0,0.2)" }} />
                        <span className="text-[12px] font-medium" style={{ color: "rgba(0,0,0,0.5)" }}>{r}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Command groups */}
              {grouped.map(({ category, items }) => (
                <div key={category} className="p-3">
                  <div className="px-2 pb-2 text-[9px] font-black uppercase tracking-widest" style={{ color: "rgba(0,0,0,0.2)" }}>
                    {category}
                  </div>
                  {items.map(cmd => {
                    const idx = flat.indexOf(cmd);
                    const active = idx === cursor;
                    return (
                      <button
                        key={cmd.id}
                        data-cursor={idx}
                        onClick={cmd.action}
                        onMouseEnter={() => setCursor(idx)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left"
                        style={{
                          background: active ? "#050505" : "transparent",
                        }}
                      >
                        <span style={{ color: active ? SIGNAL_TEAL : "rgba(0,0,0,0.35)", flexShrink: 0 }}>
                          {cmd.icon}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div
                            className="text-[12.5px] font-bold truncate"
                            style={{ color: active ? "#fff" : "#050505" }}
                          >
                            {cmd.label}
                          </div>
                          {cmd.description && (
                            <div
                              className="text-[10px] truncate mt-0.5"
                              style={{ color: active ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.3)" }}
                            >
                              {cmd.description}
                            </div>
                          )}
                        </div>
                        {active && <ArrowRight size={12} style={{ color: SIGNAL_TEAL, flexShrink: 0 }} />}
                      </button>
                    );
                  })}
                </div>
              ))}

              {/* No results */}
              {filtered.length === 0 && (
                <div className="py-16 text-center">
                  <p className="text-[11px] font-black uppercase tracking-widest" style={{ color: "rgba(0,0,0,0.15)" }}>
                    No results for &ldquo;{query}&rdquo;
                  </p>
                </div>
              )}
            </div>

            {/* Footer hints */}
            <div
              className="px-5 py-3 flex items-center gap-5 border-t"
              style={{
                borderColor: "rgba(0,0,0,0.05)",
                background: "rgba(0,0,0,0.02)",
              }}
            >
              {[
                ["", "Navigate"],
                ["", "Select"],
                ["Esc", "Close"],
              ].map(([key, label]) => (
                <div key={key} className="flex items-center gap-1.5">
                  <kbd
                    className="text-[8.5px] font-mono px-1.5 py-0.5 rounded font-black"
                    style={{
                      background: "rgba(0,0,0,0.06)",
                      color: "rgba(0,0,0,0.4)",
                      border: "1px solid rgba(0,0,0,0.08)",
                    }}
                  >
                    {key}
                  </kbd>
                  <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: "rgba(0,0,0,0.25)" }}>
                    {label}
                  </span>
                </div>
              ))}
              <div className="ml-auto text-[9px] font-mono font-black uppercase tracking-widest" style={{ color: "rgba(0,0,0,0.15)" }}>
                Cmd + K
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
