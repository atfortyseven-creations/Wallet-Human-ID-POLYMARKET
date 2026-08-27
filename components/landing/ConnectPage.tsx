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
            const safeReturn = (raw.startsWith('/') && !raw.startsWith('//') && raw !== '/portfolio') ? raw : '/hub';
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
            } else { window.location.replace("/hub"); }
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
        if (returnUrl && returnUrl !== '/portfolio') {
            if (returnUrl.startsWith('http')) { window.location.href = returnUrl; }
            else { window.location.replace(returnUrl); }
        } else { window.location.replace("/hub"); }
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
        <Link href="/hub" className="flex items-center gap-1.5 px-3 py-1.5 border border-black text-black font-mono font-bold text-[9px] uppercase tracking-[0.2em] hover:bg-black hover:text-white transition-colors duration-300">
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

  // ── LEFT PANEL (Branding & Info) — Desktop only ──
  const renderInfoPanel = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col justify-between h-full w-full z-10 p-4"
    >
      <div className="flex flex-col gap-6 w-full max-w-lg">
        {/* Simple elegant logo */}
        <Link href="/" className="flex items-center gap-2 mb-4 text-white">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="2" y1="12" x2="22" y2="12"/>
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
          </svg>
          <span className="text-[16px] font-bold tracking-tight">Humanity Ledger</span>
        </Link>
        
        <h1 className="text-4xl lg:text-5xl font-black text-white leading-[1.1] tracking-tight">
          Secure identity,<br/>private execution.
        </h1>
        
        <p className="text-[16px] text-white/70 leading-relaxed max-w-md font-medium mt-2">
          Connect your wallet to authenticate to the Humanity Ledger ecosystem. Your cryptographic identity operates seamlessly over the Aztec Network L2, providing privacy by default.
        </p>

        <div className="flex flex-col gap-4 mt-8">
          <div className="flex items-center gap-4 text-white/90">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
              <Shield size={18} />
            </div>
            <div>
              <p className="text-[14px] font-bold">Zero-Knowledge Proofs</p>
              <p className="text-[13px] text-white/50">Your data never leaves your device.</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-white/90">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
              <Smartphone size={18} />
            </div>
            <div>
              <p className="text-[14px] font-bold">Cross-Device Sync</p>
              <p className="text-[13px] text-white/50">Scan the QR to securely link your mobile.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="max-w-md">
        <p className="text-[11px] font-mono text-white/40 leading-relaxed uppercase tracking-widest">
          Powered by Aztec Network Testnet<br/>
          Institutional Ecosystem Launch — Jan 2027
        </p>
      </div>
    </motion.div>
  );

  // ── MOBILE TOP HEADER (replaces the huge left panel on small screens) ──
  const renderMobileHeader = () => (
    <div className="flex items-center justify-between px-6 pt-safe-top pb-4 border-b border-black/10 bg-white" style={{ paddingTop: 'max(16px, env(safe-area-inset-top, 16px))' }}>
      <Link href="/" className="flex items-center gap-2 text-black">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="2" y1="12" x2="22" y2="12"/>
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
        </svg>
        <span className="text-[15px] font-bold tracking-tight">Humanity Ledger</span>
      </Link>
    </div>
  );

  if (!mounted) {
    return (
      <div className="w-full min-h-screen bg-black" />
    );
  }

  return (
    <div className="w-full min-h-[100dvh] bg-white flex flex-col shrink-0 relative text-black">

      {/* ── MOBILE LAYOUT ── */}
      <div className="flex flex-col lg:hidden min-h-[100dvh]">
        {renderMobileHeader()}

        <div className="flex-1 flex flex-col px-6 py-8 pb-safe-bottom overflow-y-auto">
          <div className="w-full max-w-md mx-auto">
            <h2 className="text-2xl font-black tracking-tight mb-2">Connect to continue</h2>
            <p className="text-[14px] text-black/60 mb-8 font-medium">Use your self-custodial wallet or email to enter the secure environment.</p>
            {renderLoginCard()}
          </div>
        </div>

        <div className="px-6 py-6 border-t border-black/10 bg-zinc-50 flex flex-wrap justify-between gap-4 pb-safe-bottom text-center">
          <span className="text-[10px] font-bold text-black/40 uppercase tracking-widest w-full">Aztec L2 / Zero-Knowledge Secure</span>
        </div>
      </div>

      {/* ── DESKTOP LAYOUT ── */}
      <div className="hidden lg:flex w-full min-h-[100dvh]">
        {/* Left Side: Info Canvas */}
        <div className="w-[50%] flex flex-col px-20 py-20 bg-[#050505] text-white">
          {renderInfoPanel()}
        </div>

        {/* Right Side: Auth */}
        <div className="w-[50%] flex flex-col items-center justify-center px-16 py-20 bg-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            className="w-full max-w-[420px]"
          >
            <h2 className="text-3xl font-black tracking-tight mb-2">Secure Login</h2>
            <p className="text-[15px] text-black/60 mb-10 font-medium">Select your preferred method to authenticate.</p>
            {renderLoginCard()}
          </motion.div>

          <p className="text-[10px] font-mono text-black/30 text-center mt-12 max-w-[360px] leading-relaxed uppercase tracking-widest">
            By connecting you agree to our{" "}
            <Link href="/legal/terms" className="underline hover:text-black/60 transition-colors">Terms</Link>
            {" & "}
            <Link href="/legal/privacy" className="underline hover:text-black/60 transition-colors">Privacy</Link>.
            Not financial advice.
          </p>
        </div>
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


