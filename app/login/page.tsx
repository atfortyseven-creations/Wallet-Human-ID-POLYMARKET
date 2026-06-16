"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useWalletStore } from "@/lib/store/wallet-store";
import { useSystemConnect } from "@/hooks/useSystemConnect";
import { tryDecryptAny } from "@/lib/wallet-security";
import { ethers } from "ethers";
import Link from "next/link";

// ─────────────────────────────────────────────────────────────────────────────
// [PERSISTENCE BRIDGE] Universal Login — resolves BOTH auth systems:
//   System A: wallet-store (Zustand + CryptoJS) — used by /sign-up + QuantumVaultOnboarding
//   System B: system_accounts localStorage (AES-GCM) — used by CoreAuthGate (Portfolio page)
//
// Previously only System A was checked. Users who created via Portfolio (System B)
// saw "Account not found" even though their wallet existed in localStorage.
// ─────────────────────────────────────────────────────────────────────────────

interface SystemAccount {
  id: string;
  name: string;
  address: string;
  encryptedBlob: string;
  createdAt: number;
}

// Sanitize password — trims whitespace injected by mobile autocomplete
const sanitize = (p: string) => p.trim();

export default function LoginPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [authMethod] = useState<'select'>('select');

  // Detect which auth system has data
  const [hasStoreVault, setHasStoreVault]       = useState(false);
  const [hasSystemAccounts, setHasSystemAccounts] = useState(false);
  const [systemAccounts, setSystemAccounts]      = useState<SystemAccount[]>([]);
  const [selectedAccount, setSelectedAccount]    = useState<SystemAccount | null>(null);

  const { unlockVault, setupPassword: storeSetupPassword, importWallet, cloudSync } = useWalletStore();
  const { encryptedVault, passwordHash } = useWalletStore();
  const { activateSystemVault } = useSystemConnect();

  useEffect(() => {
    setMounted(true);

    // Detect available auth systems from storage
    try {
      const storeData = localStorage.getItem("whale-system-wallet-registry-v3");
      if (storeData) {
        const parsed = JSON.parse(storeData);
        if (parsed?.state?.passwordHash) setHasStoreVault(true);
      }
    } catch {}

    try {
      const raw = localStorage.getItem("system_accounts");
      if (raw) {
        const accs: SystemAccount[] = JSON.parse(raw);
        if (Array.isArray(accs) && accs.length > 0) {
          setHasSystemAccounts(true);
          setSystemAccounts(accs);
          setSelectedAccount(accs[0]);
        }
      }
    } catch {}
  }, []);

  const handleRedirect = useCallback(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const returnUrl = urlParams.get("returnUrl") || urlParams.get("redirect_url");
    if (returnUrl && returnUrl.startsWith('/') && !returnUrl.startsWith('/connect') && !returnUrl.startsWith('/sign-up')) {
      // Honor any valid internal returnUrl, including /portfolio
      window.location.replace(returnUrl);
    } else {
      // No valid returnUrl — go to portfolio (user just logged in, send them to their wallet)
      window.location.replace("/portfolio");
    }
  }, []);

  // ── Post-unlock shared steps ─────────────────────────────────────────────
  const afterUnlock = useCallback(async (pk: string, address: string, cleanPwd: string) => {
    try {
      sessionStorage.setItem("portfolio_unlocked", "true");
      sessionStorage.setItem("system_wallet_addr", address.toLowerCase());
      sessionStorage.removeItem("__disconnected__");
      localStorage.removeItem("__disconnected__");
    } catch {}

    try { await activateSystemVault(pk, address); } catch {}

    // Issue server JWT so middleware gates open
    try {
      const resp = await fetch("/api/auth/system-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address }),
      });
      if (resp.ok) {
        // Index wallet in DB now that cookies are set
        await cloudSync().catch(() => {});
      }
    } catch {}

    handleRedirect();
  }, [activateSystemVault, cloudSync, handleRedirect]);

  // ── Strategy A: wallet-store (Zustand / CryptoJS) ────────────────────────
  // NOTE: unlockVault may fire a toast.error internally when the hash mismatches.
  // That is acceptable — if System B subsequently succeeds it will override with a success toast.
  const tryStoreUnlock = useCallback(async (cleanPwd: string): Promise<boolean> => {
    const success = unlockVault(cleanPwd);
    if (!success) return false;

    const { privateKey, address } = useWalletStore.getState();
    if (!privateKey || !address) {
      // encryptedVault hash matched but decrypted payload has no privateKey.
      // This happens when the vault was created before the wallet keys were set.
      // Fall through silently to System B which holds the canonical AES-GCM blob.
      console.warn('[Login:SystemA] Vault unlocked but no privateKey — falling through to System B.');
      return false;
    }

    toast.success("Vault Unlocked", { description: `${address.slice(0, 6)}...${address.slice(-4)}` });
    await afterUnlock(privateKey, address, cleanPwd);
    return true;
  }, [unlockVault, afterUnlock]);

  // ── Strategy B: system_accounts (AES-GCM / CoreAuthGate) ─────────────────
  const trySystemAccountUnlock = useCallback(async (cleanPwd: string): Promise<boolean> => {
    const target = selectedAccount || systemAccounts[0];
    if (!target) return false;

    try {
      const { plaintext, wasLegacy } = await tryDecryptAny(target.encryptedBlob, cleanPwd);

      let walletObj: ethers.HDNodeWallet | ethers.Wallet;
      if (wasLegacy) {
        walletObj = new ethers.Wallet(plaintext);
      } else {
        walletObj = ethers.Wallet.fromPhrase(plaintext);
      }

      const pk   = walletObj.privateKey;
      const addr = walletObj.address;

      // Import into wallet-store so balance/tx features work
      importWallet(pk, target.name || "System Main");

      // [BRIDGE] Synchronize wallet-store so future /login visits also work via System A
      try { storeSetupPassword(cleanPwd); } catch {}

      // Update stored address on the account record if it was missing
      if (!target.address) {
        try {
          const updated = systemAccounts.map(a =>
            a.id === target.id ? { ...a, address: addr } : a
          );
          localStorage.setItem("system_accounts", JSON.stringify(updated));
        } catch {}
      }

      toast.success("Wallet Unlocked", { description: `${addr.slice(0, 6)}...${addr.slice(-4)}` });
      await afterUnlock(pk, addr, cleanPwd);
      return true;
    } catch (err: any) {
      // Wrong password — surface clean message, not raw crypto error
      return false;
    }
  }, [selectedAccount, systemAccounts, importWallet, storeSetupPassword, afterUnlock]);

  // ── Main handler ──────────────────────────────────────────────────────────
  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanPwd = sanitize(password);
    if (!cleanPwd) {
      toast.error("Password required");
      return;
    }

    // Must have at least one auth system with data
    if (!hasStoreVault && !hasSystemAccounts) {
      toast.error("No wallet found on this device", {
        description: "Please create an account first.",
      });
      router.push("/sign-up");
      return;
    }

    setLoading(true);
    await new Promise(r => setTimeout(r, 60)); // Yield to render spinner

    try {
      // Try both systems — whichever succeeds first wins.
      // Order: wallet-store first (faster, no crypto), then system_accounts (AES-GCM)
      let success = false;

      if (hasStoreVault) {
        success = await tryStoreUnlock(cleanPwd);
      }

      if (!success && hasSystemAccounts) {
        success = await trySystemAccountUnlock(cleanPwd);
      }

      if (!success) {
        toast.error("Incorrect password", {
          description: "Check your password and try again.",
        });
      }
    } catch (err) {
      toast.error("Login failed — unexpected error");
      console.error("[Login] Unexpected error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="relative min-h-screen bg-white flex items-center justify-center p-4 selection:bg-black selection:text-white">
      {/* Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div
          className="absolute inset-0 z-0 opacity-40 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(#d1d5db 1px, transparent 1px)',
            backgroundSize: '24px 24px'
          }}
        />
      </div>

      {/* Login Box */}
      <div className="relative z-10 w-[90%] max-w-[420px] bg-white p-6 md:p-12 border-[3px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] md:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center">
        <h1 className="text-3xl font-black uppercase tracking-tighter text-black mb-2 text-center">
          ACCESS GATEWAY
        </h1>
        <p className="text-xs font-bold text-black mb-6 text-center uppercase tracking-widest">
          Connect your wallet to continue
        </p>

        <div className="flex flex-col gap-4 w-full">
          <Link
            href="/connect"
            className="bg-black text-white font-black uppercase tracking-widest hover:bg-black/80 transition-colors w-full text-center"
            style={{ padding: "16px 32px", border: "2px solid black" }}
          >
            CONTINUE WITH WALLETCONNECT
          </Link>
          <div className="mt-4 flex flex-col items-center gap-2 w-full">
            <p className="text-[10px] font-mono text-black/30 uppercase tracking-widest text-center">
              Non-custodial · ECDSA Verified · Keys never leave your device
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
