"use client";

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';

// These old route names get redirected to the default
const LEGACY_ROUTE_MAP = new Set([
    'watchlist', 'firehose', 'sov-intel', 'live-port',
    'whale-port', 'graph', 'vault', 'attest', 'forensics',
    'reputation', 'scanner'
]);

// Route aliases / redirects — old route → new route
const ROUTE_ALIAS: Record<string, string> = {
    'billing': 'node-allocation',
    'upgrade': 'node-allocation',
};

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
        if (ROUTE_ALIAS[param]) return ROUTE_ALIAS[param];
        if (LEGACY_ROUTE_MAP.has(param)) return DEFAULT_ROUTE;
        return param;
    };

    const [activeRoute, setActiveRoute] = useState<string>(resolveInitialRoute);

    // Sync from URL changes (browser back/forward)
    useEffect(() => {
        const param = searchParams.get('tab');
        if (param && param !== activeRoute) {
            if (ROUTE_ALIAS[param]) {
                setActiveRoute(ROUTE_ALIAS[param]);
                window.history.replaceState(null, '', `?tab=${ROUTE_ALIAS[param]}`);
            } else if (LEGACY_ROUTE_MAP.has(param)) {
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
