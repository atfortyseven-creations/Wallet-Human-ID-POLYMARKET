import { encodeFunctionData, parseUnits, pad, concat, type Hex } from 'viem';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { GNOSIS_SAFE_ABI, USDC_ABI, POLYGON_USDC } from '@/src/config/contracts';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getFriendlyError } from '@/src/utils/errors';
import { useEffect } from 'react';

export function useWithdraw() {
    const { address } = useAccount();
    const { writeContractAsync, data: txHash, isPending } = useWriteContract();
    const queryClient = useQueryClient();

    const { isLoading: isConfirming, isSuccess, error: receiptError } = useWaitForTransactionReceipt({
        hash: txHash,
    });

    useEffect(() => {
        if (isSuccess) {
            toast.success('Retiro exitoso: Tus fondos están en camino.');
            // Invalidar todas las queries de contratos (balances)
            queryClient.invalidateQueries();
        }
        if (receiptError) {
            toast.error(getFriendlyError(receiptError));
        }
    }, [isSuccess, receiptError, queryClient]);

    const withdrawUSDC = async (
        proxyAddress: Hex,
        amount: string
    ) => {
        if (!address) {
            const error = "No hay wallet conectada";
            toast.error(error);
            throw new Error(error);
        }
        if (!proxyAddress) {
            const error = "No se detectó la Proxy Wallet";
            toast.error(error);
            throw new Error(error);
        }

        try {
            console.log("Iniciando retiro de:", amount, "USDC");

            const amountBigInt = parseUnits(amount, 6);

            const innerData = encodeFunctionData({
                abi: USDC_ABI,
                functionName: 'transfer',
                args: [address, amountBigInt],
            });

            const r = pad(address, { size: 32 });
            const s = pad("0x0", { size: 32 });
            const v = "0x01";
            const signature = concat([r, s, v]);

            const tx = await writeContractAsync({
                address: proxyAddress,
                abi: GNOSIS_SAFE_ABI,
                functionName: 'execTransaction',
                args: [
                    POLYGON_USDC,
                    0n,
                    innerData,
                    0,
                    0n,
                    0n,
                    0n,
                    '0x0000000000000000000000000000000000000000',
                    '0x0000000000000000000000000000000000000000',
                    signature
                ],
            });

            toast.info('Transacción enviada a la red...');
            return tx;

        } catch (error) {
            console.error("Error en el retiro:", error);
            toast.error(getFriendlyError(error));
            throw error;
        }
    };

    return {
        withdrawUSDC,
        isPending,
        isConfirming,
        isSuccess,
        txHash
    };
}
