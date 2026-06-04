import { moralisService, MORALIS_CHAINS } from '@/lib/blockchain/MoralisService';

export interface WalletPortfolioResponse {
    success: boolean;
    address: string;
    tokens: any[];
    totalValueUsd: number;
    change24hPercent: number;
    change24hUsd: number;
    source: 'moralis-api' | 'alchemy-api' | 'rpc-fallback';
    chainsScanned: number[];
}

export class PortfolioEnterpriseService {
    static async getCrossChainPortfolio(address: string): Promise<WalletPortfolioResponse> {
        console.log(`[Enterprise Portfolio] Sweeping cross-chain portfolio for ${address} via GetBlock Proxy...`);

        const chainIds = [1, 10, 56, 137, 42161, 8453];
        const tokensToReturn: any[] = [];
        let totalValueUsd = 0;

        await Promise.allSettled(chainIds.map(async (chainId) => {
            const moralisChain = MORALIS_CHAINS[chainId as keyof typeof MORALIS_CHAINS];
            if (!moralisChain) return;

            try {
                // Fetch Native and ERC20 balances for the chain via the GetBlock Proxy
                const [nativeBal, tokenBals] = await Promise.all([
                    moralisService.getNativeBalance(address, moralisChain),
                    moralisService.getWalletBalances(address, moralisChain)
                ]);

                // Add Native ETH / BNB / MATIC etc.
                const nativeBig = BigInt(nativeBal?.balance || '0');
                if (nativeBig > 0n) {
                    const formatted = Number(nativeBig) / 1e18;
                    // Dynamically retrieve price for the native token
                    const prices = await moralisService.getTokenPrice('0x0000000000000000000000000000000000000000', moralisChain).catch(() => ({ usdPrice: 0 }));
                    const price = prices?.usdPrice || (chainId === 1 || chainId === 10 || chainId === 8453 || chainId === 42161 ? 3000 : chainId === 56 ? 580 : 0.7);
                    const val = formatted * price;

                    totalValueUsd += val;
                    tokensToReturn.push({
                        symbol: chainId === 1 || chainId === 10 || chainId === 8453 || chainId === 42161 ? 'ETH' : chainId === 56 ? 'BNB' : 'POL',
                        name: chainId === 1 || chainId === 10 || chainId === 8453 || chainId === 42161 ? 'Ether' : chainId === 56 ? 'Binance Coin' : 'Polygon MATIC',
                        balanceNumeric: formatted,
                        price,
                        valueUsd: val,
                        chainId,
                        source: 'getblock-rpc'
                    });
                }

                // Add discovered ERC-20s
                const tokenList = Array.isArray(tokenBals?.result) ? tokenBals.result : [];
                tokenList.forEach((t: any) => {
                    const balNum = Number(t?.balance || 0) / Math.pow(10, Number(t?.decimals || 18));
                    const val = balNum * (t?.usd_price || 0);
                    totalValueUsd += val;
                    tokensToReturn.push({
                        symbol: t?.symbol || 'UNK',
                        name: t?.name || 'Unknown Token',
                        balanceNumeric: balNum,
                        price: t?.usd_price || 0,
                        valueUsd: val,
                        chainId,
                        source: 'getblock-rpc'
                    });
                });

            } catch (e) {
                console.warn(`[Enterprise Portfolio] Sweeping chain ${chainId} failed:`, e);
            }
        }));

        return {
            success: true,
            address,
            tokens: tokensToReturn.sort((a, b) => b.valueUsd - a.valueUsd),
            totalValueUsd,
            change24hPercent: 0,
            change24hUsd: 0,
            source: 'rpc-fallback',
            chainsScanned: chainIds
        };
    }
}
