"use client";

/**
 * WalletQRDisplay — Drop-in static QR code for the wallet address.
 *
 * Use anywhere in the system (Portfolio, WhaleChat, Settings, Profile, etc.)
 * by simply importing and passing the wallet address:
 *
 *   <WalletQRDisplay address="0x..." size={240} />
 *
 * The QR encodes `ethereum:<address>` so any wallet scanner (MetaMask, Trust,
 * Coinbase, etc.) can import it by scanning. It is identical to the QR shown
 * during the fingerprint scan onboarding animation.
 *
 * NOTE: `size` is the master control — cellSize is derived automatically so
 * the QR always fills exactly the requested pixel size.
 */

import React from "react";
import { WalletQRMatrix } from "@/components/ui/WalletQRMatrix";

interface WalletQRDisplayProps {
  address: string | null | undefined;
  /** Total pixel width/height of the rendered QR (default: 240) */
  size?: number;
  /** Foreground color (default: #000000) */
  color?: string;
  /** Background color (default: #ffffff) */
  bgColor?: string;
  /** Extra Tailwind classes for the wrapper */
  className?: string;
  /** If true, shows a centered wallet address label below the QR */
  showAddress?: boolean;
  /** If true, adds a subtle border frame */
  withFrame?: boolean;
}

export function WalletQRDisplay({
  address,
  size = 240,
  color = "#000000",
  bgColor = "#ffffff",
  className = "",
  showAddress = false,
  withFrame = true,
}: WalletQRDisplayProps) {
  if (!address) {
    return (
      <div
        className={`animate-pulse bg-black/10 rounded-xl ${className}`}
        style={{ width: size, height: size }}
        aria-label="Loading QR code..."
        role="status"
      />
    );
  }

  const short = `${address.slice(0, 6)}...${address.slice(-4)}`;

  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      <div
        className={withFrame ? "p-3 rounded-xl shadow-lg border border-black/10 bg-white" : ""}
        style={{ display: "inline-block" }}
        aria-label={`QR code for wallet address ${address}`}
      >
        {/* cellSize=0 means WalletQRMatrix auto-fits to `size` */}
        <WalletQRMatrix
          address={address}
          mode="static"
          size={size}
          cellSize={0}
          color={color}
          bgColor={bgColor}
        />
      </div>
      {showAddress && (
        <span
          className="font-mono text-[11px] text-black/50 tracking-widest select-all cursor-text"
          title={address}
        >
          {short}
        </span>
      )}
    </div>
  );
}
