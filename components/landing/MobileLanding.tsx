"use client";

import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import { ZKBiometricGate } from "@/components/security/ZKBiometricGate";
import { AztecArchitectureSection } from "./AztecArchitectureSection";
import { SystemFooter } from "./SystemFooter";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAccount, useConnect, useSignMessage, useDisconnect, useReconnect, useBalance, useEnsName } from "wagmi";
import { useAppKit } from "@reown/appkit/react";
import { WhaleLogo } from "@/components/shared/WhaleLogo";
import { useSystemSignOut } from '@/hooks/useSystemSignOut';
import { 
  Scan, MessageSquare, LogOut, MessageCircle, ScanLine, 
  Fingerprint, ChevronDown, CheckCircle, Zap, Shield, Menu,
  ArrowLeft, ArrowRight, Loader2, CheckCircle2, AlertCircle, RefreshCw, Mail, Info, X, PieChart,
  Newspaper, GraduationCap, Briefcase, Activity, TrendingUp, Package, LayoutDashboard, Target
} from 'lucide-react';
import { RemoteLottie } from '@/components/ui/RemoteLottie';
import { ATOM_PNGTREE } from '@/lib/constants/systemAssets';

//  Reown AppKit + WagmiAdapter localStorage key patterns 
// These are ALL the keys that Reown AppKit v1/v2 and its WagmiAdapter write
// to localStorage (2025-2026). We scan ALL of them when recovering a session.
const APPKIT_STORAGE_KEYS = [
  '@wagmi/core',
  'wagmi.store',
  'wagmi.connected',
  'reown-appkit',
  'appkit',
  '@reown/appkit',
  'W3M_STATE',
  '@w3m/',
  'wc@2:',
  'wc@2',
  'walletconnect',
  'wagmi',
  'rainbow',
  'metamask',
  'coinbase',
  'session'
];

function extractAddressFromAppKit(value: string): string | null {
  if (!value || value.length < 42) return null;
  try {
    const parsed = JSON.parse(value);
    // All known Reown AppKit v2 + Wagmi v2 address paths
    const possiblePaths = [
      parsed?.state?.connections?.value?.[0]?.[1]?.accounts?.[0],
      parsed?.state?.data?.account?.address,
      parsed?.sessions?.[0]?.namespaces?.eip155?.accounts?.[0]?.split?.(':')?.[2],
      parsed?.namespaces?.eip155?.accounts?.[0]?.split?.(':')?.[2],
      // Support for WalletConnect v2 Array structure
      parsed?.[0]?.namespaces?.eip155?.accounts?.[0]?.split?.(':')?.[2],
      parsed?.address,
      parsed?.accounts?.[0],
      parsed?.account?.address,
    ];
    for (const candidate of possiblePaths) {
      if (candidate && typeof candidate === 'string') {
        // Clean potential "eip155:1:" prefix if split failed
        const clean = candidate.includes(':') ? candidate.split(':').pop() : candidate;
        if (clean && /^0x[a-fA-F0-9]{40}$/i.test(clean)) {
          return clean.toLowerCase();
        }
      }
    }
  } catch {
    // Not valid JSON  fall through to regex
  }
  // Final fallback: extract any valid Ethereum address from raw string
  const match = value.match(/0x[a-fA-F0-9]{40}(?![a-fA-F0-9])/i);
  return match ? match[0].toLowerCase() : null;
}

//  Active clock hook 
function useActiveClock(intervalMs = 1000): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

// Universal scanner — session QR, wallet, product passport, GS1
const DynamicUniversalScanModal = dynamic(
  () => import("@/components/scan/UniversalScanModal"),
  { ssr: false }
);

import { ImmersiveManifestoLanding } from "./ImmersiveManifestoLanding";
import { WhalecosystemTweetFeed } from "./WhalecosystemTweetFeed";

//  Colour tokens 
const IVORY = "#FFFFFF";
const INK   = "#050505";
const FAINT = "rgba(5,5,5,0.08)";
const MUTED = "rgba(5,5,5,0.50)";

//  System sign message (must mirror LinkedGate exactly) 
function buildSystemMessage(address: string): string {
  return [
    '',
    '  Whale Alert Network',
    '  SECURE ACCESS HANDSHAKE',
    '',
    '',
    `Identity: ${address}`,
    `Nonce: ${Date.now()}`,
    `Network: WHALE_ALERT_NETWORK_V1`,
    '',
    'By signing you confirm that',
    'you are the sole owner of this',
    'address and authorize access',
    'to the secure dashboard.',
    '',
  ].join('\n');
}

//  Wallet button 
function WalletOption({
  logo, name, badge, onClick, delay = 0, loading = false,
}: {
  logo: string; name: string; badge: string;
  onClick: () => void; delay?: number; loading?: boolean;
}) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, ease: [0.16, 1, 0.3, 1], duration: 0.5 }}
      onClick={onClick}
      disabled={loading}
      className="group w-full flex items-center gap-4 p-4 rounded-2xl border border-black/10 bg-white hover:bg-black/[0.02] hover:border-black/20 active:scale-[0.97] transition-all duration-200 shadow-sm disabled:opacity-60"
    >
      <div className="w-11 h-11 rounded-xl bg-black/[0.03] border border-black/5 flex items-center justify-center p-2 overflow-hidden shrink-0">
        {loading ? (
          <Loader2 size={20} className="animate-spin text-black/40" />
        ) : (
          <img src={logo} alt={name} className="w-full h-full object-contain" />
        )}
      </div>
      <div className="flex-1 text-left">
        <p className="text-[13px] font-black uppercase tracking-tight text-[#050505]">{name}</p>
        <p className="text-[10px] font-mono text-[#050505]/40 uppercase tracking-widest mt-0.5">
          {loading ? "Opening app" : badge}
        </p>
      </div>
      {!loading && (
        <ArrowRight size={14} className="text-[#050505]/20 group-hover:text-[#050505] group-hover:translate-x-0.5 transition-all shrink-0" />
      )}
    </motion.button>
  );
}

