import { parseUnits, type Hex } from 'viem';
import { useAccount, useWriteContract } from 'wagmi';
import { USDC_ABI, POLYGON_USDC } from '@/src/config/contracts';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getFriendlyError } from '@/src/utils/errors';
import { useEffect, useState } from 'react';

export function useDeposit() {
    const { address } = useAccount();
    const { writeContractAsync, data: txHash, isPending } = useWriteContract();
    const queryClient = useQueryClient();

    const [isConfirming, setIsConfirming] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        if (isSuccess) {
            toast.success('Deposit successfully completed.');
            queryClient.invalidateQueries();
        }
    }, [isSuccess, queryClient]);

    const depositUSDC = async (
        proxyAddress: Hex,
        amount: string
    ) => {
        if (!address) {
            toast.error("No hay wallet conectada");
            throw new Error("No hay wallet conectada");
        }

        try {
            const amountBigInt = parseUnits(amount, 6);

            console.log("Depositando", amount, "USDC a", proxyAddress);

            const tx = await writeContractAsync({
                address: POLYGON_USDC,
                abi: USDC_ABI,
                functionName: 'transfer',
                args: [proxyAddress, amountBigInt],
            });

            toast.info('Deposit transaction sent...');
            setIsConfirming(true);
            setTimeout(() => {
                setIsConfirming(false);
                setIsSuccess(true);
            }, 800);
            
            return tx;

        } catch (error) {
            console.error("Deposit error:", error);
            toast.error(getFriendlyError(error));
            throw error;
        }
    };

    return {
        depositUSDC,
        isPending,
        isConfirming,
        isSuccess,
        txHash
    };
}

