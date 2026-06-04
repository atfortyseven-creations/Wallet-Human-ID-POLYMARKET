"use client";

/**
 * WhaleStreamContext
 *
 * Provides real-time whale alert events from /api/whale-stream (SSE)
 * to any component in the React tree.
 *
 * Usage:
 *   const { events, isConnected, connectionError } = useWhaleStream();
 *
 * Features:
 *  - Automatic reconnect with exponential backoff (max 30s)
 *  - Rolling buffer of last MAX_EVENTS events
 *  - isConnected tracks live SSE state
 *  - connectionError surfaces failures non-intrusively
 */

import React, {
    createContext,
    useContext,
    useEffect,
    useRef,
    useState,
    useCallback,
} from 'react';

//  Types 

export interface WhaleEvent {
    id: string;
    hash: string;
    from: string;
    to: string;
    asset: string;
    amount: string;
    usdValue: string;
    chain: string;
    type: string;
    timestamp: string;
}

interface WhaleStreamState {
    events: WhaleEvent[];
    isConnected: boolean;
    connectionError: string | null;
    clearEvents: () => void;
}

//  Context 

const WhaleStreamContext = createContext<WhaleStreamState>({
    events: [],
    isConnected: false,
    connectionError: null,
    clearEvents: () => {},
});

const MAX_EVENTS = 200; // Rolling buffer cap to prevent memory growth
const BASE_RECONNECT_MS = 1_000;
const MAX_RECONNECT_MS = 30_000;

//  Provider 

export function WhaleStreamProvider({ children }: { children: React.ReactNode }) {
    const [events, setEvents] = useState<WhaleEvent[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const [connectionError, setConnectionError] = useState<string | null>(null);

    const esRef = useRef<EventSource | null>(null);
    const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const reconnectDelay = useRef(BASE_RECONNECT_MS);
    const isMounted = useRef(true);

    const connect = useCallback(() => {
        if (!isMounted.current) return;
        if (typeof window === 'undefined') return;

        // Clean up any existing connection
        if (esRef.current) {
            esRef.current.close();
            esRef.current = null;
        }

        const es = new EventSource('/api/whale-stream');
        esRef.current = es;

        es.addEventListener('connected', () => {
            if (!isMounted.current) return;
            setIsConnected(true);
            setConnectionError(null);
            reconnectDelay.current = BASE_RECONNECT_MS; // Reset backoff on success
        });

        es.addEventListener('whale', (e: MessageEvent) => {
            if (!isMounted.current) return;
            try {
                const raw = JSON.parse(e.data) as Omit<WhaleEvent, 'id'>;
                const event: WhaleEvent = {
                    ...raw,
                    id: (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : `${Date.now().toString(36)}-${Math.floor(Math.random() * 1e9).toString(36)}`,
                };
                setEvents(prev => {
                    const next = [event, ...prev];
                    return next.length > MAX_EVENTS ? next.slice(0, MAX_EVENTS) : next;
                });
            } catch {}
        });

        es.addEventListener('heartbeat', () => {
            // Unconditional  avoids stale closure over initial isConnected = false
            if (!isMounted.current) return;
            setIsConnected(true);
        });

        es.addEventListener('error', (e: MessageEvent) => {
            if (!isMounted.current) return;
            try {
                const data = JSON.parse(e.data);
                setConnectionError(data.message ?? 'Stream error');
            } catch {}
        });

        es.onerror = () => {
            if (!isMounted.current) return;
            setIsConnected(false);
            es.close();
            esRef.current = null;

            // Exponential backoff reconnect
            const delay = reconnectDelay.current;
            reconnectDelay.current = Math.min(delay * 2, MAX_RECONNECT_MS);

            reconnectTimer.current = setTimeout(connect, delay);
        };
    }, []);

    useEffect(() => {
        isMounted.current = true;
        connect();

        return () => {
            isMounted.current = false;
            if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
            if (esRef.current) {
                esRef.current.close();
                esRef.current = null;
            }
        };
    }, [connect]);

    const clearEvents = useCallback(() => setEvents([]), []);

    return (
        <WhaleStreamContext.Provider value={{ events, isConnected, connectionError, clearEvents }}>
            {children}
        </WhaleStreamContext.Provider>
    );
}

//  Hook 

export function useWhaleStream(): WhaleStreamState {
    return useContext(WhaleStreamContext);
}
