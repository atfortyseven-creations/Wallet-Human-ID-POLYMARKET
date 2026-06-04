import { ethers } from 'ethers';
import { ChainId, blockchainService } from './BlockchainService';
import { getAddress } from 'viem';

import { safeToFixed, safeToLocaleString } from '@/lib/utils/number-format';
/**
 * SynthetixService
 * Elite-grade service for interacting with Synthetix V3 on Base Mainnet.
 * Provides 100% real on-chain trading capabilities for Perpetuals.
 */
export class SynthetixService {
  // Synthetix V3 Base Mainnet Addresses (Chain ID: 8453)
  // Using viem getAddress() for proper EIP-55 checksum
  private readonly CORE_PROXY = getAddress('0x32C222A9df6e61C4C2162A5ca3203478d129C2f8');
  private readonly PERPS_MARKET_PROXY = getAddress('0x0A2AF93bd3cF17645e3ff479573F9314A4C8E568');
  private readonly ACCOUNT_TOKEN = getAddress('0x63f458569426f4Ff394A790937a09287B91e1Cd6');
  private readonly USDC = getAddress('0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913');
  private readonly AUTH = getAddress('0x7890f6Fdc6F9d65942468305f884a28Ea65DeD78'); // AUTH Bridged on Base

  // Minimal ABIs for Elite Efficiency
  private readonly PERPS_ABI = [
    'function createAccount() public returns (uint128)',
    'function modifyCollateral(uint128 accountId, uint128 marketId, int256 amountDelta) external',
    'function commitOrder(tuple(uint128 accountId, uint128 marketId, int256 sizeDelta, uint128 settlementStrategyId, uint256 acceptablePrice, bytes32 trackingCode) params) external returns (tuple(uint256 commitmentTime, uint256 expirationTime, uint256 settlementTime, uint256 sizeDelta, uint128 settlementStrategyId, uint256 acceptablePrice, bytes32 trackingCode))',
    'function getOpenPosition(uint128 accountId, uint128 marketId) external view returns (int256 totalPnl, int256 accruedFunding, int256 positionSize, uint256 totalDebt)',
    'function getAccountAvailableMargin(uint128 accountId) external view returns (uint256)',
  ];

  private readonly ACCOUNT_ABI = [
    'function balanceOf(address owner) view returns (uint256)',
    'function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)'
  ];

  constructor() {}

  /**
   * Check if user has a Synthetix Perps Account
   */
  public async getAccounts(address: string): Promise<string[]> {
    const provider = blockchainService.getProvider(ChainId.BASE);
    const contract = new ethers.Contract(this.ACCOUNT_TOKEN, this.ACCOUNT_ABI, provider);

    try {
      const balance = await contract.balanceOf(address);
      if (balance === 0n) return [];

      // Get the first account ID (most users only need one)
      const accountId = await contract.tokenOfOwnerByIndex(address, 0);
      return [accountId.toString()];
    } catch (e) {
      console.warn('[SynthetixService] Failed to fetch accounts (likely network mismatch or empty):', e);
      return [];
    }
  }

  /**
   * Constructs a transaction to create a new Synthetix Perp Account.
   */
  public async getCreateAccountTx(): Promise<ethers.TransactionRequest> {
    const iface = new ethers.Interface(this.PERPS_ABI);
    const data = iface.encodeFunctionData('createAccount');
    
    return {
      to: this.PERPS_MARKET_PROXY,
      data: data,
    };
  }

  /**
   * Constructs a transaction to deposit collateral (USDC) into a Perp Account.
   * MarketId 0 is for the general Perp account collateral.
   */
  public async getModifyCollateralTx(
    accountId: string,
    amountDelta: string // Human readable amount (positive for deposit, negative for withdraw)
  ): Promise<ethers.TransactionRequest> {
    const iface = new ethers.Interface(this.PERPS_ABI);
    const amountWei = ethers.parseUnits(amountDelta, 6); // USDC is 6 decimals
    const data = iface.encodeFunctionData('modifyCollateral', [accountId, 0, amountWei]);

    return {
      to: this.PERPS_MARKET_PROXY,
      data: data,
    };
  }

