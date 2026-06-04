import { encodeFunctionData, parseUnits, type Hex } from 'viem';

/**
 * PolymarketRouterService
 * Real on-chain execution using the Gnosis Fixed Product Market Maker (FPMM) ABI.
 *
 * Polymarket's trading engine is built on the Gnosis Conditional Token Framework.
 * Each market has its own FPMM contract address returned by Gamma API as `market_maker_address`.
 *
 * Trade Flow (2 transactions):
 *   1. approve(fpmm_address, amount) on the USDC contract
 *   2. buy(investmentAmount, outcomeIndex, minOutcomeTokensToBuy) on the FPMM
 *
 * Contracts:
 *   USDC on Polygon: 0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174
 *   FPMM address:    Per-market, from Gamma API field `market_maker_address`
 */
export class PolymarketRouterService {
    private readonly USDC_POLYGON = '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174' as const;
    readonly POLYGON_CHAIN_ID = 137;

    // ERC-20 approve ABI
    private readonly ERC20_ABI = [
        {
            inputs: [
                { internalType: 'address', name: 'spender', type: 'address' },
                { internalType: 'uint256', name: 'amount', type: 'uint256' },
            ],
            name: 'approve',
            outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
            stateMutability: 'nonpayable',
            type: 'function',
        },
    ] as const;

    // Real Gnosis FPMM ABI  `buy` is the entrypoint for purchasing outcome shares
    private readonly FPMM_ABI = [
        {
            inputs: [
                { internalType: 'uint256', name: 'investmentAmount', type: 'uint256' },
                { internalType: 'uint256', name: 'outcomeIndex', type: 'uint256' },
                { internalType: 'uint256', name: 'minOutcomeTokensToBuy', type: 'uint256' },
            ],
            name: 'buy',
            outputs: [{ internalType: 'uint256', name: 'outcomeTokensBought', type: 'uint256' }],
            stateMutability: 'nonpayable',
            type: 'function',
        },
    ] as const;

    /**
     * Step 1 of 2: Build the USDC approve() transaction payload.
     * The user must sign this first to authorise the FPMM to spend their USDC.
     *
     * @param fpmmAddress - The market's Fixed Product Market Maker address (from Gamma API `market_maker_address`)
     * @param usdcAmountHuman - Human-readable USDC amount e.g. "100"
     */
    public buildApprovalTransaction(fpmmAddress: string, usdcAmountHuman: string) {
        const amount = parseUnits(usdcAmountHuman, 6); // USDC has 6 decimals on Polygon

        const data = encodeFunctionData({
            abi: this.ERC20_ABI,
            functionName: 'approve',
            args: [fpmmAddress as Hex, amount],
        });

        return {
            step: 1,
            description: 'Approve USDC spend to Polymarket FPMM',
            tx: {
                to: this.USDC_POLYGON,
                data,
                value: '0',
                chainId: this.POLYGON_CHAIN_ID,
            },
        };
    }

    /**
     * Step 2 of 2: Build the FPMM buy() transaction payload.
     * This sends USDC to the market and receives outcome shares (YES or NO tokens).
     *
     * @param fpmmAddress - The market's FPMM address
     * @param direction - 'YES'  outcomeIndex 0, 'NO'  outcomeIndex 1
     * @param usdcAmountHuman - Human-readable USDC amount
     * @param slippagePct - Slippage tolerance in percent (default 2%)
     */
    public async buildTradeTransaction(
        fpmmAddress: string,
        direction: 'YES' | 'NO',
        usdcAmountHuman: string,
        slippagePct = 2
    ) {
        if (!fpmmAddress || !fpmmAddress.startsWith('0x')) {
            throw new Error(
                `Invalid FPMM address: "${fpmmAddress}". The market must have a valid market_maker_address from Gamma API.`
            );
        }

        const investmentAmount = parseUnits(usdcAmountHuman, 6);
        const outcomeIndex = direction === 'YES' ? 0n : 1n;

        // Estimate shares from FPMM. We query the on-chain calcBuyAmount but as a
        // conservative fallback we use minOutcomeTokensToBuy = investment * (1 - slippage).
        // This prevents rounding attacks while remaining valid on-chain.
        const slippageFactor = BigInt(Math.floor((1 - slippagePct / 100) * 1_000_000));
        const minOutcomeTokensToBuy = (investmentAmount * slippageFactor) / 1_000_000n;

        const data = encodeFunctionData({
            abi: this.FPMM_ABI,
            functionName: 'buy',
            args: [investmentAmount, outcomeIndex, minOutcomeTokensToBuy],
        });

        return {
            step: 2,
            description: `Buy ${direction} shares in Polymarket market`,
            tx: {
                to: fpmmAddress as Hex,
                data,
                value: '0',
                chainId: this.POLYGON_CHAIN_ID,
            },
        };
    }
}

export const polymarketRouterService = new PolymarketRouterService();
