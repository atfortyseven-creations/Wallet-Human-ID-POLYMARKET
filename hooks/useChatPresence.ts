"use client";
import { useEffect, useRef, useCallback } from 'react';

const HEARTBEAT_INTERVAL = 30_000; // 30s heartbeat
const PRESENCE_URL = '/api/ledger/presence';

/**
 * Sends periodic presence heartbeats to keep the user's online status alive.
 * Auto-sets to 'offline' on unmount/disconnect.
 */
export function useChatPresence(address: string | null) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const updatePresence = useCallback(async (status: 'online' | 'away' | 'offline') => {
    if (!address) return;
    try {
      await fetch(PRESENCE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, status }),
        credentials: 'include',
      });
    } catch { /* silent fail */ }
  }, [address]);

  useEffect(() => {
    if (!address) return;
    
    // Mark online immediately
    updatePresence('online');

    // Heartbeat loop
    intervalRef.current = setInterval(() => updatePresence('online'), HEARTBEAT_INTERVAL);

    // Mark offline on page hide/unload
    const handleHide = () => updatePresence('away');
    const handleShow = () => updatePresence('online');
    
    document.addEventListener('visibilitychange', () => {
      document.hidden ? handleHide() : handleShow();
    });

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      updatePresence('offline');
    };
  }, [address, updatePresence]);
}
