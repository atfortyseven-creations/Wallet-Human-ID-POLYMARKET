"use client";

import { useCallback } from 'react';
import { useDisconnect } from 'wagmi';
import { signOut } from 'next-auth/react';
import { useWalletStore } from '@/lib/store/wallet-store';

/**
 * [Enterprise SYSTEM LOGOUT]
 * Secures the local session. Locks the wallet vault but PRESERVES the encrypted 
 * blob so the user can log in again with their Humanity Ledger password.
 */
export function useSystemSignOut() {
    const { disconnect, disconnectAsync } = useDisconnect();

    const nuclearDisconnect = useCallback(async () => {
        console.log('%c[System] Initiating System Logout...', 'color:#FF3B30;font-weight:bold');

        try {
            // STEP 0 — Set __disconnected__ guard IMMEDIATELY (sync, before anything async).
            sessionStorage.setItem('__disconnected__', '1');
            sessionStorage.removeItem('portfolio_unlocked');
            sessionStorage.removeItem('system_wallet_addr');
            
            // STEP 1 — Nuke ALL cookies synchronously.
            try {
                const cookies = document.cookie.split(";");
                for (let i = 0; i < cookies.length; i++) {
                    const cookie = cookies[i];
                    const eqPos = cookie.indexOf("=");
                    const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();

                    if (name.toLowerCase().startsWith('whale_chat_pin_')) continue;

                    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;SameSite=Lax`;
                    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname};SameSite=Lax`;
                    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=${window.location.pathname};SameSite=Lax`;
                }
            } catch (e) {
                console.warn('[System:Logout] Cookie purge failed:', e);
            }

            // STEP 2 — Clear LocalStorage (includes system_session_v2 which feeds auto-restore).
            try {
                const targets = [
                    'system_handshake',
                    'system_session_v2',
                    'system_vault_v1',
                    'system_pending_wakeup',
                    'whale-system-wallet-registry-v2'
                ];
                targets.forEach(t => localStorage.removeItem(t));

                Object.keys(localStorage).forEach(key => {
                    const lower = key.toLowerCase();
                    if (lower.startsWith('whale_chat_pin_')) return;
                    if (lower.includes('whale-system-wallet-registry-v3')) return;
                    if (lower === 'system_accounts' || lower === 'system_keystore') return;

                    if (
                        lower.includes('wagmi') ||
                        lower.includes('walletconnect') ||
                        lower.includes('wc@2') ||
                        lower.includes('walletlink') ||
                        lower.includes('appkit') ||
                        lower.includes('w3m') ||
                        lower.includes('reown') ||
                        lower.includes('whale_chat') ||
                        lower.includes('whale_draft') ||
                        lower.includes('system_')
                    ) {
                        localStorage.removeItem(key);
                    }
                });
            } catch (e) {
                console.warn('[System:Logout] LocalStorage purge failed:', e);
            }

            // STEP 3 — Clear full SessionStorage (preserve sw_nuclear_purge_v4 and the guard).
            try {
                const swNuclearPurgeFlag = sessionStorage.getItem('sw_nuclear_purge_v4');
                sessionStorage.clear();
                sessionStorage.setItem('__disconnected__', '1');
                if (swNuclearPurgeFlag) {
                    sessionStorage.setItem('sw_nuclear_purge_v4', swNuclearPurgeFlag);
                }
            } catch (e) {}

            // STEP 4 — Nuke IndexedDB (WalletConnect/wagmi persist session here).
            try {
                if (window.indexedDB && typeof window.indexedDB.databases === 'function') {
                    const dbs = await window.indexedDB.databases();
                    dbs.forEach(db => {
                        if (db.name && (
                            db.name.includes('walletconnect') ||
                            db.name.includes('wc@2') ||
                            db.name.includes('wagmi') ||
                            db.name.includes('w3m')
                        )) {
                            window.indexedDB.deleteDatabase(db.name);
                        }
                    });
                }
            } catch (e) {
                console.warn('[System:Logout] IndexedDB purge failed:', e);
            }

            // STEP 5 — Disconnect Wagmi.
            try {
                if (disconnectAsync) {
                    await Promise.race([
                        disconnectAsync(),
                        new Promise(resolve => setTimeout(resolve, 100)) // Bulletproof instantaneous timeout
                    ]);
                } else if (disconnect) {
                    disconnect();
                }
            } catch (e) {
                console.warn('[System:Logout] Wagmi disconnect failed:', e);
            }

            // STEP 6 — NextAuth SignOut (fire and forget).
            try {
                signOut({ redirect: false }).catch(() => {});
            } catch (e) {}

            // STEP 7 — Lock local wallet vault.
            try {
                useWalletStore.getState().lockVault();
            } catch (e) {}

            // STEP 8 — Unregister service workers to avoid stale cache bugs.
            if ('serviceWorker' in navigator) {
                try {
                    const registrations = await navigator.serviceWorker.getRegistrations();
                    for (let registration of registrations) {
                        await registration.unregister();
                    }
                } catch (e) {}
            }
            
            // STEP 9 — Hard clear cache using caches API if available.
            try {
                if ('caches' in window) {
                    const cacheKeys = await caches.keys();
                    for (const key of cacheKeys) {
                        await caches.delete(key);
                    }
                }
            } catch (e) {}
        } catch (e) {
            console.error('[System:Logout] Critical exception:', e);
        } finally {
            // STEP 10 — Hard redirect to home. Wipes all in-memory React state.
            console.log('%c[System] Session Locked. Redirecting to /', 'color:#00A36C');
            window.location.replace('/');
            
            // Fallback in case window.location.replace hangs for some reason
            setTimeout(() => {
                window.location.reload();
            }, 500);
        }
    }, [disconnect, disconnectAsync]);

    return { nuclearDisconnect };
}
