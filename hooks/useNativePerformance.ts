/**
 * Humanity Ledger Enterprise Core - useNativePerformance
 *
 * React hook that provides hardware-accelerated, mobile-native-feel
 * interactions to any component in the Humanity Ledger ecosystem.
 *
 * Features:
 * - Haptic feedback on button press
 * - Network quality monitoring (adapts XMTP polling rates)
 * - RAF-debounced scroll handlers
 * - Safe-area insets (iPhone Dynamic Island, Android nav bar)
 */

'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import {
  triggerHaptic,
  getNetworkQuality,
  rafDebounce,
  getSafeAreaInsets,
  type HapticStyle,
  type NetworkQuality,
} from '@/lib/core/NativePerformance';

interface SafeAreaInsets {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

interface UseNativePerformanceReturn {
  /** Fire haptic feedback. No-op on desktop. */
  haptic: (style?: HapticStyle) => void;
  /** Current network quality tier. Reactive — updates on connection change. */
  networkQuality: NetworkQuality;
  /** Whether we're on a poor/offline connection */
  isConnectionPoor: boolean;
  /** Safe-area insets for proper iPhone notch / Android nav bar padding */
  safeArea: SafeAreaInsets;
  /** RAF-debounced version of any handler — safe for scroll/resize listeners */
  rafDebounce: typeof rafDebounce;
  /** True if currently on a touch device (mobile or tablet) */
  isTouchDevice: boolean;
}

export function useNativePerformance(): UseNativePerformanceReturn {
  const [networkQuality, setNetworkQuality] = useState<NetworkQuality>('good');
  const [safeArea, setSafeArea] = useState<SafeAreaInsets>({ top: 0, bottom: 0, left: 0, right: 0 });
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const isInitialized = useRef(false);

  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    // Initial reads
    setNetworkQuality(getNetworkQuality());
    setSafeArea(getSafeAreaInsets());
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);

    // Network quality listener
    const conn = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    const handleConnectionChange = () => setNetworkQuality(getNetworkQuality());

    if (conn) {
      conn.addEventListener('change', handleConnectionChange);
    }
    window.addEventListener('online', handleConnectionChange);
    window.addEventListener('offline', handleConnectionChange);

    // Re-measure safe area on orientation change (landscape/portrait switch)
    const handleOrientationChange = rafDebounce(() => {
      setSafeArea(getSafeAreaInsets());
    });
    window.addEventListener('orientationchange', handleOrientationChange);
    window.screen?.orientation?.addEventListener?.('change', handleOrientationChange);

    return () => {
      if (conn) conn.removeEventListener('change', handleConnectionChange);
      window.removeEventListener('online', handleConnectionChange);
      window.removeEventListener('offline', handleConnectionChange);
      window.removeEventListener('orientationchange', handleOrientationChange);
      window.screen?.orientation?.removeEventListener?.('change', handleOrientationChange);
    };
  }, []);

  const haptic = useCallback((style: HapticStyle = 'light') => {
    triggerHaptic(style);
  }, []);

  const isConnectionPoor = networkQuality === 'poor' || networkQuality === 'offline';

  return {
    haptic,
    networkQuality,
    isConnectionPoor,
    safeArea,
    rafDebounce,
    isTouchDevice,
  };
}
