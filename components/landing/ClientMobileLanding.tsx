"use client";

import dynamic from 'next/dynamic';

/**
 * ClientMobileLanding  dynamic import to avoid SSR issues with
 * MobileManifesto (uses browser APIs for live whale flow fetching).
 */
export const ClientMobileLanding = dynamic(
  () => import('./MobileManifesto').then(m => ({ default: m.MobileManifesto })),
  {
    ssr: true, // SSR enabled: server pre-renders HTML, eliminates the blank-flash load delay
  }
);
