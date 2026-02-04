"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Grid, List, Search, X, ExternalLink, Heart } from 'lucide-react';
import { getNFTsForOwner, getNFTCollections, type NFT, type NFTCollection } from '@/lib/wallet/nfts';
import { getChainName, getExplorerAddressUrl } from '@/lib/wallet/chains';

interface NFTGalleryProps {
  walletAddress: string;
  chainId: number;
}

export default function NFTGallery({ walletAddress, chainId }: NFTGalleryProps) {
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [collections, setCollections] = useState<NFTCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  const [selectedNFT, setSelectedNFT] = useState<NFT | null>(null);

  useEffect(() => {
    loadNFTs();
  }, [walletAddress, chainId]);

  const loadNFTs = async () => {
    setLoading(true);
    try {
      const [nftList, collectionList] = await Promise.all([
        getNFTsForOwner(walletAddress, chainId),
        getNFTCollections(walletAddress, chainId),
      ]);
      
      setNfts(nftList);
      setCollections(collectionList);
    } catch (error) {
      console.error('Error loading NFTs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredNFTs = nfts.filter(nft => {
    const matchesSearch = 
      nft.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      nft.collectionName?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCollection = 
      !selectedCollection || nft.contractAddress === selectedCollection;

    return matchesSearch && matchesCollection;
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-[#1F1F1F]">NFT Collection</h2>
          <p className="text-sm text-[#1F1F1F]/70">
            {nfts.length} NFT{nfts.length !== 1 && 's'} · {collections.length} Collection{collections.length !== 1 && 's'}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-xl transition-all ${
              viewMode === 'grid'
                ? 'bg-[#1F1F1F] text-[#EAEADF]'
                : 'bg-white/50 hover:bg-white/80'
            }`}
          >
            <Grid size={20} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-xl transition-all ${
              viewMode === 'list'
                ? 'bg-[#1F1F1F] text-[#EAEADF]'
                : 'bg-white/50 hover:bg-white/80'
            }`}
          >
            <List size={20} />
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1F1F1F]/50" size={20} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search NFTs..."
            className="w-full pl-12 pr-4 py-3 bg-white/50 backdrop-blur-sm rounded-2xl outline-none focus:bg-white/80 transition-all"
          />
        </div>

        {collections.length > 0 && (
          <select
            value={selectedCollection || ''}
            onChange={(e) => setSelectedCollection(e.target.value || null)}
            className="px-4 py-3 bg-white/50 rounded-2xl outline-none focus:bg-white/80 transition-all font-bold"
          >
            <option value="">All Collections</option>
            {collections.map((collection) => (
              <option key={collection.address} value={collection.address}>
                {collection.name} ({collection.nftCount})
              </option>
            ))}
          </select>
        )}
      </div>

      {/* NFT Grid/List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#1F1F1F] border-t-transparent" />
        </div>
      ) : filteredNFTs.length === 0 ? (
        <div className="text-center py-20 text-[#1F1F1F]/70">
          <p className="text-lg font-bold mb-2">No NFTs Found</p>
          <p className="text-sm">Try adjusting your search or filters</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <AnimatePresence>
            {filteredNFTs.map((nft, index) => (
              <NFTCard
                key={`${nft.contractAddress}-${nft.tokenId}`}
                nft={nft}
                index={index}
                onClick={() => setSelectedNFT(nft)}
              />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {filteredNFTs.map((nft, index) => (
              <NFTListItem
                key={`${nft.contractAddress}-${nft.tokenId}`}
                nft={nft}
                index={index}
                onClick={() => setSelectedNFT(nft)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* NFT Detail Modal */}
      <AnimatePresence>
        {selectedNFT && (
          <NFTDetailModal
            nft={selectedNFT}
            onClose={() => setSelectedNFT(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// NFT Card Component (Grid View)
function NFTCard({ nft, index, onClick }: { nft: NFT; index: number; onClick: () => void }) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ delay: index * 0.05 }}
      onClick={onClick}
      className="group relative bg-white/50 backdrop-blur-sm rounded-2xl overflow-hidden hover:bg-white/80 transition-all border border-[#1F1F1F]/10"
    >
      {/* Image */}
      <div className="aspect-square bg-[#1F1F1F]/5 relative overflow-hidden">
        {nft.imageUrl ? (
          <img
            src={nft.imageUrl}
            alt={nft.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-4xl">🖼️</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 text-left">
        <div className="font-bold text-[#1F1F1F] truncate">{nft.name}</div>
        <div className="text-sm text-[#1F1F1F]/70 truncate">{nft.collectionName}</div>
        {nft.balance && nft.tokenType === 'ERC1155' && (
          <div className="text-xs text-[#1F1F1F]/50 mt-1">x{nft.balance}</div>
        )}
      </div>
    </motion.button>
  );
}

// NFT List Item Component (List View)
function NFTListItem({ nft, index, onClick }: { nft: NFT; index: number; onClick: () => void }) {
  return (
    <motion.button
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ delay: index * 0.03 }}
      onClick={onClick}
      className="w-full p-4 bg-white/50 backdrop-blur-sm rounded-2xl hover:bg-white/80 transition-all flex items-center gap-4 border border-[#1F1F1F]/10 text-left"
    >
      {/* Thumbnail */}
      <div className="w-16 h-16 bg-[#1F1F1F]/5 rounded-xl overflow-hidden flex-shrink-0">
        {nft.imageUrl ? (
          <img src={nft.imageUrl} alt={nft.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-2xl">🖼️</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="font-bold text-[#1F1F1F] truncate">{nft.name}</div>
        <div className="text-sm text-[#1F1F1F]/70 truncate">{nft.collectionName}</div>
        <div className="text-xs text-[#1F1F1F]/50 mt-1">
          {nft.tokenType} · {getChainName(nft.chainId)}
        </div>
      </div>

      {nft.balance && nft.tokenType === 'ERC1155' && (
        <div className="text-sm font-bold text-[#1F1F1F]">x{nft.balance}</div>
      )}
    </motion.button>
  );
}

// NFT Detail Modal
function NFTDetailModal({ nft, onClose }: { nft: NFT; onClose: () => void }) {
  const explorerUrl = getExplorerAddressUrl(nft.chainId, nft.contractAddress);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-2xl bg-[#EAEADF] rounded-3xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-[#1F1F1F]/80 hover:bg-[#1F1F1F] transition-all"
        >
          <X size={24} className="text-[#EAEADF]" />
        </button>

        {/* Image */}
        <div className="aspect-square bg-[#1F1F1F]/5 relative">
          {nft.imageUrl ? (
            <img src={nft.imageUrl} alt={nft.name} className="w-full h-full object-contain" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-8xl">🖼️</span>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="p-6 space-y-4">
          <div>
            <h2 className="text-3xl font-black text-[#1F1F1F]">{nft.name}</h2>
            <p className="text-[#1F1F1F]/70">{nft.collectionName}</p>
          </div>

          {nft.description && (
            <div>
              <h3 className="font-bold text-[#1F1F1F] mb-1">Description</h3>
              <p className="text-sm text-[#1F1F1F]/70">{nft.description}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-[#1F1F1F]/70">Token ID</div>
              <div className="font-bold text-[#1F1F1F]">{nft.tokenId}</div>
            </div>
            <div>
              <div className="text-[#1F1F1F]/70">Chain</div>
              <div className="font-bold text-[#1F1F1F]">{getChainName(nft.chainId)}</div>
            </div>
            <div>
              <div className="text-[#1F1F1F]/70">Token Type</div>
              <div className="font-bold text-[#1F1F1F]">{nft.tokenType}</div>
            </div>
            {nft.balance && (
              <div>
                <div className="text-[#1F1F1F]/70">Balance</div>
                <div className="font-bold text-[#1F1F1F]">{nft.balance}</div>
              </div>
            )}
          </div>

          {/* Attributes */}
          {nft.metadata?.attributes && nft.metadata.attributes.length > 0 && (
            <div>
              <h3 className="font-bold text-[#1F1F1F] mb-2">Attributes</h3>
              <div className="grid grid-cols-2 gap-2">
                {nft.metadata.attributes.map((attr, i) => (
                  <div key={i} className="p-2 bg-white/50 rounded-xl">
                    <div className="text-xs text-[#1F1F1F]/70">{attr.trait_type}</div>
                    <div className="font-bold text-sm text-[#1F1F1F]">{attr.value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <a
              href={explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-3 bg-[#1F1F1F] text-[#EAEADF] rounded-2xl font-bold hover:bg-[#1F1F1F]/90 transition-all flex items-center justify-center gap-2"
            >
              View on Explorer
              <ExternalLink size={18} />
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
