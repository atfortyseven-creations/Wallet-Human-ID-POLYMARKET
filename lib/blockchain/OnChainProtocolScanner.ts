import { parseAbi } from 'viem';
import { getClientForChain } from '@/lib/blockchain/rpc-engine';

const PROTOCOL_ABIS = {
  AAVE_V3_POOL: parseAbi([
    'function getUserAccountData(address user) view returns (uint256 totalCollateralBase, uint256 totalDebtBase, uint256 availableBorrowsBase, uint256 currentLiquidationThreshold, uint256 ltv, uint256 healthFactor)'
  ]),
  ERC20: parseAbi([
    'function balanceOf(address account) view returns (uint256)',
    'function symbol() view returns (string)',
    'function decimals() view returns (uint8)'
  ]),
  UNISWAP_V3_POSITIONS: parseAbi([
    'function balanceOf(address owner) view returns (uint256)'
  ])
};

const PROTOCOLS = {
  MAINNET: {
    AAVE_V3_POOL: '0x87870B27f51f6b033D7C58ca82a4aBBD58d44445' as `0x${string}`,
    LIDO_STETH: '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84' as `0x${string}`,
    LIDO_WSTETH: '0x7f39C581F595B53c5cb19bd0b3f8dA6c935E2Ca0' as `0x${string}`,
    UNISWAP_V3_MANAGER: '0xC36442b4a4522E871399CD717aBDD847Ab11FE88' as `0x${string}`
  },
  BASE: {
    AAVE_V3_POOL: '0xA238Dd80C21ACc0503b1328bD8863338C6BEB908' as `0x${string}`,
  },
  OPTIMISM: {
    AAVE_V3_POOL: '0x794a61358D6845594F94dc1DB02A252b5b4814aD' as `0x${string}`,
  }
};
export interface OnChainPosition {
  protocol: string;
  type: 'Lending' | 'Staking' | 'LP' | 'Other';
  valueUsd: number;
  details: any;
}

export class OnChainProtocolScanner {
  /**
   * Scans multiple protocols across multiple chains for a given address.
   */
  async scanWallet(address: `0x${string}`, tokens: any[] = []): Promise<OnChainPosition[]> {
    const results: OnChainPosition[] = [];

    try {
      // 1. Parallel scan of known core protocols
      const [mainnetResults, baseResults, optimismResults] = await Promise.all([
        this.scanMainnet(address),
        this.scanBase(address),
        this.scanOptimism(address),
      ]);

      results.push(...mainnetResults, ...baseResults, ...optimismResults);

      // 2.  UNIVERSAL DISCOVERY: Scan token holdings for yield patterns (WLFI, etc.)
      const heuristicResults = await this.discoverHeuristicPositions(address, tokens);
      results.push(...heuristicResults);

      return results;
    } catch (error) {
      console.error('[Scanner] Deep scan failed:', error);
      return [];
    }
  }

  /**
   *  HEURISTIC DISCOVERY ENGINE
   * Detects positions based on token names, symbols, and underlying metadata for ANY token.
   */
  private async discoverHeuristicPositions(address: `0x${string}`, tokens: any[]): Promise<OnChainPosition[]> {
    const identified: OnChainPosition[] = [];
    const client = getClientForChain(1); // Focus on Mainnet for deep heuristics

    // Tokens to analyze for yield/protocol patterns
    const candidates = tokens.filter(t => {
        const sym = (t.symbol || '').toUpperCase();
        const name = (t.name || '').toLowerCase();
        // Patterns: aToken (Aave), cToken (Compound), stToken (Lido/Stake), yToken (Yearn), vToken (Vesta), bToken, etc.
        // OR tokens with "Staked", "Lending", "Finance", "Yield" in name
        return sym.startsWith('A') || sym.startsWith('C') || sym.startsWith('ST') || sym.startsWith('Y') || 
               sym.startsWith('V') || sym.startsWith('B') || name.includes('stake') || name.includes('yield') || 
               name.includes('position') || name.includes('finance') || name.includes('vault') || 
               name.includes('liberty') || sym === 'WLFI'; // Specific support for WLFI
    });

    for (const token of candidates) {
        const sym = (token.symbol || '').toUpperCase();
        const name = (token.name || '').toLowerCase();
        let protocol = 'Generic Protocol';
        let type: OnChainPosition['type'] = 'Other';

        // Heuristic mapping [LEGENDARY UPGRADE]
        if ((sym.startsWith('A') && name.includes('aave')) || name.includes('aave')) {
            protocol = 'Aave Ecosystem';
            type = 'Lending';
        } else if (name.includes('lido') || sym.startsWith('ST') || name.includes('staked')) {
            protocol = 'Liquid Staking';
            type = 'Staking';
        } else if (name.includes('liberty') || sym === 'WLFI') {
            protocol = 'World Liberty Finance';
            type = 'Lending'; // Known to be a lending protocol fork
        } else if (name.includes('uniswap') || name.includes('lp') || sym.includes('LP') || name.includes('layer')) {
            protocol = 'Liquidity Pool';
            type = 'LP';
        } else if (name.includes('compound') || sym.startsWith('C') || name.includes('cream')) {
            protocol = 'Lending Protocol';
            type = 'Lending';
        } else if (name.includes('yearn') || name.includes('vault') || sym.startsWith('Y')) {
            protocol = 'Yield Vault';
            type = 'Other';
        }

        // Final verification for anything significant (> $1.00)
        if (token.valueUsd > 1) {
            identified.push({
                protocol,
                type,
                valueUsd: token.valueUsd,
                details: {
                    asset: token.symbol,
                    amount: token.balanceNumeric || parseFloat(token.balance_formatted || '0'),
                    isHeuristic: true,
                    label: token.name,
                    contract: token.token_address || token.address
                }
            });
        }
    }

    return identified;
  }

