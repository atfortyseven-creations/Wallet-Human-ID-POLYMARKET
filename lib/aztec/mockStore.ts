/**
 * mockStore.ts — ELIMINATED
 * ─────────────────────────────────────────────────────────────────────────────
 * This module has been permanently deleted as part of the Native Aztec Purge.
 *
 * All QDs state (balance, history, address) is now managed exclusively by
 * AztecNativeContext, which polls the PostgreSQL ledger (our L2 Sequencer
 * Indexer) every 10 seconds.
 *
 * If you are importing `useQDsStore` anywhere, replace it with:
 *
 *   import { useAztecNative } from '@/context/AztecNativeContext';
 *   const { balance, history, aztecAddress } = useAztecNative();
 *
 * There is NO Zustand store. There is NO localStorage state.
 * There is NO simulation. There is only the on-chain ledger.
 *
 * @deprecated — DO NOT USE. This file exists only to prevent import crashes
 *               during the migration period. Remove all imports of this file.
 */

// Re-export a no-op shim so any forgotten import doesn't crash at runtime.
// Each getter returns the safe default for that field.

function noopStore() {
  return {
    balance:      0,
    history:      [],
    aztecAddress: null,
    seed:         null,
    receiveQDs:   () => { console.error('[mockStore] DEPRECATED: use AztecNativeContext'); },
    sendQDs:      () => { console.error('[mockStore] DEPRECATED: use AztecNativeContext'); },
    setAddress:   () => { console.error('[mockStore] DEPRECATED: use AztecNativeContext'); },
    reset:        () => { console.error('[mockStore] DEPRECATED: use AztecNativeContext'); },
  };
}

/** @deprecated Use useAztecNative() from AztecNativeContext instead */
export function useQDsStore() {
  console.warn('[mockStore] DEPRECATED — This store has been purged. Use useAztecNative().');
  return noopStore();
}

// Attach a static .getState() for any legacy calls like useQDsStore.getState().receiveQDs(...)
useQDsStore.getState = () => ({
  ...noopStore(),
  receiveQDs: () => console.error('[mockStore.getState] DEPRECATED: use AztecNativeContext'),
  sendQDs:    () => console.error('[mockStore.getState] DEPRECATED: use AztecNativeContext'),
});
