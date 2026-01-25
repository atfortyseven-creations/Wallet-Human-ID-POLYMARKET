import { parseUnits, type Hex } from 'viem';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { USDC_ABI, POLYGON_USDC } from '@/src/config/contracts';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getFriendlyError } from '@/src/utils/errors';
import { useEffect } from 'react';

export function useDeposit() {
    const { address } = useAccount();
    const { writeContractAsync, data: txHash, isPending } = useWriteContract();
    const queryClient = useQueryClient();

    const { isLoading: isConfirming, isSuccess, error: receiptError } = useWaitForTransactionReceipt({
        hash: txHash,
    });

    useEffect(() => {
        if (isSuccess) {
            toast.success('Depósito completado con éxito.');
            queryClient.invalidateQueries();
        }
        if (receiptError) {
            toast.error(getFriendlyError(receiptError));
        }
    }, [isSuccess, receiptError, queryClient]);

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

            toast.info('Transacción de depósito enviada...');
            return tx;

        } catch (error) {
            console.error("Error en el depósito:", error);
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
