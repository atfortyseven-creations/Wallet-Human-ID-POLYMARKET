"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

// GPU-accelerated theme toggle  zero Framer overhead, CSS transform only
// will-change + transform3d forces compositing layer for 60fps flicker-free swap
export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  useEffect(() => { setMounted(true); }, []);

  // Placeholder: same size, no layout shift while mounting
  if (!mounted) {
    return <div className="w-10 h-10 rounded-full border border-black/10  bg-transparent shrink-0" aria-hidden />;
  }

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="
        relative flex items-center justify-center
        w-10 h-10 rounded-full shrink-0
        border border-black/10 
        bg-white 
        text-black 
        shadow-sm
        [transition:background-color_250ms_ease,border-color_250ms_ease,transform_120ms_ease]
        hover:scale-105 active:scale-95
        will-change-transform
      "
      style={{ WebkitFontSmoothing: 'antialiased' }}
    >
      {/* Sun icon */}
      <Sun
        size={17}
        strokeWidth={2}
        aria-hidden
        className="absolute [transition:opacity_220ms_ease,transform_220ms_ease]"
        style={{
          opacity: isDark ? 0 : 1,
          transform: isDark ? 'rotate(90deg) scale(0.5)' : 'rotate(0deg) scale(1)',
          willChange: 'transform, opacity',
        }}
      />
      {/* Moon icon */}
      <Moon
        size={17}
        strokeWidth={2}
        aria-hidden
        className="absolute [transition:opacity_220ms_ease,transform_220ms_ease]"
        style={{
          opacity: isDark ? 1 : 0,
          transform: isDark ? 'rotate(0deg) scale(1)' : 'rotate(-90deg) scale(0.5)',
          willChange: 'transform, opacity',
        }}
      />
    </button>
  );
}
