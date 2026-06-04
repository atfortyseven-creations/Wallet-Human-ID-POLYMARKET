"use client";

import React, { useEffect, useState } from "react";
import { ImmersiveManifestoLanding } from "./ImmersiveManifestoLanding";
import { SystemFooter } from "./SystemFooter";
import { useSystemAccount } from "@/hooks/useSystemAccount";

export function ClientRootRouter() {
  const { isConnected } = useSystemAccount();
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    const check = () => {
      const hasCookie = typeof document !== "undefined" &&
        (document.cookie.includes("system_handshake=") ||
         document.cookie.includes("siwe_session="));
      
      if (isConnected || hasCookie) {
        setHasSession(true);
      } else {
        setHasSession(false);
      }
    };
    
    // Run immediately on mount
    check();
    
    // [ANDROID PERF FIX] Replace 500ms setInterval with event-driven checks.
    const onVisibility = () => { if (document.visibilityState === 'visible') check(); };
    const onStorage = () => check();
    
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('storage', onStorage);
    
    // Single delayed check: catches cookies set within 1.5s of mount (post-redirect auth)
    const delayedCheck = setTimeout(check, 1500);
    
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('storage', onStorage);
      clearTimeout(delayedCheck);
    };
  }, [isConnected]);

  return (
    <div className="flex flex-col w-full min-w-full flex-1 bg-white" style={{width:'100%',minWidth:'100%'}}>
      <ImmersiveManifestoLanding />
      <SystemFooter />
    </div>
  );
}
