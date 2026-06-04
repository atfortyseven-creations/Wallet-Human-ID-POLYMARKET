"use client";

import { useState, useEffect, useCallback } from 'react';

/**
 * useQuantumSessionVisibility
 * 
 * An institutional-grade hook for managing browser visibility state and 
 * forcing React tree reconciliation after periods of inactivity (idle states).
 * This ensures that ZK-proofs and session data are always aggressively fresh
 * when the user returns to the tab, mitigating stale-state vulnerabilities.
 */
export function useQuantumSessionVisibility(): [number, () => void] {
    const [reconciliationKey, setReconciliationKey] = useState<number>(0);

    const forceReconciliation = useCallback(() => {
        setReconciliationKey((prevKey) => prevKey + 1);
    }, []);

    useEffect(() => {
        let isSessionHidden = false;

        const handleVisibilityChange = () => {
            if (document.hidden) {
                isSessionHidden = true;
            } else if (isSessionHidden) {
                // The user has returned. Force a Account Status refresh.
                isSessionHidden = false;
                forceReconciliation();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [forceReconciliation]);

    return [reconciliationKey, forceReconciliation];
}