//  Signing overlay 
function SigningOverlay({
  address, onSigned, onRetry, error, isSigning, wcDeepLink,
}: {
  address: string; onSigned: () => void; onRetry: () => void;
  error: string | null; isSigning: boolean; wcDeepLink?: string | null;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-6"
      style={{ background: "rgba(255,255,255,0.98)", backdropFilter: "blur(24px)" }}
    >
      <div className="w-full max-w-sm flex flex-col items-center gap-5 text-center">
        <div className="w-20 h-20 rounded-[2rem] bg-white border border-black/10 shadow-lg flex items-center justify-center">
          {isSigning ? (
            <RefreshCw size={28} className="text-black/40 animate-spin" />
          ) : error ? (
            <AlertCircle size={28} className="text-red-500" />
          ) : (
            <Fingerprint size={28} className="text-[#050505]" />
          )}
        </div>

        <div className="flex items-center gap-2 px-4 py-2 bg-white border border-black/10 rounded-full shadow-sm">
          <span className="text-[11px] font-black uppercase tracking-widest text-[#050505]/60 font-mono">
            {address.slice(0, 8)}{address.slice(-6)}
          </span>
        </div>

        <div className="space-y-2">
          <h2 className="text-[24px] font-black tracking-tighter text-[#050505] leading-none">
          {isSigning ? "Signature Required" : error ? "Connection Failed" : "Connecting..."}
          </h2>
          <p className="text-[12px] text-[#050505]/50 leading-relaxed">
            {error
              ? "Could not cryptographically verify the wallet. Please try again."
              : isSigning
              ? "Please approve the signature request. If you used Google/Email, tap the button below to complete login."
              : "Establishing encrypted tunnel with the Global Network... Please wait."}
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full px-4 py-3 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-[11px] font-black uppercase tracking-widest"
          >
            {error}
          </motion.div>
        )}

        {error ? (
          <button
            onClick={onRetry}
            className="w-full py-4 rounded-2xl bg-[#050505] text-white font-black uppercase tracking-widest text-[12px] flex items-center justify-center gap-3 shadow-lg active:scale-[0.97] transition-all hover:bg-black/90"
          >
            <RefreshCw size={16} />
            Retry Connection
          </button>
        ) : isSigning ? (
          <div className="w-full flex flex-col gap-3 mt-2">
             {wcDeepLink ? (
               <a
                  href={wcDeepLink}
                  rel="noopener noreferrer"
                  className="w-full py-4 rounded-2xl bg-[#050505] text-white font-black uppercase tracking-widest text-[12px] flex items-center justify-center gap-3 shadow-lg active:scale-[0.97] transition-transform select-none hover:bg-black/90"
               >
                 Open Wallet App
               </a>
             ) : (
                <button
                  onClick={onRetry}
                  className="w-full py-4 rounded-2xl bg-[#050505] text-white font-black uppercase tracking-widest text-[12px] flex items-center justify-center gap-3 shadow-lg active:scale-[0.97] transition-all hover:bg-black/90"
                >
                  Tap to Sign & Complete Login
                </button>
             )}
          </div>
        ) : (
          <div className="w-full px-4 py-3 rounded-2xl border border-black/10 bg-white flex items-center justify-center gap-3">
            <Loader2 size={16} className="animate-spin text-black/40" />
            <span className="text-[#050505] font-black uppercase tracking-widest text-[11px]">Validating...</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

//  Network name from chain ID 
function chainName(id?: number): string {
  const MAP: Record<number, string> = {
    1: 'Ethereum Mainnet', 10: 'Optimism', 56: 'BNB Chain',
    137: 'Polygon', 8453: 'Base', 42161: 'Arbitrum One',
    43114: 'Avalanche', 100: 'Gnosis', 250: 'Fantom',
    324: 'zkSync Era', 59144: 'Linea', 1101: 'Polygon zkEVM',
  };
  return id ? (MAP[id] ?? `Chain ${id}`) : 'Mainnet';
}

//  Connected Screen 
function ConnectedScreen({
  address, onScan, onScanLabel, showScanner, onCloseScanner, scanMode, onBack, connectorName, chainId, onDisconnect, signMessageAsync, initialScanData, setShowKyc
}: {
  address: string; onScan: () => void; onScanLabel: () => void;
  showScanner: boolean; onCloseScanner: () => void;
  scanMode: 'universal' | 'session-only';
  onBack?: () => void;
  connectorName?: string;
  chainId?: number;
  onDisconnect?: () => void;
  signMessageAsync?: any;
  initialScanData?: string | null;
  setShowKyc: (v: boolean) => void;
}) {
  const now = useActiveClock();
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [userAgentInfo, setUserAgentInfo] = useState('');
  const [sessionHistory, setSessionHistory] = useState<any[]>([]);

  //  Real on-chain data 
  const { data: balance } = useBalance({ address: address as `0x${string}` });
  const { data: ensName } = useEnsName({ address: address as `0x${string}`, chainId: 1 });

  const fmtBalance = () => {
    if (!balance) return null;
    const val = parseFloat(balance.formatted);
    return `${val.toFixed(4)} ${balance.symbol}`;
  };

  const checksumAddr = (addr: string) =>
    addr ? `${addr.slice(0, 8)}${addr.slice(-6)}` : '';

  useEffect(() => {
    if (typeof window !== 'undefined') {
       const ua = navigator.userAgent;
       let os = "Unknown OS";
       if (ua.indexOf("Win") != -1) os = "Windows";
       if (ua.indexOf("Mac") != -1) os = "MacOS";
       if (ua.indexOf("Linux") != -1) os = "Linux";
       if (ua.indexOf("Android") != -1) os = "Android";
       if (ua.indexOf("like Mac") != -1) os = "iOS";
       const detectedOs = `${os} (${navigator.vendor || "Browser"})`;
       setUserAgentInfo(detectedOs);
       
       if (address) {
         const key = `system_history_${address}`;
         let existing: any[] = [];
         try {
             const stored = localStorage.getItem(key);
             if (stored) {
                 const parsed = JSON.parse(stored);
                 if (Array.isArray(parsed)) existing = parsed;
             }
         } catch (e) {
             existing = [];
         }

         const currentSession = {
           date: new Date().toLocaleDateString('en-US', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }),
           time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
           provider: connectorName || "Secure Wallet",
           os: detectedOs
         };
         
         const isDuplicate = existing.length > 0 && existing[0].time === currentSession.time && existing[0].date === currentSession.date;
         let updated = existing;
         
         if (!isDuplicate) {
           updated = [currentSession, ...existing].slice(0, 50);
           try {
               localStorage.setItem(key, JSON.stringify(updated));
           } catch (e) {}
         }
         setSessionHistory(updated);
       }
    }
  }, [address, connectorName]);

  const fmtTime   = (d: Date) => d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const fmtDate   = (d: Date) => d.toLocaleDateString('en-US', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });

  return (
    <div className="relative min-h-[100dvh] w-full overflow-x-hidden font-sans flex flex-col bg-white text-black selection:bg-black selection:text-white">
      <main className="relative z-10 flex-1 flex flex-col items-center px-5 pt-8 pb-12 gap-0 max-w-[480px] w-full mx-auto">

        {/*  TOP BAR  */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          style={{ willChange: 'opacity, transform', transform: 'translateZ(0)' }}
          className="w-full flex items-center justify-center mb-10 bg-white relative"
        >
          {onBack && (
            <button
              onClick={onBack}
              className="absolute left-0 top-1/2 -translate-y-1/2 p-2 text-black/50 hover:text-black transition-colors"
              aria-label="Back to Landing Page"
            >
              <ArrowLeft size={20} />
            </button>
          )}
          <img
            src="/system-shots/connect/Gemini_Generated_Image_dzte5edzte5edzte (2).png"
            className="h-8 w-auto object-contain mix-blend-multiply"
            alt="Powered by Aztec"
          />
        </motion.div>

        {/*  ATOM LOGO & GIANT CLOCK  */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          style={{ willChange: 'opacity, transform', transform: 'translateZ(0)' }}
          className="w-full flex flex-col items-center justify-center text-center mb-2 px-6"
        >
          <div className="w-full max-w-[280px] mx-auto mb-6 flex items-center justify-center">
            <img
              src={ATOM_PNGTREE}
              alt="Silver Atom"
              className="w-full h-auto max-h-[220px] object-contain"
              style={{ mixBlendMode: 'multiply' }}
              draggable={false}
            />
          </div>
          <p className="text-[64px] sm:text-[72px] font-light tracking-[-0.04em] leading-none tabular-nums text-black">
            {fmtTime(now)}
          </p>
        </motion.div>

        {/*  DATE  */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="font-mono text-[10px] uppercase tracking-[0.3em] text-black/40 mb-10"
        >
          {fmtDate(now)}
        </motion.p>

        {/*  DIVIDER  */}
        <div className="w-full border-t border-black/8 mb-8" />

        {/*  IDENTITY BLOCK  */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.6 }}
          style={{ willChange: 'opacity, transform', transform: 'translateZ(0)' }}
          className="w-full mb-8"
        >
          <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-black/30 mb-3">Verified Identity</p>
          <div className="flex items-center gap-3 bg-black/[0.02] border border-black/8 rounded-2xl px-4 py-4">
            <div className="w-9 h-9 rounded-full bg-black/5 border border-black/10 flex items-center justify-center shrink-0">
              <Fingerprint size={16} className="text-black/40" />
            </div>
            <div className="flex flex-col min-w-0">
              <p className="font-mono text-[11px] font-bold text-black tracking-tight break-all leading-snug">
                {address}
              </p>
              {ensName && (
                <p className="font-mono text-[9px] uppercase tracking-widest text-black/40 mt-0.5">{ensName}</p>
              )}
            </div>
          </div>
        </motion.div>

        {/*  DATA ROW  */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          style={{ willChange: 'opacity, transform', transform: 'translateZ(0)' }}
          className="w-full grid grid-cols-3 mb-8"
        >
          {[
            { label: 'Network', value: chainName(chainId) },
            { label: 'Balance', value: fmtBalance() ?? '' },
            { label: 'Provider', value: connectorName || 'Secure' },
          ].map((item, i) => (
            <div key={i} className={`flex flex-col items-center text-center px-2 py-4 ${ i < 2 ? 'border-r border-black/8' : '' }`}>
              <p className="font-mono text-[8px] uppercase tracking-[0.25em] text-black/30 mb-1.5">{item.label}</p>
              <p className="font-mono text-[11px] font-bold text-black truncate w-full text-center">{item.value}</p>
            </div>
          ))}
        </motion.div>


        {/*  APPS GRID (iOS Style)  */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="w-full grid grid-cols-4 gap-y-6 gap-x-2 mb-8 px-1"
        >
          {[
            { label: 'Dashboard', href: '/dashboard', img: '/system-shots/licencia-de-conducir.png' },
            { label: 'Link New PC Session', action: onScan, icon: Scan, isLucide: true },
            { label: 'Studio Provenance Beta', href: '/studio/provenance', img: '/system-shots/paquete-o-empaquetar.png' },
            { label: 'Whale Forum', href: '/forum', img: '/system-shots/charla.png' },
            { label: 'Whale Chat', href: '/chat', img: '/system-shots/burbuja-de-dialogo.png' },
            { label: 'Portfolio', href: '/portfolio', img: '/system-shots/bitcoin.png' },
            { label: 'News', href: '/news', img: '/system-shots/periodico.png' },
            { label: 'Academy', href: '/academy', img: '/system-shots/academy.png' },
            { label: 'System Status', href: '/status', img: '/system-shots/estadistico.png' },
            { label: 'Privacy Protocol', href: '/privacy', img: '/system-shots/candado.png' },
            { label: 'Registry', href: '/registry', icon: Target, isLucide: true },
          ].map((app, i) => {
            const InnerContent = (
              <>
                <div className="w-[60px] h-[60px] bg-white rounded-[16px] flex items-center justify-center overflow-hidden active:scale-95 transition-transform shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-black/5">
                  {app.isLucide ? (
                    <app.icon size={26} strokeWidth={1.5} className="text-black/80" />
                  ) : (
                    <img src={app.img} alt={app.label} className="w-[75%] h-[75%] object-contain mix-blend-multiply" />
                  )}
                </div>
                <span 
                  className="mt-2 text-black font-medium"
                  style={{ fontSize: '9px', lineHeight: '1.2', maxWidth: '64px', textAlign: 'center' }}
                >
                  {app.label}
                </span>
              </>
            );

            return app.action ? (
              <button
                key={i}
                type="button"
                onClick={app.action}
                className="flex flex-col items-center justify-start w-full cursor-pointer"
              >
                {InnerContent}
              </button>
            ) : (
              <Link
                key={i}
                href={app.href!}
                className="flex flex-col items-center justify-start w-full cursor-pointer"
              >
                {InnerContent}
              </Link>
            );
          })}
        </motion.div>

        {/*  DISCONNECT  */}
        {onDisconnect && (
          <motion.button
            id="system-disconnect-btn"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55, duration: 0.5 }}
            whileTap={{ scale: 0.97 }}
            onClick={onDisconnect}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-mono text-[9px] uppercase tracking-[0.3em] text-black/30 hover:text-black/60 active:scale-95 transition-all"
          >
            <LogOut size={13} />
            End Session · Change Wallet
          </motion.button>
        )}


      </main>

      <DynamicUniversalScanModal
        isOpen={showScanner}
        onClose={onCloseScanner}
        address={address}
        mode={scanMode}
        initialScanData={initialScanData}
        onScan={(_result: string) => {
          const toast = document.createElement('div');
          toast.className = 'fixed top-6 left-4 right-4 z-[99999] bg-black text-white text-[10px] border border-white/10 font-mono uppercase tracking-[0.3em] px-6 py-5 rounded-2xl shadow-2xl text-center';
          toast.textContent = scanMode === 'session-only' ? 'Session Synchronized' : 'Scan complete';
          document.body.appendChild(toast);
          setTimeout(() => toast.remove(), 3000);
        }}
      />
    </div>
  );
}
//  Main Component 
export function MobileLanding() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionParam = searchParams?.get('session');

  //  Reown AppKit is the PRIMARY connector 
  const { address: wagmiAddress, isConnected: wagmiConnected, connector, chainId } = useAccount();
  const { connect, connectAsync, connectors } = useConnect();
  const { signMessageAsync } = useSignMessage();
  const { disconnect, disconnectAsync } = useDisconnect();
  const { reconnect } = useReconnect();
  const { open: rkOpenModal, close: rkCloseModal } = useAppKit();

  //  Ref: always holds the latest wagmiAddress for use inside setInterval closures 
  // setInterval captures variables at creation time (stale closure). Without a ref,
  // the poll would never see wagmiAddress updating when wagmi hydrates from cookies.
  const wagmiAddressRef = useRef<string | undefined>(undefined);
  const isSigningRef = useRef(false);
  useEffect(() => { wagmiAddressRef.current = wagmiAddress; }, [wagmiAddress]);
  // Tracks active polling interval so onFocusRecheck can cancel previous runs
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isConnected = wagmiConnected;
  const address     = wagmiAddress;

  const [mounted, setMounted]           = useState(false);
  const [showScanner, setShowScanner]   = useState(false);
  const [scanMode, setScanMode] = useState<'universal' | 'session-only'>('session-only');
  const [showHub, setShowHub]           = useState(false);
  const [showDebug, setShowDebug]       = useState(false);  // secret debug panel
  const [debugTaps, setDebugTaps]       = useState(0);
  // Always false on SSR. Reads from sessionStorage after mount to survive Chrome
  // tab freeze/restore (which resets React state when user returns from Rainbow).
  const [showManualReconnect, setShowManualReconnectRaw] = useState(false);
  const setShowManualReconnect = (val: boolean) => {
    try { sessionStorage.setItem('system_show_reconnect', val ? '1' : '0'); } catch {}
    setShowManualReconnectRaw(val);
  };

  // Init isLinked from cookie immediately  no flash
  const [isLinked, setIsLinked] = useState<boolean>(() => {
    if (typeof document === 'undefined') return false;
    return document.cookie.split('; ').some(r => r.startsWith('system_handshake=0x'));
  });

  // linkedAddress: set synchronously in performLink so effectiveAddress
  // is NEVER null after connection  critical for incognito mode where
  // wagmi/appkit re-hydration is delayed and cookieAddress memo lags.
  const [linkedAddress, setLinkedAddress] = useState<string | null>(() => {
    if (typeof document === 'undefined') return null;
    const match = document.cookie.match(/system_handshake=(0x[0-9a-fA-F]{40,})/i);
    return match?.[1] ?? null;
  });

  // Cookie address fallback (when wagmi hasn't reconnected yet)
  const cookieAddress = useMemo<string | null>(() => {
    if (typeof document === 'undefined') return null;
    const match = document.cookie.match(/system_handshake=(0x[0-9a-fA-F]{40,})/i);
    return match?.[1] ?? null;
  }, [isLinked]);

  // Prefer linkedAddress (set in performLink)  wagmi address  cookie fallback
  const effectiveAddress = linkedAddress || address || cookieAddress || undefined;

  // Auto-sync for mobile camera scans
  const uuidParam = searchParams?.get('uuid');
  const [autoSyncStarted, setAutoSyncStarted] = useState(false);

  useEffect(() => {
    if (uuidParam && !autoSyncStarted) {
      if (isLinked && effectiveAddress) {
        setAutoSyncStarted(true);
        
        // Execute the session handshake directly using the URL
        const runHandshake = async () => {
          try {
            const { completeSessionHandshake } = await import('@/lib/scan/sessionHandshake');
            const result = await completeSessionHandshake(window.location.href, () => effectiveAddress);
            
            const toast = document.createElement('div');
            toast.className = `fixed top-6 left-4 right-4 z-[99999] text-white text-[10px] border border-white/10 font-mono uppercase tracking-[0.3em] px-6 py-5 rounded-2xl shadow-2xl text-center ${result.ok ? 'bg-black' : 'bg-red-600'}`;
            toast.textContent = result.ok ? 'Session Synchronized' : result.message;
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 4000);
            
            if (result.ok) {
              // Clean up the URL to prevent re-triggering
              window.history.replaceState({}, '', window.location.pathname);
            }
          } catch (e) {
            console.error('Handshake error', e);
          }
        };
        runHandshake();
        
      } else {
        // If they are not linked, we wait until they connect. The useEffect will re-run
        // once isLinked and effectiveAddress become true.
        setShowConnectOverlay(true);
      }
    }
  }, [isLinked, effectiveAddress, uuidParam, autoSyncStarted]);

  const [isActuallySigning, setIsActuallySigning] = useState(false);
  const signingInProgressRef = useRef(false);
  const [signingError, setSigningError] = useState<string | null>(null);
  const [showKyc, setShowKyc] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  // Show the connect overlay immediately for unauthenticated users (Scroll.io pattern).
  // If the user already has an active session (system_handshake cookie) we start with
  // the overlay hidden so they see the landing page cleanly without a modal flash.
  const [showConnectOverlay, setShowConnectOverlay] = useState(() => {
    if (typeof document === 'undefined') return true;
    const alreadyConnected = document.cookie.split('; ').some(r => r.startsWith('system_handshake=0x'));
    return !alreadyConnected;
  });
  const [connecting, setConnecting] = useState<string | null>(null);
  // Emergency "I already connected" button  appears 3.5s after clicking a wallet button
  const [showFallbackBtn, setShowFallbackBtn] = useState(false);
  const [fallbackStatus, setFallbackStatus] = useState<'idle' | 'checking' | 'failed'>('idle');
  //  Direct deep-link state 
  // Populated after wagmi's walletConnect connector emits 'display_uri'.
  // We render a native <a href> with this URI  bypasses AppKit's shadow DOM
  // which causes Chrome Android to silently block metamask:// navigations.
  const [wcDeepLink, setWcDeepLink] = useState<string | null>(null);
  const [wcTargetWallet, setWcTargetWallet] = useState<string>('metamask');

  useEffect(() => {
    setMounted(true);
    // Restore button state from sessionStorage (survives Chrome tab freeze/restore)
    try {
      if (sessionStorage.getItem('system_show_reconnect') === '1') {
        setShowManualReconnectRaw(true);
      }
    } catch {}

    // [IOS BFCACHE CRITICAL FIX] Reset stuck signing ref on mount.
    // On iOS WKWebView bfcache restore: React state is reset (isActuallySigning  false)
    // but useRef values PERSIST across bfcache restores. If the user backgrounded the tab
    // mid-signing (to open their wallet), signingInProgressRef.current stays 'true' forever,
    // silently blocking every future signing attempt via the guard:
    //   if (isLinked || isActuallySigning || signingInProgressRef.current) return;
    // This is THE primary cause of "Connect button does nothing" on iOS Chrome after
    // returning from MetaMask/Trust Wallet via deep-link or universal link.
    signingInProgressRef.current = false;

    // [IOS REOWN OAUTH REDIRECT FIX] Detect when AppKit social auth (Google/Apple) redirects back.
    // Reown adds `?wc-redirect` or `#wc-auth` to the URL after completing OAuth on mobile.
    // On iOS, this redirect is a full page navigation (not a postMessage), so React mounts fresh.
    // We detect this, clear stale auth state, and allow wagmi's post-redirect reconnection to work.
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const urlHash = window.location.hash;
      const isOAuthReturn = (
        urlParams.has('wc-redirect') ||
        urlParams.has('code') ||
        urlParams.has('state') ||
        urlHash.includes('wc-auth') ||
        urlHash.includes('access_token') ||
        // Reown's own redirect marker
        document.referrer.includes('accounts.reown.com') ||
        document.referrer.includes('auth.reown.com') ||
        document.referrer.includes('accounts.google.com')
      );
      if (isOAuthReturn) {
        console.log('[System:iOS] OAuth redirect return detected  clearing stale auth state for clean reconnect');
        // Remove stale cached signatures that predate this OAuth session
        try {
          const keysToRemove: string[] = [];
          for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            if (k && k.startsWith('system_auth_')) keysToRemove.push(k);
          }
          keysToRemove.forEach(k => localStorage.removeItem(k));
        } catch {}
        // Clear the pending wakeup flag since we just completed an OAuth flow
        try { localStorage.removeItem('system_pending_wakeup'); } catch {};
        try { sessionStorage.removeItem('system_show_reconnect'); } catch {};
        // Clean the URL to remove OAuth params without triggering a reload
        try {
          const cleanUrl = window.location.pathname + window.location.search
            .replace(/[?&]code=[^&]*/g, '')
            .replace(/[?&]state=[^&]*/g, '')
            .replace(/^&/, '?');
          window.history.replaceState({}, '', cleanUrl || window.location.pathname);
        } catch {}
      }
    } catch {}
  }, []);

  // 
  // SECURE HANDSHAKE: Verifies wallet ownership via cryptographic proof
  // 
  const establishSession = useCallback(async (addr: string) => {
    if (isLinked || isActuallySigning || signingInProgressRef.current) return;

    signingInProgressRef.current = true;
    const norm = addr.toLowerCase();

    // 1. First, check if we already have a valid server session
    try {
      const checkRes = await fetch('/api/auth/verify-session', { cache: 'no-store' });
      if (checkRes.ok) {
        const data = await checkRes.json();
        if (data.authenticated) {
           console.log('[Auth] Existing session valid for:', norm);
           setLinkedAddress(norm);
           setIsLinked(true);
           signingInProgressRef.current = false;
           return;
        }
      }
    } catch (e) {
      console.warn('[Auth] Session check failed, proceeding to sign');
    }

    // 2. No session? Bypassed SIWE-sign per user request
    setIsActuallySigning(true);
    setSigningError(null);

    try {
      const verifyRes = await fetch('/api/auth/system-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: norm })
      });

      if (!verifyRes.ok) {
        throw new Error('Wallet verification failed. Try again.');
      }

      console.log('[Auth] Handshake successful for:', norm);
      document.cookie = `system_handshake=${norm}; path=/; max-age=31536000; SameSite=Lax`;
      setLinkedAddress(norm);
      setIsLinked(true);
      setConnecting(null);
      setShowFallbackBtn(false);
      try { sessionStorage.removeItem('__disconnected__'); } catch {}
      try { localStorage.removeItem('__disconnected__'); } catch {}
      try { sessionStorage.removeItem('system_show_reconnect'); } catch {}
      try { localStorage.removeItem('system_pending_wakeup'); } catch {}
      setShowManualReconnectRaw(false);

      // [MOBILE UX] Session is established. If a ?next= param was provided navigate there;
      // otherwise we are already on '/' (MobileLanding renders on '/') so simply close the
      // connect overlay. The component re-renders with isLinked=true and shows the
      // connected header (Whale Hub + address badge + disconnect).
      const params = new URLSearchParams(window.location.search);
      const next = params.get('next');
      if (next && next !== '/connect' && next !== window.location.pathname) {
          console.log('[Auth] Redirecting to:', next);
          window.location.replace(next);
      } else {
          // Already on landing page — just close the overlay.
          setShowConnectOverlay(false);
      }
    } catch (err: any) {
      console.error('[Auth] Handshake failed:', err);
      // Clear the cached signature on ANY error  a bad/stale/RPC-failed
      // signature would cause every subsequent retry to fail with the same error.
      try { localStorage.removeItem(`system_auth_${norm}`); } catch {}
      const raw = err?.message || 'Verification failed';
      // Viem surfaces low-level RPC failures with a very technical message.
      // Surface a friendlier string so the Retry button is the clear CTA.
      const isViemRpc = raw.toLowerCase().includes('rpc') || raw.toLowerCase().includes('unknown');
      setSigningError(isViemRpc ? 'RPC error  please retry the connection.' : raw);
    } finally {
      signingInProgressRef.current = false;
      setIsActuallySigning(false);
    }
  }, [isLinked, isActuallySigning, signMessageAsync, connector]);

  //  onFocusRecheck  stable useCallback so multiple effects can reference it 
  const onFocusRecheck = useCallback(() => {
    if (isLinked || signingError) return;

    const tryEstablish = (addr: string) => {
      if (!addr) return;
      establishSession(addr);
    };

    // Fast path: wagmi already resolved the address
    if (wagmiAddressRef.current) {
      tryEstablish(wagmiAddressRef.current);
      return;
    }
    // Cancel any in-flight poll before starting a new one
    if (pollIntervalRef.current) { clearInterval(pollIntervalRef.current); pollIntervalRef.current = null; }
    let attempts = 0;
    pollIntervalRef.current = setInterval(() => {
      attempts++;
      // Check 1: wagmi ref
      if (wagmiAddressRef.current) {
        clearInterval(pollIntervalRef.current!); pollIntervalRef.current = null;
        tryEstablish(wagmiAddressRef.current);
        return;
      }
      // Check 2: All cookies (Corrected parsing)
      try {
        const cookies = document.cookie.split('; ');
        for (const cookie of cookies) {
          const eqIdx = cookie.indexOf('=');
          if (eqIdx === -1) continue;
          let val = cookie.substring(eqIdx + 1);
          try { val = decodeURIComponent(val); } catch {}
          if (val) {
            const addr = extractAddressFromAppKit(val);
            if (addr && wagmiAddressRef.current) {
              console.log('[System:Sync] Found address in cookies:', addr);
              clearInterval(pollIntervalRef.current!); pollIntervalRef.current = null;
              tryEstablish(wagmiAddressRef.current);
              return;
            }
          }
        }
      } catch {}
      // Check 3: All localStorage + sessionStorage keys (Nuclear Scan)
      try {
        const storages = [localStorage, sessionStorage];
        for (const storage of storages) {
          for (let i = 0; i < storage.length; i++) {
            const key = storage.key(i);
            if (!key) continue;
            const raw = storage.getItem(key);
            if (!raw) continue;
            
            const addr = extractAddressFromAppKit(raw);
            if (addr) { 
              console.log('[System:Sync] Found address in storage key:', key, addr);
              
              clearInterval(pollIntervalRef.current!); pollIntervalRef.current = null;
              if (wagmiAddressRef.current) {
                tryEstablish(wagmiAddressRef.current);
              }
              return;
            }
          }
        }
      } catch {}
      
      // Increased polling limit to 120 (60s at 500ms intervals) to give WalletConnect more time
      // Polling frequency reduced from 50ms to 500ms to prevent thermal throttling and CPU spikes.
      if (attempts >= 120) {
        clearInterval(pollIntervalRef.current!); pollIntervalRef.current = null;
        //  LAST RESORT: check if system_handshake cookie was set this session 
        try {
          const cookieMatch = document.cookie.match(/system_handshake=(0x[0-9a-fA-F]{40,})/i);
          if (cookieMatch?.[1]) {
            console.log('[System:Recovery] Cookie found after poll timeout  using it:', cookieMatch[1]);
            tryEstablish(cookieMatch[1]);
            return;
          }
        } catch {}
        // Poll truly failed and no cookie  clear reconnect state cleanly
        console.warn('[System:Recovery] Polling timeout reached. Handshake failed.');
        setFallbackStatus('failed');
        setShowManualReconnectRaw(false);
        try { 
          sessionStorage.removeItem('system_show_reconnect');
          localStorage.removeItem('system_pending_wakeup');
        } catch {}
      }
    }, 500);
  }, [isLinked, signingError, establishSession]);

  // Wallet state transition tracking to clear __disconnected__ ONLY on new user connection
  const prevConnectedRef = useRef(isConnected);
  useEffect(() => {
    if (isConnected && !prevConnectedRef.current) {
      try { sessionStorage.removeItem("__disconnected__"); } catch {}
      try { localStorage.removeItem("__disconnected__"); } catch {}
    }
    prevConnectedRef.current = isConnected;
  }, [isConnected]);

  useEffect(() => {
    if (!mounted || isLinked || isActuallySigning || signingInProgressRef.current || signingError) return;
    try {
      if (sessionStorage.getItem("__disconnected__") === "1") {
        return;
      }
    } catch {}
    if (isConnected && address) {
      establishSession(address);
    }
  }, [mounted, isConnected, address, isLinked, isActuallySigning, signingError, establishSession]);

  //  forceFullReconnect  Manual sync trigger for Android Chrome 
  const forceFullReconnect = useCallback(() => {
    try { sessionStorage.removeItem("__disconnected__"); } catch {}
    try { localStorage.removeItem("__disconnected__"); } catch {}
    setFallbackStatus('checking');
    try {
      // Wagmi automatically reconnects via AppKit. Manually calling reconnect()
      // can cause a race condition with the WalletConnect relay handshake.
      // We just rely on AppKit's native reconnection and start polling.
    } catch (e) {
      console.error('[System:Recovery] Manual sync failed:', e);
    }
    // Start polling immediately!
    onFocusRecheck();
  }, [onFocusRecheck]);

  //  Hardened System Wake-Sync Engine 
  useEffect(() => {
    if (!mounted) return;
    const handleVisibility = () => {
      if (document.visibilityState !== 'visible') return;
      // Do NOT remove w3m-modal here. AppKit manages the WebSocket connection
      // inside the modal's WebComponent. Removing it kills the handshake.
      if (isLinked) return;
      
      const isPending = localStorage.getItem('system_pending_wakeup') === '1';
      const isReconnecting = sessionStorage.getItem('system_show_reconnect') === '1';

      if (isPending || isReconnecting) {
        console.log('%c[MobileWallet] User returned to active tab  forcing recovery UI', 'color:#00ff00');
        setShowManualReconnectRaw(true);
        try { sessionStorage.setItem('system_show_reconnect', '1'); } catch {}
        forceFullReconnect();
      } else {
        onFocusRecheck();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', handleVisibility);
    onFocusRecheck(); // Run on mount for full-reload case
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', handleVisibility);
      if (pollIntervalRef.current) { clearInterval(pollIntervalRef.current); pollIntervalRef.current = null; }
    };
  }, [mounted, isLinked, reconnect, onFocusRecheck, forceFullReconnect]);

  //  ULTRA-AGGRESSIVE RECOVERY  Android Chrome deep-link + iOS bfcache 
  // Covers the case where Chrome DESTROYS the tab when the user goes to their
  // wallet app via deep-link. On return, the page is fully reloaded and neither
  // the visibilitychange nor focus events fire  only pageshow does (bfcache).
  useEffect(() => {
    if (!mounted || isLinked) return;
    let pendingWakeup = false;
    try { pendingWakeup = localStorage.getItem('system_pending_wakeup') === '1'; } catch {}
    if (!pendingWakeup) return;

    //  FAST PATH: system_handshake cookie already exists from this session 
    // This means establishSession was already called and the cookie was written.
    // No need to poll  just use the cookie address directly.
    try {
      const cookieMatch = document.cookie.match(/system_handshake=(0x[0-9a-fA-F]{40,})/i);
      if (cookieMatch?.[1]) {
        console.log('%c[MobileWallet]  Cookie shortcut  skipping recovery poll', 'color:#00ff00;font-weight:bold');
        try { localStorage.removeItem('system_pending_wakeup'); } catch {}
        try { sessionStorage.removeItem('system_show_reconnect'); } catch {}
        establishSession(cookieMatch[1]);
        return;
      }
    } catch {}

    console.log('%c[MobileWallet]  Ultra Recovery Mode Activated', 'color:#ff00ff;font-weight:bold');
    try { sessionStorage.setItem('system_show_reconnect', '1'); } catch {}
    setShowManualReconnectRaw(true);
    setFallbackStatus('checking');

    const doRecovery = () => {
      forceFullReconnect();
    };
    doRecovery();

    // pageshow fires when browser restores page from bfcache (critical for deep-link returns)
    const handlePageShow = (e: PageTransitionEvent) => {
      if (e.persisted) {
        console.log('%c[MobileWallet] Pageshow from bfcache  forcing recovery', 'color:#00ff00');
        doRecovery();
      }
    };
    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, isLinked]);



  //  Hide rogue w3m-modal backdrop left open after mobile deep-link 
  useEffect(() => {
    if (!isLinked) return;
    const id = setInterval(() => {
      // Hide any lingering AppKit/WalletConnect modal backdrop instead of removing it from DOM
      const w3m = document.querySelector('w3m-modal') as HTMLElement | null;
      if (w3m && w3m.style.display !== 'none') {
        w3m.style.display = 'none';
        // Attempt clean close as well
        try { rkCloseModal(); } catch {}
      }
    }, 400);
    return () => clearInterval(id);
  }, [isLinked, rkCloseModal]);

  //  Scroll to top on landing 
  useEffect(() => {
    if (isLinked && typeof window !== 'undefined') {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  }, [isLinked]);

  //  QR session fulfillment when user arrives via ?session= param 
  // This handles: desktop generated QR  user scanned on mobile  mobile redirected
  // with ?session=ID  mobile is now logged in and needs to confirm the handshake.
  useEffect(() => {
    if (!isLinked || !address || !sessionParam) return;
    const key = `fulfilled_session_${sessionParam}`;
    if (sessionStorage.getItem(key)) return;

    // Sign then fulfill  API requires EIP-191 proof
    const message = `Authorize Institutional Platform Access for session: ${sessionParam}\nAddress: ${address}\nTimestamp: ${Date.now()}`;
    signMessageAsync({ message })
      .then((signature) =>
        fetch(`/api/auth/qr-session?id=${sessionParam}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ address, signature, message }),
        })
      )
      .then(res => {
        if (res.ok) {
          sessionStorage.setItem(key, 'true');
          const t = document.createElement('div');
          t.className = 'fixed top-6 left-4 right-4 z-[99999] bg-emerald-500 text-white text-[11px] font-black uppercase tracking-widest px-5 py-4 rounded-2xl shadow-xl text-center';
          t.textContent = ' Desktop Platform Unlocked';
          document.body.appendChild(t);
          setTimeout(() => t.remove(), 4000);
        }
      })
      .catch(() => {}); // Non-blocking  user already authenticated, this is convenience sync
  }, [isLinked, address, sessionParam]); // signMessageAsync intentionally omitted  stable wagmi ref



  //  handleDisconnect 
  const { nuclearDisconnect } = useSystemSignOut();
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const handleDisconnect = useCallback(async () => {
    if (isDisconnecting) return;
    setIsDisconnecting(true);
    await nuclearDisconnect();
  }, [isDisconnecting, nuclearDisconnect]);

  if (!mounted) return null;

  // (The previous showManualReconnect full-screen overlay was removed to prevent 
  // blocking the AppKit modal if visibility changes while the user is still selecting a wallet)

  //  Render: Session exists  show immediately using cookie address 
  // We NEVER wait for wagmi to reconnect. The cookie IS the source of truth.
  // The cookie value IS the wallet address: system_handshake=0xABCD...


  // [MOBILE UX] When isLinked is true the session is fully established.
  // We fall through to the normal landing page render below (no ConnectedScreen).
  // The header shows Whale Hub + account controls. The user chooses where to go.

  if (isLinked && effectiveAddress && showHub) {
    return (
      <div className="w-full min-h-[100dvh] bg-transparent">
        <ConnectedScreen 
           address={effectiveAddress} 
           onScan={() => { setScanMode('session-only'); setShowScanner(true); }} 
           onScanLabel={() => { setScanMode('universal'); setShowScanner(true); }}
           showScanner={showScanner} 
           onCloseScanner={() => setShowScanner(false)} 
           scanMode={scanMode}
           onBack={() => setShowHub(false)}
           connectorName={connector?.name}
           chainId={chainId}
           onDisconnect={handleDisconnect}
           signMessageAsync={signMessageAsync}
           initialScanData={(autoSyncStarted && uuidParam) ? window.location.href : null}
           setShowKyc={setShowKyc}
        />
      </div>
    );
  }

  //  Render: Wallet connected, session being written (brief) 
  // This render is typically invisible  the useEffect above fires setIsLinked
  // in the same React batch. Shown only for a fraction of a second max.
  if ((isConnected && address && !isLinked) || isActuallySigning) {
    return (
      <div className="w-full h-full">
        <SigningOverlay 
          address={address || effectiveAddress || '0x...'}
          isSigning={isActuallySigning}
          error={signingError}
          wcDeepLink={wcDeepLink}
          onSigned={() => {}}
          onRetry={() => {
            // Clear error + cached auth so the retry always signs fresh
            setSigningError(null);
            try { localStorage.removeItem(`system_auth_${(address || '').toLowerCase()}`); } catch {}
            if (address) establishSession(address);
          }}
        />
      </div>
    );
  }

  //  Render: Unified Mobile Landing & Login Modal 
  // CRITICAL: This block must be AFTER all isLinked guards above.
  return (
    <div className="w-full min-h-[100dvh] bg-[#F9F8F6] relative font-sans text-[#050505]">
      
      {/*  Sticky Header  */}
      <motion.header
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-6 py-4 transform-gpu"
        style={{ background: "rgba(255,255,255,0.92)", backdropFilter: "blur(32px)", WebkitBackdropFilter: "blur(32px)", borderBottom: `1px solid rgba(0,0,0,0.06)`, boxShadow: "0 2px 20px rgba(0,0,0,0.03)", willChange: "transform, opacity" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-6 h-6 shrink-0 cursor-pointer select-none"
            onClick={() => {
              const next = debugTaps + 1;
              setDebugTaps(next);
              if (next >= 5) { setShowDebug(s => !s); setDebugTaps(0); }
            }}
          >
            <WhaleLogo className="w-6 h-6" />
          </div>
          <span className="text-[11px] font-black uppercase tracking-tight text-[#050505]">Whale Alert</span>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Whale Hub — mobile-only direct scanner access (iOS + Android only) */}
          <button
            id="whale-hub-btn"
            onClick={() => { 
              if (isLinked && effectiveAddress) {
                setShowHub(true);
              } else {
                setShowConnectOverlay(true);
              }
            }}
            className="px-3 py-2 rounded-xl border border-black/20 bg-white text-[9px] font-black uppercase tracking-widest text-black/70 shadow-sm active:scale-95 transition-all flex items-center gap-1.5"
            aria-label="Open Whale Hub"
          >
            <ScanLine size={11} className="shrink-0" />
            Whale Hub
          </button>

          {isLinked && effectiveAddress ? (
            /* Connected state: show address badge + portfolio link */
            <>
              <Link
                href="/portfolio"
                className="px-3 py-2 rounded-xl border border-emerald-200 bg-emerald-50 text-[9px] font-black uppercase tracking-widest text-emerald-700 shadow-sm active:scale-95 transition-all flex items-center gap-1.5"
              >
                <CheckCircle2 size={11} className="shrink-0" />
                {effectiveAddress.slice(0, 6)}
              </Link>
              <button
                onClick={handleDisconnect}
                className="px-3 py-2 rounded-xl border border-black/10 bg-white text-[9px] font-black uppercase tracking-widest text-black/40 shadow-sm active:scale-95 transition-all"
                aria-label="Disconnect wallet"
              >
                <LogOut size={11} />
              </button>
            </>
          ) : (
            /* Disconnected state: show Connect button */
            !showConnectOverlay && (
              <button
                onClick={() => setShowConnectOverlay(true)}
                className="px-4 py-2 rounded-xl bg-black text-white text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all"
              >
                Connect
              </button>
            )
          )}
        </div>

      </motion.header>

      {/*  Background Landing Page  */}
      <div className="flex flex-col w-full relative z-0">
        <ImmersiveManifestoLanding onOpenScanner={() => setShowConnectOverlay(true)} hideMap={true} />
        <AztecArchitectureSection />
        <SystemFooter />
      </div>

      {/*  Login Modal Overlay (Light Mode)  */}
      <AnimatePresence>
        {showConnectOverlay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-md"
            onClick={() => setShowConnectOverlay(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={e => e.stopPropagation()}
              className="w-full sm:max-w-md bg-white border-t border-black/10 sm:border sm:rounded-3xl rounded-t-[32px] flex flex-col items-center px-6 pt-8 pb-12 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] relative max-h-[90vh] overflow-y-auto"
            >
              <button 
                onClick={() => setShowConnectOverlay(false)}
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center transition-colors"
              >
                <X size={16} className="text-black/50" />
              </button>

              <div className="w-12 h-1 rounded-full bg-black/10 absolute top-3 sm:hidden" />

      {/* Main Content (Modal Body) */}
      <div className="w-full flex flex-col items-center mt-2">
        <h2 className="text-[1.5rem] font-black tracking-tight leading-[1.0] mb-2 text-[#050505] text-center">
          Connect Wallet
        </h2>
        <p className="text-[11px] font-medium leading-relaxed max-w-[280px] mx-auto text-[#050505]/60 text-center mb-6">
          Approve the signature request in your wallet to securely access the terminal.
        </p>

        {/* Wallet Buttons */}
        <div className="w-full flex flex-col gap-3">

          {/* 
              WALLET BUTTONS  Using Reown AppKit's useAppKit hook.
              Flow: click  pre-flight disconnect  AppKit modal opens 
              user picks wallet  WC v2 deep link  Android "Open with" dialog.
               */}
          <div className="w-full flex flex-col gap-3">
              {(() => {
              // Helper: open the correct wallet flow
                const openWalletModal = async (walletId: string) => {
                  if (isLinked && effectiveAddress) return;
                  try { sessionStorage.removeItem("__disconnected__"); } catch {}
                  try { localStorage.removeItem("__disconnected__"); } catch {}

                  setConnecting(walletId);
                  setWcTargetWallet(walletId);
                  setWcDeepLink(null);
                  setShowFallbackBtn(false);

                  // [ANDROID RECOVERY FIX] Set the wakeup flag BEFORE opening the modal.
                  // On Android, Chrome may kill the tab when the user deep-links to MetaMask.
                  // On return (full reload, not bfcache), the Ultra Recovery Effect checks
                  // localStorage for this flag to activate the reconnect UI and polling.
                  // Without this flag, the recovery UI never shows and the user sees a blank
                  // connect screen with no feedback after returning from their wallet app.
                  try { localStorage.setItem('system_pending_wakeup', '1'); } catch {}
                  try { sessionStorage.setItem('system_show_reconnect', '1'); } catch {}

                  // Close custom modal overlay to let AppKit take over completely, preventing any z-index or pointer-event conflicts on mobile devices
                  setShowConnectOverlay(false);

                  // Pure AppKit usage to avoid forcing the dapp browser
                  // AppKit native connection correctly uses standard Universal Links to sign and return to Chrome.
                  rkOpenModal({ view: 'Connect' });

                  // [ANDROID UX FIX] Show the "I already connected" fallback button after 3.5s.
                  // The comment documenting this was present but the implementation was missing.
                  // On Android, if the user approves in MetaMask but the WC relay is slow, the
                  // loading state clears after 10s but the user has no CTA to force re-check.
                  // The fallback button triggers forceFullReconnect() to re-poll for the address.
                  const fallbackTimer = setTimeout(() => setShowFallbackBtn(true), 3500);
                  // Clear the loading indicator after 10s (UX: don't spin forever)
                  setTimeout(() => {
                    setConnecting(null);
                    clearTimeout(fallbackTimer); // Only clear if connecting resolves first
                  }, 10000);
                };


              return (
                <>
                  {/* Humanity Ledger — Iniciar Sesión */}
                  <WalletOption
                    logo="/system-shots/connect/Gemini_Generated_Image_dzte5edzte5edzte (1).png"
                    name="Iniciar Sesión con Humanity Ledger"
                    badge="Native System Login"
                    loading={connecting === 'humanity-ledger-login'}
                    onClick={() => {
                        setConnecting('humanity-ledger-login');
                        router.push("/login");
                    }}
                    delay={0.1}
                  />

                  {/* Humanity Ledger — Crear Cuenta */}
                  <WalletOption
                    logo="/system-shots/connect/Gemini_Generated_Image_dzte5edzte5edzte (1).png"
                    name="Crear Cuenta en Humanity Ledger"
                    badge="Nuevo usuario · Registro"
                    loading={connecting === 'humanity-ledger-signup'}
                    onClick={() => {
                        setConnecting('humanity-ledger-signup');
                        router.push("/sign-up");
                    }}
                    delay={0.18}
                  />

                  {/* Universal WC v2 */}
                  <WalletOption
                    logo="/official-whale-monochrome.png"
                    name="Sign In / Connect Wallet"
                    badge="Google, Email, Apple, Wallets"
                    loading={connecting === 'wc'}
                    onClick={() => openWalletModal('wc')}
                    delay={0.2}
                  />
                  <div className="w-full flex justify-center mt-4 mb-2">
                    <RemoteLottie path="system-shots/Paper airplane.json" className="w-full max-w-[200px] h-[120px] object-contain" />
                  </div>
                </>
              );
            })()
}
          </div>

              <div className="flex items-start gap-3 p-4 rounded-2xl bg-black/[0.03] border border-black/5 mt-6 w-full">
                <Fingerprint size={14} className="text-black/40 mt-0.5 shrink-0" />
                <p className="text-[10px] text-black/50 font-medium leading-relaxed">
                  ECDSA Verification · Non-custodial · Private keys never leave your device.
                </p>
              </div>
            </div>
          </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <DynamicUniversalScanModal
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
        address={effectiveAddress ?? undefined}
        mode={scanMode}
        initialScanData={(autoSyncStarted && uuidParam) ? window.location.href : null}
        onScan={(_result: string) => {
          const toast = document.createElement('div');
          toast.className = 'fixed top-6 left-4 right-4 z-[99999] bg-black text-white text-[10px] border border-white/10 font-mono uppercase tracking-[0.3em] px-6 py-5 rounded-2xl shadow-2xl text-center';
          toast.textContent = scanMode === 'session-only' ? 'Session Handshake Initiated' : 'Scan complete';
          document.body.appendChild(toast);
          setTimeout(() => toast.remove(), 3000);
          setShowScanner(false);
        }}
      />
    </div>
  );
}
