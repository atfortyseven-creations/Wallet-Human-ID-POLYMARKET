/**
 * NFT Service - Alchemy NFT API Integration
 * Fetch NFTs across multiple chains with metadata
 */

export interface NFT {
  tokenId: string;
  contractAddress: string;
  name: string;
  description?: string;
  imageUrl?: string;
  collectionName?: string;
  chainId: number;
  tokenType: 'ERC721' | 'ERC1155';
  balance?: string; // For ERC1155
  metadata?: NFTMetadata;
}

export interface NFTMetadata {
  name: string;
  description?: string;
  image?: string;
  external_url?: string;
  attributes?: NFTAttribute[];
}

export interface NFTAttribute {
  trait_type: string;
  value: string | number;
  display_type?: string;
}

export interface NFTCollection {
  address: string;
  name: string;
  totalSupply?: string;
  tokenType: 'ERC721' | 'ERC1155';
  image?: string;
  floorPrice?: number;
  nftCount: number;
}

const ALCHEMY_API_KEY = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;

/**
 * Get all NFTs owned by an address
 */
export async function getNFTsForOwner(
  ownerAddress: string,
  chainId: number
): Promise<NFT[]> {
  try {
    const baseUrl = getAlchemyNFTUrl(chainId);
    
    const response = await fetch(
      `${baseUrl}/getNFTs?owner=${ownerAddress}&withMetadata=true`,
      {
        headers: {
          'accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch NFTs');
    }

    const data = await response.json();
    
    return (data.ownedNfts || []).map((nft: any) => ({
      tokenId: nft.id.tokenId,
      contractAddress: nft.contract.address,
      name: nft.title || nft.metadata?.name || `#${nft.id.tokenId}`,
      description: nft.description || nft.metadata?.description,
      imageUrl: resolveIPFS(nft.media?.[0]?.gateway || nft.metadata?.image),
      collectionName: nft.contract.name,
      chainId,
      tokenType: nft.id.tokenMetadata?.tokenType || 'ERC721',
      balance: nft.balance,
      metadata: nft.metadata,
    }));
  } catch (error) {
    console.error('Error fetching NFTs:', error);
    return [];
  }
}

/**
 * Get NFT metadata for a specific token
 */
export async function getNFTMetadata(
  contractAddress: string,
  tokenId: string,
  chainId: number
): Promise<NFTMetadata | null> {
  try {
    const baseUrl = getAlchemyNFTUrl(chainId);
    
    const response = await fetch(
      `${baseUrl}/getNFTMetadata?contractAddress=${contractAddress}&tokenId=${tokenId}`,
      {
        headers: {
          'accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch NFT metadata');
    }

    const data = await response.json();
    
    return {
      name: data.title || data.metadata?.name || '',
      description: data.description || data.metadata?.description,
      image: resolveIPFS(data.media?.[0]?.gateway || data.metadata?.image),
      external_url: data.metadata?.external_url,
      attributes: data.metadata?.attributes || [],
    };
  } catch (error) {
    console.error('Error fetching NFT metadata:', error);
    return null;
  }
}

/**
 * Get NFT collections for owner (grouped by contract)
 */
export async function getNFTCollections(
  ownerAddress: string,
  chainId: number
): Promise<NFTCollection[]> {
  try {
    const nfts = await getNFTsForOwner(ownerAddress, chainId);
    
    // Group by contract address
    const groupedByContract = nfts.reduce((acc, nft) => {
      if (!acc[nft.contractAddress]) {
        acc[nft.contractAddress] = [];
      }
      acc[nft.contractAddress].push(nft);
      return acc;
    }, {} as Record<string, NFT[]>);

    // Create collection objects
    return Object.entries(groupedByContract).map(([address, nfts]) => ({
      address,
      name: nfts[0].collectionName || 'Unknown Collection',
      tokenType: nfts[0].tokenType,
      image: nfts[0].imageUrl,
      nftCount: nfts.length,
    }));
  } catch (error) {
    console.error('Error fetching NFT collections:', error);
    return [];
  }
}

/**
 * Get floor price for NFT collection (simplified - would use marketplace APIs in production)
 */
export async function getCollectionFloorPrice(
  contractAddress: string,
  chainId: number
): Promise<number> {
  // This would integrate with OpenSea/Reservoir/LooksRare APIs
  // For now, return 0
  return 0;
}

/**
 * Search NFTs by name or collection
 */
export async function searchNFTs(
  query: string,
  ownerAddress: string,
  chainId: number
): Promise<NFT[]> {
  const allNFTs = await getNFTsForOwner(ownerAddress, chainId);
  
  const lowerQuery = query.toLowerCase();
  
  return allNFTs.filter(nft =>
    nft.name.toLowerCase().includes(lowerQuery) ||
    nft.collectionName?.toLowerCase().includes(lowerQuery) ||
    nft.description?.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Get Alchemy NFT API URL for chain
 */
function getAlchemyNFTUrl(chainId: number): string {
  const networks: Record<number, string> = {
    1: 'eth-mainnet',
    137: 'polygon-mainnet',
    8453: 'base-mainnet',
    42161: 'arb-mainnet',
    10: 'opt-mainnet',
  };

  const network = networks[chainId] || 'eth-mainnet';
  return `https://${network}.g.alchemy.com/nft/v2/${ALCHEMY_API_KEY}`;
}

/**
 * Resolve IPFS URLs to HTTP gateways
 */
function resolveIPFS(url?: string): string | undefined {
  if (!url) return undefined;
  
  if (url.startsWith('ipfs://')) {
    return url.replace('ipfs://', 'https://ipfs.io/ipfs/');
  }
  
  return url;
}

/**
 * Get total NFT count for address across all chains
 */
export async function getTotalNFTCount(
  ownerAddress: string,
  chainIds: number[]
): Promise<number> {
  const counts = await Promise.all(
    chainIds.map(async (chainId) => {
      const nfts = await getNFTsForOwner(ownerAddress, chainId);
      return nfts.length;
    })
  );

  return counts.reduce((sum, count) => sum + count, 0);
}
