import { useAccount, useConfig, useChainId, useSwitchChain } from 'wagmi';
import { estimateGas, sendTransaction, waitForTransactionReceipt } from '@wagmi/core';
import { parseEther, type Address } from 'viem';
import { useState } from 'react';
import { toast } from 'sonner';

/**
 * Legendary Transaction Handler Hook
 * Bridges internal wallet logic with external linked wallets.
 */
export function useTransactionHandler() {
    const { address, isConnected } = useAccount();
    const config = useConfig();
    const chainId = useChainId();
    const { switchChainAsync } = useSwitchChain();
    const [isLoading, setIsLoading] = useState(false);

    /**
     * Executes a transaction using the connected external wallet
     */
    const handleExternalTransaction = async (txData: {
        to: Address;
        value?: bigint | string;
        data?: `0x${string}`;
        chainId: number;
    }) => {
        if (!isConnected) {
            toast.error("Please connect your wallet first");
            return;
        }

        setIsLoading(true);
        const id = toast.loading("Confirming transaction in your wallet...");

        try {
            if (chainId !== txData.chainId && switchChainAsync) {
                toast.loading(`Cambiando a la red ${txData.chainId}...`, { id });
                await switchChainAsync({ chainId: txData.chainId });
                await new Promise(r => setTimeout(r, 1000));
            }

            const txValue = typeof txData.value === 'string' ? parseEther(txData.value) : txData.value;

            toast.loading("Calculating transaction gas...", { id });
            // 1. Perform safety estimation first (Elite Grade)
            const gas = await estimateGas(config, {
                account: address,
                to: txData.to,
                value: txValue,
                data: txData.data,
            });

            toast.loading("Sign the transaction in your wallet...", { id });

            // 2. Send transaction via Wagmi
            const hash = await sendTransaction(config, {
                account: address,
                to: txData.to,
                value: txValue,
                data: txData.data,
                gas: (gas * 110n) / 100n, // 10% safety buffer
            });

            toast.loading(`Awaiting block confirmation (Hash: ${hash.slice(0,6)}...)...`, { id });
            
            // 3. STRICT ON-CHAIN REQUIREMENT: Wait for actual block receipt
            const receipt = await waitForTransactionReceipt(config, { hash });
            
            if (receipt.status !== 'success') {
                throw new Error("Transaction reverted on-chain");
            }

            toast.success("Transaction Confirmed on Blockchain!", { id });
            return hash;
        } catch (error: any) {
            console.error("External Tx Error:", error);
            toast.error(error.message || "Transaction failed", { id });
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        handleExternalTransaction,
        isLoading,
        isConnected,
        userAddress: address
    };
}

