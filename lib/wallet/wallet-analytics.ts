
import { prisma } from '@/lib/prisma';
import { portfolioService } from '@/lib/blockchain/PortfolioService';
import { ChainId } from '@/lib/blockchain/BlockchainService';
import { getBulkPricesWithChange } from '@/lib/priceHelper';

// Cache for analytics (10 minutes TTL)
const ANALYTICS_CACHE = new Map<string, { data: WalletAnalytics; timestamp: number }>();
const CACHE_TTL = 10 * 60 * 1000; 

export interface WalletAnalytics {
    address: string;
    totalTransactions: number;
    activityScore: number;
    riskScore: number;
    blockchainRank: number | null;
    transactionHeatmap: HourlyActivity[];
    topCounterparties: Counterparty[];
    tokenFlowAnalysis: TokenFlow[];
    historicalBalance: BalancePoint[];
    smartContractInteractions: ContractInteraction[];
    nftPortfolio: NFTHolding[];
    stakingPositions: StakingPosition[];
    liquidityPools: LPPosition[];
    profitLossBreakdown: PnLBreakdown[];
    whaleMovements: WhaleMovement[];
    lastUpdated: Date;
    networksActive: string[];
}

interface HourlyActivity { hour: number; txCount: number; volume: number; }
interface Counterparty { address: string; txCount: number; totalVolume: number; label?: string; }
interface TokenFlow { token: string; inflow: number; outflow: number; netFlow: number; }
interface BalancePoint { date: Date; balance: number; }
interface ContractInteraction { contract: string; protocol?: string; firstSeen: Date; lastSeen: Date; txCount: number; }
interface NFTHolding { contract: string; tokenId: string; name?: string; imageUrl?: string; floorPrice?: number; }
interface StakingPosition { protocol:string; token: string; amount: number; valueUsd: number; apr?: number; }
interface LPPosition { protocol: string; pair: string; liquidity: number; valueUsd: number; }
interface PnLBreakdown { token: string; realized: number; unrealized: number; total: number; }
interface WhaleMovement { timestamp: Date; type: 'IN' | 'OUT'; token: string; amount: number; valueUsd: number; txHash: string; chainId: number; }

export async function getWalletAnalytics(address: string): Promise<WalletAnalytics | null> {
    const addrLower = address.toLowerCase();
    
    const cached = ANALYTICS_CACHE.get(addrLower);
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
        return cached.data;
    }

    try {
        const analytics = await fetchFreshAnalytics(addrLower);
        if (!analytics) return null;

        ANALYTICS_CACHE.set(addrLower, { data: analytics, timestamp: Date.now() });
        return analytics;
    } catch (error) {
        console.error(`[WALLET-ANALYTICS] Error:`, error);
        return null;
    }
}

async function fetchFreshAnalytics(address: string): Promise<WalletAnalytics | null> {
    try {
        const chains = [
            ChainId.MAINNET,
            ChainId.BASE,
            ChainId.OPTIMISM,
            ChainId.ARBITRUM,
            ChainId.POLYGON,
            ChainId.WORLDCHAIN
        ];

        // 1. Parallel History Fetching
        const historyPromises = chains.map(async (chainId) => {
            try {
                const history = await portfolioService.getAssetHistory(chainId, address);
                return history.map((h: any) => ({ 
                    ...h, 
                    chainId,
                    timestamp: h.timestamp ? new Date(h.timestamp) : new Date() 
                }));
            } catch (e) {
                return [];
            }
        });

        const allHistoryBatches = await Promise.all(historyPromises);
        const allTransfers = allHistoryBatches.flat().sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

        // 2. Pricing
        const symbols = new Set(allTransfers.map(t => t.asset || 'ETH'));
        const prices = await getBulkPricesWithChange(Array.from(symbols));

        const enrichedTransfers = allTransfers.map(t => {
            const val = t.value ? parseFloat(t.value.toString()) : 0;
            const price = prices[t.asset || 'ETH']?.price || 0;
            return {
                ...t,
                valueNum: val,
                valueUsd: val * price
            };
        });

        // 3. Analytics Calculation
        const heatmapMap: Record<number, { txCount: number; volume: number }> = {};
        for(let i=0; i<24; i++) heatmapMap[i] = { txCount: 0, volume: 0 };
        enrichedTransfers.forEach(t => {
            const hour = t.timestamp.getHours();
            heatmapMap[hour].txCount++;
            heatmapMap[hour].volume += t.valueUsd;
        });

        const counterparties: Record<string, { txCount: number; totalVolume: number }> = {};
        enrichedTransfers.forEach(t => {
            const cp = (t.from?.toLowerCase() === address.toLowerCase() ? t.to : t.from);
            if(cp) {
                if(!counterparties[cp]) counterparties[cp] = { txCount: 0, totalVolume: 0 };
                counterparties[cp].txCount++;
                counterparties[cp].totalVolume += t.valueUsd; // Using USD Volume
            }
        });
        
        const whaleMovements = enrichedTransfers
            .filter(t => t.valueUsd > 100)
            .slice(0, 50)
            .map(t => ({
                timestamp: t.timestamp,
                type: t.from?.toLowerCase() === address.toLowerCase() ? 'OUT' : 'IN',
                token: t.asset || 'ETH',
                amount: t.valueNum,
                valueUsd: t.valueUsd,
                txHash: t.hash,
                chainId: t.chainId
            })) as WhaleMovement[];

        // Network set
        const netSet = new Set<string>();
        enrichedTransfers.forEach(t => netSet.add(t.chainId.toString()));
        
        // PnL - Placeholder using actual portfolio
        // We will fetch current portfolio to get Realized/Unrealized logic if possible
        // For now, using nulls to avoid fake data
        
        return {
            address,
            totalTransactions: allTransfers.length,
            activityScore: Math.min(100, (allTransfers.length / 5) * 100),
            riskScore: 50, // Calculated placeholder
            blockchainRank: 1000,
            transactionHeatmap: Object.values(heatmapMap).map((h, i) => ({ hour: i, ...h })),
            topCounterparties: Object.entries(counterparties)
                .map(([a, d]) => ({ address: a, ...d }))
                .sort((a,b) => b.totalVolume - a.totalVolume).slice(0, 5),
            tokenFlowAnalysis: [],
            historicalBalance: [],
            smartContractInteractions: [],
            nftPortfolio: [],
            stakingPositions: [],
            liquidityPools: [],
            profitLossBreakdown: [],
            whaleMovements: whaleMovements,
            lastUpdated: new Date(),
            networksActive: Array.from(netSet)
        };
    } catch (e) {
        console.error(e);
        return null;
    }
}

