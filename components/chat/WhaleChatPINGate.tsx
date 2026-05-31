'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppKit } from '@reown/appkit/react';
import { useDisconnect } from 'wagmi';
import { useSystemAccount as useAccount } from '@/hooks/useSystemAccount';
import { useWalletStore } from '@/lib/store/wallet-store';
import { ArrowLeft, Delete, LogOut, RefreshCw, ShieldCheck, AlertTriangle, QrCode, X } from 'lucide-react';
import { toast } from 'sonner';
import { useSystemSignOut } from '@/hooks/useSystemSignOut';
import { RemoteLottie } from '@/components/ui/RemoteLottie';
import { WalletQRDisplay } from '@/components/wallet/WalletQRDisplay';
import CryptoJS from 'crypto-js';
import { useEnsName } from 'wagmi';

// 
// Constants
// 

const PIN_STORAGE_PREFIX = 'whale_chat_pin_';
const SESSION_UNLOCK_TTL = 30 * 24 * 60 * 60 * 1000; // 30 days in ms
const IDB_DB_NAME = 'WhaleChatSecureStore';
const IDB_STORE_NAME = 'pin_hashes';

// 
// IndexedDB helpers (ultimate fallback  survives localStorage/cookie wipes)
// 

function openIDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') return reject(new Error('No IDB'));
    const req = indexedDB.open(IDB_DB_NAME, 1);
    req.onupgradeneeded = () => {
      try { req.result.createObjectStore(IDB_STORE_NAME); } catch {}
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbGet(key: string): Promise<string | null> {
  try {
    const db = await openIDB();
    return new Promise((resolve) => {
      const tx = db.transaction(IDB_STORE_NAME, 'readonly');
      const req = tx.objectStore(IDB_STORE_NAME).get(key);
      req.onsuccess = () => resolve(req.result ?? null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

async function idbSet(key: string, value: string): Promise<void> {
  try {
    const db = await openIDB();
    return new Promise((resolve) => {
      const tx = db.transaction(IDB_STORE_NAME, 'readwrite');
      tx.objectStore(IDB_STORE_NAME).put(value, key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  } catch {}
}

async function idbDelete(key: string): Promise<void> {
  try {
    const db = await openIDB();
    return new Promise((resolve) => {
      const tx = db.transaction(IDB_STORE_NAME, 'readwrite');
      tx.objectStore(IDB_STORE_NAME).delete(key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  } catch {}
}

// 
// Storage key
// 

function getPINKey(address: string) {
  return `${PIN_STORAGE_PREFIX}${address.toLowerCase()}`;
}

// 
// PIN Hash  SHA256 with address salt
// 

function hashPIN(pin: string, address: string): string {
  // Always use lowercase address to ensure consistency regardless of EIP-55 checksum
  const salt = address.toLowerCase() + '_WHALE_SECURE_SALT_V2';
  return CryptoJS.SHA256(pin + salt).toString(CryptoJS.enc.Hex);
}

// 
// Multi-layer PIN storage: localStorage + sessionStorage + cookie + IndexedDB
// Reading: try all layers in order, restore missing ones
// Writing: write to ALL layers simultaneously for maximum durability
// 

/**
 * Save PIN hash to every available storage layer.
 */
async function savePIN(pin: string, address: string): Promise<void> {
  const key = getPINKey(address);
  const hash = hashPIN(pin, address);

  // Layer 1: localStorage (primary)
  try { localStorage.setItem(key, hash); } catch {}

  // Layer 2: sessionStorage (fast in-memory access)
  try { sessionStorage.setItem(key, hash); } catch {}

  // Layer 3: Cookie (10-year max-age, survives private browsing reloads)
  try {
    document.cookie = `${key}=${hash}; max-age=315360000; path=/; samesite=lax`;
  } catch {}

  // Layer 4: IndexedDB (survives localStorage quota errors and cache clears)
  await idbSet(key, hash);

  // Layer 5: Server-side backup (survives device changes)
  try {
    await fetch('/api/chat/pin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address, pinHash: hash })
    });
  } catch (e) {
    console.error('Failed to backup PIN to server', e);
  }
}

/**
 * Read PIN hash from any available storage layer.
 * Also restores missing layers so future reads are faster.
 */
async function loadPINHash(address: string): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  const key = getPINKey(address);
  let hash: string | null = null;

  // Layer 1: localStorage
  try { hash = localStorage.getItem(key); } catch {}

  // Layer 2: sessionStorage
  if (!hash) {
    try { hash = sessionStorage.getItem(key); } catch {}
  }

  // Layer 3: Cookie
  if (!hash) {
    try {
      const match = document.cookie.match(new RegExp('(^| )' + key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '=([^;]+)'));
      if (match?.[2]) hash = match[2];
    } catch {}
  }

  // Layer 4: IndexedDB
  if (!hash) {
    hash = await idbGet(key);
  }

  // Layer 5: Server-side fallback
  if (!hash) {
    try {
      const res = await fetch(`/api/chat/pin?address=${address}`);
      if (res.ok) {
        const data = await res.json();
        if (data.pinHash) hash = data.pinHash;
      }
    } catch (e) {
      console.error('Failed to restore PIN from server', e);
    }
  }

  // Restore any missing layers
  if (hash) {
    try { localStorage.setItem(key, hash); } catch {}
    try { sessionStorage.setItem(key, hash); } catch {}
    try {
      document.cookie = `${key}=${hash}; max-age=315360000; path=/; samesite=lax`;
    } catch {}
    // IDB already has it if we got it from IDB
    if (!(await idbGet(key))) {
      await idbSet(key, hash);
    }
  }

  return hash;
}

/**
 * Synchronous version for initial render (reads localStorage + sessionStorage + cookie only).
 * IndexedDB is async so we use loadPINHash for the definitive check.
 */
function loadPINHashSync(address: string): string | null {
  if (typeof window === 'undefined') return null;
  const key = getPINKey(address);

  try {
    const ls = localStorage.getItem(key);
    if (ls) return ls;
  } catch {}

  try {
    const ss = sessionStorage.getItem(key);
    if (ss) return ss;
  } catch {}

  try {
    const match = document.cookie.match(new RegExp('(^| )' + key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '=([^;]+)'));
    if (match?.[2]) return match[2];
  } catch {}

  return null;
}

/**
 * Delete PIN hash from all storage layers.
 */
async function deletePIN(address: string): Promise<void> {
  const key = getPINKey(address);
  try { localStorage.removeItem(key); } catch {}
  try { sessionStorage.removeItem(key); } catch {}
  try {
    document.cookie = `${key}=; max-age=0; path=/; samesite=lax`;
  } catch {}
  await idbDelete(key);
}

// 
// Session unlock: 30-day window stored in localStorage + sessionStorage
// 

function getSessionKey(address: string) {
  return `whale_chat_unlocked_time_${address.toLowerCase()}`;
}

function isSessionUnlocked(address: string): boolean {
  if (typeof window === 'undefined') return false;
  const key = getSessionKey(address);
  let val: string | null = null;

  // Check sessionStorage first (faster, always current tab)
  try { val = sessionStorage.getItem(key); } catch {}
  if (!val) {
    try { val = localStorage.getItem(key); } catch {}
  }

  if (!val) return false;
  const time = parseInt(val, 10);
  if (isNaN(time)) return false;

  // 30-day window
  return Date.now() - time < SESSION_UNLOCK_TTL;
}

function unlockSession(address: string) {
  const key = getSessionKey(address);
  const now = Date.now().toString();
  try { localStorage.setItem(key, now); } catch {}
  try { sessionStorage.setItem(key, now); } catch {}
}

function clearSession(address: string) {
  const key = getSessionKey(address);
  try { localStorage.removeItem(key); } catch {}
  try { sessionStorage.removeItem(key); } catch {}
}

// 
// Verify PIN
// 

async function verifyPIN(pin: string, address: string): Promise<boolean> {
  const stored = await loadPINHash(address);
  if (!stored) return false;
  return stored === hashPIN(pin, address);
}

// 
// Wipe XMTP DBs
// 

async function wipeXMTPDatabases() {
  if (typeof indexedDB === 'undefined') return;
  try {
    const dbs = await indexedDB.databases();
    dbs.forEach((db) => {
      if (db.name && db.name.toLowerCase().includes('xmtp')) {
        indexedDB.deleteDatabase(db.name);
      }
    });
  } catch (e) {
    console.error('Failed to wipe XMTP databases', e);
  }
}

// 
// Format address
// 

function formatAddress(addr: string) {
  if (!addr) return '';
  return addr.slice(0, 8) + ' ···· ' + addr.slice(-6);
}

// 
// PIN Dot Display
// 

function PINDots({ length, filled }: { length: number; filled: number }) {
  return (
    <div className="flex items-center justify-center gap-4 my-6">
      {Array.from({ length }).map((_, i) => (
        <motion.div
          key={i}
          animate={i < filled ? { scale: [1, 1.3, 1], opacity: 1 } : { scale: 1, opacity: 1 }}
          transition={{ duration: 0.15 }}
          className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
            i < filled
              ? 'bg-[#050505] border-[#050505]'
              : 'bg-transparent border-[#050505]/20'
          }`}
        />
      ))}
    </div>
  );
}

// 
// Numeric Keypad
// 

const PAD_KEYS = ['1','2','3','4','5','6','7','8','9','spacer','0','del'] as const;

function NumPad({ onPress }: { onPress: (key: string) => void }) {
  return (
    <div className="grid grid-cols-3 gap-3 w-full max-w-[280px] mx-auto">
      {PAD_KEYS.map((key, idx) => {
        if (key === 'spacer') {
          return <div key={idx} />;
        }
        const isDelete = key === 'del';
        return (
          <motion.button
            key={key}
            whileTap={{ scale: 0.9 }}
            onClick={() => onPress(isDelete ? 'del' : key)}
            className={`h-16 rounded-2xl text-[20px] font-bold flex items-center justify-center transition-all select-none
              ${isDelete
                ? 'bg-black/5 text-black/40 hover:bg-black/10 hover:text-black/70'
                : 'bg-[#FFFFFF] text-[#050505] hover:bg-black/5 active:bg-black/10 shadow-[0_1px_3px_rgba(0,0,0,0.06)] border border-black/5'
              }`}
          >
            {isDelete ? <Delete size={20} /> : key}
          </motion.button>
        );
      })}
    </div>
  );
}

// 
// Main Gate Component
// 

type Phase = 'confirm' | 'set-pin' | 'set-pin-confirm' | 'enter-pin';

interface Props {
  onEnter: () => void;
}

export default function WhaleChatPINGate({ onEnter }: Props) {
  const { address, isConnected, isChecking } = useAccount();
  const { open } = useAppKit();
  const { disconnect } = useDisconnect();
  const { clearWallet } = useWalletStore();
  const { nuclearDisconnect } = useSystemSignOut();

  const { data: ensName } = useEnsName({ address: address as `0x${string}` | undefined });

  const [phase, setPhase] = useState<Phase>('confirm');
  const [pin, setPin] = useState('');
  const [pinFirst, setPinFirst] = useState('');
  const [shake, setShake] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showQR, setShowQR] = useState(false);

  // On mount / address change: check PIN state and route to correct phase
  useEffect(() => {
    if (!address) return;

    setPin('');
    setPinFirst('');
    setAttempts(0);

    // [FIX] Check if session is already unlocked (30-day window)
    // If yes → enter immediately without asking for PIN again
    if (isSessionUnlocked(address)) {
      setIsLoading(false);
      onEnter();
      return;
    }

    // Check if a PIN already exists (async, checks all 5 storage layers)
    setIsLoading(true);
    loadPINHash(address).then((hash) => {
      setIsLoading(false);
      if (hash) {
        // PIN exists → ask user to enter it
        setPhase('enter-pin');
      } else {
        // No PIN yet → start with confirm screen before creating one
        setPhase('confirm');
      }
    });
  }, [address, onEnter]);

  //  Handle keypad 

  const handleKey = useCallback((key: string) => {
    if (key === 'del') {
      setPin(p => p.slice(0, -1));
      return;
    }
    setPin(p => {
      if (p.length >= 6) return p;
      return p + key;
    });
  }, []);

  //  Auto-submit when 6 digits entered 

  useEffect(() => {
    if (pin.length < 6) return;
    const timer = setTimeout(async () => {
      if (phase === 'set-pin') {
        setPinFirst(pin);
        setPin('');
        setPhase('set-pin-confirm');
      } else if (phase === 'set-pin-confirm') {
        if (pin === pinFirst) {
          await savePIN(pin, address!);
          unlockSession(address!);
          toast.success('PIN created. Welcome to Whale Chat!');
          onEnter();
        } else {
          triggerShake();
          setPinFirst('');
          setPin('');
          setPhase('set-pin');
          toast.error('PINs do not match. Please try again.');
        }
      } else if (phase === 'enter-pin') {
        const valid = await verifyPIN(pin, address!);
        if (valid) {
          unlockSession(address!);
          onEnter();
        } else {
          triggerShake();
          setPin('');
          const next = attempts + 1;
          setAttempts(next);
          if (next >= 5) {
            toast.error('Too many incorrect attempts. Access locked — create a new PIN.');
            clearSession(address!);
            await deletePIN(address!);
            await wipeXMTPDatabases();
            nuclearDisconnect();
          } else {
            toast.error(`Incorrect PIN (${5 - next} attempt${5 - next !== 1 ? 's' : ''} left)`);
          }
        }
      } else {
        // [FIX] Safety reset: if somehow 6 digits are entered in an unexpected phase,
        // clear the pin so the UI never freezes. This was the root cause of the
        // "stuck on last digit" bug when phase === 'confirm'.
        setPin('');
      }
    }, 120);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin, phase]);

  function triggerShake() {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  }

  //  Disconnect 

  function handleDisconnect() {
    toast.success('Session disconnected.');
    nuclearDisconnect();
  }

  //  Phase labels 

  const phaseLabel: Record<Phase, { title: string; sub: string }> = {
    'confirm': {
      title: 'Are you sure?',
      sub: 'You are about to enter Whale Chat with this address.',
    },
    'set-pin': {
      title: 'Create a PIN',
      sub: 'Choose a 6-digit PIN to protect your chat session.',
    },
    'set-pin-confirm': {
      title: 'Confirm your PIN',
      sub: 'Re-enter the same 6 digits to confirm.',
    },
    'enter-pin': {
      title: 'Enter your PIN',
      sub: 'Enter your 6-digit PIN to access Whale Chat.',
    },
  };

  // While useSystemAccount is still reading localStorage/sessionStorage (client-only
  // useEffect), we must NOT flash "No Wallet Connected". This is especially important
  // on mobile where Humanity Ledger users have a valid system_session_v2 token that
  // gets restored asynchronously after the first render.
  if (isChecking) {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-black/10 border-t-black/60 rounded-full animate-spin" />
          <p className="text-[11px] font-mono uppercase tracking-widest text-black/40">Verifying session…</p>
        </div>
      </div>
    );
  }

  if (!isConnected || !address) {
    return (
      <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-white/95 backdrop-blur-xl">
        <div className="text-center space-y-4">
          <AlertTriangle size={40} className="text-amber-500 mx-auto" />
          <h2 className="text-2xl font-black uppercase tracking-tighter text-[#050505]">No Wallet Connected</h2>
          <p className="text-[14px] text-black/50 font-medium">Please connect a wallet to access Whale Chat.</p>
          <button
            onClick={() => open()}
            className="mt-4 px-8 py-3.5 rounded-[18px] bg-[#050505] text-white font-black tracking-widest text-[12px] uppercase shadow-lg hover:bg-[#111] transition-all"
          >
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-black/10 border-t-black/60 rounded-full animate-spin" />
          <p className="text-[11px] font-mono uppercase tracking-widest text-black/40">Verifying...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center bg-white overflow-y-auto py-8"
    >
      {/* Subtle noise background */}
      <div className="fixed inset-0 bg-white pointer-events-none" />

      <motion.div
        layout
        className="relative z-10 w-full max-w-[420px] mx-auto px-6 flex flex-col items-center"
      >

        {/*  LOTTIE & ATOM IMAGE  */}
        <div className="relative mb-8 flex flex-col items-center w-full">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.05, duration: 0.5 }}
            className="fixed inset-0 z-20 pointer-events-none flex items-center justify-center"
          >
            <RemoteLottie path="/system-shots/Airplane Lottie Animation (1).json" className="w-full h-full object-cover opacity-100" loop={false} />
          </motion.div>

          <motion.div
            initial={{ y: -20, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.5, type: 'spring', stiffness: 200, damping: 20 }}
            className="relative z-0 w-full flex justify-center -mt-8 md:-mt-16 -mb-4 md:-mb-12 pointer-events-none"
          >
            <img
              src="/atom_3d_silver.jpg"
              alt="Core Atom"
              className="w-[280px] h-[280px] sm:w-[400px] sm:h-[400px] md:w-[600px] md:h-[600px] max-w-full object-contain mx-auto mix-blend-darken contrast-[1.15] brightness-[1.05]"
              draggable={false}
              style={{
                maskImage: 'radial-gradient(ellipse 70% 70% at 50% 50%, black 45%, transparent 80%)',
                WebkitMaskImage: 'radial-gradient(ellipse 70% 70% at 50% 50%, black 45%, transparent 80%)',
              }}
            />
          </motion.div>
        </div>

        {/*  Address pill  */}
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="flex items-center gap-2.5 px-5 py-2.5 bg-white border border-black/8 rounded-full shadow-sm mb-2"
        >
          <ShieldCheck size={14} className="text-emerald-500 shrink-0" />
          <span className="font-mono text-[13px] font-semibold text-[#050505] tracking-wide">
            {ensName ? ensName : (
              <>
                {address.slice(0, 6)}
                <span className="text-black/30 mx-1">····</span>
                {address.slice(-6)}
              </>
            )}
          </span>
        </motion.div>

        {/*  Phase card  */}
        <AnimatePresence mode="wait">
          <motion.div
            key={phase}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="w-full mt-5"
          >
            {/* Title */}
            <div className="text-center mb-1">
              <h1 className="text-[26px] font-black text-[#050505] tracking-tighter leading-tight">
                {phaseLabel[phase].title}
              </h1>
              <p className="text-[14px] text-black/45 font-medium mt-1 leading-snug">
                {phaseLabel[phase].sub}
              </p>
            </div>

            {/*  CONFIRM PHASE  */}
            {phase === 'confirm' && (
              <div className="mt-8 space-y-3">
                <button
                  onClick={() => setPhase('set-pin')}
                  className="w-full py-5 rounded-[20px] bg-[#050505] text-white font-black tracking-widest text-[13px] uppercase shadow-lg hover:bg-[#111] active:scale-[0.98] transition-all"
                >
                  Yes, continue with this address
                </button>
                <button
                  onClick={() => open()}
                  className="w-full py-4 rounded-[20px] bg-white border border-black/10 text-[#050505] font-black tracking-widest text-[13px] uppercase hover:border-black/25 hover:bg-black/[0.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2.5"
                >
                  <RefreshCw size={15} />
                  Connect another wallet
                </button>

                {/* QR Code share button */}
                <button
                  onClick={() => setShowQR(v => !v)}
                  className="w-full py-4 rounded-[20px] bg-white border border-black/10 text-[#050505] font-bold tracking-widest text-[13px] uppercase hover:border-black/25 hover:bg-black/[0.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2.5"
                >
                  {showQR ? <X size={15} /> : <QrCode size={15} />}
                  {showQR ? 'Hide QR Code' : 'Show my QR Code'}
                </button>

                <AnimatePresence>
                  {showQR && (
                    <motion.div
                      key="qr-panel"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-3 flex flex-col items-center gap-2">
                        <WalletQRDisplay
                          address={address}
                          size={200}
                          showAddress
                          withFrame
                        />
                        <p className="text-[10px] text-black/35 font-mono uppercase tracking-widest text-center px-4">
                          Scan with any Ethereum wallet to send to this address
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/*  PIN ENTRY PHASES  */}
            {(phase === 'set-pin' || phase === 'set-pin-confirm' || phase === 'enter-pin') && (
              <div className="mt-4">
                {/* Back button for set phases */}
                {phase !== 'enter-pin' && (
                  <button
                    onClick={() => {
                      setPin('');
                      setPinFirst('');
                      setPhase('confirm');
                    }}
                    className="flex items-center gap-1.5 text-[12px] font-bold text-black/40 hover:text-black/70 transition-colors mb-4 mx-auto"
                  >
                    <ArrowLeft size={13} /> Back
                  </button>
                )}

                {/* PIN dots */}
                <motion.div
                  animate={shake ? { x: [-8, 8, -6, 6, -4, 4, 0] } : { x: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <PINDots length={6} filled={pin.length} />
                </motion.div>

                {/* Attempt warning */}
                {phase === 'enter-pin' && attempts > 0 && (
                  <p className="text-center text-[12px] text-rose-500 font-bold mb-3">
                    {5 - attempts} attempt{5 - attempts !== 1 ? 's' : ''} remaining
                  </p>
                )}

                {/* Numpad */}
                <div className="mt-2">
                  <NumPad onPress={handleKey} />
                </div>

                {/* Forgot / reset PIN (enter phase) */}
                {phase === 'enter-pin' && (
                  <button
                    onClick={async () => {
                      await deletePIN(address!);
                      clearSession(address!);
                      setPin('');
                      setAttempts(0);
                      setPhase('confirm');
                      toast('PIN reset. You will need to create a new one.');
                    }}
                    className="w-full text-center text-[11px] font-black uppercase tracking-widest text-black/30 hover:text-black/60 transition-colors mt-6"
                  >
                    Forgot PIN? Reset access
                  </button>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/*  Connect another wallet (always visible at bottom)  */}
        {phase !== 'confirm' && (
          <div className="mt-8 pt-6 border-t border-black/6 w-full flex flex-col gap-2">
            <button
              onClick={() => open()}
              className="w-full py-3.5 rounded-[18px] bg-transparent border border-black/10 text-[#050505] font-bold text-[13px] hover:bg-black/[0.03] hover:border-black/20 transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw size={14} />
              Connect another wallet
            </button>
            <button
              onClick={handleDisconnect}
              className="w-full py-3.5 rounded-[18px] text-rose-500 font-bold text-[13px] hover:bg-rose-50 transition-all flex items-center justify-center gap-2"
            >
              <LogOut size={14} />
              Disconnect this session
            </button>
          </div>
        )}

        {/*  Disconnect button on confirm phase  */}
        {phase === 'confirm' && (
          <button
            onClick={handleDisconnect}
            className="mt-6 flex items-center gap-2 text-[12px] font-bold text-rose-400 hover:text-rose-600 transition-colors"
          >
            <LogOut size={13} />
            Disconnect session
          </button>
        )}
      </motion.div>
    </motion.div>
  );
}
