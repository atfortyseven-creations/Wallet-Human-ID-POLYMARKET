"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAccount, useConnect, useDisconnect, useSignMessage } from "wagmi";
import { signIn } from "next-auth/react";
import { reconnect as wagmiReconnect, watchAccount, getAccount, getConnectorClient } from '@wagmi/core';
import { config as wagmiConfig } from '@/config/appkit';
import { useAppKit } from "@reown/appkit/react";
import { useUIStore } from "@/lib/store/ui-store";
import { toast } from "sonner";
import { RemoteLottie } from '@/components/ui/RemoteLottie';
import { QRCodeSVG } from 'qrcode.react';
import { useSystemSignOut } from '@/hooks/useSystemSignOut';
import { EmailLoginModal } from '@/components/auth/EmailLoginModal';

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
  Briefcase,
  QrCode,
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
        typeof navigator !== 'undefined' ? navigator.userAgent : ''
      )
    );
  }, []);
  return isMobile;
}

const DESKTOP_WALLETS = [
  { id: "metamask", name: "MetaMask", badge: "Browser Extension", logo: "/wallets/metamask.svg", rdns: "io.metamask", installUrl: "https://metamask.io/download/", delay: 0 },
  { id: "coinbase", name: "Coinbase Wallet", badge: "Browser Extension", logo: "/wallets/coinbase.png", rdns: "com.coinbase.wallet", installUrl: "https://www.coinbase.com/wallet", delay: 0.08 },
  { id: "rainbow", name: "Rainbow", badge: "Browser Extension", logo: "/wallets/rainbow.png", rdns: "me.rainbow", installUrl: "https://rainbow.me/extension", delay: 0.16 },
];