  private async scanMainnet(address: `0x${string}`): Promise<OnChainPosition[]> {
    const client = getClientForChain(1);
    const positions: OnChainPosition[] = [];

    try {
      const calls = [
        // Aave V3
        {
          address: PROTOCOLS.MAINNET.AAVE_V3_POOL,
          abi: PROTOCOL_ABIS.AAVE_V3_POOL,
          functionName: 'getUserAccountData',
          args: [address],
        },
        // Lido stETH
        {
          address: PROTOCOLS.MAINNET.LIDO_STETH,
          abi: PROTOCOL_ABIS.ERC20,
          functionName: 'balanceOf',
          args: [address],
        },
        // Lido wstETH
        {
          address: PROTOCOLS.MAINNET.LIDO_WSTETH,
          abi: PROTOCOL_ABIS.ERC20,
          functionName: 'balanceOf',
          args: [address],
        },
        // Uniswap V3
        {
          address: PROTOCOLS.MAINNET.UNISWAP_V3_MANAGER,
          abi: PROTOCOL_ABIS.UNISWAP_V3_POSITIONS,
          functionName: 'balanceOf',
          args: [address],
        }
      ];

      const results = await client.multicall({
        contracts: calls,
        allowFailure: true,
      });

      // 1. Process Aave V3
      const aaveData = results[0].status === 'success' ? results[0].result as any : null;
      if (aaveData && aaveData[0] > 0n) {
        positions.push({
          protocol: 'Aave V3',
          type: 'Lending',
          valueUsd: Number(aaveData[0]) / 1e8, // Aave Base unit is 8 decimals
          details: {
            collateralUsd: Number(aaveData[0]) / 1e8,
            debtUsd: Number(aaveData[1]) / 1e8,
            healthFactor: Number(aaveData[5]) / 1e18,
          }
        });
      }

      // 2. Process Lido stETH
      const stEthBalance = results[1].status === 'success' ? results[1].result as bigint : 0n;
      if (stEthBalance && stEthBalance > 1000000000000000n) { // > 0.001 ETH
        // We assume ETH price for stETH (simplified)
        positions.push({
          protocol: 'Lido',
          type: 'Staking',
          valueUsd: Number(stEthBalance) / 1e18 * 2500, // Roughly 2500 for ETH
          details: { asset: 'stETH', amount: Number(stEthBalance) / 1e18 }
        });
      }

      // 3. Process Lido wstETH
      const wstEthBalance = results[2].status === 'success' ? results[2].result as bigint : 0n;
      if (wstEthBalance && wstEthBalance > 1000000000000000n) {
        positions.push({
          protocol: 'Lido',
          type: 'Staking',
          valueUsd: Number(wstEthBalance) / 1e18 * 3000, // wstETH is more valuable than stETH
          details: { asset: 'wstETH', amount: Number(wstEthBalance) / 1e18 }
        });
      }

      // 4. Process Uniswap V3
      const uniV3Balance = results[3].status === 'success' ? results[3].result as bigint : 0n;
      if (uniV3Balance && uniV3Balance > 0n) {
        positions.push({
          protocol: 'Uniswap V3',
          type: 'LP',
          valueUsd: 0, // Valuation needs complex tick logic, marking as active for now
          details: { positionCount: Number(uniV3Balance) }
        });
      }

    } catch (e) {
      console.error('[Scanner] Mainnet scan failed:', e);
    }

    return positions;
  }

  private async scanBase(address: `0x${string}`): Promise<OnChainPosition[]> {
    const client = getClientForChain(8453);
    const positions: OnChainPosition[] = [];

    try {
      const aaveData = await client.readContract({
        address: PROTOCOLS.BASE.AAVE_V3_POOL,
        abi: PROTOCOL_ABIS.AAVE_V3_POOL,
        functionName: 'getUserAccountData',
        args: [address],
      }) as any;

      if (aaveData && aaveData[0] > 0n) {
        positions.push({
          protocol: 'Aave V3 (Base)',
          type: 'Lending',
          valueUsd: Number(aaveData[0]) / 1e8,
          details: {
            collateralUsd: Number(aaveData[0]) / 1e8,
            debtUsd: Number(aaveData[1]) / 1e8,
            healthFactor: Number(aaveData[5]) / 1e18,
          }
        });
      }
    } catch (e) {
      // Suppress logs for chains where protocol might not be deployed or failing
    }

    return positions;
  }

  private async scanOptimism(address: `0x${string}`): Promise<OnChainPosition[]> {
    const client = getClientForChain(10);
    const positions: OnChainPosition[] = [];

    try {
      const aaveData = await client.readContract({
        address: PROTOCOLS.OPTIMISM.AAVE_V3_POOL,
        abi: PROTOCOL_ABIS.AAVE_V3_POOL,
        functionName: 'getUserAccountData',
        args: [address],
      }) as any;

      if (aaveData && aaveData[0] > 0n) {
        positions.push({
          protocol: 'Aave V3 (Optimism)',
          type: 'Lending',
          valueUsd: Number(aaveData[0]) / 1e8,
          details: {
            collateralUsd: Number(aaveData[0]) / 1e8,
            debtUsd: Number(aaveData[1]) / 1e8,
            healthFactor: Number(aaveData[5]) / 1e18,
          }
        });
      }
    } catch (e) {}

    return positions;
  }
}

export const onChainProtocolScanner = new OnChainProtocolScanner();

