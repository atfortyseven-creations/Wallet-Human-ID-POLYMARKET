"use client";

import { useState, useCallback } from 'react';

export function useNativeWallet() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [address, setAddress] = useState<string | null>(null);

  const connect = useCallback(async () => {
    setIsConnecting(true);

    try {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
      const isAndroid = /Android/.test(navigator.userAgent);
      const isMobile = isIOS || isAndroid;

      // Extract the exact hostname logic for the deep link intent.
      const currentHost = typeof window !== 'undefined' ? window.location.host : 'humanidfi.com';

      // 1. Mobile & No native window.ethereum injected -> Absolute Deep Link Intent
      if (isMobile && !(window as any).ethereum) {
        if (isAndroid) {
          // Direct Android Intent to force MetaMask Selector exclusively without browser redirects
          window.location.href = `intent://${currentHost}#Intent;scheme=metamask;package=io.metamask;end`;
        } else if (isIOS) {
          // Absolute iOS Custom Scheme to force MetaMask app
          window.location.href = `metamask://dapp/${currentHost}`;
        }
        setIsConnecting(false);
        return;
      }

      // 2. Desktop or Mobile with injected provider (e.g. browsing directly inside MetaMask the app)
      if ((window as any).ethereum) {
        try {
          const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
          if (accounts && accounts.length > 0) {
            setAddress(accounts[0]);
          }
        } catch (err: any) {
          console.error("Wallet injection rejected the connection:", err);
        }
      } else {
        alert("Wallet protocol not detected. Ensure you are navigating from an integrated environment.");
      }
    } catch (error) {
      console.error("Critical intent failure:", error);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setAddress(null);
  }, []);

  const formatAddress = (addr: string) => `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;

  return {
    address,
    isConnecting,
    connect,
    disconnect,
    formatAddress
  };
}
