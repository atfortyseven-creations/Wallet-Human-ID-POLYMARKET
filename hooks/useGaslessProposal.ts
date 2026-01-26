"use client";

import { useState } from "react";
import { useAccount, useSignTypedData } from "wagmi";
import { toast } from "sonner";

/**
 * Hook for gasless proposal creation
 * 
 * Users sign a proposal creation intent off-chain, relayer executes on-chain
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

// EIP-712 Types for Proposal Creation
const types = {
    CreateProposal: [
        { name: "proposer", type: "address" },
        { name: "marketId", type: "string" },
        { name: "title", type: "string" },
        { name: "description", type: "string" },
        { name: "stakeAmount", type: "uint256" },
        { name: "nonce", type: "uint256" },
        { name: "deadline", type: "uint256" },
    ],
} as const;

interface ProposalParams {
    marketId: string;
    title: string;
    description: string;
    stakeAmount: string; // In USDC
}

export function useGaslessProposal() {
    const { address } = useAccount();
    const { signTypedDataAsync } = useSignTypedData();
    const [isLoading, setIsLoading] = useState(false);
    const [txHash, setTxHash] = useState<string | null>(null);

    /**
     * Create a proposal (gasless)
     */
    const createProposal = async (params: ProposalParams) => {
        if (!address) {
            toast.error("Please connect your wallet");
            return;
        }

        if (!GOVERNANCE_CONTRACT_ADDRESS) {
            toast.error("Governance contract not configured");
            return;
        }

        setIsLoading(true);
        const toastId = toast.loading("Preparing proposal...");

        try {
            // Step 1: Fetch current nonce
            const nonceRes = await fetch(`/api/governance/nonce?address=${address}`);
            const { nonce } = await nonceRes.json();

            // Step 2: Calculate deadline (10 minutes)
            const deadline = Math.floor(Date.now() / 1000) + 600;

            // Step 3: Parse stake amount
            const stakeAmount = BigInt(parseFloat(params.stakeAmount) * 1e6); // USDC has 6 decimals

            // Step 4: Prepare message
            const message = {
                proposer: address,
                marketId: params.marketId,
                title: params.title,
                description: params.description,
                stakeAmount,
                nonce: BigInt(nonce),
                deadline: BigInt(deadline),
            };

            toast.loading("Please sign the proposal...", { id: toastId });

            // Step 5: Sign typed data
            const signature = await signTypedDataAsync({
                domain,
                types,
                primaryType: "CreateProposal",
                message,
            });

            toast.loading("Submitting to relayer...", { id: toastId });

            // Step 6: Send to relayer
            const response = await fetch("/api/relayer/proposal", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    proposer: address,
                    marketId: params.marketId,
                    title: params.title,
                    description: params.description,
                    stakeAmount: stakeAmount.toString(),
                    nonce,
                    deadline,
                    signature,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Proposal creation failed");
            }

            setTxHash(data.txHash);
            toast.success("Proposal created successfully! (Gasless)", { id: toastId });

            return {
                success: true,
                txHash: data.txHash,
                proposalId: data.proposalId,
            };

        } catch (error: any) {
            console.error("Gasless Proposal Error:", error);
            toast.error(error.message || "Proposal creation failed", { id: toastId });
            return { success: false, error: error.message };
        } finally {
            setIsLoading(false);
        }
    };

    return {
        createProposal,
        isLoading,
        txHash,
    };
}
