import { cache } from 'react';
import { WhaleRadarEngine } from './WhaleRadarEngine';
import { PolyConfluenceEngine, ConfluenceState } from './PolyConfluenceEngine';
import { GlobalIcebergsEngine, GlobalIceberg } from './GlobalIcebergsEngine';
export interface GlobalMarketState {
    asset: string;
    markPrice: number;
    aggregatedShortOI: number;
    aggregatedLongOI: number;
    avgFundingRate: number;
    nearestSqueezeTarget: number;
    institutionalVigorUsd: number; // Delta in dollars as requested by user
    institutionalVigorPercent: number; // For % ACCUMULATION label
    institutionalIsAccumulation: boolean;
    polyConfluenceRatio: number; // For Polymarket Confluence
    polyExpectedMove: number;
    polyHasData: boolean;
    icebergs: GlobalIceberg[];
    wallDistance: number;
}

export interface PrecognitiveOutput {
    gravityScore: number;
    direction: 'BEARISH' | 'BULLISH' | 'NEUTRAL';
    targetPrice: number;
    institutionalVigorValue: number;
    institutionalVigorPercent: number;
    institutionalIsAccumulation: boolean;
    polyConfluenceValue: number;
    polyHasData: boolean;
    icebergs: GlobalIceberg[];
    probabilityOfReversal: number;
    expectedMove: number;
    currentPrice: number;
}

export class VIPGridEngine {
    
    // Calcula la propensión a un Short/Long squeeze combinando Binance + Hyperliquid
    static async calculatePrecognitiveState(asset: string): Promise<PrecognitiveOutput> {
        try {
            const state = await this.fetchActiveAggregatedState(asset);
            
            // 1. Squeeze Gravity Calculation
            const oiDelta = state.aggregatedShortOI - state.aggregatedLongOI;
            const absoluteOpenInterest = Math.max(state.aggregatedShortOI + state.aggregatedLongOI, 1);
            
            // Si el Retail está pagando premiums carisimos por ir Long (Funding alto)
            // Y todo el apalancamiento es long... la gravedad empuja hacia abajo.
            const fundingWeight = state.avgFundingRate * 10000; // Basis points
            
            // Formula HFT simplificada: Tensión direccional
            const directionalTension = (oiDelta / absoluteOpenInterest) - (fundingWeight * 0.5);
            
            let direction: 'BEARISH' | 'BULLISH' | 'NEUTRAL' = 'NEUTRAL';
            if (directionalTension > 0.05) direction = 'BULLISH';
            else if (directionalTension < -0.05) direction = 'BEARISH';
            
            let formattedScore = Math.abs(directionalTension * 100);
            formattedScore = formattedScore > 100 ? 100 : formattedScore; // Cap UI 

            // 2. Reversal Probability Formula (Phase 3 Updated)
            // Prob_Reversal = (Institutional_Vigor * 0.55) + (Squeeze_Gravity * 0.30) + (Poly_Confluence * 0.15)
            
            // Institutional Vigor scale from 0 to 1 based on actual VIGOR Percent 
            const vigorRatio = state.institutionalVigorPercent / 100;
            
            // Squeeze scale 0 to 1
            const squeezeRatio = formattedScore / 100;
            
            // Poly scale 0 to 1
            const polyRatio = state.polyHasData ? (state.polyConfluenceRatio) : 0.5;
            
            const probReversal = (vigorRatio * 0.55) + (squeezeRatio * 0.30) + (polyRatio * 0.15);

            // 3. Expected Move from Polymarket divergence
            // Ensure we use the exact PM expected move if it exists
            const expectedMove = state.polyHasData ? state.polyExpectedMove : (polyRatio - 0.5) * 5.5;

            return {
                gravityScore: Number(formattedScore.toFixed(2)),
                direction,
                targetPrice: state.nearestSqueezeTarget,
                institutionalVigorValue: state.institutionalVigorUsd,
                institutionalVigorPercent: state.institutionalVigorPercent,
                institutionalIsAccumulation: state.institutionalIsAccumulation,
                polyConfluenceValue: state.polyConfluenceRatio,
                polyHasData: state.polyHasData,
                icebergs: state.icebergs,
                probabilityOfReversal: Number((probReversal * 100).toFixed(1)),
                expectedMove: Number(expectedMove.toFixed(2)),
                currentPrice: state.markPrice
            };

        } catch (error) {
            console.error(`[Grid Engine] Gravity Failure on ${asset}`, error);
            return { 
                gravityScore: 0, direction: 'NEUTRAL', targetPrice: 0, 
                institutionalVigorValue: 0, institutionalVigorPercent: 50, institutionalIsAccumulation: false,
                polyConfluenceValue: 0.5, polyHasData: false, icebergs: [], probabilityOfReversal: 0, expectedMove: 0, currentPrice: 0 
            };
        }
    }

