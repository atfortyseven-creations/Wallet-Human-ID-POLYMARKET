"use client";

import dynamic from 'next/dynamic';

/**
 * ClientMobileLanding — dynamic import for MobileImmersiveGate.
 *
 * MobileImmersiveGate implements the full mobile flow:
 *   1. Cinematic scroll scrub (WHALE NETWORK zooms to infinity)
 *   2. Login gate (Wallet / Email) — iOS & Android safe
 *   3. Seamless transition into MobileManifesto landing page
 *
 * SSR is intentionally disabled: the gate reads cookies synchronously
 * on mount to decide which phase to start on (avoids a content flash).
 * The server-rendered fast-path in SmartLandingRouter handles the
 * initial paint with a lightweight skeleton.
 */
export const ClientMobileLanding = dynamic(
  () => import('./MobileImmersiveGate').then(m => ({ default: m.MobileImmersiveGate })),
  {
    ssr: false,
  }
);
