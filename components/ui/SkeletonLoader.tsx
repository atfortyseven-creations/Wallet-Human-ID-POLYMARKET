"use client";

/**
 * SkeletonLoader  Standardized GPU-composited skeleton placeholders
 *
 * Provides branded skeleton components for every data-heavy dashboard module.
 * All animations use transform+opacity only (240Hz GPU contract).
 */

import React from "react";

//  Base shimmer animation 

function Shimmer({ className = "", style = {} }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`rounded-xl overflow-hidden relative ${className}`}
      style={{
        background: "rgba(0,0,0,0.05)",
        ...style,
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%)",
          animation: "shimmer 1.6s ease-in-out infinite",
          backgroundSize: "200% 100%",
        }}
      />
    </div>
  );
}

//  Akashic Ledger Skeleton 

export function AkashicSkeleton() {
  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div className="space-y-2">
          <Shimmer style={{ width: 280, height: 28 }} />
          <Shimmer style={{ width: 200, height: 14 }} />
        </div>
        <Shimmer style={{ width: 120, height: 36, borderRadius: 16 }} />
      </div>

      {/* Tamper stats bar */}
      <div
        className="grid grid-cols-4 gap-4 p-5 rounded-2xl"
        style={{ background: "rgba(0,0,0,0.02)", border: "1px solid rgba(0,0,0,0.04)" }}
      >
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="space-y-2">
            <Shimmer style={{ height: 28, width: "70%" }} />
            <Shimmer style={{ height: 10, width: "90%" }} />
          </div>
        ))}
      </div>

      {/* Entry cards */}
      {[1, 2, 3].map(i => (
        <div
          key={i}
          className="p-6 rounded-2xl space-y-4"
          style={{
            background: "#fff",
            border: "1px solid rgba(0,0,0,0.05)",
            opacity: 1 - i * 0.15,
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shimmer style={{ width: 36, height: 36, borderRadius: 12 }} />
              <div className="space-y-1.5">
                <Shimmer style={{ width: 140, height: 16 }} />
                <Shimmer style={{ width: 90, height: 11 }} />
              </div>
            </div>
            <Shimmer style={{ width: 80, height: 24, borderRadius: 20 }} />
          </div>
          <div
            className="grid grid-cols-4 gap-3 pt-3 border-t"
            style={{ borderColor: "rgba(0,0,0,0.04)" }}
          >
            {[1, 2, 3, 4].map(j => (
              <div key={j} className="space-y-1">
                <Shimmer style={{ height: 10, width: "60%" }} />
                <Shimmer style={{ height: 18, width: "80%" }} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

//  Mass Transfer Skeleton 

export function MassTransferSkeleton() {
  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div className="space-y-2">
          <Shimmer style={{ width: 320, height: 28 }} />
          <Shimmer style={{ width: 240, height: 14 }} />
        </div>
        <div className="flex gap-3">
          <Shimmer style={{ width: 100, height: 36, borderRadius: 16 }} />
          <Shimmer style={{ width: 130, height: 36, borderRadius: 16 }} />
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div
            key={i}
            className="p-5 rounded-2xl space-y-2"
            style={{ background: "#fff", border: "1px solid rgba(0,0,0,0.05)" }}
          >
            <Shimmer style={{ width: "60%", height: 32 }} />
            <Shimmer style={{ width: "90%", height: 10 }} />
            <Shimmer style={{ width: "50%", height: 10 }} />
          </div>
        ))}
      </div>

      {/* Tier distribution */}
      <div
        className="p-5 rounded-2xl space-y-3"
        style={{ background: "#fff", border: "1px solid rgba(0,0,0,0.05)" }}
      >
        <Shimmer style={{ width: 180, height: 12 }} />
        {[90, 65, 45, 30, 20].map((w, i) => (
          <div key={i} className="flex items-center gap-3">
            <Shimmer style={{ width: 80, height: 10 }} />
            <Shimmer style={{ flex: 1, height: 6, borderRadius: 99 }} />
            <Shimmer style={{ width: 24, height: 10 }} />
          </div>
        ))}
      </div>

      {/* Event rows */}
      {[1, 2, 3, 4, 5, 6].map(i => (
        <div
          key={i}
          className="flex items-center gap-4 px-5 py-3.5 rounded-2xl"
          style={{
            background: "#fff",
            border: "1px solid rgba(0,0,0,0.04)",
            opacity: 1 - i * 0.1,
          }}
        >
          <Shimmer style={{ width: 8, height: 8, borderRadius: "50%" }} />
          <Shimmer style={{ width: 60, height: 20, borderRadius: 10 }} />
          <div className="flex-1 space-y-1.5">
            <Shimmer style={{ width: "40%", height: 14 }} />
            <Shimmer style={{ width: "25%", height: 10 }} />
          </div>
          <Shimmer style={{ width: 70, height: 10 }} />
        </div>
      ))}
    </div>
  );
}

//  Portfolio Skeleton 

export function PortfolioSkeleton() {
  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="space-y-2 mb-8">
        <Shimmer style={{ width: 200, height: 28 }} />
        <Shimmer style={{ width: 280, height: 14 }} />
      </div>

      {/* Total value */}
      <div
        className="p-8 rounded-3xl space-y-3 text-center"
        style={{ background: "#fff", border: "1px solid rgba(0,0,0,0.05)" }}
      >
        <Shimmer style={{ width: 120, height: 14, margin: "0 auto" }} />
        <Shimmer style={{ width: 220, height: 48, margin: "0 auto" }} />
        <Shimmer style={{ width: 80, height: 14, margin: "0 auto" }} />
      </div>

      {/* Asset rows */}
      {[1, 2, 3, 4].map(i => (
        <div
          key={i}
          className="flex items-center gap-4 p-5 rounded-2xl"
          style={{ background: "#fff", border: "1px solid rgba(0,0,0,0.04)", opacity: 1 - i * 0.12 }}
        >
          <Shimmer style={{ width: 40, height: 40, borderRadius: "50%" }} />
          <div className="flex-1 space-y-1.5">
            <Shimmer style={{ width: 80, height: 15 }} />
            <Shimmer style={{ width: 50, height: 11 }} />
          </div>
          <div className="space-y-1.5 text-right">
            <Shimmer style={{ width: 90, height: 15 }} />
            <Shimmer style={{ width: 50, height: 11 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

//  Generic Table Skeleton 

export function TableSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="p-6 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 px-2">
        <Shimmer style={{ width: 240, height: 24 }} />
        <Shimmer style={{ width: 100, height: 32, borderRadius: 16 }} />
      </div>
      {/* Column headers */}
      <div className="flex gap-4 px-4 pb-2">
        {[150, 80, 100, 80, 60].map((w, i) => (
          <Shimmer key={i} style={{ width: w, height: 10 }} />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 px-4 py-3 rounded-xl"
          style={{
            background: "#fff",
            border: "1px solid rgba(0,0,0,0.04)",
            opacity: 1 - i * 0.07,
          }}
        >
          {[150, 80, 100, 80, 60].map((w, j) => (
            <Shimmer key={j} style={{ width: w, height: 13, flexShrink: 0 }} />
          ))}
        </div>
      ))}
    </div>
  );
}

//  CSS keyframe injection 
// (shimmer is injected via globals.css or style tag  see below)
if (typeof document !== "undefined") {
  const id = "__system_shimmer_kf";
  if (!document.getElementById(id)) {
    const style = document.createElement("style");
    style.id = id;
    style.textContent = `
      @keyframes shimmer {
        0%   { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
      }
    `;
    document.head.appendChild(style);
  }
}
