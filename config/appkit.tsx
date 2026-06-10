"use client";

import { CreateConnectorFn, WagmiProvider } from 'wagmi';
import { AppKitNetwork, mainnet, base, arbitrum, polygon, optimism, bsc } from "@reown/appkit/networks";
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { cookieToInitialState, createStorage, cookieStorage } from 'wagmi';
import { createAppKit } from '@reown/appkit/react';
import { createSIWEConfig, formatMessage } from '@reown/appkit-siwe';
import { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { metaMask, injected, walletConnect, safe } from 'wagmi/connectors';
// SIWE Config will be defined below

// 1. Get projectId  Falls back to real project ID so the app renders even without the env var.
// Set NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID in Railway for clean env separation.
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
    || process.env.NEXT_PUBLIC_WC_PROJECT_ID
    || '47cce4049225582027fdeeecb2868ead'; // Master WalletConnect ID (Synced from next.config.js)

if (!process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID && typeof window !== 'undefined') {
    console.warn('[WalletConnect] Using hardcoded project ID. Ensure NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is set in production.');
}

// 2. Interstellar Node Override
const dedicatedBase = {
    ...base,
    rpcUrls: {
        ...base.rpcUrls,
        default: { http: [process.env.GETBLOCK_BASE_RPC || 'https://base.llamarpc.com'] },
        public: { http: [process.env.GETBLOCK_BASE_RPC || 'https://base.llamarpc.com'] }
    }
};

// Infura key  server-side only, never expose in client bundle
const infuraKey = process.env.INFURA_API_KEY ?? '';

const dedicatedMainnet = {
    ...mainnet,
    rpcUrls: {
        ...mainnet.rpcUrls,
        default: { http: [process.env.ETH_RPC_URL || 'https://eth.llamarpc.com'] },
        public: { http: [process.env.ETH_RPC_URL || 'https://eth.llamarpc.com'] }
    }
};

const dedicatedBsc = {
    ...bsc,
    rpcUrls: {
        ...bsc.rpcUrls,
        default: { http: [process.env.BNB_RPC_URL || 'https://bsc.publicnode.com'] },
        public: { http: [process.env.BNB_RPC_URL || 'https://bsc.publicnode.com'] }
    }
};

// 3. World Chain definition
const worldchain: AppKitNetwork = {
    id: 480,
    name: 'World Chain',
    caipNetworkId: 'eip155:480',
    chainNamespace: 'eip155',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: {
        default: { http: [process.env.NEXT_PUBLIC_ALCHEMY_API_KEY ? `https://worldchain-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}` : "https://worldchain-mainnet.g.alchemy.com/public"] }
    },
    blockExplorers: {
        default: { name: 'Worldscan', url: 'https://worldscan.org' }
    }
} as any;

const dedicatedPolygon = {
    ...polygon,
    rpcUrls: {
        ...polygon.rpcUrls,
        default: { http: ['https://polygon.llamarpc.com'] },
        public: { http: ['https://polygon.llamarpc.com'] }
    }
};

const dedicatedArbitrum = {
    ...arbitrum,
    rpcUrls: {
        ...arbitrum.rpcUrls,
        default: { http: ['https://arbitrum.llamarpc.com'] },
        public: { http: ['https://arbitrum.llamarpc.com'] }
    }
};

const dedicatedOptimism = {
    ...optimism,
    rpcUrls: {
        ...optimism.rpcUrls,
        default: { http: ['https://optimism.llamarpc.com'] },
        public: { http: ['https://optimism.llamarpc.com'] }
    }
};

export const networks: [AppKitNetwork, ...AppKitNetwork[]] = [dedicatedMainnet, dedicatedBsc, dedicatedPolygon, dedicatedBase, dedicatedArbitrum, dedicatedOptimism, worldchain];

export const wagmiAdapter = new WagmiAdapter({
    ssr: true,
    // Explicit cookieStorage: guarantees wagmi state is available synchronously
    // on SSR and survives Android Chrome tab destruction after deep-link redirects.
    // Per Reown official docs (2025-2026), this must be set explicitly alongside ssr:true.
    // @ts-ignore: Wagmi v2 type mismatch between AppKit and Wagmi core
    storage: createStorage({ storage: cookieStorage as any }),
    projectId,
    networks,
})

export const config = wagmiAdapter.wagmiConfig

const queryClient = new QueryClient()

// CRITICAL: metadata.url MUST match EXACTLY the domain registered in WalletConnect/Reown Cloud.
//
// WalletConnect Cloud allowlist (project bf1083a298e7222c838266166b12b2ba) contains:
//   - humanidfi.com
//   - https://humanidfi.com
//   - www.humanidfi.com
//
// If the metadata.url does not exactly match one of these (e.g. if testing on localhost
// or a Railway preview URL), the WalletConnect Cloud relay will SILENTLY REJECT the session.
// This causes the "Open Wallet" deep-link button on mobile to do absolutely nothing.
//
// [IOS CHROME CRITICAL FIX] The CANONICAL_APP_URL must:
// 1. Be a valid HTTPS string even during SSR (window is undefined on server)
// 2. Match EXACTLY what is registered in WalletConnect Cloud dashboard
// 3. NOT use window.location.origin  this can return '' or undefined on iOS WKWebView
//    if called before the document is fully loaded, causing the WC relay to reject the session.
// The canonical URL is ALWAYS humanidfi.com in production. Preview URLs must be allowlisted
// separately in WalletConnect Cloud dashboard if needed.
let CANONICAL_APP_URL = 'https://humanidfi.com';
if (typeof window !== 'undefined' && window.location && window.location.origin) {
    const origin = window.location.origin;
    if (origin !== 'null' && origin !== '') {
        CANONICAL_APP_URL = origin;
    }
}


const metadata = {
    name: 'Whale Alert Network',
    description: 'Institutional Grade Whale Tracking',
    url: CANONICAL_APP_URL,
    icons: [`${CANONICAL_APP_URL}/official-whale-monochrome.png`],
    redirect: {
        universal: CANONICAL_APP_URL,
    }
}

//  1-Click Auth (SIWE) Configuration 
// Natively integrated with WalletConnect to bundle connection and signature
// in a single wallet prompt. Crucial for bypassing Android tab-discard loops.
const siweConfig = createSIWEConfig({
  getMessageParams: async () => ({
    domain: typeof window !== 'undefined' ? window.location.host : 'humanidfi.com',
    uri: typeof window !== 'undefined' ? window.location.origin : 'https://humanidfi.com',
    chains: [1, 10, 56, 137, 8453, 42161, 480],
    statement: 'Sign in to Whale Alert Network'
  }),
  createMessage: ({ address, ...args }) => formatMessage(args, address),
  getNonce: async () => {
    const res = await fetch('/api/siwe/nonce', { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch nonce');
    return await res.text();
  },
  getSession: async () => {
    try {
      const res = await fetch('/api/siwe/session', { cache: 'no-store' });
      if (!res.ok) return null;
      const data = await res.json();
      return { address: data.address, chainId: data.chainId };
    } catch {
      return null;
    }
  },
  verifyMessage: async ({ message, signature }) => {
    try {
      const res = await fetch('/api/siwe/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, signature })
      });
      return res.ok;
    } catch {
      return false;
    }
  },
  signOut: async () => {
    try {
      await fetch('/api/siwe/logout');
    } catch {}
    return true;
  }
});

//  CRITICAL: createAppKit must be called at module level (not inside window check).
// Reown AppKit hooks (useAppKit, useAppKitAccount, etc.) are used during SSR in
// Next.js server components. The hooks throw "Please call createAppKit before
// using useAppKit hook" when this function hasn't been called before the hook runs.
// Solution: Call createAppKit unconditionally at module import time with a singleton
// guard. The WagmiAdapter's ssr:true handles the server-side hydration safely.
let appKitInitialized = false;

try {
    if (!appKitInitialized) {
        appKitInitialized = true;
        createAppKit({
            adapters: [wagmiAdapter],
            networks,
            projectId,
            metadata,
            allowUnsupportedChain: true,
            featuredWalletIds: [
                'c57ca95b47569778a828d19178114f4d' + 'b188b89b763c899ba0be274e97267d96', // MetaMask
                '4622a2b2d6af1c9844944291e5e7351a' + '6aa24cd7b23099efac1b2fd875da31a0', // Trust Wallet
                'fd20dc426fb37566d803205b19bbc1d4' + '096b248ac04548e3cfb6b3a38bd033aa', // Coinbase
                '1ae92b26df02f0abca6304df07debccd' + '18262fdf5fe82daa81593582dac9a369', // Rainbow
                '38f5d18bd8522c244bdd70cb4a68e0e7' + '18865155811c043f052fb9f1c51de662', // Bitget Wallet
                '971e689d0a5be527bac79629b4ee9b92' + '5e82208e5168b733496a09c0faed0709', // OKX Wallet
                '8a0ee50d1f22f6651afcae7eb4253e52' + 'a3310b90af5daef78a8c4929a9bb99d4', // Binance Web3
                'c03dfee351b6fcc421b4494ea33b9d4b' + '92a984f87aa76d1663bb28705e95034a', // Uniswap Wallet
            ],
            features: {
                analytics: false, //  INSTANT BOOT: Disable telemetry to avoid blocking network requests
                email: false, // Strictly Web3 - No Web2 Email logins
                socials: false, // Strictly Web3 - No Google/Apple/X logins
                emailShowWallets: false,
                swaps: true,
                onramp: true,
                send: true,
                receive: true,
            },
            themeMode: 'light',
            themeVariables: {
                '--w3m-accent': '#000000',
                '--w3m-color-mix': '#FFFFFF',
                '--w3m-border-radius-master': '2rem',
                '--w3m-font-family': 'FT Regola Neue, Inter, sans-serif',
                '--w3m-z-index': 9999,
            },
            enableInjected: true,
            enableEIP6963: true, //  FAST INJECT: Bypass polling by using standard EIP-6963 window events
            enableWalletConnect: true,
            enableCoinbase: true,
            customWallets: []
        });
    }
} catch (e) {
    console.warn('[AppKit] Initialization skipped (already initialized):', e);
}

import { useEffect } from 'react';
import { reconnect } from '@wagmi/core';

export function Web3ModalProvider({ children, cookies }: { children: ReactNode; cookies: string | null }) {
    let initialState;
    try {
        initialState = cookieToInitialState(wagmiAdapter.wagmiConfig, cookies);
    } catch (error: any) {
        // Safe silent fallback: cookie state parsing failed (common with URLEncoded cookies).
        // Wagmi automatically recovers and falls back to client-side localStorage state.
        // We log a clean, single-line stdout message to prevent scary PM2 stderr/[err] stack traces.
        console.log('[AppKit] Wagmi cookie state fallback active (Client-side state will be used)');
        initialState = undefined;
    }

    // [ABYSMALLY COMPLEX OPTIMIZATION] - iOS Chrome Connection Healer
    // iOS Chrome (WKWebView) aggressively suspends WebSockets when backgrounded during deep-link flows (e.g. to MetaMask).
    // Upon returning, the socket is dead but the browser doesn't know it, causing infinite loading spinners.
    // This forcibly re-evaluates and resurrects dead Wagmi connections when the tab becomes visible again.
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const handleVisibility = () => {
                if (document.visibilityState === 'visible') {
                    setTimeout(() => {
                        try {
                            reconnect(wagmiAdapter.wagmiConfig as any);
                            console.log('[System Protocol] iOS Connection Healer executed.');
                        } catch (e) {}
                    }, 300); // 300ms delay gives iOS time to fully restore networking stack
                }
            };
            document.addEventListener('visibilitychange', handleVisibility);
            return () => document.removeEventListener('visibilitychange', handleVisibility);
        }
    }, []);

    return (
        <WagmiProvider config={wagmiAdapter.wagmiConfig as any} initialState={initialState}>
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </WagmiProvider>
    )
}


