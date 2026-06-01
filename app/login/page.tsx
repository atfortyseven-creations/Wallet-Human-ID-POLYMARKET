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
  const [authMethod, setAuthMethod] = useState<'select' | 'humanity'>('select');

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
    if (returnUrl && returnUrl !== '/portfolio') {
      if (returnUrl.startsWith("http")) {
        window.location.href = returnUrl;
      } else {
        window.location.replace(returnUrl);
      }
    } else {
      // Always land on the main page so the user can choose what to do next.
      window.location.replace("/");
    }
  }, []);

  // ── Post-unlock shared steps ─────────────────────────────────────────────
  const afterUnlock = useCallback(async (pk: string, address: string, cleanPwd: string) => {
    try {
      sessionStorage.setItem("portfolio_unlocked", "true");
      sessionStorage.setItem("system_wallet_addr", address.toLowerCase());
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

      toast.success("Wallet Desbloqueado", { description: `${addr.slice(0, 6)}...${addr.slice(-4)}` });
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
          className="absolute inset-0"
          style={{
            backgroundImage: "url('/system-shots/Devine-Lu-Linvega-monochrome-pixel-art-illustration-arch-2268374-wallhere.com.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        />
      </div>

      {/* Login Box */}
      <div className="relative z-10 w-[90%] max-w-[420px] bg-white p-6 md:p-12 border-[3px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] md:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center">
        <h1 className="text-3xl font-black uppercase tracking-tighter text-black mb-2 text-center">
          {authMethod === 'select' ? "ACCESS GATEWAY" : "Sign In"}
        </h1>
        <p className="text-xs font-bold text-black mb-6 text-center uppercase tracking-widest">
          {authMethod === 'select' ? "Select your connection method" : "Enter your password to access"}
        </p>

        {authMethod === 'select' ? (
          <div className="flex flex-col gap-4 w-full">
            <button
              onClick={() => setAuthMethod('humanity')}
              className="bg-black text-white font-black uppercase tracking-widest hover:bg-black/80 transition-colors w-full"
              style={{ padding: "16px 32px", border: "2px solid black" }}
            >
              CONTINUE WITH HUMANITY LEDGER
            </button>
            <Link
              href="/connect"
              className="bg-white text-black font-black uppercase tracking-widest hover:bg-black/5 transition-colors w-full text-center"
              style={{ padding: "16px 32px", border: "2px solid black" }}
            >
              CONTINUE WITH WALLETCONNECT
            </Link>
            <div className="mt-4 flex flex-col items-center gap-2 w-full">
              <Link
                href="/sign-up"
                className="text-[11px] font-black uppercase tracking-widest text-black/40 hover:text-black transition-colors"
              >
                No account? Create one →
              </Link>
            </div>
          </div>
        ) : (
          <>

        {/* Account selector — shown when multiple CoreAuthGate accounts exist */}
        {systemAccounts.length > 1 && (
          <div className="w-full mb-6 border-2 border-black">
            <div className="bg-black text-white text-[10px] font-black uppercase tracking-widest px-3 py-1">
              Select Account
            </div>
            <div className="max-h-[120px] overflow-y-auto">
              {systemAccounts.map(acc => (
                <button
                  key={acc.id}
                  onClick={() => setSelectedAccount(acc)}
                  className={`w-full text-left px-3 py-2 text-sm font-bold uppercase tracking-wider transition-colors ${
                    selectedAccount?.id === acc.id
                      ? "bg-black text-white"
                      : "hover:bg-black/5 text-black"
                  }`}
                >
                  {acc.name}
                  {acc.address && (
                    <span className="ml-2 text-[11px] font-normal opacity-60">
                      {acc.address.slice(0, 6)}...{acc.address.slice(-4)}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-6 w-full">
          <input
            type="password"
            placeholder="PASSWORD"
            value={password}
            onChange={e => setPassword(e.target.value)}
            disabled={loading}
            autoComplete="current-password"
            className="w-full bg-white border-2 border-black px-4 py-4 text-black text-center font-bold uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-black transition-all placeholder:text-black/30"
          />

          <button
            type="submit"
            disabled={loading || !password}
            className="bg-white text-black font-black uppercase tracking-widest hover:bg-black hover:text-white transition-colors disabled:opacity-50 mx-auto"
            style={{ padding: "16px 32px", border: "2px solid black" }}
          >
            {loading ? "UNLOCKING..." : "SIGN IN"}
          </button>
        </form>

        <div className="mt-8 flex flex-col items-center gap-2 w-full">
          <button
            onClick={() => setAuthMethod('select')}
            className="text-[11px] font-black uppercase tracking-widest text-black/40 hover:text-black transition-colors mb-4"
          >
            ← Back to Connection Options
          </button>
        </div>
        </>
        )}
      </div>
    </div>
  );
}
