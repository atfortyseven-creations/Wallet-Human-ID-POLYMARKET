"use client";

import { useAccount } from 'wagmi';
import { useState, useEffect } from 'react';
import { useWalletStore } from '@/lib/store/wallet-store';
import { getAddress } from 'viem';

/**
 * [Enterprise HANDSHAKE] Account Bridge
 *
 * Priority ladder:
 *   1. Local system wallet (privateKey in memory  just unlocked)
 *   1b. Session-restored system wallet (address in sessionStorage  page reload)
 *   2. Direct Wagmi connection (MetaMask / WalletConnect / AppKit)
 *   3. QR Handshake cookie (system_handshake=0x...)
 *   4. Disconnected fallback
 *
 * Network request policy:
 *   - /api/auth/session: polled only for non-system users (ZK/SIWE flow)
 *   - Cookie poll (1s): only when no wagmi AND no system wallet in memory
 */

//  Module-level singletons to prevent duplicate polls across re-renders 
let globalIsPolling = false;
let globalIsZkVerified = false;
let globalPollId: ReturnType<typeof setInterval> | null = null;
const listeners = new Set<(v: boolean) => void>();

const startGlobalPolling = () => {
    if (typeof window === 'undefined' || globalIsPolling || globalIsZkVerified) return;
    globalIsPolling = true;

    const check = async () => {
        if (globalIsZkVerified) {
            // ZK is verified — stop polling, no further network requests needed
            if (globalPollId) { clearInterval(globalPollId); globalPollId = null; }
            return;
        }
        try {
            const res = await fetch('/api/auth/session');
            if (!res.ok) return;
            const data = await res.json();
            if (data?.user?.isZkVerified) {
                globalIsZkVerified = true;
                if (globalPollId) { clearInterval(globalPollId); globalPollId = null; }
                listeners.forEach(fn => fn(true));
            }
        } catch {}
    };

    check();
    globalPollId = setInterval(check, 15_000); // 15s — stays well under 20req/60s rate limit
};

//  SSR-safe storage helpers 
function safeSessionGet(key: string): string | null {
    try {
        return typeof window !== 'undefined' ? sessionStorage.getItem(key) : null;
    } catch {
        return null;
    }
}

//  Cookie parser (strict: requires 0x prefix) 
function readHandshakeCookie(): string | null {
    if (typeof document === 'undefined') return null;
    try {
        const match = document.cookie.match(/system_handshake=(0x[0-9a-fA-F]{40,})/i);
        if (!match?.[1]) return null;
        try { return getAddress(match[1]); } catch { return match[1].toLowerCase(); }
    } catch {
        return null;
    }
}

