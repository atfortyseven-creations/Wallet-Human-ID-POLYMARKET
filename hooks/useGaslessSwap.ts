"use client";

import { useState } from "react";
import { useAccount, useSignTypedData } from "wagmi";
import { toast } from "sonner";

/**
 * Hook for gasless swap functionality
 * 
 * Users sign a swap intent off-chain, relayer executes on-chain via Li.Fi
 * User pays NO gas fees
 */

interface GaslessSwapParams {
    fromChain: number;
    toChain: number;
    fromToken: string; // Address
    toToken: string; // Address
    fromAmount: string; // Wei/atomic units
    slippage?: number; // Basis points (50 = 0.5%)
}

export function useGaslessSwap() {
    const { address, chainId } = useAccount();
    const { signTypedDataAsync } = useSignTypedData();
    const [isLoading, setIsLoading] = useState(false);
    const [txHash, setTxHash] = useState<string | null>(null);

    /**
     * Execute a gasless swap
     * User signs, relayer executes
     */
    const executeGaslessSwap = async (params: GaslessSwapParams) => {
        if (!address) {
            toast.error("Please connect your wallet");
            return { success: false, error: "Wallet not connected" };
        }

        setIsLoading(true);
        const toastId = toast.loading("Preparing gasless swap...");

        try {
            // Step 1: Fetch current nonce
            const nonceRes = await fetch(`/api/relayer/swap?address=${address}`);
            const { nonce } = await nonceRes.json();

            // Step 2: Calculate deadline (5 minutes from now)
            const deadline = Math.floor(Date.now() / 1000) + 300;

            // Step 3: Prepare EIP-712 domain
            const domain = {
                name: "HumanDeFi Gasless Swap",
                version: "1",
                chainId: params.fromChain,
            };

            // Step 4: Prepare types
            const types = {
                Swap: [
                    { name: "user", type: "address" },
                    { name: "fromChain", type: "uint256" },
                    { name: "toChain", type: "uint256" },
                    { name: "fromToken", type: "address" },
                    { name: "toToken", type: "address" },
                    { name: "fromAmount", type: "uint256" },
                    { name: "slippage", type: "uint256" },
                    { name: "nonce", type: "uint256" },
                    { name: "deadline", type: "uint256" },
                ],
            };

            // Step 5: Prepare message
            const message = {
                user: address,
                fromChain: BigInt(params.fromChain),
                toChain: BigInt(params.toChain),
                fromToken: params.fromToken as `0x${string}`,
                toToken: params.toToken as `0x${string}`,
                fromAmount: BigInt(params.fromAmount),
                slippage: BigInt(params.slippage || 50), // 0.5% default
                nonce: BigInt(nonce),
                deadline: BigInt(deadline),
            };

            toast.loading("Please sign the transaction...", { id: toastId });

            // Step 6: Sign typed data (EIP-712)
            const signature = await signTypedDataAsync({
                domain,
                types,
                primaryType: "Swap",
                message,
            });

            toast.loading("Submitting to relayer...", { id: toastId });

            // Step 7: Send signature to relayer
            const response = await fetch("/api/relayer/swap", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user: address,
                    fromChain: params.fromChain,
                    toChain: params.toChain,
                    fromToken: params.fromToken,
                    toToken: params.toToken,
                    fromAmount: params.fromAmount,
                    slippage: params.slippage || 50,
                    nonce,
                    deadline,
                    signature,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Relayer execution failed");
            }

            // Step 8: Success!
            setTxHash(data.txHash);
            toast.success("Swap executed successfully! (Zero gas fees)", { id: toastId });

            return {
                success: true,
                txHash: data.txHash,
                blockNumber: data.blockNumber,
                gasUsed: data.gasUsed,
            };

        } catch (error: any) {
            console.error("Gasless Swap Error:", error);
            toast.error(error.message || "Swap failed", { id: toastId });
            return { success: false, error: error.message };
        } finally {
            setIsLoading(false);
        }
    };

    return {
        executeGaslessSwap,
        isLoading,
        txHash,
    };
}

