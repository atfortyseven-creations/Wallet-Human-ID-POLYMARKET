"use client";

import { useState } from "react";
import { useAccount, useSignTypedData } from "wagmi";
import { toast } from "sonner";

/**
 * Hook for gasless proposal execution
 * 
 * Users sign an execution intent off-chain, relayer executes on-chain
 * User pays NO gas fees
 */

const GOVERNANCE_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_GOVERNANCE_CONTRACT_ADDRESS as `0x${string}`;

// EIP-712 Domain
const domain = {
    name: "PolymarketGovernanceGasless",
    version: "1",
    chainId: 84532, // Base Sepolia
    verifyingContract: GOVERNANCE_CONTRACT_ADDRESS,
} as const;

// EIP-712 Types for Execution
const types = {
    ExecuteProposal: [
        { name: "executor", type: "address" },
        { name: "proposalId", type: "bytes32" },
        { name: "nonce", type: "uint256" },
        { name: "deadline", type: "uint256" },
    ],
} as const;

export function useGaslessExecute() {
    const { address } = useAccount();
    const { signTypedDataAsync } = useSignTypedData();
    const [isLoading, setIsLoading] = useState(false);
    const [txHash, setTxHash] = useState<string | null>(null);

    /**
     * Execute a proposal (gasless)
     */
    const executeProposal = async (proposalId: string) => {
        if (!address) {
            toast.error("Please connect your wallet");
            return;
        }

        if (!GOVERNANCE_CONTRACT_ADDRESS) {
            toast.error("Governance contract not configured");
            return;
        }

        setIsLoading(true);
        const toastId = toast.loading("Preparing execution...");

        try {
            // Step 1: Fetch current nonce
            const nonceRes = await fetch(`/api/governance/nonce?address=${address}`);
            const { nonce } = await nonceRes.json();

            // Step 2: Calculate deadline
            const deadline = Math.floor(Date.now() / 1000) + 600;

            // Step 3: Prepare message
            const message = {
                executor: address,
                proposalId: proposalId as `0x${string}`,
                nonce: BigInt(nonce),
                deadline: BigInt(deadline),
            };

            toast.loading("Please sign the execution...", { id: toastId });

            // Step 4: Sign typed data
            const signature = await signTypedDataAsync({
                domain,
                types,
                primaryType: "ExecuteProposal",
                message,
            });

            toast.loading("Submitting to relayer...", { id: toastId });

            // Step 5: Send to relayer
            const response = await fetch("/api/relayer/execute", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    executor: address,
                    proposalId,
                    nonce,
                    deadline,
                    signature,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Execution failed");
            }

            setTxHash(data.txHash);
            toast.success("Proposal executed successfully! (Gasless)", { id: toastId });

            return {
                success: true,
                txHash: data.txHash,
            };

        } catch (error: any) {
            console.error("Gasless Execute Error:", error);
            toast.error(error.message || "Execution failed", { id: toastId });
            return { success: false, error: error.message };
        } finally {
            setIsLoading(false);
        }
    };

    return {
        executeProposal,
        isLoading,
        txHash,
    };
}
