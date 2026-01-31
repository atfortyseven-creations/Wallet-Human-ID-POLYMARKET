/**
 * ENS (Ethereum Name Service) Integration
 * Resolve names to addresses and vice versa
 */

const MAINNET_RPC = `https://eth-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`;

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
    // Normalize ENS name
    const normalized = ensName.toLowerCase().trim();
    
    if (!normalized.endsWith('.eth')) {
      return null;
    }

    const response = await fetch(MAINNET_RPC, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_call',
        params: [{
          to: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e', // ENS Registry
          data: getResolverCalldata(normalized),
        }, 'latest'],
        id: 1,
      }),
    });

    const data = await response.json();
    
    if (data.result && data.result !== '0x') {
      // Extract address from result
      const address = '0x' + data.result.slice(-40);
      return address;
    }

    return null;
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
    const normalized = address.toLowerCase();
    
    // Construct reverse node
    const reverseNode = `${normalized.slice(2)}.addr.reverse`;
    
    const response = await fetch(MAINNET_RPC, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_call',
        params: [{
          to: '0x3671aE578E63FdF66ad4F3E12CC0c0d71Ac7510C', // Public Resolver
          data: getReverseResolverCalldata(reverseNode),
        }, 'latest'],
        id: 1,
      }),
    });

    const data = await response.json();
    
    if (data.result && data.result !

== '0x') {
      // Decode the ENS name from result
      const ensName = decodeENSName(data.result);
      return ensName;
    }

    return null;
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
    const address = await resolveENSName(ensName);
    
    if (!address) {
      return null;
    }

    // In production, you'd fetch text records for avatar, description, etc.
    // For now, return basic profile
    return {
      name: ensName,
      address,
      avatar: undefined,
      description: undefined,
      url: undefined,
      twitter: undefined,
      github: undefined,
      email: undefined,
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
  const normalized = name.toLowerCase().trim();
  
  // Must end with .eth
  if (!normalized.endsWith('.eth')) {
    return false;
  }

  // Must have at least one character before .eth
  if (normalized.length <= 4) {
    return false;
  }

  // Check for valid characters
  const validPattern = /^[a-z0-9-]+\.eth$/;
  return validPattern.test(normalized);
}

/**
 * Get resolver calldata for ENS resolution
 */
function getResolverCalldata(ensName: string): string {
  // This is a simplified version
  // In production, you'd use ethers.js or viem to properly encode the call
  return '0x0178b8bf' + keccak256(ensName).slice(2);
}

/**
 * Get reverse resolver calldata
 */
function getReverseResolverCalldata(reverseNode: string): string {
  // Simplified version
  return '0x691f3431' + keccak256(reverseNode).slice(2);
}

/**
 * Decode ENS name from hex result
 */
function decodeENSName(hexResult: string): string | null {
  try {
    // Remove 0x prefix
    const hex = hexResult.slice(2);
    
    // Skip first 64 characters (offset)
    const data = hex.slice(64);
    
    // Get length (next 64 chars)
    const length = parseInt(data.slice(0, 64), 16) * 2;
    
    // Get name
    const nameHex = data.slice(64, 64 + length);
    
    // Convert hex to string
    let name = '';
    for (let i = 0; i < nameHex.length; i += 2) {
      name += String.fromCharCode(parseInt(nameHex.substr(i, 2), 16));
    }
    
    return name || null;
  } catch (error) {
    return null;
  }
}

/**
 * Simple keccak256 hash (would use @noble/hashes in production)
 */
function keccak256(str: string): string {
  // Placeholder - in production use proper keccak256 from @noble/hashes
  return '0x' + '0'.repeat(64);
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
 * Search ENS names (would integrate with ENS subgraph in production)
 */
export async function searchENSNames(query: string): Promise<string[]> {
  // Mock implementation - would query ENS subgraph
  const mockResults = [
    'vitalik.eth',
    'nick.eth',
    'brantly.eth',
  ];

  return mockResults.filter(name => 
    name.toLowerCase().includes(query.toLowerCase())
  );
}