  /**
   * Constructs a transaction to commit a new perpetual order.
   */
  public async getCommitOrderTx(
    accountId: string,
    marketId: number, // e.g., 100 for SOL, 200 for BTC on Base
    sizeDelta: string, // Size in asset (e.g., "1.5" for 1.5 SOL)
    acceptablePrice: string
  ): Promise<ethers.TransactionRequest> {
    const iface = new ethers.Interface(this.PERPS_ABI);
    const sizeWei = ethers.parseEther(sizeDelta); // Perps sizes are 18 decimals
    const priceWei = ethers.parseEther(acceptablePrice);

    const params = {
      accountId: accountId,
      marketId: marketId,
      sizeDelta: sizeWei,
      settlementStrategyId: 0, // Market order strategy
      acceptablePrice: priceWei,
      trackingCode: ethers.encodeBytes32String('HUMAN_DEX'),
    };

    const data = iface.encodeFunctionData('commitOrder', [params]);

    return {
      to: this.PERPS_MARKET_PROXY,
      data: data,
    };
  }

  /**
   * Fetches real open positions for a user account directly from the blockchain.
   */
  public async getPositions(accountId: string, marketIds: number[]): Promise<any[]> {
    const provider = blockchainService.getProvider(ChainId.BASE);
    const contract = new ethers.Contract(this.PERPS_MARKET_PROXY, this.PERPS_ABI, provider);

    const positions = await Promise.all(
      marketIds.map(async (marketId) => {
        try {
          const pos = await contract.getOpenPosition(accountId, marketId);
          if (pos.positionSize === 0n) return null;
          
          return {
            marketId,
            pnl: ethers.formatEther(pos.totalPnl),
            accruedFunding: ethers.formatEther(pos.accruedFunding),
            size: ethers.formatEther(pos.positionSize),
            debt: ethers.formatEther(pos.totalDebt),
          };
        } catch (e) {
          return null;
        }
      })
    );

    return positions.filter((p) => p !== null);
  }

  /**
   * Fetches the available margin (balance) for a user account.
   */
  public async getAccountBalance(accountId: string): Promise<any> {
    const provider = blockchainService.getProvider(ChainId.BASE);
    const contract = new ethers.Contract(this.PERPS_MARKET_PROXY, this.PERPS_ABI, provider);

    try {
        const margin = await contract.getAccountAvailableMargin(accountId);
        
        // Elite-grade return: balance, equity (simplified)
        return {
            balance: Number(ethers.formatUnits(margin, 18)), // sUSD/fUSDC is 18 in Perps V3 accounting
            equity: Number(ethers.formatUnits(margin, 18)),
            margin: 0, // In V3, margin is more complex, but we show available as base
            unrealizedPnl: 0,
        };
    } catch (e) {
        console.error(`[SynthetixService] Balance fetch failed:`, e);
        return { balance: 0, equity: 0, margin: 0, unrealizedPnl: 0 };
    }
  }

  /**
   * INTERSTELLAR: Get logic for batch execution
   * Returns market ID for symbol (Synthetix V3 Base Mainnet)
   */
  public getMarketId(symbol: string): number {
    const s = symbol.toUpperCase();
    if (s.includes('ETH')) return 100;
    if (s.includes('BTC')) return 200;
    if (s.includes('SOL')) return 300;
    if (s.includes('AUTH')) return 400; 
    return 100; // Default to ETH for safety
  }

  // Helper to format 6-decimal USDC
  public formatUSDC(amount: number): bigint {
    return ethers.parseUnits(safeToFixed(amount, 6), 6);
  }
}

export const synthetixService = new SynthetixService();

