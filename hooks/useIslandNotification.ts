/**
 * useIslandNotification
 * ──────────────────────────────────────────────────────────────────────────────
 * A thin utility hook that exposes the Dynamic Island store actions
 * with named shortcuts for common notification patterns used across
 * the entire Humanity Ledger platform.
 *
 * Usage:
 *   const { notifyCall, notifyRecording, notifyMessage, notifyTx, notifyWallet } = useIslandNotification();
 *   notifyMessage({ title: '0xABCD...', subtitle: 'Hey, are you there?' });
 */

"use client";

import { useDynamicIsland, DynamicIslandPayload } from '@/lib/store/dynamic-island-store';
import { useCallback } from 'react';

export function useIslandNotification() {
  const { setState, dismiss } = useDynamicIsland();

  /** Show an active voice/video call pill. Pass peerName as title. */
  const notifyCall = useCallback((payload: DynamicIslandPayload) => {
    setState('calling', payload);
  }, [setState]);

  /** Show a recording indicator. */
  const notifyRecording = useCallback((payload?: DynamicIslandPayload) => {
    setState('recording', payload);
  }, [setState]);

  /** Show a Ledger Chat message notification. Auto-dismisses after 4 seconds. */
  const notifyMessage = useCallback((payload: DynamicIslandPayload) => {
    setState('notification', payload, 4000);
  }, [setState]);

  /** Show a ZK proof generation progress. No auto-dismiss — call dismissIsland when done. */
  const notifyTxProcessing = useCallback((payload?: DynamicIslandPayload) => {
    setState('tx_processing', payload ?? { title: 'Generating Proof' });
  }, [setState]);

  /** Show a tx success checkmark. Auto-dismisses after 2 seconds. */
  const notifyTxSuccess = useCallback((payload?: DynamicIslandPayload) => {
    setState('tx_success', payload ?? { title: 'Verified' }, 2000);
  }, [setState]);

  /** Show a network syncing state. No auto-dismiss unless autoDismiss ms provided. */
  const notifySync = useCallback((payload: DynamicIslandPayload, autoDismiss?: number) => {
    setState('syncing', payload, autoDismiss);
  }, [setState]);

  /** Show a wallet-linked success pill. Auto-dismisses after 2.5 seconds. */
  const notifyWallet = useCallback((payload: DynamicIslandPayload) => {
    setState('wallet_connected', payload, 2500);
  }, [setState]);

  /** Dismiss and return to idle. */
  const dismissIsland = useCallback(() => {
    dismiss();
  }, [dismiss]);

  return {
    notifyCall,
    notifyRecording,
    notifyMessage,
    notifyTxProcessing,
    notifyTxSuccess,
    notifySync,
    notifyWallet,
    dismissIsland,
  };
}
