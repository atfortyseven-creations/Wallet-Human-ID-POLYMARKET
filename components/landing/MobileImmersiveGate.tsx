"use client";

/**
 * MobileImmersiveGate
 * ─────────────────────────────────────────────────────────────────────────────
 * FLOW (iOS / Android):
 *   Phase 1 — AUTH GATE  : Full-screen white panel, shown immediately on load.
 *             No scroll required. User sees the auth options instantly.
 *             • Connect Wallet  — triggers Reown AppKit directly from onClick
 *             • Sign in with Email — opens EmailLoginModal
 *             • Apple / Google — OAuth routes
 *
 *   Phase 2 — LANDING    : MobileManifesto slides up after successful auth.
 *
 * WHY we removed the scroll-to-reveal pattern:
 *   - useScroll({ container: ref }) requires the ref to be bound to the DOM
 *     before Framer Motion reads it. On iOS/Android with SSR + async hydration,
 *     the ref is null on first paint — the scroll progress never moves,
 *     loginOpacity stays at 0, and the user sees a blank white screen forever.
 *   - Mobile UX best practice: never require scroll to access primary CTA.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React, { useEffect, useRef, useState, useCallback, startTransition } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { useAppKit } from "@reown/appkit/react";
import { useAccount, useSignMessage } from "wagmi";
import { usePathname } from "next/navigation";
import {
  reconnect as wagmiReconnect,
  watchAccount,
  getAccount,
  getConnectorClient,
} from "@wagmi/core";
import { config as wagmiConfig } from "@/config/appkit";
import { EmailLoginModal } from "@/components/auth/EmailLoginModal";
import { Loader2, Mail, Wallet } from "lucide-react";
import { toast } from "sonner";

import { MobileManifesto } from "./MobileManifesto";

// ─── Session helpers ──────────────────────────────────────────────────────────
function readHandshakeCookie(): string | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(/system_handshake=(0x[0-9a-fA-F]{40,}|email_[^;]+)/i);
  return m?.[1] ?? null;
}

function hasValidSession(): boolean {
  const cookie = readHandshakeCookie();
  if (cookie) return true;
  try {
    const raw = localStorage.getItem("system_session_v2");
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    return parsed?.exp && parsed.exp > Date.now();
  } catch {
    return false;
  }
}

type Phase = "gate" | "landing";

// ─── Component ───────────────────────────────────────────────────────────────
export function MobileImmersiveGate() {
  const [phase, setPhase] = useState<Phase>(() =>
    hasValidSession() ? "landing" : "gate"
  );
  const [mounted, setMounted] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const { address: wagmiAddress, isConnected: wagmiConnected, connector } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { open: rkOpenModal, close: rkCloseModal } = useAppKit();
  const signingRef = useRef(false);
  const pathname = usePathname();

  // ── Mount + OAuth-return detection ────────────────────────────────────────
  useEffect(() => {
    setMounted(true);
    signingRef.current = false;

    try {
      const urlParams = new URLSearchParams(window.location.search);
      const urlHash = window.location.hash;
      const isOAuthReturn =
        urlParams.has("wc-redirect") ||
        urlParams.has("code") ||
        urlParams.has("state") ||
        urlHash.includes("wc-auth") ||
        urlHash.includes("access_token") ||
        document.referrer.includes("accounts.reown.com") ||
        document.referrer.includes("auth.reown.com") ||
        document.referrer.includes("accounts.google.com");

      if (isOAuthReturn) {
        try {
          const keysToRemove: string[] = [];
          for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            if (k?.startsWith("system_auth_")) keysToRemove.push(k);
          }
          keysToRemove.forEach((k) => localStorage.removeItem(k));
        } catch {}
        try {
          const cleanUrl =
            window.location.pathname +
            window.location.search
              .replace(/[?&]code=[^&]*/g, "")
              .replace(/[?&]state=[^&]*/g, "")
              .replace(/^&/, "?");
          window.history.replaceState({}, "", cleanUrl || window.location.pathname);
        } catch {}
      }
    } catch {}

    if (hasValidSession()) {
      setPhase("landing");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Session heal: reconnect wagmi → trigger SIWE when wallet connects ─────
  useEffect(() => {
    if (!mounted || phase !== "gate") return;
    if (signingRef.current) return;
    const guarded =
      sessionStorage.getItem("__disconnected__") === "1" ||
      localStorage.getItem("__disconnected__") === "1";
    if (guarded) return;
    if (!wagmiConnected || !wagmiAddress) return;
    handleWalletConnected(wagmiAddress);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wagmiConnected, wagmiAddress, mounted, phase]);

  // ── Poll for email session ────────────────────────────────────────────────
  useEffect(() => {
    if (phase === "landing") return;
    if (!mounted) return;
    const check = setInterval(() => {
      if (hasValidSession()) {
        clearInterval(check);
        startTransition(() => {
          setPhase("landing");
        });
      }
    }, 600);
    return () => clearInterval(check);
  }, [phase, mounted]);

  // ── SIWE Handshake ────────────────────────────────────────────────────────
  const handleWalletConnected = useCallback(
    async (addr: string) => {
      if (signingRef.current) return;
      signingRef.current = true;
      setIsAuthenticating(true);
      setAuthError(null);

      const norm = addr.toLowerCase();

      try {
        const checkRes = await fetch("/api/auth/verify-session", {
          cache: "no-store",
          credentials: "include",
        });
        if (checkRes.ok) {
          const data = await checkRes.json();
          if (data.authenticated && data.user?.address?.toLowerCase() === norm) {
            persistSession(norm);
            return;
          }
        }
      } catch {}

      try {
        const nonceRes = await fetch("/api/auth/nonce", { cache: "no-store" });
        if (!nonceRes.ok) throw new Error("Failed to fetch nonce");
        const { nonce } = await nonceRes.json();
        const message = `Authenticate to Whale Network.\n\nNonce: ${nonce}`;

        try {
          wagmiReconnect(wagmiConfig).catch(() => {});
        } catch {}
        await new Promise<void>((resolve) => {
          const cur = getAccount(wagmiConfig);
          if (cur.status === "connected") {
            resolve();
            return;
          }
          let done = false;
          const unwatch = watchAccount(wagmiConfig, {
            onChange(acc) {
              if (done) return;
              if (acc.status === "connected") {
                done = true;
                unwatch();
                resolve();
              }
            },
          });
          setTimeout(() => {
            if (!done) {
              done = true;
              unwatch();
              resolve();
            }
          }, 12000);
        });

        for (let p = 0; p < 10; p++) {
          try {
            await getConnectorClient(wagmiConfig);
            break;
          } catch (e: any) {
            const msg = e?.message?.toLowerCase() ?? "";
            const recoverable =
              msg.includes("reconnecting") ||
              msg.includes("unavailable") ||
              msg.includes("no connector");
            if (!recoverable) break;
            if (p % 2 === 1) {
              try {
                wagmiReconnect(wagmiConfig).catch(() => {});
              } catch {}
            }
            await new Promise((r) => setTimeout(r, 1000));
          }
        }

        let signature = "";
        let lastErr: any = null;
        for (let i = 0; i < 4; i++) {
          try {
            try { rkCloseModal(); } catch {} // Close AppKit modal so user sees the native wallet popup
            signature = await signMessageAsync({ message });
            break;
          } catch (err: any) {
            lastErr = err;
            const em = err?.message?.toLowerCase() ?? "";
            if (
              em.includes("connector not connected") ||
              em.includes("not connected") ||
              em.includes("unavailable")
            ) {
              try {
                wagmiReconnect(wagmiConfig).catch(() => {});
              } catch {}
              for (let rp = 0; rp < 5; rp++) {
                try {
                  await getConnectorClient(wagmiConfig);
                  break;
                } catch {
                  await new Promise((r) => setTimeout(r, 1200));
                }
              }
              continue;
            }
            throw err;
          }
        }

        if (!signature && lastErr) {
          try {
            const freshAcc = getAccount(wagmiConfig);
            const activeConn = freshAcc.connector ?? connector;
            let provider: any = null;
            try {
              provider = await activeConn?.getProvider();
            } catch {}
            if (!provider && typeof window !== "undefined" && (window as any).ethereum) {
              provider = (window as any).ethereum;
            }
            if (provider?.request) {
              const hex =
                "0x" +
                Array.from(new TextEncoder().encode(message))
                  .map((b) => b.toString(16).padStart(2, "0"))
                  .join("");
              signature = await provider.request({
                method: "personal_sign",
                params: [hex, norm],
              });
            }
          } catch {}
          if (!signature) throw lastErr;
        }

        const verifyRes = await fetch("/api/auth/system-verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ address: norm, message, signature, nonce }),
        });
        if (!verifyRes.ok) throw new Error("Verification failed");

        persistSession(norm);
      } catch (err: any) {
        const raw = err?.message ?? "Verification failed";
        setAuthError(
          raw.includes("rejected") || raw.includes("denied")
            ? "Signature declined. Tap to try again."
            : raw
        );
        signingRef.current = false;
        setIsAuthenticating(false);
      }
    },
    [signMessageAsync, connector]
  );

  const persistSession = (norm: string) => {
    document.cookie = `system_handshake=${norm}; path=/; max-age=31536000; SameSite=Lax`;
    try {
      localStorage.setItem(
        "system_session_v2",
        JSON.stringify({ wallet: norm, exp: Date.now() + 604800 * 1000 })
      );
      sessionStorage.setItem("system_wallet_addr", norm);
      sessionStorage.removeItem("__disconnected__");
      localStorage.removeItem("__disconnected__");
      localStorage.removeItem("system_pending_wakeup");
    } catch {}
    setIsAuthenticating(false);
    signingRef.current = false;
    startTransition(() => {
      setPhase("landing");
    });
  };

  const handleConnectWallet = () => {
    // If we are already on /connect, open the AppKit modal directly (full wallet selector).
    // If we are on the landing page or anywhere else, navigate to /connect.
    // This avoids a redirect loop while ensuring the wallet modal opens reliably.
    const isOnConnectPage = typeof window !== 'undefined' && window.location.pathname === '/connect';
    if (isOnConnectPage) {
      try { sessionStorage.removeItem("__disconnected__"); } catch {}
      try { localStorage.removeItem("__disconnected__"); } catch {}
      try { localStorage.setItem("system_pending_wakeup", "1"); } catch {}
      rkOpenModal();
    } else {
      if (typeof window !== 'undefined') {
        window.location.href = '/connect';
      }
    }
  };

  // ── Full render ───────────────────────────────────────────────────────────
  return (
    <>
      <AnimatePresence mode="wait">
        {phase === "landing" ? (
          <motion.div
            key="landing"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="w-full"
          >
            <MobileManifesto />
          </motion.div>
        ) : (
          <motion.div
            key="gate"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 w-full bg-white z-50 flex flex-col"
            style={{
              height: "100dvh",
              paddingTop: "env(safe-area-inset-top, 0px)",
              paddingBottom: "env(safe-area-inset-bottom, 0px)",
            }}
          >
            {/* Subtle dot grid background */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: "radial-gradient(#0A0A0A 1px, transparent 1px)",
                backgroundSize: "28px 28px",
                opacity: 0.03,
              }}
            />

            {/* Header */}
            <div className="relative z-10 flex items-center justify-between px-6 pt-4 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#0A0A0A] animate-pulse" />
                <span className="font-mono text-[8px] uppercase tracking-[0.3em] text-[#0A0A0A]/40">
                  Sovereign Gateway
                </span>
              </div>
              <span className="font-mono text-[8px] uppercase tracking-[0.2em] text-[#0A0A0A]/25">
                Aztec · ZK-Native
              </span>
            </div>

            {/* Main content — centered vertically */}
            <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-5">
              {/* Wordmark */}
              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="font-serif text-[11vw] font-normal tracking-tight text-[#0A0A0A] leading-none select-none text-center mb-10"
              >
                WHALE
                <br />
                NETWORK
              </motion.h1>

              {/* Auth card */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-[400px]"
              >
                <div className="w-full bg-white border border-[#E0E0E0] rounded-[24px] shadow-[0_8px_48px_rgba(0,0,0,0.1)] overflow-hidden">
                  {/* Card header */}
                  <div className="px-6 pt-6 pb-5 border-b border-[#F0F0F0]">
                    <h2 className="text-[22px] font-black tracking-tight text-[#0A0A0A] leading-tight">
                      Access Whale Network
                    </h2>
                    <p className="text-[12px] text-[#666] mt-1 leading-relaxed font-medium">
                      Connect your wallet or sign in with email to continue.
                    </p>
                  </div>

                  {/* Authenticating state */}
                  {isAuthenticating && (
                    <div className="px-6 py-6 flex flex-col items-center gap-3 text-center">
                      <div className="w-12 h-12 rounded-full bg-[#F5F5F5] flex items-center justify-center">
                        <Loader2 size={20} className="animate-spin text-[#0A0A0A]/40" />
                      </div>
                      <div>
                        <p className="text-[13px] font-black text-[#0A0A0A] tracking-tight">
                          Signature Required
                        </p>
                        <p className="text-[11px] text-[#888] mt-1 leading-relaxed">
                          Open your wallet and approve the signature request.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Error state */}
                  {!isAuthenticating && authError && (
                    <div className="px-6 pt-4">
                      <div className="px-4 py-3 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-[11px] font-black uppercase tracking-widest text-center">
                        {authError}
                      </div>
                    </div>
                  )}

                  {/* CTA buttons */}
                  {!isAuthenticating && (
                    <div className="px-6 py-5 flex flex-col gap-3">
                      {/* Apple */}
                      <button
                        onClick={() => toast("Apple Sign In — Available Jan 1, 2027", { icon: "🍎" })}
                        className="w-full flex items-center justify-center gap-3 h-[54px] bg-[#0A0A0A] text-white rounded-2xl text-[13px] font-black tracking-wide active:scale-[0.97] transition-transform shadow-lg shadow-black/15"
                      >
                        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                        </svg>
                        Continue with Apple
                      </button>

                      {/* Google */}
                      <button
                        onClick={() => toast("Google Sign In — Available Jan 1, 2027", { icon: "🤖" })}
                        className="w-full flex items-center justify-center gap-3 h-[54px] bg-white border border-[#E0E0E0] text-[#0A0A0A] rounded-2xl text-[13px] font-black tracking-wide active:scale-[0.97] transition-transform shadow-sm"
                      >
                        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                          <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
                        </svg>
                        Continue with Google
                      </button>

                      {/* Connect Wallet */}
                      <button
                        onClick={handleConnectWallet}
                        className="w-full flex items-center justify-center gap-3 h-[54px] bg-[#0A0A0A] text-white rounded-2xl text-[13px] font-black tracking-wide active:scale-[0.97] transition-transform shadow-lg shadow-black/15"
                      >
                        <Wallet size={16} strokeWidth={2} />
                        Connect Wallet
                      </button>

                      {/* Email */}
                      <button
                        onClick={() => setEmailModalOpen(true)}
                        className="w-full flex items-center justify-center gap-3 h-[54px] bg-white border border-[#E0E0E0] text-[#0A0A0A] rounded-2xl text-[13px] font-black tracking-wide active:scale-[0.97] transition-transform shadow-sm"
                      >
                        <Mail size={16} strokeWidth={2} />
                        Sign in with Email
                      </button>

                      <p className="text-center text-[10px] font-mono text-[#0A0A0A]/25 uppercase tracking-widest pt-1">
                        Secured by Aztec · ZK-Native
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Footer */}
            <div className="relative z-10 pb-4 flex flex-col items-center gap-3 px-5">
              <div className="bg-white border border-[#E8E8E8] rounded-2xl px-5 py-3 text-center">
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0A0A0A] mb-0.5">
                  January 1, 2027
                </div>
                <p className="text-[9px] font-mono text-[#888] uppercase tracking-[0.1em]">
                  Global release on App Store & Google Play
                </p>
              </div>
              <p className="text-[9px] font-mono text-[#0A0A0A]/20 uppercase tracking-[0.25em]">
                Whale Network · 2026
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <EmailLoginModal
        isOpen={emailModalOpen}
        onClose={() => setEmailModalOpen(false)}
      />
    </>
  );
}
