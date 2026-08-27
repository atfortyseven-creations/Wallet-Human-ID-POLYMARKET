// hooks/useLedgerChatPresence.ts
// Fully local presence system using BroadcastChannel API (no server needed)
// Tabs/windows in the same origin share presence state in real-time

import { useState, useEffect, useRef, useCallback } from 'react';

export interface PeerPresence {
  status: 'online' | 'away' | 'offline';
  lastSeen: number | null;
  isTyping: boolean;
  peer: string | null;
}

export interface PresenceBroadcastPayload {
  type: 'heartbeat' | 'typing_start' | 'typing_stop' | 'active_peer' | 'away' | 'bye';
  from: string;
  to?: string;
  timestamp: number;
}

const PRESENCE_CHANNEL = 'whale-presence';
const HEARTBEAT_INTERVAL_MS = 10_000; // 10s
const AWAY_THRESHOLD_MS = 30_000;     // 30s of no heartbeats = away
const OFFLINE_THRESHOLD_MS = 60_000;  // 60s = offline

// Shared cross-tab channel
let broadcastChannel: BroadcastChannel | null = null;
function getChannel(): BroadcastChannel | null {
  if (typeof window === 'undefined') return null;
  if (!broadcastChannel) {
    try {
      broadcastChannel = new BroadcastChannel(PRESENCE_CHANNEL);
    } catch {}
  }
  return broadcastChannel;
}

export function useLedgerChatPresence(myAddress: string, activePeer: string | null) {
  const [peerStatus, setPeerStatus] = useState<PeerPresence>({
    status: 'offline',
    lastSeen: null,
    isTyping: false,
    peer: activePeer,
  });

  const peerHeartbeats = useRef<Map<string, number>>(new Map());
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const myAddressRef = useRef(myAddress);
  const activePeerRef = useRef(activePeer);

  myAddressRef.current = myAddress;
  activePeerRef.current = activePeer;

  const broadcast = useCallback((payload: Omit<PresenceBroadcastPayload, 'from' | 'timestamp'>) => {
    const ch = getChannel();
    if (!ch || !myAddressRef.current) return;
    try {
      ch.postMessage({
        ...payload,
        from: myAddressRef.current,
        timestamp: Date.now(),
      } satisfies PresenceBroadcastPayload);
    } catch {}
  }, []);

  const broadcastTyping = useCallback(() => {
    broadcast({ type: 'typing_start', to: activePeerRef.current ?? undefined });

    // Auto-stop typing signal after 3 seconds
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      broadcast({ type: 'typing_stop', to: activePeerRef.current ?? undefined });
    }, 3000);
  }, [broadcast]);

  const evaluatePeerStatus = useCallback(() => {
    if (!activePeerRef.current) {
      setPeerStatus({ status: 'offline', lastSeen: null, isTyping: false, peer: null });
      return;
    }

    const lastHeartbeat = peerHeartbeats.current.get(activePeerRef.current.toLowerCase());
    if (!lastHeartbeat) {
      setPeerStatus(prev => ({ ...prev, status: 'offline', peer: activePeerRef.current }));
      return;
    }

    const age = Date.now() - lastHeartbeat;
    if (age < AWAY_THRESHOLD_MS) {
      setPeerStatus(prev => ({ ...prev, status: 'online', lastSeen: lastHeartbeat, peer: activePeerRef.current }));
    } else if (age < OFFLINE_THRESHOLD_MS) {
      setPeerStatus(prev => ({ ...prev, status: 'away', lastSeen: lastHeartbeat, peer: activePeerRef.current }));
    } else {
      setPeerStatus(prev => ({ ...prev, status: 'offline', lastSeen: lastHeartbeat, peer: activePeerRef.current }));
    }
  }, []);

  useEffect(() => {
    if (!myAddress) return;

    const ch = getChannel();
    if (!ch) return;

    const handleMessage = (event: MessageEvent<PresenceBroadcastPayload>) => {
      const { type, from, to, timestamp } = event.data;
      if (!from || from.toLowerCase() === myAddress.toLowerCase()) return;

      const fromKey = from.toLowerCase();

      switch (type) {
        case 'heartbeat':
        case 'active_peer':
          peerHeartbeats.current.set(fromKey, timestamp);
          // If this is from our active peer, re-evaluate
          if (activePeerRef.current?.toLowerCase() === fromKey) {
            evaluatePeerStatus();
          }
          break;

        case 'typing_start':
          if (to?.toLowerCase() === myAddress.toLowerCase() && activePeerRef.current?.toLowerCase() === fromKey) {
            setPeerStatus(prev => ({ ...prev, isTyping: true }));
          }
          break;

        case 'typing_stop':
          if (to?.toLowerCase() === myAddress.toLowerCase()) {
            setPeerStatus(prev => ({ ...prev, isTyping: false }));
          }
          break;

        case 'away':
          if (activePeerRef.current?.toLowerCase() === fromKey) {
            setPeerStatus(prev => ({ ...prev, status: 'away', lastSeen: timestamp }));
          }
          break;

        case 'bye':
          if (activePeerRef.current?.toLowerCase() === fromKey) {
            setPeerStatus(prev => ({ ...prev, status: 'offline', lastSeen: timestamp }));
          }
          break;
      }
    };

    ch.addEventListener('message', handleMessage);

    // Start heartbeat
    const sendHeartbeat = () => {
      broadcast({ type: 'heartbeat', to: activePeerRef.current ?? undefined });
    };
    sendHeartbeat();
    heartbeatRef.current = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL_MS);

    // Evaluating peer every 10s
    const evalInterval = setInterval(evaluatePeerStatus, 10_000);

    // On visibility change
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        broadcast({ type: 'heartbeat' });
        evaluatePeerStatus();
      } else {
        broadcast({ type: 'away' });
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // On page close
    const handleBeforeUnload = () => {
      broadcast({ type: 'bye' });
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      ch.removeEventListener('message', handleMessage);
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      clearInterval(evalInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      broadcast({ type: 'bye' });
    };
  }, [myAddress, broadcast, evaluatePeerStatus]);

  // Re-evaluate when activePeer changes
  useEffect(() => {
    evaluatePeerStatus();
  }, [activePeer, evaluatePeerStatus]);

  return { peerStatus, broadcastTyping };
}
