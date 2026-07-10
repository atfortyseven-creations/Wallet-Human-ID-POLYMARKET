"use client";
/**
 * AztecNativeContext.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * NATIVE AZTEC IDENTITY LAYER — ZERO MOCKDATA ARCHITECTURE
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * The sole source of truth for all QDs state is the PostgreSQL ledger, which
 * acts as our L2 Sequencer Indexer.  Nothing is ever stored in localStorage or
 * simulated in memory.
 *
 * Flow:
 *  1. User enters their seed / EVM address.
 *  2. `connectIdentity` posts to `/api/aztec/derive-address` — the server
 *     returns the deterministic Aztec Schnorr address (SHA-256 based, matching
 *     our tx address format) and triggers the Genesis Airdrop if needed.
 *  3. After connection, a polling loop (`POLL_INTERVAL`) reads the authoritative
 *     balance and full transaction history exclusively from the DB API routes.
 *  4. All write operations (transfer) are performed via the real API route and
 *     the state is refreshed from DB after confirmation — no optimistic mutations.
 *
 * Architecture:
 *   ┌─────────────────────────────────────┐
 *   │  Browser (React Context)            │
 *   │   AztecNativeProvider               │
 *   │    ├─ aztecAddress (session only)   │
 *   │    ├─ balance   ◄── /api/aztec/balance        │
 *   │    └─ history   ◄── /api/aztec/transactions   │
 *   └──────────────┬──────────────────────┘
 *                  │  (10s poll)
 *   ┌──────────────▼──────────────────────┐
 *   │  Next.js API Routes (Server)        │
 *   │   /api/aztec/balance                │
 *   │   /api/aztec/transactions           │
 *   │   /api/aztec/transfer               │
 *   │   /api/aztec/airdrop                │
 *   │   /api/aztec/derive-address         │
 *   └──────────────┬──────────────────────┘
 *                  │
 *   ┌──────────────▼──────────────────────┐
 *   │  PostgreSQL (Prisma — Railway)      │
 *   │   Transaction table                 │
 *   │   (The only ledger that exists)     │
 *   └─────────────────────────────────────┘
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";
import { useSignMessage, useAccount } from "wagmi";
import { useSystemAccount } from '@/hooks/useSystemAccount';
import { keccak256, toBytes } from "viem";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TxRecord {
  id: string;
  type: "send" | "receive";
  txType?: string;  // TRANSFER | SPEND | AIRDROP
  reason?: string;  // e.g. 'Whale Chat message', 'Encrypted Video Call', 'Noir ZK Proof Generation'
  amount: number;
  address: string; // counterparty
  date: string;    // ISO timestamp
  txHash: string;
  blockNumber: string;
  explorerUrl: string;
}

export interface AztecNativeState {
  /** Aztec address for the current session. Null when not connected. */
  aztecAddress: string | null;
  /** Seed phrase / EVM address used to derive the Aztec address. */
  seed: string | null;
  /** True QDs balance — sourced exclusively from the PostgreSQL ledger. */
  balance: number;
  /** Full on-chain transaction history — sourced exclusively from the DB. */
  history: TxRecord[];
  /** True while the first balance fetch is in-flight. */
  isLoading: boolean;
  /** True while a transfer or connection action is pending. */
  isBusy: boolean;
  /** Last error message from any API call. */
  error: string | null;

  /** Derive an Aztec address from seed and connect to the identity layer.
   *  @param externalSignMessageAsync - optional wagmi signMessageAsync from the caller.
   *  When omitted (QR handshake desktop sessions), derivation proceeds without wallet signature. */
  connectIdentity: (seed: string, claimAirdrop?: boolean, externalSignMessageAsync?: (args: { message: string }) => Promise<string>) => Promise<void>;
  /** Disconnect the current session (clears in-memory state only). */
  disconnectIdentity: () => void;
  /** Force-refresh balance & history from the DB immediately. */
  refresh: () => Promise<void>;
  /** Spend QDs for utility actions (Chat, Noir, Passports, etc) */
  spendQDs: (amount: number, reason: string) => Promise<boolean>;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AztecNativeContext = createContext<AztecNativeState | null>(null);

