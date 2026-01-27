import { useReadContract, useWriteContract, useAccount } from 'wagmi';
import { parseUnits } from 'viem';
import { calcBuyAmount } from '../lib/fpmm-math';

// Minimal ABI for FPMM
const FPMM_ABI = [
    {
        name: 'buy',
        type: 'function',
        stateMutability: 'nonpayable',
        inputs: [
            { name: 'investmentAmount', type: 'uint256' },
            { name: 'outcomeIndex', type: 'uint256' },
            { name: 'minOutcomeTokensToBuy', type: 'uint256' }
        ],
        outputs: []
    },
    {
        name: 'calcBuyAmount',
        type: 'function',
        stateMutability: 'view',
        inputs: [
            { name: 'investmentAmount', type: 'uint256' },
            { name: 'outcomeIndex', type: 'uint256' }
        ],
        outputs: [{ name: '', type: 'uint256' }]
    },
    // We would need 'sell' as well
] as const;

export function useFPMM(marketAddress: `0x${string}`) {
    const { writeContract, data: hash, isPending, error } = useWriteContract();

    // Buy Outcome Tokens
    // outcomeIndex: 0 for YES (usually), 1 for NO. (Depends on Market Maker initialization!)
    // IMPORTANT: Check FPMM implementation. Usually Index 0 corresponds to the FIRST outcome slot (YES), Index 1 to NO.
    const buy = (investmentAmount: string, outcomeIndex: number, minTokensOut: bigint) => {
        if (!marketAddress) throw new Error("Market Address not provided");

        const weiInvestment = parseUnits(investmentAmount, 18);

        writeContract({
            address: marketAddress,
            abi: FPMM_ABI,
            functionName: 'buy',
            args: [
                weiInvestment,
                BigInt(outcomeIndex),
                minTokensOut
            ]
        });
    };

    return {
        buy,
        isPending,
        hash,
        error
    };
}
