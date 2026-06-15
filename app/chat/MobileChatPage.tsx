"use client";

import dynamic from "next/dynamic";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { UniversalEliteWallpaper } from "@/components/shared/UniversalEliteWallpaper";

// ─── Chat stack ─────────────────────────────────────────────────────────────
// IMPORTANT: We use ChatClientPage (which includes WhaleChatPINGate →
// WhaleChatInitPhase → SystemChat) instead of rendering SystemChat directly.
const ChatClientPage = dynamic(
  () => import("@/components/chat/ChatClientPage"),
  {
    ssr: false,
    loading: () => (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-[#9945FF] border-t-transparent animate-spin" />
          <p className="text-[10px] font-mono uppercase tracking-widest text-white/40">
            Loading Secure Channel
          </p>
        </div>
      </div>
    ),
  }
);

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
    const check = () => {
      setIsMobile(window.innerWidth < 768);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return { isMobile, isMounted };
}

export default function MobileChatPage() {
  const { isMobile, isMounted } = useIsMobile();
  const [viewportHeight, setViewportHeight] = useState<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    //  Body Scroll Lock 
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.height = '100%';
    document.body.style.overscrollBehavior = 'none';

    if (isMobile && window.visualViewport) {
      const vv = window.visualViewport!;
      const update = () => {
        if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(() => {
          // Use visualViewport height — this correctly shrinks when keyboard opens
          // and expands when it closes. offsetTop accounts for iOS address bar offset.
          setViewportHeight(vv.height);
        });
      };
      update();
      vv.addEventListener("resize", update, { passive: true });
      vv.addEventListener("scroll", update, { passive: true });
      return () => {
        vv.removeEventListener("resize", update);
        vv.removeEventListener("scroll", update);
        if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';
        document.body.style.height = '';
        document.body.style.overscrollBehavior = '';
      };
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
      document.body.style.overscrollBehavior = '';
    };
  }, [isMobile]);

  // Before mount: show a subtle spinner — NEVER black flash
  if (!isMounted) {
    return (
      <>
        <UniversalEliteWallpaper />
        <div className="fixed inset-0 z-[1000] flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-white/70 animate-spin" />
        </div>
      </>
    );
  }

  //  Desktop: simple flex-col filling the full viewport 
  if (!isMobile) {
    return (
      <>
        <UniversalEliteWallpaper />
        <div className="flex-1 flex flex-col h-screen w-full relative z-10 bg-transparent items-center">
          <div className="w-full flex flex-col h-full bg-black/40 backdrop-blur-3xl shadow-2xl overflow-hidden relative">
            {/*  Top Navigation Bar  */}
            <header className="shrink-0 h-14 flex items-center justify-between px-8 bg-black/60 backdrop-blur-[60px] border-b border-white/5 relative z-10 w-full">
              <Link
                href="/terminal"
                className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                aria-label="Back to dashboard"
              >
                <ArrowLeft size={18} />
              </Link>

              <div className="flex items-center gap-3">
                <img src="/official-whale-monochrome.png" alt="Whale" className="w-5 h-5 opacity-90 filter invert" />
                <span className="font-mono text-[12px] font-black uppercase tracking-[0.25em] text-white">Whale Chat</span>
              </div>

              <div className="w-9 flex items-center justify-center">
                <span className="font-mono text-[10px] font-black uppercase tracking-widest text-white/30">P2P</span>
              </div>
            </header>

            {/* Full chat stack with PIN gate */}
            <div className="flex-1 flex flex-col min-h-0 w-full overflow-hidden relative bg-transparent">
              <ChatClientPage />
            </div>
          </div>
        </div>
      </>
    );
  }

  //  Mobile: visual-viewport-anchored fixed positioning 
  const containerStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    // Use measured visualViewport height, fall back to 100dvh (better than 100vh on mobile)
    height: viewportHeight ? `${viewportHeight}px` : '100dvh',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    backgroundColor: 'transparent',
    zIndex: 1000,
  };

  return (
    <>
      <UniversalEliteWallpaper />
      <div style={containerStyle} className="text-[#050505] dark:text-white">
        {/*  Top Navigation Bar with safe-area-inset for iPhone notch */}
        <header
          className="shrink-0 flex items-end justify-between px-5 bg-black/60 backdrop-blur-[60px] border-b border-white/5 z-10"
          style={{
            paddingTop: 'calc(env(safe-area-inset-top) + 0.75rem)',
            paddingBottom: '0.75rem',
            minHeight: '56px',
          }}
        >
          <Link
            href="/"
            className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-white/5 text-white/50 transition-colors"
            aria-label="Back to home"
          >
            <ArrowLeft size={18} />
          </Link>

          <div className="flex items-center gap-2.5">
            <img src="/official-whale-monochrome.png" alt="Whale" className="w-4 h-4 opacity-80 filter invert" />
            <span className="font-mono text-[11px] font-black uppercase tracking-[0.25em] text-white">Whale Chat</span>
          </div>

          <div className="w-9 flex items-center justify-center">
            <span className="font-mono text-[9px] font-black uppercase tracking-widest text-white/20">P2P</span>
          </div>
        </header>

        {/* Full chat stack — wallpaper shows through. Safe-area-inset-bottom for home indicator */}
        <div
          className="flex-1 flex flex-col min-h-0 overflow-hidden relative"
        >
          <ChatClientPage />
        </div>
      </div>
    </>
  );
}