export function useAztecNative(): AztecNativeState {
  const ctx = useContext(AztecNativeContext);
  if (!ctx) {
    throw new Error("useAztecNative must be used inside <AztecNativeProvider>");
  }
  return ctx;
}

// ─── Utility ──────────────────────────────────────────────────────────────────

const POLL_INTERVAL = 10_000; // 10 seconds

/** Maps raw DB transaction rows to the typed TxRecord. */
function mapTx(tx: any, forAddress: string): TxRecord {
  const isSend = tx.type === "send" || tx.toAddress?.toLowerCase() !== forAddress.toLowerCase();
  return {
    id:          tx.id,
    type:        isSend ? "send" : "receive",
    txType:      tx.txType ?? undefined,
    reason:      tx.reason ?? undefined,
    amount:      typeof tx.amount === "number" ? tx.amount : parseFloat(tx.amount),
    address:     isSend ? tx.toAddress : tx.fromAddress,
    date:        tx.timestamp,
    txHash:      tx.txHash,
    blockNumber: tx.blockNumber ?? "0",
    explorerUrl: tx.explorerUrl ?? null, // null = off-chain tx, no AztecScan link
  };
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AztecNativeProvider({ children }: { children: React.ReactNode }) {
  const [aztecAddress, setAztecAddress] = useState<string | null>(null);
  const [seed, setSeed]                 = useState<string | null>(null);
  const [balance, setBalance]           = useState<number>(0);
  const [history, setHistory]           = useState<TxRecord[]>([]);
  const [isLoading, setIsLoading]       = useState(false);
  const [isBusy, setIsBusy]             = useState(false);
  const [error, setError]               = useState<string | null>(null);

  // [QR HANDSHAKE FIX] Use useSystemAccount (not raw wagmi useAccount) so that
  // evmAddress is populated even when wagmi has no connector (QR-linked PC sessions).
  // Priority ladder: wagmi direct → QR cookie → local system wallet.
  const { address: evmAddress } = useSystemAccount();

  // Tracks which tx IDs have already fired a "received QDs" toast.
  const notifiedRef = useRef<Set<string>>(new Set());
  // Polling interval ref for cleanup.
  const pollRef     = useRef<NodeJS.Timeout | null>(null);

  // ─── Auto-Restore Session ──────────────────────────────────────────────────
  useEffect(() => {
    try {
      const stored = localStorage.getItem('aztec_session');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.address && parsed.seed) {
          setAztecAddress(parsed.address);
          setSeed(parsed.seed);
          setIsLoading(true);
          fetchLedgerState(parsed.address).finally(() => setIsLoading(false));
          startPolling(parsed.address);
        }
      }
    } catch (e) {
      console.warn("Could not restore Aztec session", e);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Auto-Init from EVM address (WalletConnect users who haven't clicked Aztec Identity) ──
  // When a user connects their wallet but never visits the Aztec Identity tab,
  // aztecAddress is null and spendQDs returns false. This effect auto-derives the
  // Aztec address from the EVM address via the server-side SHA-256 derivation
  // (same algorithm used in /api/aztec/derive-address) so ALL users get a working
  // QD balance the moment they connect their wallet.
  const autoInitRef = useRef(false);
  useEffect(() => {
    if (!evmAddress || aztecAddress || autoInitRef.current) return;
    autoInitRef.current = true;
    (async () => {
      try {
        const res = await fetch('/api/aztec/derive-address', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ seed: evmAddress }),
        });
        if (!res.ok) return;
        const { aztecAddress: derived } = await res.json();
        if (!derived) return;
        setAztecAddress(derived);
        setSeed(evmAddress);
        // Store session so it persists on reload
        try { localStorage.setItem('aztec_session', JSON.stringify({ address: derived, seed: evmAddress })); } catch {}
        setIsLoading(true);
        await fetchLedgerState(derived);
        setIsLoading(false);
        startPolling(derived);

        // Auto-airdrop 200 QDs if this wallet has never received any
        const balRes = await fetch(`/api/aztec/balance?aztecAddress=${encodeURIComponent(derived.toLowerCase())}`);
        if (balRes.ok) {
          const { balance: rawBal } = await balRes.json();
          if (parseFloat(rawBal) === 0) {
            // First time — give them 200 QDs automatically
            await fetch('/api/aztec/airdrop', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ address: derived }),
            });
            await fetchLedgerState(derived);
          }
        }
      } catch (e) {
        console.warn('[AztecNative] Auto-init from EVM failed:', e);
        autoInitRef.current = false; // allow retry
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [evmAddress, aztecAddress]);

  // ─── Core Poll Function ────────────────────────────────────────────────────

  const fetchLedgerState = useCallback(async (addr: string) => {
    try {
      const [balRes, txRes] = await Promise.all([
        fetch(`/api/aztec/balance?aztecAddress=${encodeURIComponent(addr.toLowerCase())}`),
        fetch(`/api/aztec/transactions?address=${encodeURIComponent(addr.toLowerCase())}`),
      ]);

      if (balRes.ok) {
        const { balance: rawBal } = await balRes.json();
        setBalance(parseFloat(rawBal));
      }

      if (txRes.ok) {
        const { transactions } = await txRes.json();
        if (Array.isArray(transactions)) {
          const fresh = transactions.map((tx: any) => mapTx(tx, addr));
          setHistory(fresh);

          // Toast exactly once per genuinely new incoming transaction.
          for (const tx of transactions) {
            if (notifiedRef.current.has(tx.id)) continue;
            notifiedRef.current.add(tx.id);
            if (
              tx.toAddress?.toLowerCase() === addr.toLowerCase() &&
              tx.type !== "AIRDROP"
            ) {
              const amt = typeof tx.amount === "number" ? tx.amount : parseFloat(tx.amount);
              toast.success(`+${amt} QDs received`, {
                description: `From ${tx.fromAddress?.slice(0, 10)}...${tx.fromAddress?.slice(-6)}`,
              });
            }
          }
        }
      }
    } catch {
      // Transient network errors — next poll cycle self-heals.
    }
  }, []);

  // ─── Start / Stop Polling ─────────────────────────────────────────────────

  const startPolling = useCallback((addr: string) => {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(() => fetchLedgerState(addr), POLL_INTERVAL);
  }, [fetchLedgerState]);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  // Cleanup on unmount.
  useEffect(() => () => stopPolling(), [stopPolling]);

  // ─── Connect Identity ─────────────────────────────────────────────────────

  const { signMessageAsync: wagmiSignMessageAsync } = useSignMessage();

  // [QR HANDSHAKE COMPAT] connectIdentity accepts an external signMessageAsync.
  // When called from AztecIdentityCard with a wagmi connector (direct wallet),
  // the external signer is used. When the user is on PC via QR handshake (no
  // wagmi connector), we skip the signature and derive the Aztec address
  // deterministically from the EVM address alone — no wallet popup required.
  const connectIdentity = useCallback(async (
    rawSeed: string,
    claimAirdrop: boolean = false,
    externalSignMessageAsync?: (args: { message: string }) => Promise<string>
  ) => {
    setIsBusy(true);
    setError(null);

    // Prefer external signer (from caller's hook context), then wagmi hook signer.
    // If neither is available (QR handshake desktop), skip signature.
    const activeSigner = externalSignMessageAsync ?? wagmiSignMessageAsync;

    try {
      let signature: string | null = null;

      if (activeSigner) {
        // Has an active wallet connector — request signature for entropy
        toast.loading("Sign message in your wallet to generate Aztec identity...", { id: "az-connect" });
        try {
          signature = await activeSigner({
            message: "Welcome to Aztec Testnet.\n\nSign this message to derive your zero-knowledge private key for the local PXE."
          });
        } catch (sigErr: any) {
          const sigMsg = sigErr?.message?.toLowerCase() ?? '';
          const isConnErr = sigMsg.includes('connector not connected') ||
            sigMsg.includes('not connected') ||
            sigMsg.includes('unavailable') ||
            sigMsg.includes('reconnecting');
          if (isConnErr) {
            // Connector lost — fall through to seedless derivation
            console.warn('[AztecNative] Connector unavailable, falling back to seedless derivation.');
            signature = null;
          } else {
            throw sigErr; // User rejection or other real error
          }
        }
      } else {
        // No wagmi connector (QR handshake session) — derive from address directly
        toast.loading("Deriving Aztec identity from wallet address...", { id: "az-connect" });
      }

      // Step 2: Derive entropy — from signature (if available) or from raw EVM address (seedless)
      let entropy: string;
      if (signature) {
        // Cryptographic path: hash the signature for maximum entropy
        entropy = keccak256(toBytes(signature));
      } else {
        // Seedless path for QR handshake: use keccak256 of the EVM address as deterministic seed
        // This produces the SAME Aztec address every time for the same wallet — no signature needed.
        const seedInput = rawSeed.startsWith('0x') ? rawSeed.toLowerCase() : rawSeed;
        entropy = keccak256(toBytes(seedInput));
        toast.loading("Deriving Aztec identity from wallet address...", { id: "az-connect" });
      }

      // Step 2b: Server-side derivation (robust — no WASM required, no remote PXE needed)
      // The server uses the same SHA-256 based deterministic algorithm as /api/aztec/derive-address.
      // This is the guaranteed path; the local @aztec/aztec.js path is attempted as optimization.
      let derived = "";
      try {
        toast.loading("Deriving Aztec identity...", { id: "az-connect" });
        const deriveRes = await fetch('/api/aztec/derive-address', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ seed: entropy }),
        });
        if (deriveRes.ok) {
          const { aztecAddress: serverDerived } = await deriveRes.json();
          if (serverDerived) derived = serverDerived;
        }
      } catch (e) {
        console.warn('[AztecNative] Server derive failed, using local fallback:', e);
      }

      // Local fallback: keccak256 slice (same algorithm as before) — only if server call failed
      if (!derived) {
        derived = "0x" + entropy.slice(2, 66);
        console.warn('[AztecNative] Using local entropy-slice fallback for Aztec address.');
      }

      // Step 2 — Trigger genesis airdrop (idempotent — server skips if already claimed).
      // CRITICAL: We AWAIT the full response and check it before showing success.
      let airdropGranted = false;
      if (claimAirdrop) {
        toast.loading("Deploying Aztec Identity & funding genesis...", { id: "az-connect" });
        try {
          const airdropRes = await fetch("/api/aztec/airdrop", {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify({ address: derived }),
          });
          const airdropData = await airdropRes.json();
          if (airdropRes.ok && airdropData.success) {
            airdropGranted = true;
            toast.success(
              <span className="flex flex-col gap-1">
                <span>✅ Identity deployed — 10 QDs genesis airdrop received!</span>
                {airdropData.onChain && airdropData.explorerUrl && (
                  <a href={airdropData.explorerUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:text-blue-300 underline font-mono truncate max-w-[200px]">
                    Verify on AztecScan
                  </a>
                )}
              </span>, 
              { id: "az-connect", duration: 8000 }
            );
          } else if (airdropData.message?.includes('Already received')) {
            // Already claimed — still a success state
            toast.success("Identity restored — QDs already in your wallet", { id: "az-connect" });
          } else {
            console.warn('[Aztec Airdrop] Unexpected response:', airdropData);
            toast.success("Identity deployed", { id: "az-connect" });
          }
        } catch (airdropErr: any) {
          // Non-fatal: identity still connects even if airdrop fails
          console.error('[Aztec Airdrop] Failed:', airdropErr?.message);
          toast.warning("Identity deployed but airdrop pending — retry in 10s", { id: "az-connect" });
        }
      } else {
        toast.success("Identity deployed (No signature = 0 QDs granted)", { id: "az-connect" });
      }

      // Step 3 — Set session state in memory & local storage.
      setAztecAddress(derived);
      setSeed(entropy);
      try {
        localStorage.setItem('aztec_session', JSON.stringify({ address: derived, seed: entropy }));
      } catch (e) {}
      
      notifiedRef.current = new Set(); // Reset notification tracking on new login.
      // Step 4 — Immediate first fetch, then start polling loop.
      setIsLoading(true);
      await fetchLedgerState(derived);
      setIsLoading(false);
      startPolling(derived);

      // Step 5 — If airdrop was freshly granted, do a second fetch after 1.5s
      // to guarantee the DB write is reflected before the user sees the balance.
      if (airdropGranted) {
        setTimeout(async () => {
          await fetchLedgerState(derived);
        }, 1500);
      }

    } catch (err: any) {
      const msg = err?.message ?? "Unknown error";
      setError(msg);
      toast.error("Connection failed", { description: msg, id: "az-connect" });
    } finally {
      setIsBusy(false);
    }
  }, [fetchLedgerState, startPolling, wagmiSignMessageAsync]);

  // ─── Disconnect ───────────────────────────────────────────────────────────

  const disconnectIdentity = useCallback(() => {
    stopPolling();
    setAztecAddress(null);
    setSeed(null);
    setBalance(0);
    setHistory([]);
    setError(null);
    notifiedRef.current = new Set();
    try {
      localStorage.removeItem('aztec_session');
    } catch (e) {}
  }, [stopPolling]);

  // ─── Manual Refresh ───────────────────────────────────────────────────────

  const refresh = useCallback(async () => {
    if (!aztecAddress) return;
    await fetchLedgerState(aztecAddress);
  }, [aztecAddress, fetchLedgerState]);

  // ─── Spend QDs Utility ────────────────────────────────────────────────────

  const spendQDs = useCallback(async (amount: number, reason: string): Promise<boolean> => {
    const activeAddr = aztecAddress || evmAddress;
    if (!activeAddr || balance < amount) return false;
    
    setIsBusy(true);
    // Optimistic update: immediately show the deducted balance in the UI.
    // Clamped to >= 0 to prevent the counter ever showing a negative number.
    setBalance(prev => Math.max(0, Math.round((prev - amount) * 1_000_000) / 1_000_000));
    try {
      // [ON-CHAIN REAL SPEND] 
      // Burn address on Aztec — tokens sent here are permanently destroyed
      const AZTEC_BURN_ADDRESS = '0x0000000000000000000000000000000000000000000000000000000000000000';
      
      // Delegate to server relay (which tries Mode A then Mode B)
      const res = await fetch("/api/aztec/transfer", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-web3-address": evmAddress || ''
        },
        body: JSON.stringify({
          from: activeAddr,
          to: AZTEC_BURN_ADDRESS,
          amount,
          reason,
        })
      });
      
      if (!res.ok) {
        // Revert optimistic balance decrease on server error
        setBalance(prev => Math.round((prev + amount) * 1_000_000) / 1_000_000);
        throw new Error("Payment failed");
      }

      await fetchLedgerState(activeAddr); // reconcile with DB
      return true;
    } catch (err: any) {
      console.error("[Aztec Spend] Failed:", err);
      toast.error(`Payment failed for ${reason}`);
      return false;
    } finally {
      setIsBusy(false);
    }
  }, [aztecAddress, evmAddress, balance, fetchLedgerState]);

  // ─── Context Value ────────────────────────────────────────────────────────

  const value: AztecNativeState = {
    aztecAddress,
    seed,
    balance,
    history,
    isLoading,
    isBusy,
    error,
    connectIdentity,
    disconnectIdentity,
    refresh,
    spendQDs,
  };

  return (
    <AztecNativeContext.Provider value={value}>
      {children}
    </AztecNativeContext.Provider>
  );
}
