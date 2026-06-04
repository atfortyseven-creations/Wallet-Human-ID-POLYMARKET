import { moralisService } from '../blockchain/MoralisService';
import { ChainId } from '../blockchain/BlockchainService';

export interface NFT {
  id: string;
  contract: string;
  tokenId: string;
  title: string;
  description: string;
  image: string;
  collectionName: string;
  floorPrice?: number;
}

/**
 *  LEGENDARY NFT FETCHING - MORALIS EDITION 
 * Uses Moralis NFT API for high-fidelity metadata.
 */
export async function getNFTs(address: string, chainId: number = 1): Promise<NFT[]> {
  try {
    const nfts = (await moralisService.getWalletNFTs(address, moralisService.getChainName(chainId))) as unknown as any[];

    return nfts?.map((nft: any) => ({
      id: `${nft.contract}-${nft.tokenId}`,
      contract: nft.contract,
      tokenId: nft.tokenId,
      title: nft.name || `#${nft.tokenId}`,
      description: nft.description || '',
      image: nft.image || '',
      collectionName: nft.collection || 'Unknown Collection',
      floorPrice: nft.price // Moralis provides floor price in basic wallet NFT fetch sometimes
    }));
  } catch (error) {
    console.error('[NFT-FETCH-ERROR] Error fetching NFTs via Moralis:', error);
    return [];
  }
}

export async function getNFTMetadata(contractAddress: string, tokenId: string, chainId: number = 1) {
  try {
    // Note: This would ideally use a specific Moralis endpoint if not in portfolio
    return { contractAddress, tokenId }; 
  } catch (error) {
    console.error('Error fetching NFT metadata:', error);
    return null;
  }
}

export const getNFTsForOwner = getNFTs;

export async function getNFTCollections(address: string, chainId: number = 1) {
  const nfts = await getNFTs(address, chainId);
  
  const collectionsMap = new Map();
  
  nfts.forEach(nft => {
    if (!collectionsMap.has(nft.contract)) {
      collectionsMap.set(nft.contract, {
        contract: nft.contract,
        name: nft.collectionName || 'Unknown Collection',
        image: nft.image,
        count: 0
      });
    }
    collectionsMap.get(nft.contract).count++;
  });

  return Array.from(collectionsMap.values());
}

