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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      onClick={loading ? undefined : onClick}
      disabled={loading}
      className="group relative w-full flex items-center justify-between py-4 transition-all duration-500 hover:px-2 border-b border-black/10 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
    >
      <div className="absolute inset-0 bg-black translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[0.16,1,0.3,1] z-0" />
      <div className="relative z-10 flex items-center gap-4 w-full">
        <div className="w-8 h-8 flex items-center justify-center grayscale group-hover:grayscale-0 group-hover:brightness-200 transition-all duration-500 shrink-0">
          <img src={logo} alt={name} className="w-full h-full object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
        </div>
        <div className="flex-1 text-left min-w-0 flex flex-col">
          <span className="text-[14px] sm:text-[18px] font-serif font-medium tracking-tight text-black group-hover:text-white transition-colors duration-500 truncate">
            {loading ? "CONNECTING..." : name}
          </span>
          <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-black/40 group-hover:text-white/60 transition-colors duration-500 truncate mt-0.5">
            {badge}
          </span>
        </div>
      </div>
      <div className="relative z-10 shrink-0 ml-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        {loading ? (
          <Loader2 size={16} className="animate-spin text-white" />
        ) : extraIcon ? (
          <span className="text-white">{extraIcon}</span>
        ) : (
          <ArrowRight size={18} className="text-white transform -translate-x-4 group-hover:translate-x-0 transition-all duration-500" />
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
                    if (payloadRaw.seed && addr) localStorage.setItem(`ledger_chat_seed_${addr}`, payloadRaw.seed);
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
            const safeReturn = (raw.startsWith('/') && !raw.startsWith('//') && raw !== '/hub' && !raw.startsWith('/terminal')) ? raw : '/chat';
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
            if (returnUrl && returnUrl !== '/portfolio' && !returnUrl.startsWith('/terminal')) {
                if (returnUrl.startsWith('http')) { window.location.href = returnUrl; }
                else { window.location.replace(returnUrl); }
            } else { window.location.replace("/chat"); }
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
        const message = `Authenticate to Humanity Ledger.\n\nNonce: ${nonce}`;
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
        if (returnUrl && returnUrl !== '/portfolio' && !returnUrl.startsWith('/terminal')) {
            if (returnUrl.startsWith('http')) { window.location.href = returnUrl; }
            else { window.location.replace(returnUrl); }
        } else { window.location.replace("/chat"); }
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
    <div className="flex flex-col gap-2">
      <WalletButton
        logo="/email-icon.svg"
        name="Authenticate via Email"
        badge="Enterprise-grade OTP delivery"
        onClick={() => setEmailModalOpen(true)}
        delay={0.3}
        extraIcon={
          <span className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 bg-blue-500/10 rounded border border-blue-500/20 text-blue-400">OTP</span>
        }
      />
      <div className="text-center mt-1">
        <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400">
          *Self-custodial wallet required later for L2 execution
        </span>
      </div>
    </div>
  );

  // ── RIGHT PANEL (Auth) ──
  const renderLoginCard = () => (
    <div className="w-full flex-shrink-0 flex flex-col relative bg-transparent">
      
      <div className="pb-6 border-b border-black/10 flex items-center gap-3 relative z-10">
        <div className="w-1.5 h-1.5 bg-black" />
        <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-black font-bold flex-1">Secure Entry</span>
        <Link href="/chat" className="flex items-center gap-1.5 px-3 py-1.5 border border-black text-black font-mono font-bold text-[9px] uppercase tracking-[0.2em] hover:bg-black hover:text-white transition-colors duration-300">
          <QrCode size={12} /> Studio
        </Link>
      </div>

      <div className="w-full flex flex-col flex-1 pt-8 relative z-10">
        <p className="text-[13px] text-black/60 leading-relaxed font-medium mb-1">
          Access the workspace using your Ethereum identity.
        </p>
        <p className="text-[11px] text-black/40 leading-relaxed mb-4">
          A read-only signature will be requested to verify ownership. No gas fees are required.
        </p>

        {mounted && !isVerified && (
          <div className="absolute top-8 right-8 flex items-center gap-2 px-3 py-1 bg-zinc-50 border border-black/10 rounded-full">
            <div className="w-1.5 h-1.5 bg-black/30 rounded-full"></div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-black/50">Disconnected</span>
          </div>
        )}

        <div className="flex-1 overflow-y-auto min-h-0 pr-4 mr-[-16px]">
          <AnimatePresence mode="wait">
            {isVerified ? (
          <motion.div key="verified" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} className="flex flex-col items-center justify-center flex-1 relative min-h-[280px]">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-[260px] h-[260px] opacity-80 mix-blend-multiply">
                <RemoteLottie path="/system-shots/Transaction Complete.json" loop={false} className="w-full h-full object-contain scale-[1.2]" />
              </div>
            </div>
            <div className="absolute bottom-0 flex flex-col items-center w-full gap-3 pt-6 border-t border-black/10">
              {isMobile && (
                <button onClick={() => setShowMobileScanner(true)} className="w-full flex items-center justify-center gap-3 py-4 border border-black bg-black text-white font-mono font-bold uppercase tracking-[0.2em] text-[10px] active:scale-[0.98] transition-all hover:bg-white hover:text-black">
                  <ScanLine size={13} /> Link to PC
                </button>
              )}
              <button onClick={handleTotalDisconnect} className={`flex items-center justify-center gap-2 px-5 py-3 border border-black/20 text-[9px] font-mono font-bold uppercase tracking-[0.2em] text-black hover:bg-black hover:text-white transition-all active:scale-[0.98] ${isMobile ? 'w-full' : ''}`}>
                Terminate Session
              </button>
            </div>
          </motion.div>
        ) : effectiveIsConnected && !isLinked ? (
          /* STATE: Connected but awaiting signature */
          <div className="flex flex-col items-center justify-center gap-6 flex-1 py-4 text-center">
            <div className="w-16 h-16 border border-black flex items-center justify-center text-black">
              <Lock size={20} strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="text-[24px] font-serif font-black tracking-tight text-black mb-2 uppercase">Cryptographic Signature Required</h2>
              <p className="text-[10px] text-black/60 font-mono uppercase tracking-[0.1em] leading-relaxed max-w-[260px] mx-auto">Please check your wallet to sign the deterministic verification request.</p>
            </div>
            {authStatus === 'failed' ? (
              <div className="flex flex-col gap-3 w-full mt-4 pt-6 border-t border-black/10">
                <button onClick={() => { triggerManualVerify(); }} className="w-full flex items-center justify-center gap-2 py-4 border border-black bg-black text-white font-mono text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-colors">
                  <ExternalLink size={13} /> Retry Signature
                </button>
                <button onClick={handleTotalDisconnect} className="w-full py-4 border border-black/20 text-black hover:bg-black hover:text-white font-mono text-[10px] font-bold uppercase tracking-[0.2em] transition-colors">Terminate Session</button>
              </div>
            ) : (
              <div className="flex flex-col gap-3 w-full mt-4 pt-6 border-t border-black/10">
                <div className="w-full flex items-center justify-center gap-2 py-4 border border-black/10 bg-black/5 text-black/40 font-mono text-[10px] font-bold uppercase tracking-[0.2em] cursor-not-allowed">
                  <ExternalLink size={13} /> Check Wallet App
                </div>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <div className="w-1.5 h-1.5 bg-black animate-pulse" />
                  <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-black font-bold animate-pulse">Awaiting cryptographic signature...</span>
                </div>
              </div>
            )}
          </div>
        ) : !mounted ? (
          /* STATE: Loading skeleton */
          <div className="flex flex-col gap-4 flex-1">
            {[0, 1].map((i) => <div key={i} className="w-full h-[60px] border border-black/10 bg-black/[0.02] animate-pulse" />)}
          </div>
        ) : isMobile ? (
          /* STATE: Mobile — wallet list */
          <div className="flex flex-col gap-3 flex-1">
            {renderWeb2Logins()}
            <div className="h-px w-full bg-black/10 my-4" />
            <WalletButton
              logo="https://raw.githubusercontent.com/WalletConnect/walletconnect-assets/master/Logo/Blue%20(Default)/Logo.svg"
              name="Self-Custodial Wallet"
              badge="Connect via WalletConnect protocol"
              onClick={() => openAppKitSafe()}
              delay={0.35}
            />
            <button onClick={() => setShowMobileScanner(true)} className="w-full flex items-center justify-center gap-3 py-4 mt-4 border border-black text-black font-mono font-bold uppercase tracking-[0.2em] text-[10px] active:bg-black active:text-white transition-colors">
              <ScanLine size={13} /> Scan QR Code
            </button>
          </div>
        ) : (
          /* STATE: Desktop — QR + wallet list */
          <div className="flex flex-col gap-3 flex-1 w-full">
            {syncStatus === "AWAITING" && qrData ? (
              <motion.div key="qr-ready" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }} className="flex justify-center mb-8">
                <div className="pb-6 border-b border-black/10 flex flex-col items-center gap-6 w-full">
                  <div className="p-4 bg-white border border-black">
                    <QRCodeSVG value={qrData} size={220} fgColor="#000000" bgColor="#FFFFFF" level="L" includeMargin={false} />
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-black font-bold">Scan to Authenticate</span>
                  {pinCode && (
                    <div className="w-full border-t border-black/10 pt-6 mt-2">
                      <div className="flex items-center justify-center mb-4 gap-2">
                        <Shield size={12} className="text-black" />
                        <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-black">Security Checksum</span>
                      </div>
                      <div className="flex items-center justify-center gap-4">
                        {pinCode.split('').map((digit, idx) => (
                          <motion.div key={idx} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.07, duration: 0.3 }} className="w-12 h-14 border border-black flex items-center justify-center bg-transparent">
                            <span className="text-xl font-serif font-black text-black select-none">{digit}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : syncStatus === "IDLE" || (syncStatus === "AWAITING" && !qrData) ? (
              <div className="flex justify-center mb-8">
                <div className="py-8 border-b border-black/10 flex flex-col items-center gap-6 w-full">
                  <div className="w-full aspect-square max-w-[220px] border border-black/20 flex items-center justify-center bg-transparent">
                    <Loader2 size={24} className="animate-spin text-black/40" />
                  </div>
                  <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-black/50 font-bold animate-pulse">Establishing Secure Connection...</span>
                </div>
              </div>
            ) : syncStatus === "ERROR" ? (
              <div className="flex justify-center mb-8">
                <div className="py-8 border-b border-black/10 flex flex-col items-center gap-4 w-full text-center">
                  <Shield size={22} className="text-black" />
                  <p className="text-[10px] font-mono text-black font-bold uppercase tracking-[0.2em]">Connection Failed</p>
                  <button onClick={() => { setSyncStatus("IDLE"); setQrSession(null); setQrData(''); }} className="px-6 py-3 border border-black bg-black text-white text-[9px] font-mono font-bold uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-colors mt-2">Retry Link</button>
                </div>
              </div>
            ) : null}

            {DESKTOP_WALLETS.map((w) => (
              <WalletButton key={w.id} logo={w.logo} name={w.name} badge={w.badge} onClick={() => handleDesktopWallet(w.id, w.rdns, w.installUrl)} loading={isPending && pendingId === w.id} delay={w.delay} />
            ))}
            
            <div className="h-px w-full bg-black/10 my-4" />
            {renderWeb2Logins()}
            <div className="mt-8 text-center px-4">
              <p className="text-[10px] text-black/40 leading-relaxed uppercase tracking-widest font-mono">
                By connecting, you agree to the <Link href="/legal/terms" className="underline hover:text-black">Terms of Service</Link> &amp; <Link href="/legal/privacy" className="underline hover:text-black">Privacy Policy</Link>.
              </p>
            </div>
          </div>
        )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );



  if (!mounted) {
    return (
      <div className="w-full min-h-screen bg-white" />
    );
  }

  return (
    <div className="w-full min-h-screen bg-white text-black overflow-y-auto overflow-x-hidden selection:bg-black selection:text-white">
      
      {/* ── IMMERSIVE SCROLL SECTION 1: CORPORATE LOGO ── */}
      <div className="w-full min-h-[100dvh] flex flex-col items-center justify-center p-8 relative">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: false, margin: "-100px" }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-5xl flex items-center justify-center"
        >
          <img src="/logo-corporate.png" alt="Humanity Ledger" className="w-full h-auto max-h-[40vh] object-contain" />
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-12 flex flex-col items-center gap-4 text-black/30"
        >
          <span className="text-[10px] uppercase tracking-widest font-mono font-bold">Scroll to initialize</span>
          <div className="w-px h-16 bg-gradient-to-b from-black/30 to-transparent" />
        </motion.div>
      </div>

      {/* ── IMMERSIVE SCROLL SECTION 2: LEDGER CHAT ── */}
      <div className="w-full min-h-[100dvh] flex flex-col items-center justify-center p-8 bg-zinc-50 relative border-y border-black/10">
        <div className="max-w-4xl mx-auto flex flex-col items-center text-center gap-8">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, margin: "-100px" }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <h2 className="text-5xl md:text-7xl font-serif font-black tracking-tight text-black mb-6">
              Ledger Chat
            </h2>
            <p className="text-lg md:text-2xl font-serif font-medium text-black/60 leading-relaxed max-w-3xl mx-auto">
              The Sovereign Communication Network. 
              <br className="hidden md:block"/>
              End-to-end encrypted, cryptographically verified, and completely private.
            </p>
          </motion.div>
          
          <motion.div
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: false }}
             transition={{ delay: 0.3, duration: 1 }}
             className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 w-full max-w-4xl"
          >
            {[
              { icon: <Lock size={20} strokeWidth={1.5} />, title: "Zero-Knowledge", desc: "Your keys and data never leave your physical device." },
              { icon: <Shield size={20} strokeWidth={1.5} />, title: "E2E Encrypted", desc: "Military-grade communication via decentralized transport." },
              { icon: <ScanLine size={20} strokeWidth={1.5} />, title: "Wallet Identity", desc: "Authenticate without email or phone numbers." }
            ].map((feature, i) => (
              <div key={i} className="flex flex-col items-center text-center gap-4 p-8 border border-black/10 bg-white hover:border-black transition-colors duration-500">
                <div className="w-12 h-12 flex items-center justify-center border border-black text-black">
                  {feature.icon}
                </div>
                <h3 className="font-bold text-[12px] uppercase tracking-widest font-mono text-black">{feature.title}</h3>
                <p className="text-[13px] text-black/50 font-medium leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ── IMMERSIVE SCROLL SECTION 3: LOGIN ── */}
      <div className="w-full min-h-[100dvh] flex flex-col items-center justify-center p-4 md:p-8 bg-white relative">
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, margin: "-100px" }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-[480px] bg-white p-6 md:p-10 border border-black shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)]"
        >
            <div className="flex flex-col items-center text-center mb-8 pb-8 border-b border-black/10">
              <h2 className="text-3xl font-serif font-black tracking-tight text-black mb-2">Secure Authentication</h2>
              <p className="text-[14px] text-black/50 font-medium">Select your preferred method to enter the network.</p>
            </div>
            
            {/* The base text & connected states */}
            {renderLoginCard()}

            {/* The interactive wallet / QR sections (rendered if not verified and not waiting for signature) */}
            {mounted && !isVerified && !(effectiveIsConnected && !isLinked) && (
              <div className="mt-4">
                {isMobile ? (
                  /* Mobile wallet list */
                  <div className="flex flex-col gap-3 flex-1">
                    {renderWeb2Logins()}
                    <div className="h-px w-full bg-black/10 my-4" />
                    <WalletButton
                      logo="https://raw.githubusercontent.com/WalletConnect/walletconnect-assets/master/Logo/Blue%20(Default)/Logo.svg"
                      name="Self-Custodial Wallet"
                      badge="Connect via WalletConnect protocol"
                      onClick={() => openAppKitSafe()}
                      delay={0.35}
                    />
                    <button onClick={() => setShowMobileScanner(true)} className="w-full flex items-center justify-center gap-3 py-4 mt-4 border border-black text-black font-mono font-bold uppercase tracking-[0.2em] text-[10px] active:bg-black active:text-white transition-colors">
                      <ScanLine size={13} /> Scan QR Code
                    </button>
                  </div>
                ) : (
                  /* Desktop QR + wallet list */
                  <div className="flex flex-col gap-3 flex-1 w-full mt-4">
                    {syncStatus === "AWAITING" && qrData ? (
                      <motion.div key="qr-ready" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }} className="flex justify-center mb-8">
                        <div className="pb-6 border-b border-black/10 flex flex-col items-center gap-6 w-full">
                          <div className="p-4 bg-white border border-black">
                            <QRCodeSVG value={qrData} size={220} fgColor="#000000" bgColor="#FFFFFF" level="L" includeMargin={false} />
                          </div>
                          <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-black font-bold">Scan to Authenticate</span>
                          {pinCode && (
                            <div className="w-full border-t border-black/10 pt-6 mt-2">
                              <div className="flex items-center justify-center mb-4 gap-2">
                                <Shield size={12} className="text-black" />
                                <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-black">Security Checksum</span>
                              </div>
                              <div className="flex items-center justify-center gap-4">
                                {pinCode.split('').map((digit, idx) => (
                                  <motion.div key={idx} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.07, duration: 0.3 }} className="w-12 h-14 border border-black flex items-center justify-center bg-transparent">
                                    <span className="text-xl font-serif font-black text-black select-none">{digit}</span>
                                  </motion.div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ) : syncStatus === "IDLE" || (syncStatus === "AWAITING" && !qrData) ? (
                      <div className="flex justify-center mb-8">
                        <div className="py-8 border-b border-black/10 flex flex-col items-center gap-6 w-full">
                          <div className="w-full aspect-square max-w-[220px] border border-black/20 flex items-center justify-center bg-transparent">
                            <Loader2 size={24} className="animate-spin text-black/40" />
                          </div>
                          <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-black/50 font-bold animate-pulse">Establishing Secure Connection...</span>
                        </div>
                      </div>
                    ) : syncStatus === "ERROR" ? (
                      <div className="flex justify-center mb-8">
                        <div className="py-8 border-b border-black/10 flex flex-col items-center gap-4 w-full text-center">
                          <Shield size={22} className="text-black" />
                          <p className="text-[10px] font-mono text-black font-bold uppercase tracking-[0.2em]">Connection Failed</p>
                          <button onClick={() => { setSyncStatus("IDLE"); setQrSession(null); setQrData(''); }} className="px-6 py-3 border border-black bg-black text-white text-[9px] font-mono font-bold uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-colors mt-2">Retry Link</button>
                        </div>
                      </div>
                    ) : null}

                    {DESKTOP_WALLETS.map((w) => (
                      <WalletButton key={w.id} logo={w.logo} name={w.name} badge={w.badge} onClick={() => handleDesktopWallet(w.id, w.rdns, w.installUrl)} loading={isPending && pendingId === w.id} delay={w.delay} />
                    ))}
                    
                    <div className="h-px w-full bg-black/10 my-4" />
                    {renderWeb2Logins()}
                  </div>
                )}
              </div>
            )}
            
            <div className="mt-8 pt-8 border-t border-black/10">
              <p className="text-[10px] font-mono text-black/40 text-center leading-relaxed uppercase tracking-widest">
                By connecting you agree to our{" "}
                <Link href="/docs/terms" className="underline hover:text-black transition-colors">Terms</Link>
                {" & "}
                <Link href="/docs/privacy" className="underline hover:text-black transition-colors">Privacy</Link>.
              </p>
            </div>
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

      {/* Hidden AppKit button for native mobile dispatch */}
      <div aria-hidden="true" style={{ position: 'absolute', opacity: 0, width: '1px', height: '1px', pointerEvents: 'none', overflow: 'hidden' }}>
        {/* @ts-ignore */}
        <appkit-button />
      </div>

    </div>
  );
}


