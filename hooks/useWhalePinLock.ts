// hooks/useWhalePinLock.ts
// Biometric/PIN-based screen lock for Ledger Chat sessions
// Complies with App Store Guideline 5.1.1 (Local Authentication)

import { useState, useEffect, useCallback, useRef } from 'react';
import { vault } from '@/lib/core/SecureVault';
import { auditLog } from '@/lib/utils/e2eAuditLog';

const PIN_VAULT_KEY_PREFIX = 'whale_pin_hash_';
const LOCK_TIMEOUT_KEY = 'whale_lock_timeout';
const DEFAULT_LOCK_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes

// Production-grade PBKDF2 PIN hashing
async function hashPIN(pin: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(pin),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );
  
  const hashBuffer = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: encoder.encode('whale-pin-secure-salt-v2'),
      iterations: 250_000,
      hash: 'SHA-256',
    },
    keyMaterial,
    256
  );
  
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export interface PinLockState {
  isLocked: boolean;
  hasPIN: boolean;
  isLoading: boolean;
  lockError: string | null;
}

export function useWhalePinLock(address: string) {
  const [isLocked, setIsLocked] = useState(false);
  const [hasPIN, setHasPIN] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [lockError, setLockError] = useState<string | null>(null);
  const lockTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const getVaultKey = useCallback(() => `${PIN_VAULT_KEY_PREFIX}${address?.toLowerCase()}`, [address]);

  // Initialize: check if a PIN is stored
  useEffect(() => {
    if (!address) {
      setIsLoading(false);
      return;
    }

    (async () => {
      try {
        const stored = await vault.getItem(getVaultKey());
        setHasPIN(!!stored);
        // Lock if PIN exists and last lock was more than timeout ago
        if (stored) {
          const lastUnlock = parseInt(localStorage.getItem(`whale_last_unlock_${address}`) ?? '0', 10);
          const timeout = parseInt(localStorage.getItem(LOCK_TIMEOUT_KEY) ?? String(DEFAULT_LOCK_TIMEOUT_MS), 10);
          if (Date.now() - lastUnlock > timeout) {
            setIsLocked(true);
          }
        }
      } catch {
        setHasPIN(false);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [address, getVaultKey]);

  // Auto-lock on inactivity
  const resetLockTimer = useCallback(() => {
    if (!hasPIN) return;
    if (lockTimerRef.current) clearTimeout(lockTimerRef.current);
    const timeout = parseInt(localStorage.getItem(LOCK_TIMEOUT_KEY) ?? String(DEFAULT_LOCK_TIMEOUT_MS), 10);
    lockTimerRef.current = setTimeout(() => {
      setIsLocked(true);
      auditLog.log('app_locked', { actor: address });
    }, timeout);
  }, [hasPIN, address]);

  useEffect(() => {
    if (!hasPIN || typeof window === 'undefined') return;
    const events = ['mousedown', 'keydown', 'touchstart', 'scroll'];
    const handler = () => resetLockTimer();
    events.forEach(e => window.addEventListener(e, handler, { passive: true }));
    resetLockTimer();
    return () => {
      events.forEach(e => window.removeEventListener(e, handler));
      if (lockTimerRef.current) clearTimeout(lockTimerRef.current);
    };
  }, [hasPIN, resetLockTimer]);

  const setPIN = useCallback(async (pin: string): Promise<boolean> => {
    if (pin.length < 4 || pin.length > 8) {
      setLockError('PIN must be 4-8 digits.');
      return false;
    }
    try {
      const hash = await hashPIN(pin);
      await vault.setItem(getVaultKey(), hash);
      setHasPIN(true);
      auditLog.log('pin_set', { actor: address });
      return true;
    } catch (e) {
      setLockError('Failed to set PIN. Try again.');
      return false;
    }
  }, [address, getVaultKey]);

  const verifyPIN = useCallback(async (pin: string): Promise<boolean> => {
    setLockError(null);
    try {
      const stored = await vault.getItem(getVaultKey());
      if (!stored) {
        setLockError('No PIN configured.');
        return false;
      }
      const hash = await hashPIN(pin);
      if (hash === stored) {
        setIsLocked(false);
        localStorage.setItem(`whale_last_unlock_${address}`, String(Date.now()));
        auditLog.log('pin_verified', { actor: address });
        resetLockTimer();
        return true;
      } else {
        setLockError('Incorrect PIN. Try again.');
        auditLog.log('app_locked', { actor: address, metadata: { reason: 'wrong_pin' } });
        return false;
      }
    } catch {
      setLockError('Verification failed.');
      return false;
    }
  }, [address, getVaultKey, resetLockTimer]);

  const removePIN = useCallback(async (): Promise<void> => {
    await vault.removeItem(getVaultKey());
    setHasPIN(false);
    setIsLocked(false);
    auditLog.log('pin_changed', { actor: address, metadata: { action: 'removed' } });
  }, [address, getVaultKey]);

  const lockNow = useCallback(() => {
    if (!hasPIN) return;
    setIsLocked(true);
    auditLog.log('app_locked', { actor: address });
  }, [hasPIN, address]);

  return {
    isLocked,
    hasPIN,
    isLoading,
    lockError,
    setPIN,
    verifyPIN,
    removePIN,
    lockNow,
    resetLockTimer,
  };
}
