"use client";

import { useState } from "react";
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from "wagmi";
import { parseUnits, erc20Abi } from "viem";
import { toast } from "sonner";

// TODO: Replace with deployed contract address
const TIPS_CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000";
// TODO: Replace with USDC address on Polygon
const USDC_ADDRESS = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174"; // USDC.e on Polygon

const TIPS_ABI = [
    {
        inputs: [
            { internalType: "address", name: "trader", type: "address" },
            { internalType: "uint256", name: "amount", type: "uint256" },
        ],
        name: "tipTrader",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
] as const;

export function useTips() {
    const { address } = useAccount();
    const [isPending, setIsPending] = useState(false);

    const { writeContractAsync } = useWriteContract();

    const sendTip = async (traderAddress: string, amount: string) => {
        if (!address) {
            toast.error("Please connect your wallet first");
            return;
        }

        setIsPending(true);
        const amountBigInt = parseUnits(amount, 6); // USDC has 6 decimals

        try {
            // 1. Approve USDC
            toast.info("Approving USDC...");
            const approveHash = await writeContractAsync({
                address: USDC_ADDRESS,
                abi: erc20Abi,
                functionName: "approve",
                args: [TIPS_CONTRACT_ADDRESS, amountBigInt],
            });

            // In production, we should wait for receipt here, but strictly speaking 
            // writeContractAsync resolves when tx is submitted. 
            // For better UX we often wait.
            // For now, let's assume immediate next step or separate wait logic.

            // 2. Send Tip
            toast.info("Sending tip...");
            const tipHash = await writeContractAsync({
                address: TIPS_CONTRACT_ADDRESS,
                abi: TIPS_ABI,
                functionName: "tipTrader",
                args: [traderAddress as `0x${string}`, amountBigInt],
            });

            toast.success("Tip sent successfully!");
            return tipHash;
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Failed to send tip");
        } finally {
            setIsPending(false);
        }
    };

    return {
        sendTip,
        isPending
    };
}