//  Hook 
export function useSystemAccount() {
    const wagmiAccount = useAccount();
    const { address: storeAddress, privateKey: storePrivateKey } = useWalletStore();

    const [handshakeAddress, setHandshakeAddress] = useState<string | null>(null);
    const [sessionAddress, setSessionAddress]     = useState<string | null>(null);
    const [isSessionUnlocked, setIsSessionUnlocked] = useState(false);
    const [isZkVerified, setIsZkVerified]         = useState(globalIsZkVerified);
    const [isChecking, setIsChecking]             = useState(true);

    // [CRITICAL FIX] Absolute Firewall for Logout Loops
    // Read the disconnect guard synchronously during render.
    // Wagmi sometimes auto-reconnects on page load if IndexedDB clearing fails.
    // If the guard is active, we FORCE the UI to show disconnected.
    const isGuarded = typeof window !== 'undefined' && (
        safeSessionGet('__disconnected__') === '1' ||
        (typeof localStorage !== 'undefined' && localStorage.getItem('__disconnected__') === '1')
    );

    //  Mount effect: read all client-only storage once 
    useEffect(() => {
        // 0. AUTO-RESTORE from system_session_v2 (Humanity Ledger EIP-712 sign-up)
        if (isGuarded) {
            // Actively purge any lingering session data so a re-render
            // cannot restore the session that was just explicitly killed.
            try { localStorage.removeItem('system_session_v2'); } catch {}
            try { sessionStorage.removeItem('system_wallet_addr'); } catch {}
            try { sessionStorage.removeItem('portfolio_unlocked'); } catch {}
            // Guard is consumed ONLY upon explicit user re-login in CoreAuthGate/ConnectPage
            // Do NOT proceed with any session restoration below.
        }

        if (!isGuarded && typeof window !== 'undefined') {
            try {
                const raw = localStorage.getItem('system_session_v2');
                if (raw) {
                    const parsed = JSON.parse(raw);
                    if (parsed?.exp > Date.now() && parsed?.wallet) {
                        const addr: string = parsed.wallet;
                        if (addr.startsWith('0x') && addr.length === 42) {
                            try {
                                sessionStorage.setItem('system_wallet_addr', addr.toLowerCase());
                                sessionStorage.setItem('portfolio_unlocked', 'true');
                            } catch {}
                        }
                    }
                }
            } catch {}
        }

        // 1. Read sessionStorage (safe  client only) — now includes auto-restored values above
        const sessAddr = safeSessionGet('system_wallet_addr');
        if (sessAddr && sessAddr.startsWith('0x') && sessAddr.length === 42) {
            setSessionAddress(sessAddr);
        }
        const unlocked = safeSessionGet('portfolio_unlocked') === 'true';
        setIsSessionUnlocked(unlocked);

        // 2. Read handshake cookie
        setHandshakeAddress(readHandshakeCookie());

        // 3. ZK verification listener
        const listener = (v: boolean) => setIsZkVerified(v);
        listeners.add(listener);

        // 4. ZK polling  only for non-system users
        //    If storePrivateKey is set, the user unlocked a local wallet.
        //    They NEVER need /api/auth/session (no SIWE/ZK involved).
        if (!storePrivateKey) {
            startGlobalPolling();
        }

        setIsChecking(false);

        // 5. Cookie poll interval  only when:
        //    - not connected via wagmi (MetaMask etc.)
        //    - AND no system wallet already in memory
        //    - AND no session already restored from system_session_v2
        //    This avoids a 1s tick hammering while already authenticated.
        let cookiePoll: ReturnType<typeof setInterval> | null = null;
        const alreadyRestored = safeSessionGet('portfolio_unlocked') === 'true';
        if (!wagmiAccount.isConnected && !storePrivateKey && !alreadyRestored) {
            cookiePoll = setInterval(() => {
                setHandshakeAddress(readHandshakeCookie());
            }, 1_000);
        }

        return () => {
            if (cookiePoll) clearInterval(cookiePoll);
            listeners.delete(listener);
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [wagmiAccount.isConnected, storePrivateKey]);

    //  Priority 0: Nuclear Disconnect Guard 
    if (isGuarded) {
        return {
            address: undefined,
            isConnected: false,
            isConnecting: false,
            isReconnecting: false,
            isDisconnected: true,
            status: 'disconnected' as const,
            chain: undefined,
            chainId: 1,
            connector: undefined,
            isSystemHandshake: false,
            isLocalSystemWallet: false,
            needsWalletReconnect: false,
            isZkVerified: false,
            isChecking: false,
        };
    }

    //  Priority 1: Local system wallet (privateKey live in memory) 
    if (storeAddress && storePrivateKey) {
        return {
            address: storeAddress as `0x${string}`,
            isConnected: true,
            isConnecting: false,
            isReconnecting: false,
            isDisconnected: false,
            status: 'connected' as const,
            chain: undefined,
            chainId: 1,
            connector: undefined,
            isSystemHandshake: false,
            isLocalSystemWallet: true,
            needsWalletReconnect: false,
            isZkVerified,
            isChecking: false,
        };
    }

    //  Priority 1b: Session-restored (address in sessionStorage) 
    // privateKey is not in memory (security  never persisted), but the address
    // is safe to use for read-only portfolio display. Signing requires re-login.
    const sessionRestoredAddr = sessionAddress || storeAddress;
    if (sessionRestoredAddr && isSessionUnlocked) {
        return {
            address: sessionRestoredAddr as `0x${string}`,
            isConnected: true,
            isConnecting: false,
            isReconnecting: false,
            isDisconnected: false,
            status: 'connected' as const,
            chain: undefined,
            chainId: 1,
            connector: undefined,
            isSystemHandshake: false,
            isLocalSystemWallet: true,
            needsWalletReconnect: false,
            isZkVerified,
            isChecking: false,
        };
    }

    //  Priority 2: Direct Wagmi connection (MetaMask / WalletConnect) 
    if (wagmiAccount.isConnected) {
        return {
            address: wagmiAccount.address,
            isConnected: true,
            isConnecting: wagmiAccount.isConnecting,
            isReconnecting: wagmiAccount.isReconnecting,
            isDisconnected: false,
            status: 'connected' as const,
            connector: wagmiAccount.connector,
            chainId: wagmiAccount.chainId,
            chain: wagmiAccount.chain,
            isSystemHandshake: false,
            isLocalSystemWallet: false,
            needsWalletReconnect: false,
            isZkVerified,
            isChecking: false,
        };
    }

    //  Priority 3: QR Handshake cookie 
    if (handshakeAddress) {
        return {
            address: handshakeAddress as `0x${string}`,
            isConnected: true,
            isConnecting: false,
            isReconnecting: false,
            isDisconnected: false,
            status: 'connected' as const,
            chain: undefined,
            chainId: 1,
            connector: undefined,
            isSystemHandshake: true,
            isLocalSystemWallet: false,
            needsWalletReconnect: !wagmiAccount.isConnected,
            isZkVerified,
            isChecking: false,
        };
    }

    //  Priority 4: Disconnected / connecting fallback 
    return {
        address: wagmiAccount.address,
        isConnected: false,
        isConnecting: wagmiAccount.isConnecting,
        isReconnecting: wagmiAccount.isReconnecting,
        isDisconnected: wagmiAccount.isDisconnected,
        status: wagmiAccount.status,
        connector: wagmiAccount.connector,
        chainId: wagmiAccount.chainId,
        chain: wagmiAccount.chain,
        isSystemHandshake: false,
        isLocalSystemWallet: false,
        needsWalletReconnect: false,
        isZkVerified,
        isChecking,
    };
}
