"use client";

import React, { useEffect, useState } from "react";
import { ImmersiveManifestoLanding } from "./ImmersiveManifestoLanding";
import { SystemFooter } from "./SystemFooter";
import { useSystemAccount } from "@/hooks/useSystemAccount";

// Helper: check if system_handshake cookie already exists (any valid type)
function hasValidHandshakeCookie(): boolean {
  if (typeof document === 'undefined') return false;
  try {
    return document.cookie.split('; ').some(c =>
      c.startsWith('system_handshake=0x') ||
      c.startsWith('system_handshake=email_')
    );
  } catch { return false; }
}

export function ClientRootRouter() {
  const { isConnected } = useSystemAccount();
  const [hasSession, setHasSession] = useState(false);

  // ── Google OAuth Session Heal ───────────────────────────────────────────
  // After a Google OAuth callback, NextAuth sets HttpOnly `human.session-token`
  // but the client-side gate needs `system_handshake` (a JS-readable cookie).
  // We call /api/auth/session-heal once on mount to bridge that gap.
  useEffect(() => {
    const heal = async () => {
      try {
        // If system_handshake is already present, nothing to do.
        if (hasValidHandshakeCookie()) return;

        // Check if there is a NextAuth session and heal the cookie.
        const res = await fetch('/api/auth/session-heal', {
          credentials: 'include',
          cache: 'no-store',
        });
        if (res.ok) {
          const data = await res.json();
          if (data.healed) {
            console.info('[ClientRootRouter] Google OAuth session healed. Reloading gate check...');
            // The cookie is now set; force the TitaniumGate to re-evaluate by
            // triggering a storage event (it listens to visibilitychange + storage).
            try { window.dispatchEvent(new Event('storage')); } catch {}
          }
        }
      } catch {
        // Non-blocking — if heal fails, the user will be prompted to re-authenticate.
      }
    };

    heal();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    <div className="w-full bg-white flex flex-col">
      <ImmersiveManifestoLanding />
      <SystemFooter />
    </div>
  );
}
