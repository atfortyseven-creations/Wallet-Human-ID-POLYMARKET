"use client";

/**
 * WalletQRMatrix — Universal QR Code Matrix for Humanity Ledger
 *
 * Generates the REAL cryptographic QR matrix from the wallet address and
 * exposes it in two modes:
 *
 *   mode="static"  → Renders a clean, scannable QR code (for WhaleChat, portfolio, contacts...)
 *   mode="animate" → Renders the pixel illumination animation for the fingerprint scanner
 *
 * The QR matrix is always the same binary grid derived from the wallet address,
 * so scanning the animated version with a camera works identically to the static one.
 */

import React, { useMemo, useState, useEffect, useRef } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AnimateQRProps {
  address: string;
  mode: "animate";
  progress: number;
  isPressing: boolean;
  illuminationOrder: number[];
  size?: number;
  className?: string;
}

export interface StaticQRProps {
  address: string;
  mode: "static";
  size?: number;
  cellSize?: number;
  className?: string;
  color?: string;
  bgColor?: string;
}

export type WalletQRMatrixProps = AnimateQRProps | StaticQRProps;

// ─── Core: QR Matrix Generator ────────────────────────────────────────────────

/**
 * Generates the raw boolean matrix from a QR code of the given content.
 * Uses qrcode library's synchronous create() API correctly.
 * Returns null while generating.
 */
export function useQRMatrix(content: string | null): boolean[][] | null {
  const [matrix, setMatrix] = useState<boolean[][] | null>(null);
  const lastContent = useRef<string | null>(null);

  useEffect(() => {
    // Treat empty string same as null — no valid QR can be generated
    const safeContent = content && content.trim().length > 0 ? content : null;

    if (!safeContent) {
      setMatrix(null);
      lastContent.current = null;
      return;
    }
    // Skip if content hasn't changed
    if (safeContent === lastContent.current) return;
    lastContent.current = safeContent;

    // Dynamically import to avoid SSR issues with the qrcode package
    import("qrcode").then((QRCode) => {
      try {
        // qrcode v1.5 create() is SYNCHRONOUS — returns QRCode object directly, not a Promise
        const qr = QRCode.create(safeContent, { errorCorrectionLevel: "M" });
        const modules = qr.modules;
        const dim: number = modules.size;
        const grid: boolean[][] = [];

        for (let row = 0; row < dim; row++) {
          const rowArr: boolean[] = [];
          for (let col = 0; col < dim; col++) {
            // modules.data is a Uint8Array / BitMatrix — non-zero = dark module
            rowArr.push(modules.data[row * dim + col] !== 0);
          }
          grid.push(rowArr);
        }
        setMatrix(grid);
      } catch (err) {
        console.warn("[WalletQRMatrix] QR generation failed:", err);
        setMatrix(null);
      }
    }).catch((err) => {
      console.warn("[WalletQRMatrix] Failed to load qrcode:", err);
      setMatrix(null);
    });
  }, [content]);

  return matrix;
}

/**
 * Flattens a 2D boolean QR matrix into a 1D array.
 * Also returns the grid dimension (always square).
 */
export function flattenMatrix(matrix: boolean[][]): { cells: boolean[]; dim: number } {
  const dim = matrix.length;
  const cells = matrix.flat();
  return { cells, dim };
}

// ─── Utility: Pre-generate Illumination Order ─────────────────────────────────

/**
 * Generates a stable shuffled illumination order using Fisher-Yates.
 * Must be called with useMemo so it's stable across renders.
 */
