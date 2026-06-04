"use client";

/**
 * SystemVaultBootstrap
 * 
 * A silent, zero-render-cost component that mounts once inside Providers.tsx
 * and triggers the System Vault auto-reconnect flow if a stored key exists.
 *
 * It performs NO rendering and has NO visible UI  pure side-effect on mount.
 */

import { useEffect } from "react";
import { useSystemConnect } from "@/hooks/useSystemConnect";

export function SystemVaultBootstrap() {
  const { autoReconnect } = useSystemConnect();

  useEffect(() => {
    // Defer by one tick so the Wagmi provider is fully hydrated before we
    // attempt to connect. This prevents a "connector not found" race condition.
    const id = setTimeout(autoReconnect, 50);
    return () => clearTimeout(id);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}