    private static async fetchActiveAggregatedState(asset: string): Promise<GlobalMarketState> {
        // Fetch Phase 1 data from Binance API
        const symbol = `${asset.toUpperCase()}USDT`;
        
        try {
            // Promise.all to fetch both endpoints concurrently for minimal latency (<150ms total)
            const [priceRes, premiumRes, globalRatioRes, oiRes] = await Promise.all([
                fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`, { next: { revalidate: 0 } }).catch(() => null),
                fetch(`https://fapi.binance.com/fapi/v1/premiumIndex?symbol=${symbol}`, { next: { revalidate: 0 } }).catch(() => null),
                fetch(`https://fapi.binance.com/futures/data/globalLongShortAccountRatio?symbol=${symbol}&period=5m&limit=1`, { next: { revalidate: 0 } }).catch(() => null),
                fetch(`https://fapi.binance.com/fapi/v1/openInterest?symbol=${symbol}`, { next: { revalidate: 0 } }).catch(() => null)
            ]);

            const priceData = priceRes ? await priceRes.json().catch(() => ({})) : {};
            const premiumData = premiumRes ? await premiumRes.json().catch(() => ({})) : {};
            const ratioData = globalRatioRes ? await globalRatioRes.json().catch(() => ({})) : [];
            const oiData = oiRes ? await oiRes.json().catch(() => ({})) : {};

            let markPrice = Number(priceData.price || premiumData.markPrice || 0);
            
            if (markPrice === 0) {
               // Absolute fallback if asset doesn't exist on Binance, attempt MEXC (Real On-Chain/CEX fallback)
               const mexcRes = await fetch(`https://api.mexc.com/api/v3/ticker/price?symbol=${symbol}`, { next: { revalidate: 0 } }).catch(() => null);
               const mexcData = mexcRes ? await mexcRes.json().catch(() => ({})) : {};
               markPrice = Number(mexcData.price || 0);
               
               if (markPrice === 0) {
                   throw new Error(`[Grid Engine] Asset ${asset} pricing unavailable from primary and secondary oracles.`);
               }
            }

            // Ratio API outputs an array of periods: [{ longAccount: "0.55", shortAccount: "0.45", longShortRatio: "1.2" }]
            let latestRatio = ratioData && ratioData.length > 0 ? ratioData[0] : null;
            let apiFunding = Number(premiumData.lastFundingRate !== undefined ? premiumData.lastFundingRate : 0.0000);

            if (!latestRatio || !latestRatio.longAccount) {
                // If API is blocked, do not synthesize mock data. Use explicitly neutral data.
                latestRatio = { longAccount: "0.50", shortAccount: "0.50" };
            }

            const longPercent = Number(latestRatio.longAccount);
            const shortPercent = Number(latestRatio.shortAccount);
            const avgFundingRate = apiFunding;
            
            // True Open Interest in USD
            const openInterestAmount = Number(oiData.openInterest || 0);
            const actualTotalOIUsd = openInterestAmount > 0 ? (openInterestAmount * markPrice) : 0;
            
            const aggregatedLongOI = actualTotalOIUsd * longPercent;
            const aggregatedShortOI = actualTotalOIUsd * shortPercent;

            // Nearest Squeeze Target (Wall)
            const nearestSqueezeTarget = markPrice * (shortPercent > longPercent ? 1.025 : 0.975); // 2.5% up/down target


            // Phase 2: On-Chain Whale Radar Integration
            const whaleState = await WhaleRadarEngine.getWhaleVigor(asset, markPrice);
            const institutionalVigorUsd = whaleState.usdVolume;
            const institutionalVigorPercent = whaleState.vigorPercent;
            const institutionalIsAccumulation = whaleState.isAccumulation;
            
            // Phase 3: Polymarket Confluence & Icebergs
            const polyState = await PolyConfluenceEngine.getConfluenceRatio(asset, markPrice);
            const polyConfluenceRatio = polyState.ratio;
            const polyExpectedMove = polyState.expectedMove;
            const polyHasData = polyState.hasData;

            const icebergs = await GlobalIcebergsEngine.detectGlobalIcebergs(asset, markPrice);

            return {
                asset,
                markPrice,
                aggregatedLongOI,
                aggregatedShortOI,
                avgFundingRate,
                nearestSqueezeTarget,
                institutionalVigorUsd,
                institutionalVigorPercent,
                institutionalIsAccumulation,
                polyConfluenceRatio,
                polyExpectedMove,
                polyHasData,
                icebergs,
                wallDistance: 2.5
            };

        } catch (e) {
            console.error('[Binance Provider] FAPI Failed:', e);
            throw e;
        }
    }
}
