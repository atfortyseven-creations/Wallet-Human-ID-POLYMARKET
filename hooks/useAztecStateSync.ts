"use client";

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';

const LEGACY_ROUTE_MAP = new Set([
    'dashboard', 'watchlist', 'firehose', 'sov-intel', 'live-port',
    'whale-port', 'graph', 'vault', 'trade', 'forensics',
    'reputation', 'scanner'
]);

const DEFAULT_ROUTE = 'gold';

/**
 * useAztecStateSync
 * 
 * A robust URL-to-State synchronizer. This hook intercepts legacy routes,
 * enforces strict typing on the active dashboard tab, and couples the
 * URL parameters with the internal React state in a highly predictable manner.
 * 
 * @param onStateChange Callback triggered whenever the state mutates, useful for forcing reconciliation.
 */
export function useAztecStateSync(onStateChange: () => void) {
    const searchParams = useSearchParams();
    
    const resolveInitialRoute = (): string => {
        const param = searchParams.get('tab');
        if (!param) return DEFAULT_ROUTE;
        if (LEGACY_ROUTE_MAP.has(param)) return DEFAULT_ROUTE;
        return param;
    };

    const [activeRoute, setActiveRoute] = useState<string>(resolveInitialRoute);

    // Sync from URL changes (browser back/forward)
    useEffect(() => {
        const param = searchParams.get('tab');
        if (param && param !== activeRoute) {
            if (LEGACY_ROUTE_MAP.has(param)) {
                setActiveRoute(DEFAULT_ROUTE);
                window.history.replaceState(null, '', `?tab=${DEFAULT_ROUTE}`);
            } else {
                setActiveRoute(param);
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams]);

    // Programmatic mutation
    const mutateRoute = useCallback((newRoute: string) => {
        if (newRoute === activeRoute) return;
        setActiveRoute(newRoute);
        onStateChange();
        window.history.pushState(null, '', `?tab=${newRoute}`);
    }, [activeRoute, onStateChange]);

    return {
        activeRoute,
        mutateRoute
    };
}
