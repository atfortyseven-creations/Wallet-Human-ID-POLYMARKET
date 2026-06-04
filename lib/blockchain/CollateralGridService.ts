import { blockchainService, ChainId } from './BlockchainService';
import { type Address } from 'viem';
import { ethers } from 'ethers';

/**
 * CollateralGridService
 * Manages institutional collateral valuation and risk parameters.
 * Supports multi-asset LTV (Loan-to-Value) mapping for the Dark Pool.
 */
export class CollateralGridService {
    // Chainlink Aggregator Interface (simplified)
    private readonly AGGREGATOR_ABI = [
        'function latestRoundData() view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)'
    ];

    /**
     * Fetches the current valuation of collateral assets.
     */
    public async getAssetValue(chainId: ChainId, asset: Address, feedAddress: Address): Promise<bigint> {
        const provider = blockchainService.getProvider(chainId);
        const oracle = new ethers.Contract(feedAddress, this.AGGREGATOR_ABI, provider);
        
        const [, price] = await oracle.latestRoundData();
        return BigInt(price);
    }

    /**
     * Calculates the borrowing capacity based on the Collateral Grid.
     */
    public calculateCapacity(balances: { asset: Address, amount: bigint, ltv: number, price: bigint }[]): bigint {
        return balances.reduce((total, b) => {
            const valuation = (b.amount * b.price) / BigInt(1e8); // Assuming 8 decimals for oracle
            return total + (valuation * BigInt(b.ltv)) / 100n;
        }, 0n);
    }

    /**
     * Evaluates health factor for institutional positions.
     */
    public getHealthFactor(collateralValueUsd: bigint, borrowedValueUsd: bigint): number {
        if (borrowedValueUsd === 0n) return 999; // Peak health
        return Number(collateralValueUsd * 100n / borrowedValueUsd) / 100;
    }
}

export const collateralGridService = new CollateralGridService();
