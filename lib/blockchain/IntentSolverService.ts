import { bridgeService } from './BridgeService';
import { type Address, type Hex, encodeFunctionData } from 'viem';
import { blockchainService, ChainId } from './BlockchainService';

/**
 * IntentSolverService
 * High-Lvl Orchestrator for Cross-Chain Intent execution.
 * Transforms complex liquidity moves into atomic, system intents.
 */
export class IntentSolverService {
    /**
     * Resolves a cross-chain rebalancing intent into a set of Smart Account calls.
     */
    public async resolveRebalanceIntent(
        owner: Address,
        sourceChain: ChainId,
        targetChain: ChainId,
        tokenAddress: Address,
        amount: string
    ): Promise<{ to: Address; data: Hex; value: bigint }[]> {
        // Step 1: Fetch optimized bridge route (Intents-first approach)
        const quote = await bridgeService.getBridgeTransaction(
            sourceChain,
            targetChain,
            tokenAddress,
            tokenAddress, // Rebalancing same asset
            amount,
            owner
        );

        // Step 2: Construct the atomic calls
        const calls: { to: Address; data: Hex; value: bigint }[] = [];

        // If it's a token transfer, we might need an approval first
        // Note: For ERC-4337 Smart Accounts, we can batch the approval and the cross-chain call
        if (tokenAddress !== '0x0000000000000000000000000000000000000000') {
            const erc20Interface = [
                {
                    name: 'approve',
                    type: 'function',
                    inputs: [
                        { name: 'spender', type: 'address' },
                        { name: 'amount', type: 'uint256' }
                    ],
                    outputs: [{ name: '', type: 'bool' }]
                }
            ] as const;

            calls.push({
                to: tokenAddress,
                data: encodeFunctionData({
                    abi: erc20Interface,
                    functionName: 'approve',
                    args: [quote.tx.to as Address, BigInt(amount)]
                }),
                value: 0n
            });
        }

        // Add the bridge/intent execution call
        calls.push({
            to: quote.tx.to as Address,
            data: quote.tx.data as Hex,
            value: BigInt(quote.tx.value || 0)
        });

        return calls;
    }
}

export const intentSolverService = new IntentSolverService();
