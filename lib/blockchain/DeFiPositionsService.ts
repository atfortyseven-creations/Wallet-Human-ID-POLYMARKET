import { moralisService } from './MoralisService';
import { portfolioService } from './PortfolioService';
import { onChainProtocolScanner } from './OnChainProtocolScanner';
import { safeToFixed, safeToLocaleString } from '@/lib/utils/number-format';

/**
 * DeFi Positions Service
 * Unified access to DeFi protocol positions (Aave, Uniswap, etc.)
 */
export class DeFiPositionsService {
  
  /**
   * Get comprehensive DeFi positions for a wallet
   */
  async getPositions(address: string) {
    try {
      // Universal Discovery: Get tokens first to fuel heuristic scanning
      const portfolio = await portfolioService.getMultiChainPortfolio(address, undefined, false, false).catch(() => ({ tokens: [] }));
      const tokens = portfolio.tokens || [];

      // Parallel execution: Moralis (Breadth) + On-Chain Scanner (Depth/Precision + Universal Discovery)
      const [moralisData, onChainData] = await Promise.all([
        moralisService.getDefiPositions(address).catch(() => null as any),
        onChainProtocolScanner.scanWallet(address as `0x${string}`, tokens).catch(() => [] as any[])
      ]);
      
      let allPositions: any[] = [];
      let totalValueUsd = 0;
      const seenProtocols = new Set<string>();

      // 1. Process On-Chain Data (High Authority)
      if (onChainData && onChainData.length > 0) {
        onChainData.forEach(pos => {
          totalValueUsd += pos.valueUsd;
          seenProtocols.add(pos.protocol.toLowerCase());
          
          allPositions.push({
            protocol: pos.protocol,
            protocolLogo: this.getProtocolLogo(pos.protocol),
            type: pos.type,
            label: pos.protocol.includes('Aave') ? 'Lending Pool' : pos.type,
            tokens: this.mapOnChainToTokens(pos),
            valueUsd: pos.valueUsd,
            onChain: true,
            details: pos.details
          });
        });
      }

      // 2. Process Moralis Data (Fill the gaps)
      if (moralisData && moralisData.protocols) {
        moralisData.protocols.forEach((protocol: any) => {
          // Avoid duplication if the on-chain scanner already found this protocol
          const protocolKey = protocol.protocol_name.toLowerCase();
          const isCoreProtocol = protocolKey.includes('aave') || protocolKey.includes('lido') || protocolKey.includes('uniswap');
          
          // If it's a core protocol we already scanned on-chain, or it's a new protocol
          if (!isCoreProtocol || !seenProtocols.has(protocolKey)) {
            const protocolPositions = protocol.position_details.map((position: any) => ({
              protocol: protocol.protocol_name,
              protocolLogo: protocol.protocol_logo,
              type: this.categorizePosition(position.label),
              label: position.label,
              tokens: position.tokens.map((t: any) => ({
                symbol: t.symbol,
                balance: parseFloat(t.balance_formatted),
                balanceFormatted: t.balance_formatted,
                valueUsd: t.usd_value,
                logo: this.getTokenLogo(t.symbol)
              })),
              valueUsd: position.usd_value
            }));

            allPositions = [...allPositions, ...protocolPositions];
            
            if (!isCoreProtocol) {
               totalValueUsd += protocol.total_usd_value || 0;
            }
          }
        });
      }

      // If everything failed, try portfolio fallback
      if (allPositions.length === 0) {
         return this.getPortfolioFallback(address);
      }

      return {
        totalValueUsd,
        protocols: Array.from(seenProtocols).map(p => ({ name: p, totalValueUsd: 0 })), // Simplified summary
        positions: allPositions
      };
    } catch (error: any) {
      console.error('[DeFi] Failed to fetch positions:', error.message);
      return this.getPortfolioFallback(address);
    }
  }

  private mapOnChainToTokens(pos: any) {
    if (pos.details?.asset) {
        return [{
            symbol: pos.details.asset,
            balance: pos.details.amount,
            balanceFormatted: safeToFixed(pos.details.amount, 4),
            valueUsd: pos.valueUsd,
            logo: this.getTokenLogo(pos.details.asset)
        }];
    }
    if (pos.protocol.includes('Aave')) {
        return [{
            symbol: 'USDC/ETH (Base)',
            balance: pos.details.collateralUsd,
            balanceFormatted: safeToLocaleString(pos.details.collateralUsd),
            valueUsd: pos.valueUsd,
            logo: this.getTokenLogo('USDC')
        }];
    }
    return [];
  }

