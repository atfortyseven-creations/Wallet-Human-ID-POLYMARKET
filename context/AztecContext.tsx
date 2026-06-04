"use client";

/**
 * AztecContext.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Private eXecution Environment (PXE) integration layer for Whale Network.
 *
 * ARCHITECTURE NOTE:
 * @aztec/aztec.js is a browser-only SDK that communicates with a locally
 * running Aztec Sandbox (PXE) on port 8080. It cannot be bundled server-side
 * during Next.js build time on Railway because:
 *   1. The package uses browser-only APIs (WebAssembly, SubtleCrypto).
 *   2. The PXE endpoint (localhost:8080) is a user's local machine, not Railway.
 *
 * SOLUTION: All Aztec SDK calls are dynamically imported at runtime inside the
 * browser. This means Railway builds cleanly (no static import to resolve) and
 * users who ARE running the Aztec Sandbox locally get full ZK functionality.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React, { createContext, useContext, useEffect, useState } from 'react';

// ─── Local type definitions (mirrors @aztec/aztec.js types) ──────────────────
// These are declared locally so TypeScript is satisfied without a static import.
// The real runtime objects come from the dynamic import below.

export interface AztecAddress {
  toString(): string;
  toBuffer(): Uint8Array;
}

export interface PXE {
  getRegisteredAccounts(): Promise<Array<{ address: AztecAddress }>>;
  getNodeInfo(): Promise<{ chainId: number; protocolVersion: number }>;
  isGlobalStateSynchronized(): Promise<boolean>;
}

// ─── Context Shape ────────────────────────────────────────────────────────────

interface AztecContextType {
  /** The live PXE client instance. null until the Sandbox is reachable. */
  pxe: PXE | null;
  /** True once the PXE handshake completes successfully. */
  isReady: boolean;
  /** Human-readable error if PXE init fails (e.g. Sandbox not running). */
  error: string | null;
  /** The first registered Aztec account address from the Sandbox. */
  walletAddress: AztecAddress | null;
  /** Aztec network metadata from the connected node. */
  nodeInfo: { chainId: number; protocolVersion: number } | null;
}

const AztecContext = createContext<AztecContextType>({
  pxe: null,
  isReady: false,
  error: null,
  walletAddress: null,
  nodeInfo: null,
});

// ─── Provider ─────────────────────────────────────────────────────────────────

export const AztecProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pxe, setPxe]                   = useState<PXE | null>(null);
  const [isReady, setIsReady]           = useState(false);
  const [error, setError]               = useState<string | null>(null);
  const [walletAddress, setWalletAddress] = useState<AztecAddress | null>(null);
  const [nodeInfo, setNodeInfo]         = useState<{ chainId: number; protocolVersion: number } | null>(null);

  useEffect(() => {
    /**
     * initAztec
     * Dynamically imports the Aztec SDK at runtime (browser only).
     * This prevents Railway's server-side build from ever touching the package.
     *
     * Flow:
     *  1. Dynamic import resolves @aztec/aztec.js in the user's browser.
     *  2. Creates a PXE client pointing to the local Aztec Sandbox (port 8080).
     *  3. Waits up to 10 seconds for the Sandbox to respond.
     *  4. Fetches registered accounts and node metadata.
     *  5. Populates context state for downstream consumers (WhaleChat, HumanityLedger, etc.).
     */
    const initAztec = async () => {
      try {
        console.log('🟡 [Aztec] Loading SDK via dynamic import...');

        // ─ Dynamic import: only executes in the browser at runtime ─
        const { createPXEClient, waitForPXE } = (await import(
          /* webpackIgnore: true */
          '@aztec/aztec.js'
        )) as any;

        const PXE_URL = process.env.NEXT_PUBLIC_AZTEC_PXE_URL || 'http://localhost:8080';
        console.log(`🟡 [Aztec] Connecting to PXE at ${PXE_URL}...`);

        const pxeClient = createPXEClient(PXE_URL) as unknown as PXE;

        // waitForPXE polls until the Sandbox is ready (max 10 retries × 1s)
        await waitForPXE(pxeClient as any, 10);

        // Fetch node metadata
        const info = await pxeClient.getNodeInfo();
        setNodeInfo(info);

        // Fetch registered accounts (populated by Aztec Sandbox by default)
        const accounts = await pxeClient.getRegisteredAccounts();
        if (accounts && accounts.length > 0) {
          setWalletAddress(accounts[0].address);
          console.log(`🟢 [Aztec] Wallet address: ${accounts[0].address.toString()}`);
        }

        setPxe(pxeClient);
        setIsReady(true);
        console.log('🟢 [Aztec] PXE Connected & Ready | Chain:', info.chainId);

      } catch (err: any) {
        // Graceful degradation: the app works normally without a local Sandbox.
        // Only ZK-specific features (WhaleChat ZK mode, HumanityLedger proofs) are gated.
        const msg = err?.message ?? 'Failed to initialize Aztec PXE';
        console.warn('🔴 [Aztec] PXE init failed (Sandbox not running?)', msg);
        setError(msg);
      }
    };

    // Only run in the browser (not during SSR / static generation)
    if (typeof window !== 'undefined') {
      initAztec();
    }
  }, []);

  return (
    <AztecContext.Provider value={{ pxe, isReady, error, walletAddress, nodeInfo }}>
      {children}
    </AztecContext.Provider>
  );
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * useAztec
 * Consumes the AztecContext. Must be used inside <AztecProvider>.
 *
 * @example
 * const { isReady, walletAddress, nodeInfo } = useAztec();
 */
export const useAztec = () => useContext(AztecContext);