export function useIlluminationOrder(length: number): number[] {
  return useMemo(() => {
    const arr = Array.from({ length }, (_, i) => i);
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally empty: shuffle once per mount
}

// ─── Inner render components (no conditional hook calls) ─────────────────────

function AnimateQRInner({
  rawMatrix,
  progress,
  isPressing,
  illuminationOrder,
  size,
  className,
}: {
  rawMatrix: boolean[][];
  progress: number;
  isPressing: boolean;
  illuminationOrder: number[];
  size: number;
  className: string;
}) {
  const { cells, dim } = flattenMatrix(rawMatrix);
  const total = cells.length;

  // Build rank lookup: illuminationOrder[rank] = cellIndex → rankOf[cellIndex] = rank/total
  const rankOf = useMemo(() => {
    const arr = new Float32Array(total).fill(1); // default: illuminate last
    const len = illuminationOrder.length;
    for (let rank = 0; rank < len && rank < total; rank++) {
      const cellIdx = illuminationOrder[rank] % total;
      arr[cellIdx] = rank / Math.max(total - 1, 1);
    }
    return arr;
  }, [illuminationOrder, total]);

  // Calculate cell pixel size ensuring it's always >= 1
  const GAP = 1;
  const cellPx = Math.max(1, Math.floor((size - GAP * (dim - 1)) / dim));
  // Recalculate total rendered size based on actual cellPx
  const renderedSize = dim * cellPx + GAP * (dim - 1);

  return (
    <div
      className={`relative flex-shrink-0 ${className}`}
      style={{ width: renderedSize, height: renderedSize }}
      aria-hidden="true"
      role="presentation"
    >
      {cells.map((isDark, i) => {
        if (!isDark) return null;

        const row = Math.floor(i / dim);
        const col = i % dim;
        // The fade happens over a window of 8 progress units.
        // The highest threshold is 100 - 8 = 92, meaning the last pixel starts fading at 92% and finishes exactly at 100%.
        const fadeWindow = 8;
        const maxThreshold = 100 - fadeWindow;
        const threshold = rankOf[i] * maxThreshold;

        let opacity = 0.04;
        let scale = 1;
        let isFullyRevealed = false;

        if (progress >= 100) {
          opacity = 1;
          scale = 1;
          isFullyRevealed = true;
        } else if (progress > threshold) {
          const fadeProgress = Math.min(1, (progress - threshold) / fadeWindow);
          opacity = 0.04 + fadeProgress * 0.96;
          // While fading, the pixel blooms (scale 1.15). When its fade finishes, it snaps to perfect crisp scale 1.0
          if (fadeProgress === 1) {
            scale = 1;
            isFullyRevealed = true;
          } else {
            scale = 1.15;
          }
        }

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: col * (cellPx + GAP),
              top: row * (cellPx + GAP),
              width: cellPx,
              height: cellPx,
              backgroundColor: "#000000",
              opacity,
              borderRadius: isFullyRevealed ? 0 : 2, // Sharp corners when fully revealed
              willChange: "opacity, transform",
              transition: isPressing
                ? "opacity 0.25s ease-out, transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), border-radius 0.2s"
                : "opacity 0.15s ease-in, transform 0.15s ease-in",
              transform: `scale(${scale})`,
            }}
          />
        );
      })}
    </div>
  );
}

function StaticQRInner({
  rawMatrix,
  size,
  cellSize,
  color,
  bgColor,
  className,
  address,
}: {
  rawMatrix: boolean[][];
  size: number;
  cellSize: number;
  color: string;
  bgColor: string;
  className: string;
  address: string;
}) {
  const { cells, dim } = flattenMatrix(rawMatrix);
  // Ensure the QR fits within `size` if cellSize is not specified
  const resolvedCellSize = cellSize || Math.max(2, Math.floor(size / dim));
  const totalPx = dim * resolvedCellSize;

  return (
    <svg
      width={totalPx}
      height={totalPx}
      viewBox={`0 0 ${totalPx} ${totalPx}`}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ background: bgColor === "transparent" ? undefined : bgColor, display: "block" }}
      aria-label={`QR code for wallet address ${address}`}
      role="img"
    >
      {bgColor !== "transparent" && (
        <rect width={totalPx} height={totalPx} fill={bgColor} />
      )}
      {cells.map((isDark, i) => {
        if (!isDark) return null;
        const row = Math.floor(i / dim);
        const col = i % dim;
        return (
          <rect
            key={i}
            x={col * resolvedCellSize}
            y={row * resolvedCellSize}
            width={resolvedCellSize}
            height={resolvedCellSize}
            fill={color}
          />
        );
      })}
    </svg>
  );
}

// ─── Main Component (hooks always called unconditionally) ─────────────────────

export function WalletQRMatrix(props: WalletQRMatrixProps) {
  const { address, mode, size = 320, className = "" } = props;

  // ethereum: URI prefix makes it scannable by MetaMask, Trust, Coinbase, etc.
  // Pass null if no valid address — triggers skeleton state
  const qrContent = address && address.trim().length > 0 ? `ethereum:${address}` : null;

  // Hook always called — never inside a conditional
  const rawMatrix = useQRMatrix(qrContent);

  // ── Skeleton while generating ──────────────────────────────────────────────
  if (!rawMatrix) {
    return (
      <div
        className={`animate-pulse bg-black/5 rounded ${className}`}
        style={{ width: size, height: size }}
        aria-label="Generating QR code..."
        role="status"
      />
    );
  }

  // ── Animate Mode ──────────────────────────────────────────────────────────
  if (mode === "animate") {
    const { progress, isPressing, illuminationOrder } = props as AnimateQRProps;
    return (
      <AnimateQRInner
        rawMatrix={rawMatrix}
        progress={progress}
        isPressing={isPressing}
        illuminationOrder={illuminationOrder}
        size={size}
        className={className}
      />
    );
  }

  // ── Static Mode ───────────────────────────────────────────────────────────
  const {
    cellSize = 0, // 0 = auto-fit to `size`
    color = "#000000",
    bgColor = "transparent",
  } = props as StaticQRProps;

  return (
    <StaticQRInner
      rawMatrix={rawMatrix}
      size={size}
      cellSize={cellSize}
      color={color}
      bgColor={bgColor}
      className={className}
      address={address}
    />
  );
}
