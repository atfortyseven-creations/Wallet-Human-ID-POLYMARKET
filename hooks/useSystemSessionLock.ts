'use client';

import { useEffect, useRef } from 'react';
import { useSettingsStore } from '@/lib/store/useSettingsStore';
import { useSystemAccount } from '@/hooks/useSystemAccount';
import { useDisconnect } from 'wagmi';

export function useSystemSessionLock() {
    const { settings } = useSettingsStore();
    const { disconnect } = useDisconnect();
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        // If 0, disabled.
        if (!settings?.inactivityLockMinutes || settings.inactivityLockMinutes <= 0) {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            return;
        }

        const resetTimer = () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);

            timeoutRef.current = setTimeout(() => {
                console.log(`[Enterprise SECURITY] Inactivity limit reached (${settings.inactivityLockMinutes}m). Locking session.`);
                
                // Disconnect external wallet gracefully
                disconnect();
                
                // Clear any secure local memory variables (if relying on them)
                // localStorage.clear(); // We rely on System Settings DB, keeping it clean
                
                // Enforce redirect or visual block
                if (window.location.pathname !== '/') {
                    window.location.href = '/?lock=true';
                }
            }, settings.inactivityLockMinutes * 60 * 1000);
        };

        const handleInteraction = () => {
            // Debounce the interaction to prevent micro-stutters in the React Tree
            requestAnimationFrame(() => resetTimer());
        };

        const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
        
        events.forEach(event => {
            window.addEventListener(event, handleInteraction, { passive: true });
        });

        // Initialize first timer
        resetTimer();

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            events.forEach(event => {
                window.removeEventListener(event, handleInteraction);
            });
        };
    }, [settings?.inactivityLockMinutes, disconnect]);
}
