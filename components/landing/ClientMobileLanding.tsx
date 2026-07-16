"use client";

import dynamic from 'next/dynamic';

/**
 * ClientMobileLanding
 * 
 * On mobile, the root domain `/` directly serves the ConnectPage flow.
 * This guarantees users see the cinematic AUTHENTICATE presentation and
 * the mobile-adapted native wallet login immediately upon visiting the domain.
 */
export const ClientMobileLanding = dynamic(
  () => import('./ConnectPage').then(m => ({ default: m.default })),
  {
    ssr: false,
  }
);
