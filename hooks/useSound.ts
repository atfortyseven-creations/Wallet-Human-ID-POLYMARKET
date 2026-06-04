"use client";

import { useCallback } from 'react';
import { useSettingsStore } from '@/lib/store/useSettingsStore';

type SoundType = 'whale-alert' | 'activity' | 'achievement' | 'level-up' | 'notification';

export function useSound() {
  const { audioAlerts, hapticFeedback } = useSettingsStore();

  const playSound = useCallback((type: SoundType, volume: number = 0.5) => {
    return; // Force silence per user request
  }, [audioAlerts]);

  const vibrate = useCallback((pattern: number | number[] = 50) => {
    // Respect hapticFeedback setting
    if (!hapticFeedback) return;
    if (typeof navigator === 'undefined' || !navigator.vibrate) return;
    try {
      navigator.vibrate(pattern);
    } catch {
      // Not supported on this device  silent fail
    }
  }, [hapticFeedback]);

  return { playSound, vibrate };
}
