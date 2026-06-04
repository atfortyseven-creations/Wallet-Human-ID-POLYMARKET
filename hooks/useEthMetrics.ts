/**
 * hooks/useEthMetrics.ts
 * 
 * Shared hook: subscribes to the Ethereum mainnet block stream and exposes
 * real-time metrics (block number, base fee in Gwei, UTC time).
 *
 * Used by:
 *   - components/landing/ImmersiveManifestoLanding.tsx  (hero stats bar)
 *   - components/dashboard/WhaleProShell.tsx            (top master bar)
 *
 * Design decisions:
 *   - Single `watchBlocks` subscription per mount  no polling.
 *   - Ref-guarded cleanup prevents stale-closure leaks when publicClient
 *     changes (chain switch).
 *   - Graceful degradation: if provider is absent, all values remain null
 *     and the UI renders safe fallback text ("---").
 * 
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import { usePublicClient } from 'wagmi';

export interface EthMetrics {
  /** Current block number as formatted string, e.g. "#22,134,521" */
  blockNumber: string | null;
  /** Base fee in Gwei, formatted to 2 decimal places */
  baseFeeGwei: string | null;
  /** Current UTC time string, updated every second */
  utcTime: string | null;
  /** True while waiting for the first block event */
  syncing: boolean;
}

export function useEthMetrics(): EthMetrics {
  const publicClient = usePublicClient({ chainId: 1 }); // Ethereum Mainnet

  const [blockNumber, setBlockNumber] = useState<string | null>(null);
  const [baseFeeGwei, setBaseFeeGwei] = useState<string | null>(null);
  const [utcTime,     setUtcTime    ] = useState<string | null>(null);
  const [syncing,     setSyncing    ] = useState(true);

  //  UTC clock  updates every second 
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setUtcTime(
        now.toUTCString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, '$1') + ' UTC'
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  //  Ethereum block subscription 
  const unwatchRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    // Cleanup previous subscription before creating a new one (chain switch)
    if (unwatchRef.current) {
      unwatchRef.current();
      unwatchRef.current = null;
    }

    if (!publicClient) return;

    // Eagerly fetch the latest block so we don't wait for the next one
    publicClient.getBlock().then(block => {
      setBlockNumber('#' + block.number.toLocaleString('en-US'));
      if (block.baseFeePerGas) {
        setBaseFeeGwei((Number(block.baseFeePerGas) / 1e9).toFixed(2));
      }
      setSyncing(false);
    }).catch(() => {
      setSyncing(false);
    });

    // Subscribe to every new block
    try {
      unwatchRef.current = publicClient.watchBlocks({
        onBlock: (block) => {
          setBlockNumber('#' + block.number.toLocaleString('en-US'));
          if (block.baseFeePerGas) {
            setBaseFeeGwei((Number(block.baseFeePerGas) / 1e9).toFixed(2));
          }
          setSyncing(false);
        },
        onError: () => {
          // Don't crash  silently degrade to last known values
        },
      });
    } catch {
      // Provider doesn't support watchBlocks (e.g., some injected wallets)
    }

    return () => {
      if (unwatchRef.current) {
        unwatchRef.current();
        unwatchRef.current = null;
      }
    };
  }, [publicClient]);

  return { blockNumber, baseFeeGwei, utcTime, syncing };
}
