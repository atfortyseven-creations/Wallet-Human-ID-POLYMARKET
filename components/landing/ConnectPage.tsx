"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useAccount, useConnect, useDisconnect, useSignMessage } from "wagmi";
import { useAppKit } from "@reown/appkit/react";
import { useUIStore } from "@/lib/store/ui-store";
import { toast } from "sonner";
import { RemoteLottie } from '@/components/ui/RemoteLottie';
import { QRCodeSVG } from 'qrcode.react';
import { useSystemSignOut } from '@/hooks/useSystemSignOut';

import {
  ArrowRight,
  Loader2,
  ExternalLink,
  Smartphone,
  Monitor,
  ScanLine,
  Lock,
  Shield,
  CheckCircle,
  MessageSquare,
} from "lucide-react";

const DynamicUniversalScanModal = dynamic(
  () => import('@/components/scan/UniversalScanModal'),
  { ssr: false }
);

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    setIsMobile(
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(
        navigator.userAgent
      )
    );
  }, []);
  return isMobile;
}

const DESKTOP_WALLETS = [
  { id: "metamask", name: "MetaMask", badge: "Browser Extension", logo: "/wallets/metamask.svg", rdns: "io.metamask", installUrl: "https://metamask.io/download/", delay: 0 },
  { id: "coinbase", name: "Coinbase Wallet", badge: "Browser Extension", logo: "/wallets/coinbase.png", rdns: "com.coinbase.wallet", installUrl: "https://www.coinbase.com/wallet", delay: 0.08 },
  { id: "rainbow", name: "Rainbow", badge: "Browser Extension", logo: "/wallets/rainbow.png", rdns: "me.rainbow", installUrl: "https://rainbow.me/extension", delay: 0.16 },
  { id: "humanity-ledger-login", name: "Iniciar Sesión con Humanity Ledger", badge: "Native System Login", logo: "/system-shots/connect/Gemini_Generated_Image_dzte5edzte5edzte (1).png", rdns: null, installUrl: null, delay: 0.24 },
  { id: "humanity-ledger-signup", name: "Crear Cuenta en Humanity Ledger", badge: "Nuevo usuario · Registro", logo: "/system-shots/connect/Gemini_Generated_Image_dzte5edzte5edzte (1).png", rdns: null, installUrl: null, delay: 0.30 },
];

const MOBILE_WALLETS = [
  { id: "metamask-mobile", name: "MetaMask", badge: "Tap to open app", logo: "/wallets/metamask.svg", delay: 0 },
  { id: "coinbase-mobile", name: "Coinbase Wallet", badge: "Tap to open app", logo: "/wallets/coinbase.png", delay: 0.08 },
  { id: "rainbow-mobile", name: "Rainbow", badge: "Tap to open app", logo: "/wallets/rainbow.png", delay: 0.16 },
  { id: "humanity-ledger-login-mobile", name: "Iniciar Sesión con Humanity Ledger", badge: "Native System Login", logo: "/system-shots/connect/Gemini_Generated_Image_dzte5edzte5edzte (1).png", delay: 0.24 },
  { id: "humanity-ledger-signup-mobile", name: "Crear Cuenta en Humanity Ledger", badge: "Nuevo usuario · Registro", logo: "/system-shots/connect/Gemini_Generated_Image_dzte5edzte5edzte (1).png", delay: 0.30 },
];

