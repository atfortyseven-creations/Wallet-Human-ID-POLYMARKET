import { useAccount, useSignMessage, useReadContract } from "wagmi";
import { useState, useEffect } from "react";
import { toast } from "sonner";

// Placeholder for Polymarket/Gnosis Proxy Factory on Polygon
const PROXY_FACTORY_ADDRESS = "0xa584D285F5D0992300D775D4E680E7B28E8C0468";

// Using JSON ABI instead of parseAbi to avoid potential runtime parsing issues in edge environments
const FACTORY_ABI = [
    {
        inputs: [{ name: "_user", type: "address" }],
        name: "isInstantiation",
        outputs: [{ name: "", type: "bool" }],
        stateMutability: "view",
        type: "function",
    },
] as const;

export function usePolymarketSession() {
    const { address, isConnected } = useAccount();
    const { signMessageAsync } = useSignMessage();

    const [isProxyEnabled, setIsProxyEnabled] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [sessionLoading, setSessionLoading] = useState(false);

    // 1. Check if user has a Proxy Wallet deployed
    const { data: hasProxy, isLoading: isProxyCheckLoading } = useReadContract({
        address: PROXY_FACTORY_ADDRESS,
        abi: FACTORY_ABI,
        functionName: "isInstantiation",
        args: address ? [address] : undefined,
        query: {
            enabled: !!address // Only run if address is defined
        }
    });

    useEffect(() => {
        if (hasProxy) {
            setIsProxyEnabled(Boolean(hasProxy));
        }
    }, [hasProxy]);

    // 2. Login / Enable Trading (Simulated for Demo)
    const login = async () => {
        if (!address) return;
        setSessionLoading(true);

        try {
            // STEP 1: Request Signature
            const message = `Enable Polymarket Trading\nTimestamp: ${Date.now()}`;
            await signMessageAsync({ message });

            // STEP 2: Deploy Proxy Wallet (Active logic needed here)
            toast.info("Deploying Proxy Wallet...", { duration: 2000 });
            // The real logic would involve transaction confirmation for the proxy factory
            // e.g., await proxyFactory.deploy();

            toast.success("Proxy Wallet Enabled!");

            // Persist State
            setIsProxyEnabled(true);
            setIsAuthenticated(true);
            if (typeof window !== 'undefined') {
                localStorage.setItem("polymarket_proxy_enabled", "true");
            }

        } catch (error) {
            console.error("Login/Enable failed", error);
            toast.error("User denied signature");
        } finally {
            setSessionLoading(false);
        }
    };

    // Load persisted state on mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem("polymarket_proxy_enabled");
            if (stored === "true") {
                setIsProxyEnabled(true);
                setIsAuthenticated(true);
            }
        }
    }, []);

    return {
        address,
        isConnected,
        isProxyEnabled,
        isAuthenticated,
        // Add null checks for loading states to prevent hydration mismatches if possible
        isSessionLoading: sessionLoading || (!!address && isProxyCheckLoading),
        login
    };
}

