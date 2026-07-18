"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
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
  
  const effectiveIsConnected = isConnected && !isGuarded;

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
        if (!nonceRes.ok) throw new Error('Failed to fetch authentication nonce');
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
        } else { window.location.replace("/"); }
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

  const openAppKitSafe = useCallback(async (retries = 0): Promise<void> => {
    try {
      await openAppKit();
    } catch (e: any) {
      if (retries < 5) {
        await new Promise(r => setTimeout(r, 150));
        return openAppKitSafe(retries + 1);
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
    openAppKitSafe();
  }, [openAppKitSafe]);

  const triggerManualVerify = useCallback(() => {
    signingRef.current = false;
    setAuthStatus('idle');
  }, []);

  const isVerified = mounted && isLinked;

  // --- Scroll-Driven Cinematic Sequence ---
  const [phase, setPhase] = useState<"intro" | "login">("intro");
  const introScrollRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null); // NEW: Reference for the scrolling container
  
  const { scrollYProgress: introScrollProgress } = useScroll({
    target: introScrollRef,
    container: containerRef, // Attach to the modal container instead of window
    offset: ["start start", "end start"],
  });

  // 1. Authenticate Text (fades out early)
  const introScale = useTransform(introScrollProgress, [0, 0.2], [1, 0.88]);
  const introOpacity = useTransform(introScrollProgress, [0, 0.2], [1, 0]);
  const introBlur = useTransform(introScrollProgress, [0, 0.2], ["blur(0px)", "blur(16px)"]);

  // 2. Whale Network Manifesto (fades in, stays, fades out)
  const manifestoOpacity = useTransform(introScrollProgress, [0.2, 0.3, 0.8, 0.9], [0, 1, 1, 0]);
  const manifestoY = useTransform(introScrollProgress, [0.2, 0.3, 0.8, 0.9], [40, 0, 0, -40]);

  // Transition to login phase when scrolled past 95% of intro container
  useEffect(() => {
    return introScrollProgress.on('change', (v) => {
      if (v >= 0.95 && phase === 'intro') {
        setPhase('login');
      }
    });
  }, [introScrollProgress, phase]);

  // ── WEB2 LOGINS (Shared) ──
  const renderWeb2Logins = () => (
    <>
      {/* Google OAuth */}
      <WalletButton
        logo="https://www.svgrepo.com/show/475656/google-color.svg"
        name="Continue with Google"
        badge="1-click · No wallet needed"
        onClick={async () => {
          if (googleLoading) return;
          setGoogleLoading(true);
          try {
            try { sessionStorage.removeItem('__disconnected__'); } catch {}
            try { localStorage.removeItem('__disconnected__'); } catch {}
            await signIn('google', { callbackUrl: '/' });
          } catch (err) {
            console.error('[Google OAuth] signIn error:', err);
            setGoogleLoading(false);
          }
        }}
        loading={googleLoading}
        delay={0.24}
      />
      {/* Email OTP */}
      <WalletButton
        logo="/email-icon.svg"
        name="Sign in with Email"
        badge="6-digit code sent to your inbox"
        onClick={() => setEmailModalOpen(true)}
        delay={0.3}
        extraIcon={
          <span className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 bg-black/5 rounded text-black/40">OTP</span>
        }
      />
    </>
  );

  // ── LEFT PANEL CONTENT (shared between mobile/desktop) ──
  const renderLoginCard = () => (
    <div className="w-full lg:w-[400px] flex-shrink-0 flex flex-col bg-white rounded-[20px] border border-[#E8E8E8] shadow-[0_8px_48px_rgba(0,0,0,0.18)] p-8">
      {/* Header row */}
      <div className="flex items-center gap-3 mb-8 pb-5 border-b border-[#EFEFEF]">
        <Lock size={16} strokeWidth={1.5} className="text-[#0A0A0A]" />
        <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#0A0A0A]/50 font-medium flex-1">Secure Authentication</span>
        <Link href="/terminal" className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F0F4FF] text-blue-600 font-black rounded-lg text-[10px] uppercase tracking-widest hover:bg-blue-100 transition-all active:scale-95 shadow-sm">
          <QrCode size={12} />Studio
        </Link>
      </div>

      <div className="w-full flex flex-col flex-1">
        {mounted && !isVerified && (
          <div className="flex items-center justify-center gap-2 mb-5 opacity-40">
            {isMobile ? <Smartphone size={12} /> : <Monitor size={12} />}
            <span className="text-[9px] font-mono uppercase tracking-[0.2em]">{isMobile ? "Mobile connection" : "Desktop connection"}</span>
          </div>
        )}

        {/* STATE: Verified */}
        {isVerified ? (
          <motion.div key="verified" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} className="flex flex-col items-center justify-center flex-1 relative min-h-[280px]">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-[260px] h-[260px]">
                <RemoteLottie path="/system-shots/Transaction Complete.json" loop={false} className="w-full h-full object-contain scale-[1.2]" />
              </div>
            </div>
            <div className="absolute bottom-4 flex flex-col items-center gap-2">
              <button onClick={handleTotalDisconnect} className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] bg-rose-50 text-rose-500 hover:bg-rose-100 transition-all active:scale-[0.98]">
                Total Disconnect
              </button>
            </div>
          </motion.div>
        ) : effectiveIsConnected && !isLinked ? (
          /* STATE: Connected but awaiting signature */
          <div className="flex flex-col items-center justify-center gap-5 flex-1 py-4 text-center">
            <div className="w-14 h-14 bg-[#0A0A0A]/5 rounded-full flex items-center justify-center text-[#0A0A0A]">
              <Lock size={18} strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="text-[17px] font-black tracking-tight text-[#0A0A0A] mb-2">Signature Required</h2>
              <p className="text-[11px] text-[#888] leading-relaxed max-w-[230px] mx-auto">Sign the verification request in your wallet to complete secure authentication.</p>
            </div>
            {authStatus === 'failed' ? (
              <div className="flex flex-col gap-3 w-full mt-2">
                <button onClick={() => { openAppKitSafe(); triggerManualVerify(); }} className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#0A0A0A] text-white font-mono text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#222] transition-all shadow-md active:scale-[0.98]">
                  <ExternalLink size={13} /> Open Wallet &amp; Retry
                </button>
                <button onClick={handleTotalDisconnect} className="w-full py-2.5 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-100 font-mono text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-[0.98]">Disconnect</button>
              </div>
            ) : (
              <div className="flex flex-col gap-3 w-full mt-2">
                <button onClick={() => openAppKitSafe()} className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#0A0A0A] text-white font-mono text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#222] transition-all shadow-md active:scale-[0.98]">
                  <ExternalLink size={13} /> Tap to Sign / Open Wallet
                </button>
                <div className="flex items-center justify-center gap-2">
                  <Loader2 size={11} className="animate-spin text-black/35" />
                  <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-black/35 animate-pulse">Awaiting signature...</span>
                </div>
              </div>
            )}
          </div>
        ) : !mounted ? (
          /* STATE: Loading skeleton */
          <div className="flex flex-col gap-3 flex-1">
            {[0, 1, 2].map((i) => <div key={i} className="w-full h-[60px] rounded-xl bg-[#F5F5F5] animate-pulse" />)}
          </div>
        ) : isMobile ? (
          /* STATE: Mobile — wallet list */
          <div className="flex flex-col gap-3 flex-1">
            <span className="text-center text-[10px] font-mono uppercase tracking-[0.2em] text-black/35">QR synchronized</span>
            {renderWeb2Logins()}
            <div className="h-px w-full bg-[#F0F0F0] my-1" />
            {MOBILE_WALLETS.map((w) => (
              <WalletButton key={w.id} logo={w.logo} name={w.name} badge={w.badge} onClick={() => handleMobileWallet(w.id)} loading={isPending && pendingId === w.id} delay={w.delay} extraIcon={<ExternalLink size={13} />} />
            ))}
            <button onClick={() => setShowMobileScanner(true)} className="w-full flex items-center justify-center gap-3 py-4 mt-1 rounded-xl border border-[#E8E8E8] bg-white font-black uppercase tracking-[0.2em] text-[10px] text-[#0A0A0A] active:scale-[0.98] transition-all hover:bg-black/5">
              <ScanLine size={13} /> Scan QR Code
            </button>
          </div>
        ) : (
          /* STATE: Desktop — QR + wallet list */
          <div className="flex flex-col gap-3 flex-1 w-full">
            {syncStatus === "AWAITING" && qrData ? (
              <motion.div key="qr-ready" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }} className="flex justify-center mb-3">
                <div className="p-5 bg-white rounded-2xl border border-[#EFEFEF] flex flex-col items-center gap-3 shadow-sm w-full">
                  <span className="text-[22px] font-black tracking-tight text-[#0A0A0A]">Login</span>
                  <QRCodeSVG value={qrData} size={200} fgColor="#0A0A0A" bgColor="#FFFFFF" level="M" includeMargin={false} />
                  <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-[#0A0A0A]/35">Connect Mobile</span>
                  {pinCode && (
                    <div className="w-full rounded-xl overflow-hidden border border-[#E0E0E0]">
                      <div className="flex items-center gap-2 px-3 py-2 bg-[#0A0A0A]">
                        <Shield size={11} className="text-white/60" />
                        <span className="text-[8px] font-black uppercase tracking-[0.25em] text-white/60">Visual Security PIN</span>
                        <span className="ml-auto text-[7px] font-mono text-white/25">HKDF·SHA-256</span>
                      </div>
                      <div className="flex items-center justify-center gap-2 py-2.5 px-3 bg-black/[0.025]">
                        {pinCode.split('').map((digit, idx) => (
                          <motion.div key={idx} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.07, duration: 0.3 }} className="w-10 h-11 rounded-lg bg-white border-2 border-black/[0.08] flex items-center justify-center shadow-sm">
                            <span className="text-lg font-black text-[#0A0A0A] select-none">{digit}</span>
                          </motion.div>
                        ))}
                      </div>
                      <div className="px-3 py-2 bg-[#0A0A0A]/[0.025] border-t border-black/5 flex items-center gap-1.5">
                        <Lock size={8} className="text-black/25" />
                        <span className="text-[8px] text-black/30 font-mono">Enter this code in the mobile scanner to authenticate</span>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : syncStatus === "IDLE" || (syncStatus === "AWAITING" && !qrData) ? (
              <div className="flex justify-center mb-3">
                <div className="p-5 bg-white rounded-2xl border border-[#EFEFEF] flex flex-col items-center gap-3 shadow-sm w-full">
                  <div className="w-full aspect-square max-w-[200px] rounded-xl bg-[#F8F8F8] animate-pulse flex items-center justify-center">
                    <Loader2 size={24} className="animate-spin text-black/15" />
                  </div>
                  <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-black/20">Generating secure link...</span>
                </div>
              </div>
            ) : syncStatus === "ERROR" ? (
              <div className="flex justify-center mb-3">
                <div className="p-5 bg-rose-50 rounded-2xl border border-rose-100 flex flex-col items-center gap-3 w-full">
                  <Shield size={22} className="text-rose-300" />
                  <p className="text-[10px] font-mono text-rose-400 text-center">QR generation failed</p>
                  <button onClick={() => { setSyncStatus("IDLE"); setQrSession(null); setQrData(''); }} className="px-4 py-2 rounded-xl bg-rose-500 text-white text-[9px] font-black uppercase tracking-widest hover:bg-rose-600 transition-colors active:scale-[0.97]">Retry</button>
                </div>
              </div>
            ) : null}

            {DESKTOP_WALLETS.map((w) => (
              <WalletButton key={w.id} logo={w.logo} name={w.name} badge={w.badge} onClick={() => handleDesktopWallet(w.id, w.rdns, w.installUrl)} loading={isPending && pendingId === w.id} delay={w.delay} />
            ))}
            
            <div className="h-px w-full bg-[#F0F0F0] my-1" />
            {renderWeb2Logins()}
          </div>
        )}
      </div>
    </div>
  );

  // ── RIGHT PANEL: QD Utility Marketing ──
  const renderQDPanel = () => (
    <motion.div
      initial={{ opacity: 0, x: 14 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.45, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
      className="flex-1 min-w-0 flex flex-col bg-white rounded-[20px] border border-[#E8E8E8] shadow-[0_12px_60px_rgba(0,0,0,0.12)] overflow-hidden"
    >
      {/* Header */}
      <div className="px-7 pt-7 pb-5 border-b border-[#F0F0F0]">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-1.5 h-1.5 rounded-full bg-[#0A0A0A] animate-pulse" />
          <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#0A0A0A]/60">Whale Network · QD Economy</span>
        </div>
        <h2 className="text-[22px] font-black tracking-tight text-[#0A0A0A] leading-tight">What can you do with QDs?</h2>
        <p className="text-[12px] font-medium text-[#555] mt-2 leading-relaxed">
          QDs are the native on-chain currency of Whale Network. Every action is settled natively on the Aztec L2 ledger — cryptographically private, censorship-proof.
        </p>
      </div>

      {/* Utility rows */}
      <div className="px-7 pt-5 pb-5 flex flex-col gap-3.5 bg-[#FAFAFA]">
        {[
          { icon: <MessageSquare size={16} strokeWidth={2} />, label: "E2E Encrypted Video Calls", sub: "WebRTC calls through XMTP. Zero metadata leakage. Uncensorable.", cost: "0.5 QD / call", badge: "LIVE", bc: "bg-[#EAEAEA] text-[#0A0A0A]" },
          { icon: <Briefcase size={16} strokeWidth={2} />, label: "Noir ZK Proof Compiler", sub: "Generate Barretenberg UltraHonk proofs locally. No trusted setup.", cost: "0.1 QD / proof", badge: "LIVE", bc: "bg-[#EAEAEA] text-[#0A0A0A]" },
          { icon: <Shield size={16} strokeWidth={2} />, label: "Aztec L2 Shielding Portal", sub: "Private state transitions and shielded asset transfers on Aztec.", cost: "Variable", badge: "TESTNET", bc: "bg-amber-100 text-amber-800" },
          { icon: <CheckCircle size={16} strokeWidth={2} />, label: "Social Identity Verification", sub: "Link X, Discord and Telegram to your identity. Earn QDs monthly.", cost: "Free — Earn QDs", badge: "EARNS", bc: "bg-emerald-100 text-emerald-800" },
        ].map((item, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 + i * 0.07, duration: 0.35 }}
            className="flex gap-4 items-center p-4 rounded-2xl border border-[#E5E5E5] bg-white hover:border-[#D0D0D0] hover:shadow-md transition-all cursor-default">
            <div className="w-10 h-10 rounded-xl bg-[#F8F8F8] border border-[#E0E0E0] flex items-center justify-center shrink-0 text-[#0A0A0A]">{item.icon}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                <span className="text-[12px] font-black uppercase tracking-wider text-[#0A0A0A]">{item.label}</span>
                <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${item.bc}`}>{item.badge}</span>
              </div>
              <p className="text-[11px] font-medium text-[#666] leading-snug">{item.sub}</p>
            </div>
            <span className="text-[11px] font-black font-mono text-[#0A0A0A] whitespace-nowrap shrink-0 px-2.5 py-1.5 bg-[#F5F5F5] rounded-lg border border-[#E0E0E0] shadow-sm">{item.cost}</span>
          </motion.div>
        ))}
      </div>

      {/* Account Class grid */}
      <div className="px-7 pb-7 pt-2 bg-[#FAFAFA]">
        <div className="text-[9px] font-black uppercase tracking-[0.25em] text-[#0A0A0A]/50 mb-3 ml-1">Account Class · Aztec Protocol Roles</div>
        <div className="grid grid-cols-3 gap-2.5">
          {[
            { name: 'WITNESS', range: '< 10 QD' },
            { name: 'PROVER', range: '10+ QD' },
            { name: 'SEQUENCER', range: '50+ QD' },
            { name: 'SHIELDER', range: '100+ QD' },
            { name: 'SOVEREIGN', range: '500+ QD' },
            { name: 'ARCHITECT', range: '1,000+ QD' },
          ].map((r, i) => (
            <div key={i} className="flex flex-col gap-1 p-3 rounded-xl border border-[#E5E5E5] bg-white shadow-sm hover:border-[#D0D0D0] hover:shadow transition-all">
              <span className="text-[9px] font-black uppercase tracking-widest text-[#0A0A0A]">{r.name}</span>
              <span className="text-[8px] font-mono font-medium text-[#666]">{r.range}</span>
            </div>
          ))}
        </div>
        <p className="text-[10px] font-medium text-[#666] mt-4 leading-relaxed ml-1">
          Authenticate and receive <span className="font-black text-[#0A0A0A]">1000 QDs</span> on entry. Spend them. Earn more. Climb the protocol.
        </p>
      </div>
    </motion.div>
  );

  // ── BOTTOM SECTION ──
  const renderBottomSection = () => (
    <div className="w-full max-w-[900px] flex flex-col gap-4">
      {/* Manifesto */}
      <div className="bg-white rounded-2xl shadow-lg p-5 flex flex-col gap-3 items-center text-center border border-[#EFEFEF]">
        <div className="flex items-center gap-2">
          <img src="/ballena-checkpoint.png" alt="Whale Network" className="h-5 w-5 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          <span className="text-[11px] font-black uppercase tracking-[0.25em] text-[#0a0a0a]">Whale Network</span>
        </div>
        <p className="text-[11px] text-[#444] leading-relaxed">
          Privacy is a fundamental right. Architecture is a declaration of values. Whale Network is structurally incapable of collecting user state. Data is sealed via SNARKs before reaching any network layer — a sovereign enclave powered by the Aztec Network.
        </p>
      </div>

      {/* Platform badges */}
      <div className="bg-white rounded-2xl shadow-lg p-5 flex flex-col gap-4 items-center border border-[#EFEFEF]">
        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0A0A0A]">
          January 1, 2027
        </div>
        <div className="text-[9px] font-mono text-[#666] uppercase tracking-[0.1em] text-center max-w-[200px]">
          Global release on App Store & Google Play
        </div>
        <div className="flex items-center gap-3 justify-center flex-wrap w-full mt-1">
          {[
            { label: 'iOS', d: 'M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z' },
            { label: 'Android', d: 'M3.18 23.76c.3.17.65.19.96.07l12.75-7.37-2.79-2.79L3.18 23.76zm-1.13-1.49V1.73c0-.43.23-.82.6-1.03L15.19 12l-13.14 12.3c0-.01 0-.02-.01-.03zm15.53-8.12l2.38 2.38c.41.41.41 1.07 0 1.48L17.72 20l-2.79-2.79 2.65-3.06zM3.18.24c.31-.12.66-.1.96.07L16.9 7.68l-2.79 2.79L3.18.24z' },
          ].map(({ label, d }) => (
            <div key={label} className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-[#FAFAFA] rounded-xl border border-[#E8E8E8]">
              <svg viewBox="0 0 24 24" className="w-4 h-4 text-[#0A0A0A]" fill="currentColor"><path d={d} /></svg>
              <span className="text-[9px] font-black uppercase tracking-widest text-[#0A0A0A]">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Social links */}
      <div className="flex gap-3 justify-center">
        <a href="https://github.com/whalenetwork" target="_blank" rel="noopener noreferrer" className="flex flex-1 items-center justify-center py-3 rounded-2xl bg-white border border-[#EFEFEF] shadow-lg text-[#0A0A0A] hover:-translate-y-0.5 transition-all">
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" /></svg>
        </a>
        <a href="https://t.me/humanityledger" target="_blank" rel="noopener noreferrer" className="flex flex-1 items-center justify-center py-3 rounded-2xl bg-white border border-[#EFEFEF] shadow-lg text-[#2AABEE] hover:-translate-y-0.5 transition-all">
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.94z" /></svg>
        </a>
        <a href="https://linkedin.com/in/stefan-antonio-cirisanu" target="_blank" rel="noopener noreferrer" className="flex flex-1 items-center justify-center py-3 rounded-2xl bg-white border border-[#EFEFEF] shadow-lg text-[#0A66C2] hover:-translate-y-0.5 transition-all">
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
        </a>
      </div>

      <p className="text-black/30 text-[8px] font-mono uppercase tracking-[0.25em] text-center">© 2027 Humanity Ledger · Whale Network</p>
    </div>
  );

  return (
    <div ref={containerRef} className="fixed inset-0 w-full bg-white z-50 flex flex-col min-h-screen overflow-y-auto">
      {/* Film grain noise overlay */}
      <motion.div
        className="fixed inset-0 pointer-events-none z-50"
        animate={{ opacity: phase === "intro" ? 0.02 : 0.04 }}
        transition={{ duration: 1.5 }}
        style={{
          backgroundImage: 'url("https://upload.wikimedia.org/wikipedia/commons/7/76/1k_Dissolve_Noise_Texture.png")',
          backgroundRepeat: 'repeat',
          mixBlendMode: 'multiply'
        }}
      />

      <div className="w-full flex-1 flex flex-col items-center justify-center relative z-10 h-full">

        {/* PHASE 1: The Cryptographic Typography — Scroll-Driven */}
        <AnimatePresence>
          {phase === "intro" && (
            <motion.div
              ref={introScrollRef}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ scale: 2, opacity: 0, filter: "blur(40px)" }}
              transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-20"
              style={{ minHeight: '400vh', width: '100%' }}
            >
              {/* Sticky viewport that holds the text during scroll */}
              <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden pointer-events-none">
                
                {/* 1. AUTHENTICATE TITLE */}
                <motion.div
                  style={{ scale: introScale, opacity: introOpacity, filter: introBlur }}
                  className="absolute inset-0 flex flex-col items-center justify-center"
                >
                  <div className="flex flex-col items-center text-center gap-6">
                    <h1 className="font-serif text-[15vw] md:text-[10vw] font-normal tracking-tight text-[#0A0A0A] leading-none select-none">
                      AUTHENTICATE
                    </h1>
                    <p className="font-mono text-[9px] md:text-[11px] uppercase tracking-[0.4em] text-[#0A0A0A]/40 max-w-[80vw] md:max-w-none text-balance leading-relaxed">
                      WITH HUMANITY LEDGER TO JOIN WHALE NETWORK
                    </p>
                  </div>
                  <div className="absolute bottom-12 left-1/2 -translate-x-1/2 text-[9px] md:text-[10px] font-mono tracking-[0.3em] uppercase text-black/30 flex flex-col items-center gap-3">
                    <span className="whitespace-nowrap">Scroll down</span>
                    <motion.div
                      className="w-px bg-black/20"
                      animate={{ height: ['12px', '40px', '12px'] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                    />
                  </div>
                </motion.div>

                {/* 2. MANIFESTO PRESENTATION */}
                <motion.div
                  style={{ opacity: manifestoOpacity, y: manifestoY }}
                  className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 max-w-[800px] mx-auto pointer-events-none"
                >
                  <h2 className="font-serif text-[8vw] md:text-5xl tracking-tight text-[#0A0A0A] mb-10 select-none">
                    The Sovereign Observation Layer
                  </h2>
                  <div className="flex flex-col gap-6 text-[11px] md:text-[13px] font-mono text-[#0A0A0A]/60 leading-[2] text-justify tracking-wide md:px-12">
                    <p>
                      Whale Network is not a data aggregator; it is a decentralized, zero-knowledge observation layer built natively over the Aztec protocol. It resolves the fundamental contradiction of on-chain capital flows: the absolute necessity to monitor systemic liquidity without participating in the public surveillance apparatus.
                    </p>
                    <p>
                      Traditional blockchains broadcast every state transition to all observers, rendering financial privacy mathematically impossible. By integrating with Humanity Ledger, Whale Network processes high-frequency on-chain events—sovereign accumulation, dark pool transitions, and institutional liquidations—and relays them into a cryptographically shielded execution environment (PXE).
                    </p>
                    <p>
                      Your queries, your alerts, and your portfolio positions are secured by Client-Side zk-SNARKs (Barretenberg proofs) and recursive Plonk verification. The network is structurally incapable of identifying you. Privacy is no longer an opt-in feature; it is the absolute mathematical baseline.
                    </p>
                  </div>
                  <div className="absolute bottom-12 left-1/2 -translate-x-1/2 text-[9px] md:text-[10px] font-mono tracking-[0.3em] uppercase text-black/30 flex flex-col items-center gap-3">
                    <span className="whitespace-nowrap">Continue scrolling to initialize</span>
                    <motion.div
                      className="w-px bg-black/20"
                      animate={{ height: ['12px', '40px', '12px'] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                    />
                  </div>
                </motion.div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* PHASE 2: The Login Assembly */}
        <AnimatePresence>
          {phase === "login" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, filter: "blur(15px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
              className="relative z-10 w-full flex-1 flex flex-col items-center justify-center gap-8 px-4 py-12 h-full overflow-y-auto"
            >
              {/* Side-by-side: Login Card + QD Marketing Panel */}
              <div className="flex flex-col lg:flex-row items-stretch justify-center gap-5 w-full max-w-[900px]">
                {renderLoginCard()}
                {!isMobile && renderQDPanel()}
              </div>

              {/* Bottom section */}
              {!isMobile && renderBottomSection()}
            </motion.div>
          )}
        </AnimatePresence>

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
    </div>
  );
}
