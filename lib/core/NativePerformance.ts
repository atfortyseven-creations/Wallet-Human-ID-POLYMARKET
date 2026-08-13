/**
 * Humanity Ledger Enterprise Core - NativePerformance
 *
 * Cross-platform performance & UX utilities designed for maximum
 * scalability across web, iOS (AppStore), and Android (Google Play).
 *
 * Key responsibilities:
 * - Haptic feedback (via navigator.vibrate on web, bridges to UIImpactFeedbackGenerator on native)
 * - Hardware-accelerated scroll locking (prevents jank during modal transitions)
 * - Frame budget management to avoid dropping frames during heavy ZK computations
 * - Safe-area inset helpers for iPhone notch / Dynamic Island / Android nav bar
 * - Network quality detection to gracefully degrade WebSocket-heavy features
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type HapticStyle = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';
export type NetworkQuality = 'excellent' | 'good' | 'poor' | 'offline';

// ─── Haptic Feedback ─────────────────────────────────────────────────────────
//
// Web: navigator.vibrate (Chrome Android only; silently ignored elsewhere)
// Native bridge: When running inside Capacitor/React Native, this would call
// Haptics.impact() / Haptics.notification() from @capacitor/haptics.
// The abstraction means zero code changes in consuming components.

const HAPTIC_PATTERNS: Record<HapticStyle, number | number[]> = {
  light:   10,
  medium:  20,
  heavy:   40,
  success: [10, 50, 10],
  warning: [20, 30, 20],
  error:   [40, 30, 40],
};

export function triggerHaptic(style: HapticStyle = 'light'): void {
  if (typeof navigator === 'undefined') return;
  try {
    if ('vibrate' in navigator) {
      navigator.vibrate(HAPTIC_PATTERNS[style]);
    }
    // [NATIVE BRIDGE POINT]: When Capacitor is present, replace above with:
    // import { Haptics, ImpactStyle } from '@capacitor/haptics';
    // await Haptics.impact({ style: ImpactStyle.Light });
  } catch {
    // Silently fail - haptics are enhancement, not requirement
  }
}

// ─── Scroll Lock (for Modals / Bottom Sheets) ────────────────────────────────
//
// On iOS, a simple overflow:hidden on body is insufficient — the underlying
// page can still scroll via inertia. We must additionally pin the body position.

let scrollLockCount = 0;
let savedScrollY = 0;

export function lockBodyScroll(): void {
  if (typeof document === 'undefined') return;
  scrollLockCount++;
  if (scrollLockCount > 1) return; // Already locked

  savedScrollY = window.scrollY;
  document.body.style.position = 'fixed';
  document.body.style.top = `-${savedScrollY}px`;
  document.body.style.left = '0';
  document.body.style.right = '0';
  document.body.style.overflowY = 'scroll';
}

export function unlockBodyScroll(): void {
  if (typeof document === 'undefined') return;
  scrollLockCount = Math.max(0, scrollLockCount - 1);
  if (scrollLockCount > 0) return; // Still locked by another consumer

  document.body.style.position = '';
  document.body.style.top = '';
  document.body.style.left = '';
  document.body.style.right = '';
  document.body.style.overflowY = '';
  window.scrollTo(0, savedScrollY);
}

// ─── Frame Budget Manager ─────────────────────────────────────────────────────
//
// Defers heavy work to idle frames using requestIdleCallback with a strict
// deadline. This prevents ZK proof simulations from spiking the main thread
// and dropping animation frames (key for 60fps on mobile).

export function scheduleIdleWork(work: () => void, timeoutMs = 2000): void {
  if (typeof window === 'undefined') return;

  if ('requestIdleCallback' in window) {
    (window as any).requestIdleCallback(
      (deadline: { timeRemaining: () => number; didTimeout: boolean }) => {
        if (deadline.timeRemaining() > 5 || deadline.didTimeout) {
          work();
        }
      },
      { timeout: timeoutMs }
    );
  } else {
    // Fallback: next macrotask (will not be idle-aware but prevents blocking current frame)
    setTimeout(work, 0);
  }
}

// ─── Network Quality Detection ────────────────────────────────────────────────
//
// Detects connection quality to gracefully degrade heavy features
// (e.g., reduce XMTP polling frequency on poor connections).

export function getNetworkQuality(): NetworkQuality {
  if (typeof navigator === 'undefined') return 'good';

  if (!navigator.onLine) return 'offline';

  const conn = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
  if (!conn) return 'good'; // No API, assume good

  const { effectiveType, downlink } = conn;

  if (effectiveType === '4g' && downlink > 2) return 'excellent';
  if (effectiveType === '4g' || effectiveType === '3g') return 'good';
  if (effectiveType === '2g' || effectiveType === 'slow-2g') return 'poor';

  return 'good';
}

// ─── Safe Area Insets ─────────────────────────────────────────────────────────
//
// Reads CSS env() variables for iPhone notch / Dynamic Island / Android nav bar.
// Consuming components should use these values for bottom padding in floating UIs.

export function getSafeAreaInsets(): { top: number; bottom: number; left: number; right: number } {
  if (typeof window === 'undefined') {
    return { top: 0, bottom: 0, left: 0, right: 0 };
  }

  const get = (prop: string): number => {
    const el = document.createElement('div');
    el.style.paddingTop = `env(${prop})`;
    el.style.position = 'absolute';
    el.style.visibility = 'hidden';
    document.body.appendChild(el);
    const val = parseInt(getComputedStyle(el).paddingTop || '0', 10);
    document.body.removeChild(el);
    return isNaN(val) ? 0 : val;
  };

  return {
    top: get('safe-area-inset-top'),
    bottom: get('safe-area-inset-bottom'),
    left: get('safe-area-inset-left'),
    right: get('safe-area-inset-right'),
  };
}

// ─── GPU Layer Promotion ──────────────────────────────────────────────────────
//
// Forces an element onto its own GPU compositing layer, ensuring the browser
// does not repaint it alongside other elements. Critical for list items in
// high-frequency data feeds (Markets orderbook, Chat message list).

export function promoteToGPULayer(el: HTMLElement | null): void {
  if (!el) return;
  el.style.transform = 'translateZ(0)';
  el.style.willChange = 'transform, opacity';
  el.style.backfaceVisibility = 'hidden';
}

export function demoteFromGPULayer(el: HTMLElement | null): void {
  if (!el) return;
  el.style.transform = '';
  el.style.willChange = 'auto';
  el.style.backfaceVisibility = '';
}

// ─── Debounce (RAF-based) ─────────────────────────────────────────────────────
//
// Animation-frame debounce — collapses rapid calls into a single frame.
// More efficient than time-based debounce for layout/scroll handlers.

export function rafDebounce<T extends (...args: any[]) => void>(fn: T): T {
  let rafId: number | null = null;
  return function (this: unknown, ...args: Parameters<T>) {
    if (rafId !== null) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(() => {
      fn.apply(this, args);
      rafId = null;
    });
  } as T;
}
