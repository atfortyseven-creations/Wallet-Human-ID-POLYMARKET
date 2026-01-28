import { useReadContract, useWriteContract, useAccount } from 'wagmi';
import { parseUnits, encodeFunctionData } from 'viem';
import { getConditionId, getCollectionId, getPositionId, INDEX_SETS } from '../lib/gnosis-ctf';

// Minimal ABIs (In production, import full Artifacts)
const CTF_ABI = [
    {
        name: 'splitPosition',
        type: 'function',
        stateMutability: 'nonpayable',
        inputs: [
            { name: 'collateralToken', type: 'address' },
            { name: 'parentCollectionId', type: 'bytes32' },
            { name: 'conditionId', type: 'bytes32' },
            { name: 'partition', type: 'uint256[]' },
            { name: 'amount', type: 'uint256' }
        ],
        outputs: []
    },
    {
        name: 'mergePositions',
        type: 'function',
        stateMutability: 'nonpayable',
        inputs: [
            { name: 'collateralToken', type: 'address' },
            { name: 'parentCollectionId', type: 'bytes32' },
            { name: 'conditionId', type: 'bytes32' },
            { name: 'partition', type: 'uint256[]' },
            { name: 'amount', type: 'uint256' }
        ],
        outputs: []
    },
    {
        name: 'redeemPositions',
        type: 'function',
        stateMutability: 'nonpayable',
        inputs: [
            { name: 'collateralToken', type: 'address' },
            { name: 'parentCollectionId', type: 'bytes32' },
            { name: 'conditionId', type: 'bytes32' },
            { name: 'indexSets', type: 'uint256[]' }
        ],
        outputs: []
    },
    {
        name: 'prepareCondition',
        type: 'function',
        stateMutability: 'nonpayable',
        inputs: [
            { name: 'oracle', type: 'address' },
            { name: 'questionId', type: 'bytes32' },
            { name: 'outcomeSlotCount', type: 'uint256' }
        ],
        outputs: []
    },
    {
        name: 'payoutDenominator',
        type: 'function',
        stateMutability: 'view',
        inputs: [{ name: 'conditionId', type: 'bytes32' }],
        outputs: [{ name: 'denominator', type: 'uint256' }]
    }
] as const;

// Addresses (ENV variables or constants)
const CTF_ADDRESS = process.env.NEXT_PUBLIC_CTF_ADDRESS as `0x${string}`;
const COLLATERAL_TOKEN = process.env.NEXT_PUBLIC_COLLATERAL_TOKEN_ADDRESS as `0x${string}`; // Deployed MockERC20


export function useCTF() {
    const { address } = useAccount();
    const { writeContractAsync, data: hash, isPending, error } = useWriteContract();

    // 0. Prepare Condition (Register Question)
    const prepareCondition = async (questionId: `0x${string}`, outcomeSlotCount: number = 2) => {
        if (!CTF_ADDRESS) throw new Error("CTF Address not configured");

        // Oracle is us (the user/deployer) for this simple ID-based system
        // Or in a real oracle system, it's the Adapter address. 
        // For this "Void" version where user resolves, oracle = sender? 
        // Or we use a fixed oracle?
        // Let's assume the Connected User is the Oracle for their own question (Simple)
        // OR use a fixed address if we have a centralized resolution bot.
        // User wants "Submit to Chain", implying they own it.
        const oracle = address;

        if (!oracle) throw new Error("Wallet not connected");

        return await writeContractAsync({
            address: CTF_ADDRESS,
            abi: CTF_ABI,
            functionName: 'prepareCondition',
            args: [
                oracle,
                questionId,
                BigInt(outcomeSlotCount)
            ]
        });
    };

    // 1. Split Position (Mint Tokens)
    const splitPosition = async (conditionId: `0x${string}`, amount: string) => {
        if (!CTF_ADDRESS) throw new Error("CTF Address not configured");

        const weiAmount = parseUnits(amount, 18); // Assuming 18 decimals
        const parentCollectionId = '0x0000000000000000000000000000000000000000000000000000000000000000'; // Base Split

        return await writeContractAsync({
            address: CTF_ADDRESS,
            abi: CTF_ABI,
            functionName: 'splitPosition',
            args: [
                COLLATERAL_TOKEN,
                parentCollectionId,
                conditionId,
                [BigInt(INDEX_SETS.YES), BigInt(INDEX_SETS.NO)],
                weiAmount
            ]
        });
    };

    // 2. Merge Positions (Burn Tokens)
    const mergePositions = async (conditionId: `0x${string}`, amount: string) => {
        const weiAmount = parseUnits(amount, 18);
        const parentCollectionId = '0x0000000000000000000000000000000000000000000000000000000000000000';

        return await writeContractAsync({
            address: CTF_ADDRESS,
            abi: CTF_ABI,
            functionName: 'mergePositions',
            args: [
                COLLATERAL_TOKEN,
                parentCollectionId,
                conditionId,
                [BigInt(INDEX_SETS.YES), BigInt(INDEX_SETS.NO)],
                weiAmount
            ]
        });
    };

    // 3. Redeem Positions (Claim Winnings)
    const redeemPositions = async (conditionId: `0x${string}`) => {
        const parentCollectionId = '0x0000000000000000000000000000000000000000000000000000000000000000';

        return await writeContractAsync({
            address: CTF_ADDRESS,
            abi: CTF_ABI,
            functionName: 'redeemPositions',
            args: [
                COLLATERAL_TOKEN,
                parentCollectionId,
                conditionId,
                [BigInt(INDEX_SETS.YES), BigInt(INDEX_SETS.NO)]
            ]
        });
    };

    return {
        prepareCondition,
        splitPosition,
        mergePositions,
        redeemPositions,
        isPending,
        hash,
        error
    };
}
