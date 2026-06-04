"use client";

import { useEffect, useState, useRef } from "react";

/**
 * 
 * usePerformanceMode
 * 
 * Detects device/battery state and returns a performance tier that canvas
 * components use to throttle their rAF loops.
 *
 * Tiers:
 *  "HIGH"     plugged in, high-end GPU, tab visible        target 60 fps
 *  "REDUCED"  battery  30% or charging but low cap        target 30 fps
 *  "MINIMAL"  battery saver / power-saver OS mode / tab
 *              hidden or very low battery                    target 10 fps
 *              (canvas renders skeleton only, particles halved)
 *
 * Returned values:
 *  mode           "HIGH" | "REDUCED" | "MINIMAL"
 *  targetFps      numeric fps cap the caller should honour
 *  isVisible      false when document.hidden (pause canvas entirely)
 *  particleScale  1.0 | 0.5 | 0.2  (multiply particle count by this)
 *  skipBloom      true when mode is not HIGH (skip expensive bloom passes)
 */

export type PerfMode = "HIGH" | "REDUCED" | "MINIMAL";

interface PerfState {
  mode: PerfMode;
  targetFps: number;
  isVisible: boolean;
  particleScale: number;
  skipBloom: boolean;
  skipEdges: boolean; // Skip O(n²) constellation lines
}

const FPS: Record<PerfMode, number> = {
  HIGH: 60,
  REDUCED: 30,
  MINIMAL: 10,
};

const PARTICLE_SCALE: Record<PerfMode, number> = {
  HIGH: 1.0,
  REDUCED: 0.5,
  MINIMAL: 0.2,
};

function deriveMode(
  batteryLevel: number,
  isCharging: boolean,
  isVisible: boolean,
  prefersReducedMotion: boolean,
  isSaverMode: boolean
): PerfMode {
  // User has opted into reduced motion  always be minimal
  if (prefersReducedMotion) return "MINIMAL";
  // OS battery saver active
  if (isSaverMode) return "MINIMAL";
  // Tab hidden  no need to render at all (caller should pause rAF)
  if (!isVisible) return "MINIMAL";
  // Critical battery
  if (batteryLevel <= 0.12 && !isCharging) return "MINIMAL";
  // Battery low (laptop unplugged under 30%)
  if (batteryLevel <= 0.30 && !isCharging) return "REDUCED";
  // Charging but very low battery  still be kind
  if (batteryLevel <= 0.15 && isCharging) return "REDUCED";
  return "HIGH";
}

export function usePerformanceMode(): PerfState {
  const [state, setState] = useState<PerfState>({
    mode: "HIGH",
    targetFps: 60,
    isVisible: true,
    particleScale: 1.0,
    skipBloom: false,
    skipEdges: false,
  });

  // Refs to track current values for event listeners
  const batteryRef = useRef({ level: 1, isCharging: true });
  const visibleRef = useRef(true);

  const updateMode = () => {
    const { level, isCharging } = batteryRef.current;
    const isVisible = visibleRef.current;
    const prefersReducedMotion =
      typeof window !== "undefined"
        ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
        : false;
    // navigator.connection is non-standard but broadly supported
    const conn = (navigator as any).connection;
    const isSaverMode = conn?.saveData === true;

    const mode = deriveMode(level, isCharging, isVisible, prefersReducedMotion, isSaverMode);

    setState({
      mode,
      targetFps: FPS[mode],
      isVisible,
      particleScale: PARTICLE_SCALE[mode],
      skipBloom: mode !== "HIGH",
      skipEdges: mode === "MINIMAL",
    });
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    //  Page Visibility API 
    const onVisibilityChange = () => {
      visibleRef.current = !document.hidden;
      updateMode();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    //  Battery Status API 
    let battery: any = null;
    const onBattery = (b: any) => {
      battery = b;
      const onBatteryChange = () => {
        batteryRef.current = { level: b.level, isCharging: b.charging };
        updateMode();
      };
      batteryRef.current = { level: b.level, isCharging: b.charging };
      b.addEventListener("levelchange", onBatteryChange);
      b.addEventListener("chargingchange", onBatteryChange);
      updateMode();
    };

    if ("getBattery" in navigator) {
      (navigator as any).getBattery().then(onBattery).catch(() => {
        // Battery API unavailable  stay at HIGH
      });
    }

    //  Prefers Reduced Motion 
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onMqChange = () => updateMode();
    mq.addEventListener("change", onMqChange);

    // Initial evaluation
    updateMode();

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      mq.removeEventListener("change", onMqChange);
      if (battery) {
        battery.removeEventListener("levelchange", () => {});
        battery.removeEventListener("chargingchange", () => {});
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return state;
}

/**
 * Utility: returns whether this rAF frame should actually render,
 * given the target FPS and the timestamp of the last rendered frame.
 *
 * Usage inside a rAF loop:
 *   if (!shouldRenderFrame(now, lastRenderedRef.current, targetFps)) { raf(tick); return; }
 *   lastRenderedRef.current = now;
 *   // ... render
 */
export function shouldRenderFrame(
  now: number,
  lastRender: number,
  targetFps: number
): boolean {
  const interval = 1000 / targetFps;
  return now - lastRender >= interval - 1; // -1ms tolerance for timer drift
}
