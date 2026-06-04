"use client";

import { useEffect, useRef } from "react";
import { useAccount } from "wagmi";

export function GeoLoginTracker() {
  const { address, isConnected, connector } = useAccount();
  const trackedSession = useRef<string | null>(null);

  useEffect(() => {
    if (isConnected && address && trackedSession.current !== address) {
      trackedSession.current = address;
      
      // Fire the global intelligence tracker
      // This endpoint is GDPR compliant (IPs are hashed, only region/country is stored)
      // and feeds the real-time global Map on /registry
      fetch("/api/geo/login-event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: address, // Or hash of address if privacy required, but DB handles it
          sessionType: "WALLET_CONNECT",
          authMethod: connector?.name || "UNKNOWN",
          deviceType: window.innerWidth < 768 ? "MOBILE" : "DESKTOP",
          wasSuccessful: true,
        }),
      }).catch((err) => console.error("GeoTrack Error:", err));
    } else if (!isConnected) {
      trackedSession.current = null;
    }
  }, [isConnected, address, connector]);

  return null; // Invisible global tracker
}