  private getProtocolLogo(name: string): string {
    if (name.includes('Aave')) return 'https://assets.coingecko.com/coins/images/12645/small/aave.png';
    if (name.includes('Lido')) return 'https://assets.coingecko.com/coins/images/13573/small/Lido_DAO.png';
    if (name.includes('Uniswap')) return 'https://assets.coingecko.com/coins/images/12504/small/uni.png';
    return '';
  }

  private async getPortfolioFallback(address: string) {
      try {
          const portfolio = await portfolioService.getMultiChainPortfolio(address, undefined, false, false);
          const defiTokens = portfolio.tokens.filter((t: any) => 
            ['DeFi', 'Staking', 'Yield', 'Lending', 'DEX'].includes(t.sector || '')
          );

          if (defiTokens.length > 0) {
              const positions = defiTokens.map((t: any) => ({
                  protocol: 'Sector Identified',
                  protocolLogo: null,
                  type: (t.sector === 'Staking' ? 'Staking' : t.sector === 'Lending' ? 'Lending' : 'Other') as any,
                  label: `${t.sector} Position`,
                  tokens: [{
                      symbol: t.symbol,
                      balance: t.balanceNumeric,
                      balanceFormatted: t.balanceFormatted,
                      valueUsd: t.valueUsd,
                      logo: t.logo
                  }],
                  valueUsd: t.valueUsd
              }));

              return {
                  totalValueUsd: defiTokens.reduce((acc: number, t: any) => acc + t.valueUsd, 0),
                  protocols: [{ name: 'Historical Assets', logo: null, totalValueUsd: defiTokens.reduce((acc: number, t: any) => acc + t.valueUsd, 0) }],
                  positions
              };
          }
      } catch (e) {}
      
      return { totalValueUsd: 0, protocols: [], positions: [] };
  }


  /**
   * Get DeFi summary (high-level overview)
   */
  async getSummary(address: string) {
    try {
      const data: any = await moralisService.getDefiSummary(address);
      
      if (!data || !data.protocols) {
        return {
          totalValueUsd: 0,
          protocolCount: 0,
          protocols: []
        };
      }

      return {
        totalValueUsd: data.total_usd_value,
        protocolCount: data.protocols.length,
        protocols: data.protocols.map((p: any) => ({
          name: p.protocol_name,
          id: p.protocol_id,
          totalValueUsd: p.total_usd_value,
          positionCount: p.total_positions
        }))
      };
    } catch (error) {
      console.error('[DeFi] Failed to fetch summary:', error);
      return {
        totalValueUsd: 0,
        protocolCount: 0,
        protocols: []
      };
    }
  }

  /**
   * Categorize position type for UI display
   */
  private categorizePosition(label: string): 'Lending' | 'LP' | 'Staking' | 'Other' {
    const lower = label.toLowerCase();
    
    if (lower.includes('lend') || lower.includes('deposit') || lower.includes('supply')) {
      return 'Lending';
    }
    if (lower.includes('lp') || lower.includes('liquidity') || lower.includes('pool')) {
      return 'LP';
    }
    if (lower.includes('stake') || lower.includes('staking')) {
      return 'Staking';
    }
    
    return 'Other';
  }

  /**
   * Get token logo URL (fallback to generic if not available)
   */
  private getTokenLogo(symbol: string): string {
    const logos: Record<string, string> = {
      'ETH': 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
      'USDC': 'https://assets.coingecko.com/coins/images/6319/small/usdc.png',
      'USDT': 'https://assets.coingecko.com/coins/images/325/small/tether.png',
      'DAI': 'https://assets.coingecko.com/coins/images/9956/small/dai.png',
      'WETH': 'https://assets.coingecko.com/coins/images/2518/small/weth.png',
      'UNI': 'https://assets.coingecko.com/coins/images/12504/small/uni.png',
      'AAVE': 'https://assets.coingecko.com/coins/images/12645/small/aave.png'
    };
    
    return logos[symbol.toUpperCase()] || '';
  }
}

export const defiPositionsService = new DeFiPositionsService();