const MOBILE_WALLETS = [
  { id: "metamask-mobile", name: "MetaMask", badge: "Tap to open app", logo: "/wallets/metamask.svg", delay: 0 },
  { id: "coinbase-mobile", name: "Coinbase Wallet", badge: "Tap to open app", logo: "/wallets/coinbase.png", delay: 0.08 },
  { id: "rainbow-mobile", name: "Rainbow", badge: "Tap to open app", logo: "/wallets/rainbow.png", delay: 0.16 },
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
  const { isConnected, address, connector, status: accountStatus } = useAccount();
  const { connect, connectors, isPending, isError, error } = useConnect();
  const { signMessageAsync } = useSignMessage();
  const { open: openAppKit, close: closeAppKit } = useAppKit();
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
  const [pinCode, setPinCode] = useState<string | null>(null);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const redirectingRef = useRef(false);

  let isGuarded = false;
  try {
    if (typeof window !== 'undefined') {
      isGuarded = sessionStorage.getItem("__disconnected__") === "1" || localStorage.getItem("__disconnected__") === "1";
    }
  } catch {}
  
  const effectiveIsConnected = mounted && isConnected && !isGuarded;

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

  useEffect(() => { 
    setMounted(true); 
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.has('s') && urlParams.has('p')) {
        window.location.replace('/scan?payload=' + encodeURIComponent(window.location.href));
      }
      // After Google OAuth callback, heal the system_handshake cookie so
      // the gate detects the authenticated state without a page reload.
      if (!document.cookie.includes('system_handshake=')) {
        fetch('/api/auth/session-heal', { credentials: 'include', cache: 'no-store' })
          .then(r => r.json())
          .then(d => { if (d.healed) window.dispatchEvent(new Event('storage')); })
          .catch(() => {});
      }
    }
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    try {
      if (
        sessionStorage.getItem('__disconnected__') === '1' ||
        localStorage.getItem('__disconnected__') === '1'
      ) return;
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
      const { generateX25519KeyPair, generateVisualPin } = await import('@/lib/web-crypto');
      const pair = await generateX25519KeyPair();
      setEphemeral(pair);
      const pin = generateVisualPin();
      setPinCode(pin);
      const sessId = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36);
      setQrSession(sessId);
      const origin = typeof window !== 'undefined' ? window.location.origin : 'https://humanidfi.com';
      const shortQrUrl = new URL('/connect', origin);
      shortQrUrl.searchParams.set('s', sessId);
      shortQrUrl.searchParams.set('p', pair.publicKey);
      if (pair.isECDH) shortQrUrl.searchParams.set('ecdh', '1');
      setQrData(shortQrUrl.toString());
      setSyncStatus("AWAITING");
      const t = setTimeout(() => { setQrSession(null); setSyncStatus("IDLE"); setPinCode(null); }, 270000);
      return () => clearTimeout(t);
    } catch (e: any) {
      setSyncStatus("ERROR");
    }
  }, []);

  useEffect(() => { if (!qrSession && mounted) initEphemeral(); }, [qrSession, initEphemeral, mounted]);

  useEffect(() => {
    if (!qrSession || !ephemeral || syncStatus === "SYNCED" || syncStatus === "ERROR") return;
    const poll = setInterval(async () => {
      try {
        const res = await fetch(`/api/auth/qr-poll?uuid=${qrSession}&t=${Date.now()}`, { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();

        if (data.encryptedPayload || data.serverJwt) {
          clearInterval(poll);
          let jwt: string | null = null;

          if (data.encryptedPayload && data.iv && ephemeral && data.mobilePub) {
            try {
              const { deriveSharedSecret, decryptAESGCM } = await import('@/lib/web-crypto');
              const isECDHFlag = ephemeral.isECDH;
              const shared = await deriveSharedSecret(ephemeral.privateKey, data.mobilePub, isECDHFlag, pinCode ?? undefined);
              const decrypted = await decryptAESGCM(shared, data.encryptedPayload, data.iv);
              try {
                const payloadRaw = JSON.parse(decrypted);
                if (payloadRaw.jwt) { jwt = payloadRaw.jwt; }
                const activeJwt = jwt || data.serverJwt;
                if (activeJwt) {
                  const parts = activeJwt.split('.');
                  if (parts.length === 3) {
                    const jwtData = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
                    const addr = (jwtData.sub || jwtData.address || '').toLowerCase();
                    if (payloadRaw.seed && addr) localStorage.setItem(`whale_chat_seed_${addr}`, payloadRaw.seed);
                    if (payloadRaw.vault) localStorage.setItem('system_vault_v1', payloadRaw.vault);
                  }
                }
              } catch {
                if (decrypted && decrypted.split('.').length === 3) jwt = decrypted;
              }
            } catch (decryptErr) {
              console.warn('[QR:Desktop] ECDH decrypt failed, falling back to serverJwt:', decryptErr);
            }
          }

          if (!jwt && data.serverJwt) { jwt = data.serverJwt; }

          if (!jwt) {
            console.error('[QR:Desktop] No valid JWT obtained from handshake payload.');
            setSyncStatus("ERROR");
            return;
          }

          setSyncStatus("SYNCED");

          const hydrateRes = await fetch('/api/auth/qr-hydrate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ jwt })
          });

          if (hydrateRes.ok) {
            try {
              const hydrateData = await hydrateRes.json().catch(() => ({}));
              let normalized: string | null = (hydrateData as any).address || null;
              if (!normalized) {
                const parts = jwt.split('.');
                if (parts.length === 3) {
                  const payloadRaw = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
                  const addr = (payloadRaw.sub || payloadRaw.address || '') as string;
                  if (addr && addr.startsWith('0x') && addr.length === 42) {
                    normalized = addr.toLowerCase();
                  }
                }
              }
              if (normalized) {
                localStorage.setItem('system_session_v2', JSON.stringify({ wallet: normalized, exp: Date.now() + 604800 * 1000, source: 'qr-handshake' }));
                sessionStorage.setItem('system_wallet_addr', normalized);
                sessionStorage.setItem('portfolio_unlocked', 'true');
                sessionStorage.removeItem('__disconnected__');
                localStorage.removeItem('__disconnected__');
                document.cookie = `system_handshake=${normalized}; path=/; max-age=604800; SameSite=Lax`;
                setLinked(true);
              }
            } catch (persistErr) {
              console.warn('[QR:Desktop] Session persistence error (non-fatal):', persistErr);
            }
            await new Promise(r => setTimeout(r, 800));
            const urlParams = new URLSearchParams(window.location.search);
            const raw = urlParams.get('returnUrl') || urlParams.get('redirect_url') || '';
            const safeReturn = (raw.startsWith('/') && !raw.startsWith('//') && raw !== '/portfolio') ? raw : '/terminal';
            window.location.replace(safeReturn);
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
  }, [qrSession, ephemeral, qrData, syncStatus, pinCode]);

  const { disconnect } = useDisconnect();

  const handleTotalDisconnect = useCallback(() => {
    toast.success("Disconnected & purged all sessions.");
    nuclearDisconnect();
  }, [nuclearDisconnect]);

  const prevConnectedRef = useRef(isConnected);
  useEffect(() => {
    prevConnectedRef.current = isConnected;
  }, [isConnected]);

  const signingRef = useRef(false);
  useEffect(() => {
    if (!mounted || accountStatus !== 'connected' || !address) return;
    if (redirectingRef.current || signingRef.current || authStatus === 'failed') return;
    try {
      const isGuardedNow =
        sessionStorage.getItem("__disconnected__") === "1" ||
        localStorage.getItem("__disconnected__") === "1";
      if (isGuardedNow) return;
    } catch {}

    signingRef.current = true;

    const runVerify = async () => {
      setAuthStatus('verifying');
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        const checkRes = await fetch('/api/auth/verify-session', { cache: 'no-store', credentials: 'include', signal: controller.signal });
        clearTimeout(timeoutId);
        if (checkRes.ok) {
          const data = await checkRes.json();
          if (data.authenticated && data.user?.address?.toLowerCase() === address?.toLowerCase()) {
            setLinked(true);
            redirectingRef.current = true;
            const urlParams = new URLSearchParams(window.location.search);
            const returnUrl = urlParams.get('returnUrl') || urlParams.get('redirect_url');
            if (returnUrl && returnUrl !== '/portfolio') {
                if (returnUrl.startsWith('http')) { window.location.href = returnUrl; }
                else { window.location.replace(returnUrl); }
            } else { window.location.replace("/terminal"); }
            return;
          }
        }
      } catch {}

      try {
        const norm = address.toLowerCase();
        const nonceRes = await fetch('/api/auth/nonce', { cache: 'no-store' });
        if (!nonceRes.ok) {
            const errData = await nonceRes.json().catch(() => ({}));
            throw new Error(errData.error || 'Failed to fetch authentication nonce');
        }
        const { nonce } = await nonceRes.json();
        const message = `Authenticate to Whale Network.\n\nNonce: ${nonce}`;
        let signature = '';
        let lastErr: any = null;

        try { wagmiReconnect(wagmiConfig).catch(() => {}); } catch {}

        await new Promise<void>((resolveLayer1) => {
          const cur = getAccount(wagmiConfig);
          if (cur.status === 'connected') { resolveLayer1(); return; }
          let done = false;
          const unwatch = watchAccount(wagmiConfig, {
            onChange(acc) {
              if (done) return;
              if (acc.status === 'connected') { done = true; unwatch(); resolveLayer1(); }
            }
          });
          setTimeout(() => { if (!done) { done = true; unwatch(); resolveLayer1(); } }, 12000);
        });

        let relayReady = false;
        for (let probe = 0; probe < 10; probe++) {
          try {
            const freshAcc = getAccount(wagmiConfig);
            if (!freshAcc.connector) throw new Error('no connector');
            await getConnectorClient(wagmiConfig);
            relayReady = true;
            break;
          } catch (probeErr: any) {
            const probeMsg = probeErr?.message?.toLowerCase() ?? '';
            const isRecoverable = probeMsg.includes('reconnecting') || probeMsg.includes('unavailable') || probeMsg.includes('not connected') || probeMsg.includes('no connector') || probeMsg.includes('provider');
            if (!isRecoverable) break;
            if (probe % 2 === 1) { try { wagmiReconnect(wagmiConfig).catch(() => {}); } catch {} }
            await new Promise(r => setTimeout(r, 1000));
          }
        }

        for (let i = 0; i < 4; i++) {
            try {
                try { closeAppKit(); } catch {} // Close AppKit modal so user can see signature UI and native wallet popup
                signature = await signMessageAsync({ message });
                break;
            } catch (err: any) {
                lastErr = err;
                const errMsg = err?.message?.toLowerCase() || '';
                const isConnErr = errMsg.includes('connector not connected') || errMsg.includes('not connected') || errMsg.includes('socket stall') || errMsg.includes('provider not found') || errMsg.includes('reconnecting') || errMsg.includes('unavailable');
                if (isConnErr) {
                    try { wagmiReconnect(wagmiConfig).catch(() => {}); } catch {}
                    for (let rp = 0; rp < 5; rp++) {
                      try { await getConnectorClient(wagmiConfig); break; } catch { await new Promise(r => setTimeout(r, 1200)); }
                    }
                    continue;
                }
                throw err;
            }
        }

        if (!signature && lastErr) {
            try {
              const freshAccount = getAccount(wagmiConfig);
              const activeConnector = freshAccount.connector ?? connector;
              let provider: any = null;
              try { provider = await activeConnector?.getProvider(); } catch {}
              if (!provider && typeof window !== 'undefined' && (window as any).ethereum) { provider = (window as any).ethereum; }
              if (provider?.request) {
                const hexMessage = '0x' + Array.from(new TextEncoder().encode(message)).map(b => b.toString(16).padStart(2, '0')).join('');
                signature = await provider.request({ method: 'personal_sign', params: [hexMessage, norm] });
              }
            } catch (fallbackErr: any) {
              console.error('[Auth:CP] L3B fallback failed:', fallbackErr?.message);
            }
            if (!signature) throw lastErr;
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);
        const verifyRes = await fetch('/api/auth/system-verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ address: norm, message, signature, nonce }),
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
        if (returnUrl && returnUrl !== '/portfolio') {
            if (returnUrl.startsWith('http')) { window.location.href = returnUrl; }
            else { window.location.replace(returnUrl); }
        } else { window.location.replace("/terminal"); }
      } catch (err: any) {
        const msg = err?.message || '';
        if (!msg.toLowerCase().includes('rejected') && !msg.toLowerCase().includes('denied')) {
          toast.error('Authentication failed', { description: msg });
        }
        signingRef.current = false;
        setAuthStatus('failed');
      }
    };

    runVerify();
  }, [accountStatus, address, mounted, setLinked, signMessageAsync, authStatus, connector]);

  const openAppKitSafe = useCallback(() => {
    try {
      (openAppKit as any)({ view: 'Connect' });
    } catch {
      try {
        openAppKit();
      } catch (e: any) {
        console.warn("AppKit open error", e);
        // DOM fallback
        try {
          const el = (document.querySelector("appkit-modal") || document.querySelector("w3m-modal")) as any;
          if (el) { el.open = true; if (typeof el.openModal === 'function') el.openModal(); }
        } catch {}
      }
    }
  }, [openAppKit]);

  const handleDesktopWallet = useCallback((walletId: string, rdns: string | null, installUrl: string | null) => {
    try { sessionStorage.removeItem("__disconnected__"); } catch {}
    try { localStorage.removeItem("__disconnected__"); } catch {}
    setPendingId(walletId);
    if (!rdns) { openAppKitSafe(); setPendingId(null); return; }
    const conn = connectors.find((c: any) => c.id === rdns)
      || connectors.find((c) => c.name.toLowerCase().includes(walletId.toLowerCase()))
      || connectors.find((c) => c.id === "injected" || (c as any).type === "injected");
    if (conn) connect({ connector: conn });
    else {
      setPendingId(null);
      if (installUrl) toast.error("Wallet extension not found", { action: { label: "Install", onClick: () => window.open(installUrl, "_blank") } });
    }
  }, [connect, connectors, openAppKitSafe]);

  const handleMobileWallet = useCallback((walletId: string) => {
    try { sessionStorage.removeItem("__disconnected__"); } catch {}
    try { localStorage.removeItem("__disconnected__"); } catch {}
    try { localStorage.setItem('system_pending_wakeup', '1'); } catch {}

    // If we are inside a dApp browser (MetaMask, Coinbase, etc.) use injected connector directly
    const injectedConn = connectors.find((c: any) =>
      c.id === 'injected' ||
      c.type === 'injected' ||
      c.id === 'io.metamask' ||
      c.name.toLowerCase().includes(walletId.split('-')[0].toLowerCase())
    );

    if (injectedConn && typeof window !== 'undefined' && ((window as any).ethereum || (window as any).web3)) {
      setPendingId(walletId);
      connect({ connector: injectedConn });
      return;
    }

    // Pure synchronous call — dispatch directly to the shadow DOM of <appkit-button>
    // to bypass iOS Safari's popup blocker.
    try {
      const appkitBtn = document.querySelector('appkit-button') || document.querySelector('w3m-button');
      if (appkitBtn && appkitBtn.shadowRoot) {
        const nativeBtn = appkitBtn.shadowRoot.querySelector('button');
        if (nativeBtn) {
          nativeBtn.click();
          return; // Successfully dispatched
        }
      }
    } catch (e) {}

    // Fallback
    try { (openAppKit as any)({ view: 'Connect' }); } catch {
      try { openAppKit(); } catch {}
    }
  }, [openAppKit, connect, connectors]);

  const triggerManualVerify = useCallback(() => {
    signingRef.current = false;
    setAuthStatus('idle');
  }, []);

  const isVerified = mounted && isLinked;
  // Cinematic scroll intro has been removed. Auth is now immediate to match mobile gate.



  // ── WEB2 LOGINS (Shared) ──
  const renderWeb2Logins = () => (
    <>
      <WalletButton
        logo="/email-icon.svg"
        name="Sign in with Email"
        badge="6-digit code sent to your inbox"
        onClick={() => setEmailModalOpen(true)}
        delay={0.3}
        extraIcon={
          <span className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 bg-blue-500/10 rounded border border-blue-500/20 text-blue-400">OTP</span>
        }
      />
    </>
  );

  // ── RIGHT PANEL (Auth) ──
  const renderLoginCard = () => (
    <div className="w-full lg:w-[420px] flex-shrink-0 flex flex-col bg-white/95 backdrop-blur-2xl rounded-3xl border border-white shadow-[0_20px_60px_rgba(0,0,0,0.15)] overflow-hidden relative">
      
      <div className="px-8 pt-8 pb-5 border-b border-slate-100 flex items-center gap-3 relative z-10">
        <Lock size={16} strokeWidth={2} className="text-blue-500" />
        <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-slate-400 font-bold flex-1">Secure Entry</span>
        <Link href="/terminal" className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 border border-slate-200 text-slate-600 font-black rounded-lg text-[9px] uppercase tracking-widest hover:bg-slate-200 hover:text-slate-800 transition-all active:scale-95 shadow-sm">
          <QrCode size={12} />Studio
        </Link>
      </div>

      <div className="w-full flex flex-col flex-1 p-8 relative z-10">
        {mounted && !isVerified && (
          <div className="flex items-center justify-center gap-2 mb-6">
            {isMobile ? <Smartphone size={12} className="text-slate-400" /> : <Monitor size={12} className="text-slate-400" />}
            <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-slate-400 font-bold">{isMobile ? "Mobile connection" : "Desktop connection"}</span>
          </div>
        )}

        {/* STATE: Verified */}
        {isVerified ? (
          <motion.div key="verified" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} className="flex flex-col items-center justify-center flex-1 relative min-h-[280px]">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-[260px] h-[260px] opacity-80 mix-blend-multiply">
                <RemoteLottie path="/system-shots/Transaction Complete.json" loop={false} className="w-full h-full object-contain scale-[1.2]" />
              </div>
            </div>
            <div className="absolute bottom-4 flex flex-col items-center gap-2">
              <button onClick={handleTotalDisconnect} className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-rose-500/30 text-[9px] font-black uppercase tracking-[0.2em] bg-rose-50 text-rose-500 hover:bg-rose-100 transition-all active:scale-[0.98]">
                Total Disconnect
              </button>
            </div>
          </motion.div>
        ) : effectiveIsConnected && !isLinked ? (
          /* STATE: Connected but awaiting signature */
          <div className="flex flex-col items-center justify-center gap-5 flex-1 py-4 text-center">
            <div className="w-16 h-16 bg-blue-50 border border-blue-100 rounded-full flex items-center justify-center text-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.1)]">
              <Lock size={20} strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-[18px] font-black tracking-tight text-slate-900 mb-2">Signature Required</h2>
              <p className="text-[11px] text-slate-500 font-medium leading-relaxed max-w-[230px] mx-auto">Please check your browser extension or mobile app to sign the request.</p>
            </div>
            {authStatus === 'failed' ? (
              <div className="flex flex-col gap-3 w-full mt-4">
                <button onClick={() => { triggerManualVerify(); }} className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-blue-600 text-white font-mono text-[10px] font-black uppercase tracking-[0.2em] hover:bg-blue-500 transition-all shadow-md active:scale-[0.98]">
                  <ExternalLink size={13} /> Retry Signature
                </button>
                <button onClick={handleTotalDisconnect} className="w-full py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-rose-500 hover:bg-slate-200 font-mono text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-[0.98]">Disconnect</button>
              </div>
            ) : (
              <div className="flex flex-col gap-3 w-full mt-4">
                <div className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-400 font-mono text-[10px] font-black uppercase tracking-[0.2em] cursor-not-allowed">
                  <ExternalLink size={13} /> Check Wallet App
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Loader2 size={11} className="animate-spin text-blue-500" />
                  <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-blue-500 font-bold animate-pulse">Awaiting signature...</span>
                </div>
              </div>
            )}
          </div>
        ) : !mounted ? (
          /* STATE: Loading skeleton */
          <div className="flex flex-col gap-4 flex-1">
            {[0, 1].map((i) => <div key={i} className="w-full h-[65px] rounded-xl bg-slate-100 border border-slate-200 animate-pulse" />)}
          </div>
        ) : isMobile ? (
          /* STATE: Mobile — wallet list */
          <div className="flex flex-col gap-3 flex-1">
            {renderWeb2Logins()}
            <div className="h-px w-full bg-slate-100 my-2 relative"><div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-200 to-transparent" /></div>
            <WalletButton
              logo="https://raw.githubusercontent.com/WalletConnect/walletconnect-assets/master/Logo/Blue%20(Default)/Logo.svg"
              name="Connect Web3 Wallet"
              badge="Select from 300+ wallets"
              onClick={() => openAppKitSafe()}
              delay={0.35}
            />
            <button onClick={() => setShowMobileScanner(true)} className="w-full flex items-center justify-center gap-3 py-4 mt-2 rounded-xl border border-slate-200 bg-slate-50 font-black uppercase tracking-[0.2em] text-[10px] text-slate-700 active:scale-[0.98] transition-all hover:bg-slate-100 hover:border-slate-300">
              <ScanLine size={13} /> Scan QR Code
            </button>
          </div>
        ) : (
          /* STATE: Desktop — QR + wallet list */
          <div className="flex flex-col gap-3 flex-1 w-full">
            {syncStatus === "AWAITING" && qrData ? (
              <motion.div key="qr-ready" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }} className="flex justify-center mb-4">
                <div className="p-6 bg-white border border-slate-200 rounded-2xl flex flex-col items-center gap-4 shadow-xl w-full">
                  <span className="text-[20px] font-black tracking-tight text-slate-900">Connect</span>
                  <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-100">
                    <QRCodeSVG value={qrData} size={180} fgColor="#0F172A" bgColor="#FFFFFF" level="M" includeMargin={false} />
                  </div>
                  <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-slate-500 font-bold">Scan with Mobile App</span>
                  {pinCode && (
                    <div className="w-full rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                      <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border-b border-slate-100">
                        <Shield size={11} className="text-blue-500" />
                        <span className="text-[8px] font-black uppercase tracking-[0.25em] text-blue-500">Visual Security PIN</span>
                      </div>
                      <div className="flex items-center justify-center gap-2 py-3 px-3 bg-white">
                        {pinCode.split('').map((digit, idx) => (
                          <motion.div key={idx} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.07, duration: 0.3 }} className="w-10 h-11 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center shadow-inner">
                            <span className="text-lg font-black text-slate-800 select-none">{digit}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : syncStatus === "IDLE" || (syncStatus === "AWAITING" && !qrData) ? (
              <div className="flex justify-center mb-4">
                <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col items-center gap-3 shadow-inner w-full">
                  <div className="w-full aspect-square max-w-[180px] rounded-xl bg-white border border-slate-200 animate-pulse flex items-center justify-center shadow-sm">
                    <Loader2 size={24} className="animate-spin text-blue-500" />
                  </div>
                  <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-slate-400 font-bold">Securing tunnel...</span>
                </div>
              </div>
            ) : syncStatus === "ERROR" ? (
              <div className="flex justify-center mb-4">
                <div className="p-6 bg-rose-50 rounded-2xl border border-rose-100 flex flex-col items-center gap-3 w-full">
                  <Shield size={22} className="text-rose-500" />
                  <p className="text-[10px] font-mono text-rose-600 text-center font-bold uppercase tracking-widest">Connection Failed</p>
                  <button onClick={() => { setSyncStatus("IDLE"); setQrSession(null); setQrData(''); }} className="px-5 py-2.5 rounded-lg bg-rose-500 text-white text-[9px] font-black uppercase tracking-widest hover:bg-rose-600 transition-colors active:scale-[0.97] mt-1 shadow-md">Retry Link</button>
                </div>
              </div>
            ) : null}

            {DESKTOP_WALLETS.map((w) => (
              <WalletButton key={w.id} logo={w.logo} name={w.name} badge={w.badge} onClick={() => handleDesktopWallet(w.id, w.rdns, w.installUrl)} loading={isPending && pendingId === w.id} delay={w.delay} />
            ))}
            
            <div className="h-px w-full bg-slate-100 my-1 relative"><div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-200 to-transparent" /></div>
            {renderWeb2Logins()}
          </div>
        )}
      </div>
    </div>
  );

  // ── LEFT PANEL (Branding & Info) ──
  const renderInfoPanel = () => (
    <motion.div
      initial={{ opacity: 0, x: -14 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col justify-center gap-8 px-4 lg:px-12 text-center lg:text-left z-10 max-w-2xl"
    >
      <div className="flex flex-col gap-4 items-center lg:items-start">
        <div className="flex items-center gap-2 mb-2 bg-white px-4 py-2 rounded-full shadow-md w-fit mx-auto lg:mx-0">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.8)]" />
          <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-emerald-600 font-bold">Aztec V5 Testnet Active</span>
        </div>
        
        <div className="bg-white px-8 py-6 rounded-[2rem] shadow-xl w-fit mx-auto lg:mx-0">
          <h1 className="font-black tracking-tighter uppercase leading-[0.9] text-slate-900" style={{ fontSize: 'clamp(48px, 8vw, 84px)' }}>
            WHALE
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-600">NETWORK</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-3 mt-2 bg-white px-4 py-2 rounded-full shadow-md w-fit mx-auto lg:mx-0">
          <span className="text-[10px] font-mono uppercase tracking-[0.4em] text-slate-500 font-bold">
            Powered by Aztec Network
          </span>
        </div>
      </div>
      
      <div className="bg-white/95 backdrop-blur-md p-6 rounded-3xl shadow-lg max-w-xl mx-auto lg:mx-0">
        <p className="text-[14px] md:text-[16px] font-medium text-slate-700 leading-relaxed">
          A private-by-default enclave for verifiable financial intelligence. Every transaction, signal, and identity proof is sealed using Zero Knowledge cryptography before reaching the network.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2 max-w-xl mx-auto lg:mx-0">
        <div className="bg-white border border-slate-100 shadow-lg rounded-2xl p-5 flex flex-col gap-2 backdrop-blur-md">
          <Shield className="text-blue-500 mb-2" size={20} />
          <h3 className="text-[12px] font-black uppercase tracking-widest text-slate-900">Absolute Privacy</h3>
          <p className="text-[11px] text-slate-500 leading-relaxed font-mono">Noir ZK circuits ensure your identity and balances are cryptographically invisible.</p>
        </div>
        <div className="bg-white border border-slate-100 shadow-lg rounded-2xl p-5 flex flex-col gap-2 backdrop-blur-md">
          <MessageSquare className="text-indigo-500 mb-2" size={20} />
          <h3 className="text-[12px] font-black uppercase tracking-widest text-slate-900">Sovereign Intel</h3>
          <p className="text-[11px] text-slate-500 leading-relaxed font-mono">End-to-end encrypted signals and peer-to-peer data markets settled on L2.</p>
        </div>
      </div>
    </motion.div>
  );

  if (!mounted) return <div className="w-full min-h-screen bg-slate-50" />;

  return (
    <div className="w-full min-h-screen bg-slate-50 flex flex-col shrink-0 relative overflow-hidden text-slate-900">
      
      {/* Wave Background */}
      <div 
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: 'url("/bg-waves.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />
      <div className="fixed inset-0 pointer-events-none z-0 bg-gradient-to-b from-white/40 via-transparent to-slate-50/90" />

      <div className="w-full relative z-10 flex-1 flex flex-col lg:flex-row items-center justify-center lg:justify-between max-w-[1280px] mx-auto px-6 py-12 lg:py-0 gap-12 lg:gap-8 min-h-screen">
        
        {/* Left Side: Branding */}
        <div className="flex-1 flex justify-center lg:justify-start w-full">
          {renderInfoPanel()}
        </div>

        {/* Right Side: Auth */}
        <div className="flex-1 flex justify-center lg:justify-end w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          >
            {renderLoginCard()}
          </motion.div>
        </div>

        {/* Mobile QR Scanner modal */}
        {isMobile && mounted && (
          <DynamicUniversalScanModal
            isOpen={showMobileScanner}
            onClose={() => setShowMobileScanner(false)}
            address={address ?? ""}
            mode="session-only"
            onScan={() => { setShowMobileScanner(false); toast.success("Session synchronized"); }}
          />
        )}

        {/* Global Email Login Modal */}
        <EmailLoginModal isOpen={emailModalOpen} onClose={() => setEmailModalOpen(false)} />
      </div>
      
      {/* Hidden AppKit button for native mobile dispatch */}
      <div aria-hidden="true" style={{ position: 'absolute', opacity: 0, width: '1px', height: '1px', pointerEvents: 'none', overflow: 'hidden' }}>
        {/* @ts-ignore */}
        <appkit-button />
      </div>

    </div>
  );
}
