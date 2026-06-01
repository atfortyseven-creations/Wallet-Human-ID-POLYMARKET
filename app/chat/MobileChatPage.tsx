"use client";

import dynamic from "next/dynamic";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { UniversalEliteWallpaper } from "@/components/shared/UniversalEliteWallpaper";

// ─── Chat stack ─────────────────────────────────────────────────────────────
// IMPORTANT: We use ChatClientPage (which includes WhaleChatPINGate →
// WhaleChatInitPhase → SystemChat) instead of rendering SystemChat directly.
// Previously MobileChatPage rendered SystemChat raw, completely bypassing the
// PIN gate. This meant Humanity Ledger users on mobile landed in SystemChat's
// "needsWalletReconnect" screen and tapping "Connect Wallet" opened AppKit
// which did nothing (HL users are not WalletConnect users).
//
// With ChatClientPage:
//   1. WhaleChatPINGate detects the HL system_session_v2 session.
//   2. If session is valid AND PIN is unlocked → auto-passes, opens chat.
//   3. If PIN is needed → shows the PIN pad (correct UX).
//   4. isChecking spinner prevents any premature "No Wallet Connected" flash.
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
  useEffect(() => {
    const check = () => {
      setIsMobile(window.innerWidth < 768);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return isMobile;
}

export default function MobileChatPage() {
  const isMobile = useIsMobile();
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
          setViewportHeight(vv.height);
        });
      };
      update();
      vv.addEventListener("resize", update, { passive: true });
      return () => {
        vv.removeEventListener("resize", update);
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
                href="/dashboard"
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
        {/*  Top Navigation Bar  */}
        <header className="shrink-0 h-14 flex items-center justify-between px-5 bg-black/60 backdrop-blur-[60px] border-b border-white/5 z-10">
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

        {/* Full chat stack with PIN gate  wallpaper shows through */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
          <ChatClientPage />
        </div>
      </div>
    </>
  );
}
