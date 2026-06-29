'use client';

/**
 * [PHASE 5 — NULLIFIED]
 *
 * GoogleTagManager has been permanently removed from Whale Network.
 * 
 * REASON: Irreconcilable with the Zero-Tracker / Cypherpunk mandate.
 * Third-party analytics infrastructure violates the absolute privacy
 * guarantee: "Whale Network is structurally incapable of collecting user state."
 *
 * This file is preserved as a tombstone to document the architectural decision
 * and prevent accidental re-introduction of tracking infrastructure.
 *
 * DO NOT re-import or re-instantiate this component.
 * DO NOT add any third-party analytics scripts.
 *
 * Privacy is not a feature. It is an unalienable cryptographic right.
 *
 * @deprecated Permanently disabled. Aztec Cypherpunk alignment v5.0.
 */

// This module intentionally exports nothing.
// Any import of this file in layout.tsx must be removed.
export function GoogleTagManager(_props: { gtmId: string }) {
  // Unconditionally returns null. GTM is not loaded under any consent state.
  // The platform collects zero telemetry. Zero. No exceptions.
  return null;
}
