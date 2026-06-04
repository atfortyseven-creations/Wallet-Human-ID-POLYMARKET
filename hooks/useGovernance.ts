import { useReadContract, useWriteContract, useAccount } from 'wagmi';
import { CIVILIZATION_CONTRACTS } from '@/config/contracts';
import { parseUnits, formatUnits } from 'viem';

const GOV_ABI = [
    { name: 'votingPower', type: 'function', stateMutability: 'view', inputs: [{ name: 'account', type: 'address'}], outputs: [{ type: 'uint256' }] },
    { name: 'zap', type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'amount', type: 'uint256'}], outputs: [] },
    { name: 'withdrawStake', type: 'function', stateMutability: 'nonpayable', inputs: [], outputs: [] }
] as const;

export function useGovernance() {
    const { address } = useAccount();
    const { writeContractAsync } = useWriteContract();

    const { data: votingPower, refetch: refetchPower } = useReadContract({
        address: CIVILIZATION_CONTRACTS.GOVERNANCE,
        abi: GOV_ABI,
        functionName: 'votingPower',
        args: [address as `0x${string}`],
        query: { enabled: !!address }
    });

    const zap = async (amount: string) => {
        return writeContractAsync({
            address: CIVILIZATION_CONTRACTS.GOVERNANCE,
            abi: GOV_ABI,
            functionName: 'zap',
            args: [parseUnits(amount, 18)],
        });
    };

    const withdraw = async () => {
        return writeContractAsync({
            address: CIVILIZATION_CONTRACTS.GOVERNANCE,
            abi: GOV_ABI,
            functionName: 'withdrawStake',
            args: [],
        });
    };

    return {
        votingPower: votingPower ? formatUnits(votingPower, 18) : "0",
        zap,
        withdraw,
        refetchPower
    };
}

