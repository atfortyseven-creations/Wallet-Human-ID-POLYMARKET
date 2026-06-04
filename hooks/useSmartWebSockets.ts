"use client";

import { useEffect } from 'react';
import { useWebSocketStore } from '@/lib/store/websocket-store';

/**
 * [LEGENDARY] Enhanced Smart WebSocket Hook
 * - Refactored for Phase 3 PWA/Zustand Global Architecture 
 * - Now wraps the global useWebSocketStore
 */
export function useSmartWebSockets(address: string | undefined, enabled = true) {
    const { connectAlchemy, disconnect, lastAlchemyTx, isConnected } = useWebSocketStore();

    useEffect(() => {
        if (!address || !enabled) return;
        connectAlchemy(address);

        // Cleanup disabled intentionally to maintain global persistence across PWA routes
        // Only disconnect if explicitly requested by unmounting the root provider (which we don't do)
    }, [address, enabled, connectAlchemy]);

    return { lastTx: lastAlchemyTx, connected: isConnected };
}