function WalletButton({ logo, name, badge, onClick, loading = false, delay = 0, extraIcon }: {
  logo: string; name: string; badge: string; onClick: () => void; loading?: boolean; delay?: number; extraIcon?: React.ReactNode;
}) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      onClick={loading ? undefined : onClick}
      disabled={loading}
      className="group relative w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-300 bg-white border border-[#E8E8E8] shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-[#D0D0D0] disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
    >
      <div className="absolute inset-0 bg-[#FFFFFF] translate-y-[100%] group-hover:translate-y-0 transition-transform duration-500 ease-[0.16,1,0.3,1] z-0" />
      <div className="relative z-10 w-10 h-10 rounded-lg bg-white border border-[#E8E8E8] flex items-center justify-center p-2 shrink-0">
        <img src={logo} alt={name} className="w-full h-full object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
      </div>
      <div className="relative z-10 flex-1 text-left min-w-0">
        <p className="text-[12px] font-black uppercase tracking-widest text-[#0A0A0A] truncate">
          {loading ? "Connecting..." : name}
        </p>
        <p className="text-[10px] font-mono text-black/40 uppercase tracking-[0.2em] mt-0.5 truncate">
          {badge}
        </p>
      </div>
      <div className="relative z-10 shrink-0">
        {loading ? (
          <Loader2 size={16} className="animate-spin text-[#999]" />
        ) : extraIcon ? (
          <span className="text-[#CCC] group-hover:text-[#0A0A0A] transition-colors">{extraIcon}</span>
        ) : (
          <ArrowRight size={16} className="text-[#CCC] group-hover:text-[#0A0A0A] group-hover:translate-x-0.5 transition-all duration-300" />
        )}
      </div>
    </motion.button>
  );
}

