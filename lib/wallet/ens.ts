import { createPublicClient, http } from 'viem';
import { mainnet } from 'viem/chains';
import { normalize } from 'viem/ens';

const publicClient = createPublicClient({
  chain: mainnet,
  transport: http(`https://eth-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`)
});

export interface ENSProfile {
  name: string;
  address: string;
  avatar?: string;
  description?: string;
  url?: string;
  twitter?: string;
  github?: string;
  email?: string;
}

/**
 * Resolve ENS name to Ethereum address
 */
export async function resolveENSName(ensName: string): Promise<string | null> {
  try {
    const address = await publicClient.getEnsAddress({
      name: normalize(ensName),
    });
    return address;
  } catch (error) {
    console.error('Error resolving ENS name:', error);
    return null;
  }
}

/**
 * Reverse resolve address to ENS name
 */
export async function reverseResolveENS(address: string): Promise<string | null> {
  try {
    const name = await publicClient.getEnsName({
      address: address as `0x${string}`,
    });
    return name;
  } catch (error) {
    console.error('Error reverse resolving address:', error);
    return null;
  }
}

/**
 * Get ENS Profile (avatar, text records, etc.)
 */
export async function getENSProfile(ensName: string): Promise<ENSProfile | null> {
  try {
    const [address, avatar] = await Promise.all([
        resolveENSName(ensName),
        publicClient.getEnsAvatar({ name: normalize(ensName) })
    ]);
    
    if (!address) return null;

    return {
      name: ensName,
      address,
      avatar: avatar || undefined,
    };
  } catch (error) {
    console.error('Error getting ENS profile:', error);
    return null;
  }
}

/**
 * Check if string is valid ENS name
 */
export function isValidENSName(name: string): boolean {
  if (!name || name.startsWith('0x')) return false;
  return name.includes('.');
}

/**
 * Format address or ENS name for display
 */
export function formatAddressOrENS(addressOrENS: string, length: number = 8): string {
  if (isValidENSName(addressOrENS)) {
    return addressOrENS;
  }

  // Format as shortened address
  if (addressOrENS.startsWith('0x') && addressOrENS.length === 42) {
    const half = Math.floor(length / 2);
    return `${addressOrENS.slice(0, half + 2)}...${addressOrENS.slice(-half)}`;
  }

  return addressOrENS;
}

/**
 * Batch resolve multiple ENS names
 */
export async function batchResolveENS(ensNames: string[]): Promise<Record<string, string | null>> {
  const results = await Promise.all(
    ensNames.map(async (name) => ({
      name,
      address: await resolveENSName(name),
    }))
  );

  return results.reduce((acc, { name, address }) => {
    acc[name] = address;
    return acc;
  }, {} as Record<string, string | null>);
}

/**
 * Search ENS names 
 */
export async function searchENSNames(query: string): Promise<string[]> {
  // Return empty to avoid fictitious results.
  return [];
}
