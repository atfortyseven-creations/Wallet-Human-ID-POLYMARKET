'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Cpu, CheckCircle2, Key, Shield, AlertTriangle, Loader2, Lock, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Session key ─────────────────────────────────────────────────────────────
// The enclave clearance token is persisted for the current browser session only.
// It resets on tab close — requiring re-verification each new session.
// NOTE: This token is issued by the server after real PIN verification.
const CLEARANCE_KEY = '__enclave_clearance_v2__';
const CLEARANCE_TOKEN_KEY = '__enclave_token__';
const CLEARANCE_TS_KEY = '__enclave_ts__';
const CLEARANCE_TTL_MS = 8 * 60 * 60 * 1000; // 8 hours

function readClearance(): boolean {
  try {
    const granted = sessionStorage.getItem(CLEARANCE_KEY) === 'granted';
    if (!granted) return false;
    // Validate token age
    const ts = parseInt(sessionStorage.getItem(CLEARANCE_TS_KEY) || '0', 10);
    if (Date.now() - ts > CLEARANCE_TTL_MS) {
      // Token expired — clear it
      sessionStorage.removeItem(CLEARANCE_KEY);
      sessionStorage.removeItem(CLEARANCE_TOKEN_KEY);
      sessionStorage.removeItem(CLEARANCE_TS_KEY);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

function writeClearance(token: string, ts: number) {
  try {
    sessionStorage.setItem(CLEARANCE_KEY, 'granted');
    sessionStorage.setItem(CLEARANCE_TOKEN_KEY, token);
    sessionStorage.setItem(CLEARANCE_TS_KEY, ts.toString());
  } catch {}
}

// ─── Component ───────────────────────────────────────────────────────────────
export function TuringShieldGate({
  children,
  onVerified,
}: {
  children: React.ReactNode;
  onVerified?: (enclaveId: string) => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [cleared, setCleared] = useState(false);
  const [pin, setPin] = useState(['', '', '', '', '', '']);
  const [pinError, setPinError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [shake, setShake] = useState(false);
  const [attemptsRemaining, setAttemptsRemaining] = useState<number | null>(null);
  const [locked, setLocked] = useState(false);
  // [SECURITY FIX] Server-enforced lockout timer — cannot be bypassed client-side
  const [lockoutExpiresAt, setLockoutExpiresAt] = useState<number | null>(null);
  const [lockoutCountdown, setLockoutCountdown] = useState(0);

  // Count down the lockout timer — purely cosmetic, server enforces the real block
  React.useEffect(() => {
    if (!lockoutExpiresAt) return;
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((lockoutExpiresAt - Date.now()) / 1000));
      setLockoutCountdown(remaining);
      if (remaining === 0) {
        setLocked(false);
        setLockoutExpiresAt(null);
        setAttemptsRemaining(null);
        setPinError(null);
        setPin(['', '', '', '', '', '']);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutExpiresAt]);

  // Set new PIN flow
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [settingPin, setSettingPin] = useState(false);
  const [newPin, setNewPin] = useState(['', '', '', '', '', '']);
  const [confirmPin, setConfirmPin] = useState(['', '', '', '', '', '']);
  const [pinSetStep, setPinSetStep] = useState<'new' | 'confirm'>('new');
  const [pinSetError, setPinSetError] = useState<string | null>(null);
  const [pinSetSuccess, setPinSetSuccess] = useState(false);

  const pinRefs = useRef<(HTMLInputElement | null)[]>([]);
  const newPinRefs = useRef<(HTMLInputElement | null)[]>([]);
  const confirmPinRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    setMounted(true);
    if (readClearance()) {
      setCleared(true);
    }
  }, []);

  const triggerShake = useCallback(() => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  }, []);

  // ─── Verify PIN against server ─────────────────────────────────────────────
  const handleSubmit = useCallback(async (digits: string[]) => {
    const code = digits.join('');
    if (code.length !== 6) return;
    if (verifying || locked) return;

    setVerifying(true);
    setPinError(null);

    try {
      const res = await fetch('/api/auth/enclave-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: code }),
        credentials: 'include',
      });

      const data = await res.json();

      if (res.status === 429) {
        // [SECURITY FIX] Record server-side lockout expiry — client CANNOT reset this
        setLocked(true);
        setPinError(data.error || 'Too many attempts. Please wait 15 minutes.');
        setPin(['', '', '', '', '', '']);
        triggerShake();
        setVerifying(false);
        // Set lockout for 15 minutes from now — countdown is cosmetic only
        // Server will continue to block all requests regardless of client state
        setLockoutExpiresAt(Date.now() + 15 * 60 * 1000);
        setLockoutCountdown(15 * 60);
        return;
      }

      if (!res.ok || !data.success) {
        const remaining = data.attemptsRemaining ?? null;
        setAttemptsRemaining(remaining);
        if (remaining === 0) {
          setLocked(true);
          setPinError('Enclave locked. Too many failed attempts. Wait 15 minutes.');
        } else {
          if (data.error?.includes('expired')) {
            window.location.href = '/connect';
            return;
          }
          setPinError(data.error || `Incorrect PIN. ${remaining !== null ? `${remaining} attempts remaining.` : ''}`);
        }
        setPin(['', '', '', '', '', '']);
        triggerShake();
        setTimeout(() => pinRefs.current[0]?.focus(), 100);
        setVerifying(false);
        return;
      }

      // ✅ Verified
      writeClearance(data.clearanceToken, data.clearanceTs);
      setVerifying(false);
      setCleared(true);
      if (onVerified) onVerified(data.clearanceToken);

      // If first-time user, prompt them to set their own PIN
      if (data.isFirstTimeUser) {
        setIsFirstTime(true);
        setSettingPin(true);
      }

    } catch (err) {
      console.error('[TuringShieldGate] Network error:', err);
      setPinError('Network error. Please check your connection and try again.');
      triggerShake();
      setVerifying(false);
    }
  }, [verifying, locked, onVerified, triggerShake]);

  const handlePinChange = useCallback((
    index: number,
    value: string,
    pinState: string[],
    setPinState: React.Dispatch<React.SetStateAction<string[]>>,
    refs: React.MutableRefObject<(HTMLInputElement | null)[]>,
    onComplete?: (digits: string[]) => void,
  ) => {
    if (!/^\d*$/.test(value)) return;
    setPinError(null);
    setPinSetError(null);

    const newPinState = [...pinState];
    newPinState[index] = value.slice(-1);
    setPinState(newPinState);

    if (value && index < 5) {
      setTimeout(() => refs.current[index + 1]?.focus(), 0);
    }

    if (index === 5 && value) {
      const full = [...newPinState];
      full[5] = value.slice(-1);
      if (full.every(d => d !== '') && onComplete) {
        onComplete(full);
      }
    }
  }, []);

  const handleKeyDown = useCallback((
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
    pinState: string[],
    setPinState: React.Dispatch<React.SetStateAction<string[]>>,
    refs: React.MutableRefObject<(HTMLInputElement | null)[]>,
    onComplete?: () => void,
  ) => {
    if (e.key === 'Backspace') {
      if (!pinState[index] && index > 0) {
        const newPinState = [...pinState];
        newPinState[index - 1] = '';
        setPinState(newPinState);
        setTimeout(() => refs.current[index - 1]?.focus(), 0);
      }
    } else if (e.key === 'Enter') {
      if (pinState.every(d => d !== '') && onComplete) onComplete();
    }
  }, []);

  // ─── Set new PIN flow ─────────────────────────────────────────────────────
  const handleSetPin = useCallback(async () => {
    const code = newPin.join('');
    const conf = confirmPin.join('');

    if (code.length !== 6) { setPinSetError('Enter a 6-digit PIN.'); return; }

    if (pinSetStep === 'new') {
      setPinSetStep('confirm');
      setConfirmPin(['', '', '', '', '', '']);
      setTimeout(() => confirmPinRefs.current[0]?.focus(), 100);
      return;
    }

    // Confirm step
    if (code !== conf) {
      setPinSetError('PINs do not match. Please start over.');
      setPinSetStep('new');
      setNewPin(['', '', '', '', '', '']);
      setConfirmPin(['', '', '', '', '', '']);
      setTimeout(() => newPinRefs.current[0]?.focus(), 100);
      return;
    }

    setSettingPin(false);
    try {
      const res = await fetch('/api/auth/enclave-pin', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPin: code }),
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok) {
        setPinSetSuccess(true);
        setSettingPin(true); // Keep overlay open to show success
      } else {
        if (data.error?.includes('expired')) {
          window.location.href = '/connect';
          return;
        }
        setPinSetError(data.error || 'Failed to update PIN.');
        setSettingPin(true);
      }
    } catch (err) {
      setPinSetError('Network error while saving PIN.');
      setSettingPin(true);
    }
  }, [newPin, confirmPin, pinSetStep]);

  // Prevent Hydration Mismatch
  if (!mounted) return null;

  // ─── Set PIN Overlay (shown after first successful login with default PIN) ──
  if (cleared && settingPin) {
    return (
      <>
        {children}
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="w-full max-w-[380px] bg-white rounded-[28px] p-7 shadow-2xl flex flex-col items-center text-center"
          >
            <div className="w-14 h-14 rounded-full bg-indigo-50 flex items-center justify-center mb-4 text-indigo-600">
              <Lock size={24} strokeWidth={2.5} />
            </div>
            <h2 className="text-[20px] font-black tracking-tight mb-1">
              {pinSetSuccess ? 'PIN Saved!' : 'Set Your Enclave PIN'}
            </h2>
            {pinSetSuccess ? (
              <>
                <p className="text-[13px] text-[#555] mb-5 leading-relaxed">
                  Your personal 6-digit enclave PIN has been saved securely. Use it every session.
                </p>
                <button
                  onClick={() => setSettingPin(false)}
                  className="w-full py-3 bg-indigo-600 text-white rounded-2xl font-black text-[13px] uppercase tracking-[0.1em]"
                >
                  <CheckCircle2 size={14} className="inline mr-2" />
                  Continue to Enclave
                </button>
              </>
            ) : (
              <>
                <p className="text-[12px] text-[#666] mb-5 leading-relaxed px-2">
                  {isFirstTime
                    ? 'You logged in with the default PIN. Set your own personal PIN now for maximum security.'
                    : `${pinSetStep === 'confirm' ? 'Confirm your new PIN.' : 'Enter a new 6-digit PIN.'}`
                  }
                </p>
                {pinSetError && (
                  <p className="text-red-500 text-[11px] font-bold mb-3 flex items-center gap-1">
                    <AlertTriangle size={11} /> {pinSetError}
                  </p>
                )}
                <div className="flex gap-2 mb-5 justify-center">
                  {(pinSetStep === 'new' ? newPin : confirmPin).map((digit, i) => (
                    <input
                      key={i}
                      ref={el => { (pinSetStep === 'new' ? newPinRefs : confirmPinRefs).current[i] = el; }}
                      type="tel"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      onChange={e => handlePinChange(
                        i, e.target.value,
                        pinSetStep === 'new' ? newPin : confirmPin,
                        pinSetStep === 'new' ? setNewPin : setConfirmPin,
                        pinSetStep === 'new' ? newPinRefs : confirmPinRefs,
                      )}
                      onKeyDown={e => handleKeyDown(
                        i, e,
                        pinSetStep === 'new' ? newPin : confirmPin,
                        pinSetStep === 'new' ? setNewPin : setConfirmPin,
                        pinSetStep === 'new' ? newPinRefs : confirmPinRefs,
                        handleSetPin,
                      )}
                      className="w-11 h-14 text-center text-[18px] font-black rounded-xl outline-none border-2 border-indigo-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 bg-indigo-50 text-indigo-700 transition-all"
                      style={{ height: '56px' }}
                    />
                  ))}
                </div>
                <button
                  onClick={handleSetPin}
                  disabled={(pinSetStep === 'new' ? newPin : confirmPin).some(d => d === '')}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-[13px] uppercase tracking-[0.1em] transition-all disabled:opacity-40 disabled:cursor-not-allowed mb-2"
                >
                  {pinSetStep === 'new' ? 'Next: Confirm PIN →' : 'Save PIN'}
                </button>
                <button
                  onClick={() => setSettingPin(false)}
                  className="w-full py-2.5 text-[11px] text-[#999] hover:text-black transition-colors"
                >
                  Skip for now (use default PIN next time)
                </button>
              </>
            )}
          </motion.div>
        </div>
      </>
    );
  }

  // Already cleared — render children immediately
  if (cleared) return <>{children}</>;

  // ─── PIN Gate ─────────────────────────────────────────────────────────────
  return (
    <div
      className="fixed inset-0 z-[9000] overflow-y-auto bg-white font-sans text-[#0A0A0A] p-4 flex flex-col items-center select-none"
      style={{ WebkitOverflowScrolling: 'touch' }}
    >
      <div className="flex-1 flex flex-col items-center w-full min-h-full pb-[10vh]">
        {/* Background ambient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-indigo-500/5 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute top-1/4 right-1/4 w-[200px] h-[200px] bg-purple-500/4 blur-[80px] rounded-full pointer-events-none" />

        <AnimatePresence mode="wait">
          <motion.div
            key="enclave-gate"
            initial={{ scale: 0.94, opacity: 0, y: 24 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.94, opacity: 0, y: -16 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            style={{ willChange: 'transform, opacity' }}
            className="my-auto relative z-10 w-full max-w-[400px] border border-[#EBEBEB] bg-white rounded-[28px] p-7 shadow-[0_32px_80px_rgba(0,0,0,0.12)] flex flex-col items-center text-center"
          >
          {/* Icon */}
          <div className="relative w-[72px] h-[72px] mb-5 flex items-center justify-center">
            <div className={`absolute inset-0 rounded-full opacity-15 animate-pulse ${locked ? 'bg-red-500' : 'bg-gradient-to-tr from-indigo-500 to-purple-600'}`} />
            <div className="absolute inset-[3px] rounded-full border border-indigo-400/25" />
            <div className={`w-14 h-14 rounded-full bg-white shadow-[0_0_32px_rgba(99,102,241,0.25)] flex items-center justify-center relative z-10 ${locked ? 'text-red-500' : 'text-indigo-600'}`}>
              {locked ? <Lock size={26} strokeWidth={2.5} /> : <Key size={26} strokeWidth={2.5} />}
            </div>
          </div>

          {/* Title */}
          <h2 className="text-[22px] font-black tracking-tight text-black mb-1 leading-tight">
            {verifying ? 'Verifying...' : locked ? 'Enclave Locked' : 'Enclave Authentication'}
          </h2>
          <div className={`text-[10px] font-bold uppercase tracking-[0.2em] mb-5 flex items-center justify-center gap-1.5 ${locked ? 'text-red-500' : 'text-indigo-600'}`}>
            <Cpu size={10} strokeWidth={3} />
            {locked ? 'Brute-Force Protection Active' : 'Secure Enclave Active'}
          </div>

          {/* Description */}
          <p className="text-[13px] text-[#666] font-medium leading-[1.6] mb-6 px-1">
            {locked
              ? 'Too many failed attempts. Enclave is temporarily locked for security. Please wait before trying again.'
              : 'Enter your 6-digit Enclave PIN to verify identity and access the sovereign network.'
            }
          </p>

          {!locked && (
            <>
              {/* PIN inputs */}
              <motion.div
                animate={shake ? { x: [0, -10, 10, -10, 10, 0] } : { x: 0 }}
                transition={{ duration: 0.4 }}
                className="flex gap-2 mb-4 w-full justify-center"
              >
                {pin.map((digit, i) => (
                  <input
                    key={i}
                    ref={el => { pinRefs.current[i] = el; }}
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    autoComplete="one-time-code"
                    maxLength={1}
                    value={digit}
                    onChange={e => handlePinChange(i, e.target.value, pin, setPin, pinRefs, handleSubmit)}
                    onKeyDown={e => handleKeyDown(i, e, pin, setPin, pinRefs, () => handleSubmit(pin))}
                    disabled={verifying}
                    className={`w-11 h-13 sm:w-12 sm:h-14 text-center text-[18px] font-black rounded-xl outline-none transition-all duration-200 disabled:opacity-50
                      ${pinError
                        ? 'bg-red-50 border-2 border-red-400 text-red-600'
                        : digit
                        ? 'bg-indigo-50 border-2 border-indigo-500 text-indigo-700'
                        : 'bg-black/[0.04] border border-black/10 text-black focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'
                      }`}
                    style={{ height: '56px' }}
                  />
                ))}
              </motion.div>

              {/* Error */}
              <AnimatePresence>
                {pinError && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-1.5 text-red-600 text-[11px] font-bold uppercase tracking-widest mb-4 text-center"
                  >
                    <AlertTriangle size={12} className="shrink-0" />
                    {pinError}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Attempts indicator */}
              {attemptsRemaining !== null && attemptsRemaining <= 3 && !locked && (
                <p className="text-orange-500 text-[10px] font-bold uppercase tracking-widest mb-3">
                  ⚠ {attemptsRemaining} attempt{attemptsRemaining !== 1 ? 's' : ''} remaining before lockout
                </p>
              )}

              {/* Submit button */}
              <button
                onClick={() => handleSubmit(pin)}
                disabled={pin.some(d => d === '') || verifying}
                className="w-full h-[52px] bg-[#0A0A0A] hover:bg-black/80 text-white rounded-2xl font-black text-[13px] uppercase tracking-[0.15em] transition-all duration-200 active:scale-[0.97] shadow-lg shadow-black/15 flex items-center justify-center gap-3 disabled:opacity-40 disabled:cursor-not-allowed mb-6"
              >
                {verifying ? (
                  <><Loader2 size={16} className="animate-spin" /> Verifying...</>
                ) : (
                  <><Shield size={16} /> Confirm Enclave Access</>
                )}
              </button>
            </>
          )}

          {locked && (
            <div className="w-full flex flex-col items-center gap-3 mb-6">
              <div className="flex items-center gap-2 text-[12px] text-red-400 font-mono">
                <RefreshCw size={12} className="animate-spin" />
                {/* [SECURITY FIX] Countdown is cosmetic — server enforces the real lockout */}
                {lockoutCountdown > 0
                  ? `Lockout expires in ${Math.floor(lockoutCountdown / 60)}:${String(lockoutCountdown % 60).padStart(2, '0')}`
                  : 'Lockout active. Server will verify readiness.'}
              </div>
              {/* [SECURITY FIX] Removed "Try again anyway" button — it allowed infinite attempts
                   by resetting client-side state only. The server enforces brute-force protection
                   independently. Attempting again while locked will receive a 429 from the server. */}
              {lockoutCountdown === 0 && (
                <button
                  onClick={() => { setPinError(null); setPin(['', '', '', '', '', '']); }}
                  className="w-full py-3 border border-black/10 rounded-2xl text-[12px] font-bold text-[#666] hover:bg-black/[0.03] transition-all"
                >
                  Try Again
                </button>
              )}
            </div>
          )}

          {/* Audit trail */}
          <div className="w-full flex flex-col gap-2 text-left bg-black/[0.02] px-4 py-4 rounded-2xl border border-black/[0.06]">
            <div className="text-[9px] uppercase tracking-[0.25em] text-black/35 font-black mb-1">Security Audit Trail</div>
            {[
              'Server-side PIN verification (no local bypass)',
              'HMAC-SHA256 • Timing-safe comparison',
              'Brute-force protection: 5 attempts / 15 min',
            ].map(item => (
              <div key={item} className="flex items-center gap-2 text-[11px] font-medium text-[#555]">
                <CheckCircle2 size={12} className="text-indigo-500 shrink-0" />
                {item}
              </div>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
      </div>
    </div>
  );
}