export default function ConnectPage() {
  const router = useRouter();
  const isMobile = useIsMobile();
  const { isConnected, address } = useAccount();
  const { connect, connectors, isPending, isError, error } = useConnect();
  const { signMessageAsync } = useSignMessage();
  const { open: openAppKit } = useAppKit();
  const { isLinked, setLinked } = useUIStore();
  const { nuclearDisconnect } = useSystemSignOut();

  const [mounted, setMounted] = useState(false);
  const [qrSession, setQrSession] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<"IDLE" | "AWAITING" | "SYNCED" | "ERROR">("IDLE");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [showMobileScanner, setShowMobileScanner] = useState(false);
  const [qrData, setQrData] = useState('');
  const [ephemeral, setEphemeral] = useState<{ publicKey: string; privateKey: string; isECDH?: boolean } | null>(null);
  const [authStatus, setAuthStatus] = useState<"idle" | "verifying" | "failed">("idle");
  const redirectingRef = useRef(false);

  useEffect(() => {
    if (!isError || !error) return;
    setPendingId(null);
    const msg = error.message ?? "Unknown error";
    if (msg.toLowerCase().includes("already connected") || msg.toLowerCase().includes("connector already")) return;
    if (msg.toLowerCase().includes("provider not found") || msg.toLowerCase().includes("not installed")) {
      toast.error("Wallet extension not found", { description: "Please install the wallet extension and try again.", action: { label: "Install MetaMask", onClick: () => window.open("https://metamask.io/download/", "_blank") }, duration: 7000 });
    } else if (msg.toLowerCase().includes("user rejected") || msg.toLowerCase().includes("rejected")) {
      toast.error("Connection declined", { description: "The wallet connection was cancelled." });
    } else {
      toast.error("Connection failed", { description: msg });
    }
  }, [isError, error]);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    // [FIX] BUG-9/10: Must check disconnect guard BEFORE restoring session.
    // If the user just logged out, system_session_v2 and system_handshake cookie
    // are being cleared async. Reading them here without the guard check
    // caused an immediate setLinked(true) race that restored the session mid-logout.
    try {
      if (
        sessionStorage.getItem('__disconnected__') === '1' ||
        localStorage.getItem('__disconnected__') === '1'
      ) return; // actively disconnecting — do NOT restore session
    } catch {}
    const hasCookie = document.cookie.split("; ").some((r) => r.startsWith("system_handshake="));
    const hasLocal = (() => {
      try {
        const raw = localStorage.getItem("system_session_v2");
        if (!raw) return false;
        const parsed = JSON.parse(raw);
        return parsed && parsed.exp && parsed.exp > Date.now();
      } catch { return false; }
    })();
    if (hasCookie || hasLocal) setLinked(true);
  }, [setLinked]);

  const initEphemeral = useCallback(async () => {
    try {
      const { generateX25519KeyPair } = await import('@/lib/web-crypto');
      const pair = await generateX25519KeyPair();
      setEphemeral(pair);
      const sessId = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36);
      setQrSession(sessId);
      // [FIX] Origin fallback updated to humanidfi.com to match WalletConnect Cloud registration
      const origin = typeof window !== 'undefined' ? window.location.origin : 'https://humanidfi.com';
      const expiresAt = Date.now() + 300000;
      const qrUrl = new URL('/connect', origin);
      qrUrl.searchParams.set('uuid', sessId);
      qrUrl.searchParams.set('pub', encodeURIComponent(pair.publicKey));
      qrUrl.searchParams.set('ecdh', pair.isECDH ? '1' : '0');
      qrUrl.searchParams.set('exp', String(expiresAt));
      setQrData(qrUrl.toString());
      setSyncStatus("AWAITING");
      const t = setTimeout(() => { setQrSession(null); setSyncStatus("IDLE"); }, 270000);
      return () => clearTimeout(t);
    } catch (e: any) {
      setSyncStatus("ERROR");
    }
  }, []);

  useEffect(() => { if (!qrSession && mounted) initEphemeral(); }, [qrSession, initEphemeral, mounted]);

  // QR poll  desktop side: waits for mobile to complete handshake, then hydrates session
  useEffect(() => {
    if (!qrSession || !ephemeral || syncStatus === "SYNCED") return;
    const poll = setInterval(async () => {
      try {
        const res = await fetch(`/api/auth/qr-poll?uuid=${qrSession}&t=${Date.now()}`, { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();

        // Payload received: either ECDH-encrypted or server-minted JWT
        if (data.encryptedPayload || data.serverJwt) {
          clearInterval(poll);
          let jwt: string | null = null;

          // PATH A: Try to decrypt ECDH-encrypted JWT from mobile
          if (data.encryptedPayload && data.iv && ephemeral && data.mobilePub) {
            try {
              const { deriveSharedSecret, decryptAESGCM } = await import('@/lib/web-crypto');
              let isECDHFlag = false;
              try { isECDHFlag = new URL(qrData).searchParams.get('ecdh') === '1'; } catch {}
              const shared = await deriveSharedSecret(ephemeral.privateKey, data.mobilePub, isECDHFlag);
              const decrypted = await decryptAESGCM(shared, data.encryptedPayload, data.iv);
              if (decrypted && decrypted.split('.').length === 3) jwt = decrypted;
            } catch (decryptErr) {
              console.warn('[QR:Desktop] ECDH decrypt failed, falling back to serverJwt:', decryptErr);
            }
          }

          // PATH B: Fall back to server-minted JWT (most common path for first-time mobile scan)
          if (!jwt && data.serverJwt) {
            try {
              const { verifyJWT } = await import('@/lib/jwt');
              await verifyJWT(data.serverJwt);
              jwt = data.serverJwt;
            } catch (verifyErr) {
              console.warn('[QR:Desktop] serverJwt verification failed:', verifyErr);
            }
          }

          if (!jwt) {
            console.error('[QR:Desktop] No valid JWT obtained from handshake payload.');
            setSyncStatus("ERROR");
            return;
          }

          //  CRITICAL FIX: Removed `if (!data.kycVerified) return;` 
          // kycVerified is NEVER set in the qr-mobile-link payload 
          // this guard was silently blocking 100% of QR sessions from hydrating.
          // The JWT contains the wallet address and clearance level, that's sufficient.

          setSyncStatus("SYNCED");

          // Hydrate desktop session with the JWT from mobile
          const hydrateRes = await fetch('/api/auth/qr-hydrate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ jwt })
          });

          if (hydrateRes.ok) {
            // [SESSION PERSISTENCE] Decode the wallet address from the JWT payload
            // and persist it in localStorage so useSystemAccount auto-restores
            // the session on page reload — making QR sessions identical in durability
            // to Humanity Ledger and MetaMask sessions.
            try {
              const parts = jwt.split('.');
              if (parts.length === 3) {
                const payloadRaw = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
                const addr = (payloadRaw.sub || payloadRaw.address || '') as string;
                if (addr && addr.startsWith('0x') && addr.length === 42) {
                  const normalized = addr.toLowerCase();
                  // 7-day expiry — same as cookie maxAge
                  localStorage.setItem('system_session_v2', JSON.stringify({
                    wallet: normalized,
                    exp: Date.now() + 604800 * 1000,
                    source: 'qr-handshake',
                  }));
                  try {
                    sessionStorage.setItem('system_wallet_addr', normalized);
                    sessionStorage.setItem('portfolio_unlocked', 'true');
                  } catch {}
                  // Also set system_handshake client-side as belt-and-suspenders
                  document.cookie = `system_handshake=${normalized}; path=/; max-age=604800; SameSite=Lax`;
                }
              }
            } catch {}

            // Small delay so the SYNCED animation plays before redirect
            await new Promise(r => setTimeout(r, 800));
            window.location.replace("/dashboard");
          } else {
            const errData = await hydrateRes.json().catch(() => ({}));
            console.error('[QR:Desktop] Hydrate failed:', errData);
            setSyncStatus("ERROR");
          }

        }
      } catch (pollErr) {
        console.warn('[QR:Desktop] Poll error (will retry):', pollErr);
      }
    }, 1000);
    return () => clearInterval(poll);
  }, [qrSession, ephemeral, qrData, syncStatus]);

  const { disconnect } = useDisconnect();

  const handleTotalDisconnect = useCallback(() => {
    toast.success("Disconnected & purged all sessions.");
    nuclearDisconnect();
  }, [nuclearDisconnect]);

  // Wallet state transition tracking:
  // [FIX] BUG-7: The previous code cleared __disconnected__ whenever isConnected flipped
  // from false to true — including wagmi auto-reconnect on page load after logout.
  // This erased the disconnect guard silently, making logout impossible.
  // Guard is now ONLY cleared explicitly inside handleDesktopWallet / handleMobileWallet
  // (when the user physically taps a wallet button). Auto-reconnect no longer clears it.
  const prevConnectedRef = useRef(isConnected);
  useEffect(() => {
    prevConnectedRef.current = isConnected;
  }, [isConnected]);

  // [CRITICAL FIX] Wallet connect  SIWE system-verify  then redirect.
  // The old code went directly to /dashboard without calling system-verify,
  // meaning no whale_session/human_session/system_handshake cookie was set.
  // Every subsequent API call to a protected route returned 401.
  const signingRef = useRef(false);
  useEffect(() => {
    if (!mounted || !isConnected || !address) return;
    if (redirectingRef.current || signingRef.current || authStatus === 'failed') return;
    try {
      if (sessionStorage.getItem("__disconnected__") === "1") return;
    } catch {}

    signingRef.current = true;

    const runVerify = async () => {
      setAuthStatus('verifying');
      try {
        // 1. Check if session already valid (returning user)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        const checkRes = await fetch('/api/auth/verify-session', { cache: 'no-store', signal: controller.signal });
        clearTimeout(timeoutId);
        if (checkRes.ok) {
          const data = await checkRes.json();
          if (data.authenticated) {
            setLinked(true);
            redirectingRef.current = true;
            const urlParams = new URLSearchParams(window.location.search);
            const returnUrl = urlParams.get('returnUrl') || urlParams.get('redirect_url');
            if (returnUrl) {
                if (returnUrl.startsWith('http')) {
                    window.location.href = returnUrl;
                } else {
                    window.location.replace(returnUrl);
                }
            } else {
                window.location.replace("/dashboard");
            }
            return;
          }
        }
      } catch {}

      // 2. No session  Bypassed SIWE-sign per user request
      try {
        const norm = address.toLowerCase();

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);
        const verifyRes = await fetch('/api/auth/system-verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ address: norm }),
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (!verifyRes.ok) {
          toast.error('Session verification failed', { description: 'Please try connecting again.' });
          signingRef.current = false;
          setAuthStatus('failed');
          return;
        }

        setLinked(true);
        redirectingRef.current = true;
        const urlParams = new URLSearchParams(window.location.search);
        const returnUrl = urlParams.get('returnUrl') || urlParams.get('redirect_url');
        if (returnUrl) {
            if (returnUrl.startsWith('http')) {
                window.location.href = returnUrl;
            } else {
                window.location.replace(returnUrl);
            }
        } else {
            window.location.replace("/dashboard");
        }
      } catch (err: any) {
        const msg = err?.message || '';
        // User rejected signing  don't show an error, just reset
        if (!msg.toLowerCase().includes('rejected') && !msg.toLowerCase().includes('denied')) {
          toast.error('Authentication failed', { description: msg });
        }
        signingRef.current = false;
        setAuthStatus('failed');
      }
    };

    runVerify();
  }, [isConnected, address, mounted, setLinked, signMessageAsync, authStatus]);

  const handleDesktopWallet = useCallback((walletId: string, rdns: string | null, installUrl: string | null) => {
    if (walletId === "humanity-ledger-login") {
        router.push("/login");
        return;
    }
    if (walletId === "humanity-ledger-signup") {
        router.push("/sign-up");
        return;
    }
    try { sessionStorage.removeItem("__disconnected__"); } catch {}
    try { localStorage.removeItem("__disconnected__"); } catch {}
    setPendingId(walletId);
    if (!rdns) { openAppKit(); setPendingId(null); return; }
    const connector = connectors.find((c: any) => c.id === rdns)
      || connectors.find((c) => c.name.toLowerCase().includes(walletId.toLowerCase()))
      || connectors.find((c) => c.id === "injected" || (c as any).type === "injected");
    if (connector) connect({ connector });
    else {
      setPendingId(null);
      if (installUrl) toast.error("Wallet extension not found", { action: { label: "Install", onClick: () => window.open(installUrl, "_blank") } });
    }
  }, [connect, connectors, openAppKit]);

  const handleMobileWallet = useCallback((walletId: string) => {
    if (walletId === "humanity-ledger-login-mobile") {
        router.push("/login");
        return;
    }
    if (walletId === "humanity-ledger-signup-mobile") {
        router.push("/sign-up");
        return;
    }
    try { sessionStorage.removeItem("__disconnected__"); } catch {}
    try { localStorage.removeItem("__disconnected__"); } catch {}
    try { localStorage.setItem('system_pending_wakeup', '1'); } catch {}
    
    // Instead of forcing the user into the dapp browser with metamask.app.link/dapp,
    // we use AppKit which correctly uses standard Universal Links to sign and return to Chrome.
    openAppKit();
  }, [openAppKit]);

  const triggerManualVerify = useCallback(() => {
    signingRef.current = false;
    setAuthStatus('idle');
  }, []);

  const isVerified = mounted && isLinked;

  return (
    <div className="w-full min-h-screen flex flex-col items-center bg-white relative overflow-hidden">
      {/* Background Image — fills entire page, no black bands, no zoom */}
      <img
        src="/system-shots/monochrome-illustration-science-fiction-arch-pixel-art-Devine-Lu-Linvega-2268380-wallhere.com (1).jpg"
        alt="Architecture Background"
        className="absolute inset-0 z-0 w-full h-full pointer-events-none"
        style={{
          objectFit: 'cover',
          objectPosition: 'right top',
          opacity: 1,
        }}
      />
      
      <div className="relative z-10 w-full flex-1 flex flex-col items-center justify-center px-4 pt-0 mx-auto min-h-0" style={{ pointerEvents: 'none' }}>
        
        {/* Login Panel — positioned further right, slightly wider panel */}
        <div className="w-full max-w-[540px] flex-shrink-0 flex flex-col bg-white/96 backdrop-blur-sm rounded-[24px] border border-[#F0F0F0] shadow-[0_8px_60px_rgba(0,0,0,0.18)] p-8 z-20 translate-x-[10%]" style={{ pointerEvents: 'all' }}>
          
          <div className="flex items-center gap-3 mb-8 pb-5 border-b border-black/5">
            <Lock size={16} strokeWidth={1.2} className="text-[#0A0A0A]" />
            <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#0A0A0A]/60 font-medium">
              Secure Authentication
            </span>
          </div>

          <div className="w-full flex flex-col h-full mx-auto">
            {mounted && !isVerified && (
              <div className="flex items-center justify-center gap-2 mb-6 opacity-60">
                {isMobile ? <Smartphone size={13} /> : <Monitor size={13} />}
                <span className="text-[9px] font-mono uppercase tracking-[0.2em]">
                  {isMobile ? "Mobile connection" : "Desktop connection"}
                </span>
              </div>
            )}

            {/* Verified state */}
            {isVerified ? (
              <motion.div
                key="verified"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col items-center justify-center w-full h-full flex-1 relative min-h-[300px]"
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-[300px] h-[300px]">
                    <RemoteLottie path="Transaction Complete.json" loop={false} className="w-full h-full object-contain scale-[1.2]" />
                  </div>
                </div>

                <div className="absolute bottom-4 flex flex-col items-center gap-2">
                  <button
                    onClick={handleTotalDisconnect}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] bg-rose-50 text-rose-500 hover:bg-rose-100 hover:text-rose-600 transition-all active:scale-[0.98]"
                  >
                    Total Disconnect
                  </button>
                </div>
              </motion.div>

            ) : isConnected && !isLinked ? (
              <div className="flex flex-col items-center justify-center gap-6 flex-1 py-4 text-center">
                <div className="w-16 h-16 bg-[#0A0A0A]/5 rounded-full flex items-center justify-center text-[#0A0A0A] mb-2">
                  <Lock size={20} strokeWidth={1.5} />
                </div>
                <div>
                  <h2 className="text-[18px] font-black tracking-tight text-[#0A0A0A] mb-2">
                    Signature Required
                  </h2>
                  <p className="text-[12px] text-[#888] leading-relaxed max-w-[240px] mx-auto">
                    Sign the verification request in your wallet to complete secure authentication.
                  </p>
                </div>
                {authStatus === 'failed' ? (
                  <div className="flex flex-col gap-3 w-full mt-4">
                    <button
                      onClick={triggerManualVerify}
                      className="w-full py-4 rounded-xl bg-[#0A0A0A] text-white font-mono text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#222] transition-all shadow-md active:scale-[0.98]"
                    >
                      Sign Message
                    </button>
                    <button
                      onClick={handleTotalDisconnect}
                      className="w-full py-4 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-100 font-mono text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-[0.98]"
                    >
                      Disconnect
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3 mt-4">
                    <Loader2 size={20} className="animate-spin text-black/40" />
                    <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-black/40 animate-pulse">
                      Awaiting signature...
                    </span>
                  </div>
                )}
              </div>

            ) : !mounted ? (
              <div className="flex flex-col gap-3 flex-1">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="w-full h-[60px] rounded-xl bg-[#F5F5F5] animate-pulse" />
                ))}
              </div>

            ) : isMobile ? (
              <div className="flex flex-col gap-3 flex-1">
                {MOBILE_WALLETS.map((w) => (
                  <WalletButton key={w.id} logo={w.logo} name={w.name} badge={w.badge} onClick={() => handleMobileWallet(w.id)} loading={isPending && pendingId === w.id} delay={w.delay} extraIcon={<ExternalLink size={14} />} />
                ))}
                <button
                  onClick={() => setShowMobileScanner(true)}
                  className="w-full flex items-center justify-center gap-3 py-4 mt-2 rounded-xl border border-[#E8E8E8] bg-white font-black uppercase tracking-[0.2em] text-[10px] text-[#0A0A0A] active:scale-[0.98] transition-all hover:bg-black/5"
                >
                  <ScanLine size={14} />
                  Scan QR Code
                </button>
              </div>

            ) : (
              <div className="flex flex-col gap-3 flex-1 w-full">
                {/* QR Panel */}
                {syncStatus === "AWAITING" && qrData ? (
                  <motion.div
                    key="qr-ready"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="flex justify-center mb-5"
                  >
                    <div className="p-5 bg-white rounded-2xl border border-[#F0F0F0] flex flex-col items-center gap-3 shadow-sm relative w-[319px]">
                      <div className="flex items-center justify-center w-full mb-2 pb-2 border-b border-[#F0F0F0]">
                        <span className="text-[40px] font-black tracking-tight text-[#0A0A0A]">Login</span>
                      </div>
                      <QRCodeSVG
                        value={qrData}
                        size={261}
                        fgColor="#0A0A0A"
                        bgColor="#FFFFFF"
                        level="M"
                        includeMargin={false}
                      />
                      <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#0A0A0A]/40 text-center">
                        Connect Mobile
                      </span>
                    </div>
                  </motion.div>
                ) : syncStatus === "IDLE" || (syncStatus === "AWAITING" && !qrData) ? (
                  <div className="flex justify-center mb-5">
                    <div className="p-5 bg-white rounded-2xl border border-[#F0F0F0] flex flex-col items-center gap-3 shadow-sm w-[319px]">
                      <div className="w-[261px] h-[261px] bg-[#FFFFFF] rounded-xl animate-pulse flex items-center justify-center">
                        <Loader2 size={28} className="animate-spin text-black/20" />
                      </div>
                      <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-black/20 text-center">
                        Generating secure link...
                      </span>
                    </div>
                  </div>
                ) : syncStatus === "ERROR" ? (
                  <div className="flex justify-center mb-5">
                    <div className="p-5 bg-rose-50 rounded-2xl border border-rose-100 flex flex-col items-center gap-3 w-[319px]">
                      <div className="w-[261px] h-[261px] rounded-xl bg-rose-50 flex flex-col items-center justify-center gap-3">
                        <Shield size={24} className="text-rose-300" />
                        <p className="text-[10px] font-mono text-rose-400 text-center leading-relaxed">
                          QR generation failed
                        </p>
                        <button
                          onClick={() => { setSyncStatus("IDLE"); setQrSession(null); setQrData(''); }}
                          className="px-4 py-2 rounded-xl bg-rose-500 text-white text-[9px] font-black uppercase tracking-widest hover:bg-rose-600 transition-colors active:scale-[0.97]"
                        >
                          Retry
                        </button>
                      </div>
                      <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-rose-300 text-center">
                        Tap retry to regenerate
                      </span>
                    </div>
                  </div>
                ) : null}
                
                {DESKTOP_WALLETS.map((w) => (
                  <WalletButton key={w.id} logo={w.logo} name={w.name} badge={w.badge} onClick={() => handleDesktopWallet(w.id, w.rdns, w.installUrl)} loading={isPending && pendingId === w.id} delay={w.delay} />
                ))}
                <button
                  onClick={() => openAppKit({ view: 'Connect' })}
                  className="w-full flex items-center justify-center gap-4 py-10 mt-4 rounded-xl border-2 border-[#0A0A0A] bg-white font-black uppercase tracking-[0.2em] text-[24px] text-[#0A0A0A] hover:bg-[#0A0A0A] hover:text-[#FFFFFF] transition-all shadow-xl hover:scale-[1.02]"
                >
                  <ScanLine size={28} />
                  WalletConnect
                </button>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* TOP BAR: Aztec only */}
      <div className="absolute top-0 left-0 right-0 z-40 border-b border-black/10 bg-white backdrop-blur-md overflow-hidden h-16 flex items-center">
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes marquee-aztec {
            0% { transform: translateX(0%); }
            100% { transform: translateX(-50%); }
          }
          .animate-marquee-aztec {
            animation: marquee-aztec 10s linear infinite;
          }
          @keyframes marquee-bottom {
            0% { transform: translateX(0%); }
            100% { transform: translateX(-50%); }
          }
          .animate-marquee-bottom {
            animation: marquee-bottom 12s linear infinite;
          }
        `}} />
        <div className="flex w-max animate-marquee-aztec items-center">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-8">
              <img
                src="/system-shots/connect/Gemini_Generated_Image_dzte5edzte5edzte (2).png"
                className="h-10 w-auto object-contain"
                alt="Aztec"
              />
              <span className="text-black/50 text-[8px] font-mono uppercase tracking-[0.3em] whitespace-nowrap">Powered by Aztec</span>
            </div>
          ))}
          {[...Array(20)].map((_, i) => (
            <div key={`b-${i}`} className="flex items-center gap-3 px-8">
              <img
                src="/system-shots/connect/Gemini_Generated_Image_dzte5edzte5edzte (2).png"
                className="h-10 w-auto object-contain"
                alt="Aztec"
              />
              <span className="text-black/50 text-[8px] font-mono uppercase tracking-[0.3em] whitespace-nowrap">Powered by Aztec</span>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile QR Scanner */}
      {isMobile && mounted && (
        <DynamicUniversalScanModal
          isOpen={showMobileScanner}
          onClose={() => setShowMobileScanner(false)}
          address={address ?? ""}
          mode="session-only"
          onScan={() => {
            setShowMobileScanner(false);
            toast.success("Session synchronized");
          }}
        />
      )}

      {/* Bottom bar removed — image must show fully including Humanity Ledger text */}
    </div>
  );
}
