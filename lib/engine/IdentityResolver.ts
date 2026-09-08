import { createPublicClient, http } from 'viem';
import { mainnet } from 'viem/chains';
import { normalize } from 'viem/ens';
import { AegisEventBus } from '@/lib/core/EventBus';

export interface RealIdentity {
  address: string;
  ensName: string | null;
  ensAvatar: string | null;
  lensHandle?: string | null;
  resolvedAt: number;
}

/**
 * REAL ENS IDENTITY RESOLVER
 * Uses viem to fetch real on-chain data from Ethereum Mainnet.
 * Zero mock data. Caches results in memory to prevent RPC rate-limits.
 */
export class RealIdentityResolver {
  private static cache: Map<string, RealIdentity> = new Map();
  private static publicClient = createPublicClient({
    chain: mainnet,
    transport: http() // In production, inject Alchemy/Infura URL here
  });

  public static async resolveAddress(address: string): Promise<RealIdentity> {
    const lowerAddr = address.toLowerCase();
    
    if (this.cache.has(lowerAddr)) {
      const cached = this.cache.get(lowerAddr)!;
      if (Date.now() - cached.resolvedAt < 3600000) return cached; // 1 hour TTL
    }

    try {
      // 1. Resolve ENS Name
      const ensName = await this.publicClient.getEnsName({ address: address as `0x${string}` });
      
      let ensAvatar = null;
      if (ensName) {
        // 2. Resolve ENS Avatar if name exists
        ensAvatar = await this.publicClient.getEnsAvatar({ name: normalize(ensName) });
      }

      const identity: RealIdentity = {
        address: lowerAddr,
        ensName,
        ensAvatar,
        resolvedAt: Date.now()
      };

      this.cache.set(lowerAddr, identity);
      AegisEventBus.publish('IDENTITY_RESOLVED', identity);
      
      return identity;
    } catch (error) {
      console.error(`[AEGIS IDENTITY] Failed to resolve on-chain data for ${address}:`, error);
      return { address: lowerAddr, ensName: null, ensAvatar: null, resolvedAt: Date.now() };
    }
  }
}