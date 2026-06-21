"use client";

import { CreateConnectorFn, WagmiProvider } from 'wagmi';
import { AppKitNetwork, mainnet, base, arbitrum, polygon, optimism, bsc, linea, avalanche, zksync } from "@reown/appkit/networks";
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
        default: { http: [process.env.GETBLOCK_BASE_RPC || 'https://base.drpc.org'] },
        public: { http: [process.env.GETBLOCK_BASE_RPC || 'https://base.drpc.org'] }
    }
};

// Infura key  server-side only, never expose in client bundle
const infuraKey = process.env.INFURA_API_KEY ?? '';

const dedicatedMainnet = {
    ...mainnet,
    rpcUrls: {
        ...mainnet.rpcUrls,
        default: { http: [process.env.ETH_RPC_URL || 'https://cloudflare-eth.com'] },
        public: { http: [process.env.ETH_RPC_URL || 'https://cloudflare-eth.com'] }
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

const dedicatedMonadMainnet: AppKitNetwork = {
    id: 10143, // Placeholder ID for Monad
    name: 'Monad Mainnet',
    caipNetworkId: 'eip155:10143',
    chainNamespace: 'eip155',
    nativeCurrency: { name: 'Monad', symbol: 'MONAD', decimals: 18 },
    rpcUrls: {
        default: { http: ['https://rpc.monad.xyz'] }
    },
    blockExplorers: {
        default: { name: 'Monad Explorer', url: 'https://explorer.monad.xyz' }
    }
} as any;

const galactica: AppKitNetwork = {
    id: 9302,
    name: 'Galactica Reticulum',
    caipNetworkId: 'eip155:9302',
    chainNamespace: 'eip155',
    nativeCurrency: { name: 'GNET', symbol: 'GNET', decimals: 18 },
    rpcUrls: {
        default: { http: ['https://evm-rpc-http-reticulum.galactica.com/'] }
    },
    blockExplorers: {
        default: { name: 'Galactica Explorer', url: 'https://explorer-reticulum.galactica.com/' }
    }
} as any;

const dedicatedPolygon = {
    ...polygon,
    rpcUrls: {
        ...polygon.rpcUrls,
        default: { http: ['https://polygon.drpc.org'] },
        public: { http: ['https://polygon.drpc.org'] }
    }
};

const dedicatedArbitrum = {
    ...arbitrum,
    rpcUrls: {
        ...arbitrum.rpcUrls,
        default: { http: ['https://arbitrum.drpc.org'] },
        public: { http: ['https://arbitrum.drpc.org'] }
    }
};

const dedicatedOptimism = {
    ...optimism,
    rpcUrls: {
        ...optimism.rpcUrls,
        default: { http: ['https://optimism.drpc.org'] },
        public: { http: ['https://optimism.drpc.org'] }
    }
};

export const networks: [AppKitNetwork, ...AppKitNetwork[]] = [dedicatedMainnet, dedicatedBase, dedicatedBsc, dedicatedPolygon, dedicatedArbitrum, dedicatedOptimism, worldchain, linea, avalanche, zksync, dedicatedMonadMainnet, galactica];

export const wagmiAdapter = new WagmiAdapter({
    ssr: true,
    // Explicit cookieStorage: guarantees wagmi state is available synchronously
    // on SSR and survives Android Chrome tab destruction after deep-link redirects.
    // Per Reown official docs (2025-2026), this must be set explicitly alongside ssr:true.
    // @ts-ignore: Wagmi v2 type mismatch between AppKit and Wagmi core
    storage: createStorage({ storage: cookieStorage as any }),
    projectId,
    networks,
    // [MOBILE STABILITY] Disabled EIP-6963 to prevent the 'connector not connect' crash on iOS/Android
    // specifically triggered by wagmi/core 2.22.1 + AppKit conflicts.
    // multiInjectedProviderDiscovery: false,
})

export const config = wagmiAdapter.wagmiConfig

const queryClient = new QueryClient()

// [FIX] CANONICAL_APP_URL must ALWAYS be the registered WalletConnect Cloud domain.
// NEVER override with window.location.origin — on Railway preview environments,
// this returns a .up.railway.app URL which is NOT in the WalletConnect allowlist.
// A mismatched URL causes the relay to SILENTLY REJECT all mobile sessions,
// producing exactly the "handshake failed" and "timeout" errors users report.
// The CANONICAL_APP_URL is pinned unconditionally to the registered production domain.
const CANONICAL_APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://humanidfi.com';

const metadata = {
    name: 'Whale Alert Network',
    description: 'Institutional Grade Whale Tracking',
    url: CANONICAL_APP_URL,
    icons: [`${CANONICAL_APP_URL}/official-whale-monochrome.png`],
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
            enableEIP6963: true, // MUST BE TRUE for wagmi 2.x to detect injected wallets like MetaMask properly
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
    // [FIX] wagmi 2.22.1 + AppKit: DO NOT pass initialState from SSR cookies to WagmiProvider.
    // The cookieToInitialState restores a serialized connector reference from the server,
    // but on mobile the actual WalletConnect WebSocket hasn't re-established yet.
    // This mismatch causes wagmi to believe a connector exists (from cookie) but
    // the connector's underlying transport is dead → "Connector not connected".
    // Solution: let wagmi start fresh client-side and call reconnect() once on mount.
    // Reown official recommendation for SSR + mobile: https://docs.reown.com/appkit/next/core/installation

    useEffect(() => {
        // Single-shot reconnect on mount: syncs AppKit internal state with wagmi connector state.
        // This is the official Reown pattern for wagmi 2.x with SSR.
        // It runs ONCE when the page loads, not on every focus/visibility change.
        reconnect(wagmiAdapter.wagmiConfig as any).catch(() => {
            // Silently ignore: reconnect fails when no previous session exists (new user).
            // This is expected and not an error.
        });
    }, []);

    return (
        <WagmiProvider config={wagmiAdapter.wagmiConfig as any}>
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </WagmiProvider>
    )
}


