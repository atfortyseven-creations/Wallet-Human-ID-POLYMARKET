import { ethers } from 'ethers';
import { ChainId, blockchainService } from './BlockchainService';

export interface TokenMetadata {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  chainId: number;
  logoUrl?: string;
}

/**
 * TokenMetadataService
 * Fetches and caches token details to minimize RPC calls and maximize speed.
 */
export class TokenMetadataService {
  private cache: Map<string, TokenMetadata> = new Map();

  /**
   * Fetches metadata for a specific token.
   * Leverages existing caching mechanism.
   */
  public async getTokenMetadata(chainId: ChainId, address: string): Promise<TokenMetadata> {
    const cacheKey = `${chainId}-${address.toLowerCase()}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    const provider = blockchainService.getProvider(chainId);
    const erc20Interface = new ethers.Interface([
      'function decimals() view returns (uint8)',
      'function symbol() view returns (string)',
      'function name() view returns (string)'
    ]);

    const contract = new ethers.Contract(address, erc20Interface, provider);

    try {
      // Execute in parallel for performance
      const [name, symbol, decimals] = await Promise.all([
        contract.name(),
        contract.symbol(),
        contract.decimals()
      ]);

      const metadata: TokenMetadata = {
        address,
        name,
        symbol,
        decimals: Number(decimals),
        chainId,
      };

      this.cache.set(cacheKey, metadata);
      return metadata;
    } catch (e) {
      console.error(`Error fetching metadata for token ${address} on chain ${chainId}:`, e);
      throw new Error(`Could not fetch metadata for token ${address}`);
    }
  }

  /**
   * Batch fetch metadata for multiple tokens.
   */
  public async getBatchMetadata(chainId: ChainId, addresses: string[]): Promise<TokenMetadata[]> {
    return Promise.all(
      addresses.map(addr => this.getTokenMetadata(chainId, addr).catch(err => {
        console.error(err);
        return null;
      }))
    ).then(results => results.filter(r => r !== null) as TokenMetadata[]);
  }
}

export const tokenMetadataService = new TokenMetadataService();

