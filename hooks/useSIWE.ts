"use client";

import { useState, useCallback } from "react";
import { SiweMessage } from "siwe";
import { useAccount, useSignMessage, useChainId } from "wagmi";
import { toast } from "sonner";

export type SIWEStatus = "idle" | "pending-nonce" | "pending-sign" | "pending-verify" | "authenticated" | "error";

export interface UseSIWEReturn {
  status: SIWEStatus;
  address: string | null;
  signIn: () => Promise<boolean>;
  signOut: () => Promise<void>;
  error: string | null;
}

/**
 * useSIWE  Sign-In With Ethereum hook
 * 
 * Full SIWE authentication flow:
 * 1. GET /api/siwe/nonce           cryptographic nonce
 * 2. Build SiweMessage             domain + address + nonce + chain
 * 3. signMessageAsync              EIP-191 wallet signature
 * 4. POST /api/siwe/verify         server verifies + issues JWT session
 * 5. Cookie: human_session, system_handshake, wallet-auth
 */
export function useSIWE(): UseSIWEReturn {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { signMessageAsync } = useSignMessage();

  const [status, setStatus] = useState<SIWEStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [authedAddress, setAuthedAddress] = useState<string | null>(() => {
    // Restore from cookie on mount (fast SSR-safe check)
    if (typeof document === "undefined") return null;
    const match = document.cookie.match(/wallet-auth=([^;]+)/);
    return match ? match[1] : null;
  });

  const signIn = useCallback(async (): Promise<boolean> => {
    if (!isConnected || !address) {
      toast.error("Connect your wallet first to authenticate.");
      return false;
    }

    try {
      //  Step 1: Fetch nonce 
      setStatus("pending-nonce");
      setError(null);

      const nonceRes = await fetch("/api/siwe/nonce", { cache: "no-store" });
      if (!nonceRes.ok) throw new Error("Failed to obtain cryptographic nonce.");
      const nonce = await nonceRes.text();

      //  Step 2: Build SIWE message 
      const domain = window.location.host;
      const origin = window.location.origin;
      const checksummedAddress = (await import('viem')).getAddress(address);

      const message = new SiweMessage({
        domain,
        address: checksummedAddress,
        statement: "Authenticate into the Whale Alert System Network. This request will not trigger a blockchain transaction or cost any gas fees.",
        uri: origin,
        version: "1",
        chainId: chainId || 1,
        nonce,
        issuedAt: new Date().toISOString(),
        expirationTime: new Date(Date.now() + 1000 * 60 * 10).toISOString(), // 10 min
      });

      const preparedMessage = message.prepareMessage();

      //  Step 3: Request wallet signature 
      setStatus("pending-sign");
      let signature: string;

      try {
        signature = await signMessageAsync({ message: preparedMessage });
      } catch (signErr: any) {
        // User rejected the signature
        const rejected = signErr?.code === 4001 || signErr?.message?.toLowerCase().includes("reject");
        const msg = rejected ? "Signature rejected. Authentication cancelled." : "Failed to sign message.";
        toast.error(msg);
        setStatus("idle");
        setError(msg);
        return false;
      }

      //  Step 4: Verify on server 
      setStatus("pending-verify");

      const verifyRes = await fetch("/api/siwe/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: preparedMessage,
          signature,
        }),
      });

      if (!verifyRes.ok) {
        const errData = await verifyRes.json().catch(() => ({}));
        throw new Error(errData.error || "Server verification failed.");
      }

      const result = await verifyRes.json();

      if (!result.ok) {
        throw new Error(result.error || "Authentication rejected by server.");
      }

      //  Step 5: Session active 
      setStatus("authenticated");
      setAuthedAddress(result.address);
      toast.success("Enterprise ACCESS GRANTED", {
        description: `Identity verified: ${result.address.slice(0, 6)}...${result.address.slice(-4)}`,
      });

      return true;

    } catch (err: any) {
      const msg = err?.message || "Authentication failed.";
      setStatus("error");
      setError(msg);
      toast.error("AUTHENTICATION FAILED", { description: msg });
      return false;
    }
  }, [address, isConnected, chainId, signMessageAsync]);

  const signOut = useCallback(async () => {
    try {
      await fetch("/api/siwe/logout");
      setStatus("idle");
      setAuthedAddress(null);
      setError(null);
      toast.info("Session terminated.");
    } catch {
      // Silently clear local state even if network fails
      setStatus("idle");
      setAuthedAddress(null);
    }
  }, []);

  return {
    status,
    address: authedAddress,
    signIn,
    signOut,
    error,
  };
}
