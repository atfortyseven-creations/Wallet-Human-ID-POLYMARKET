"use client";
import React from 'react';
import { ShieldCheck } from 'lucide-react';

/**
 * NonCustodialBanner — Fase 5: Apple/Google required disclaimer.
 * Must be visible on any view handling balances, portfolio or transactions.
 */
export function NonCustodialBanner() {
  return (
    <div className="w-full bg-[#f0f0f0] border-b border-[#e0e0e0] py-2 px-4 flex items-center gap-2 text-[11px] text-[#555] font-medium">
      <ShieldCheck size={13} className="text-indigo-500 shrink-0" />
      <span>
        Humanity Ledger is a <strong>non-custodial</strong> software interface. We do not hold, store, transfer, or control user funds. All operations are executed client-side on your device.
      </span>
    </div>
  );
}
