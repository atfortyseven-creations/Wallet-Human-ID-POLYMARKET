"use client";

import { motion } from 'framer-motion';
import { ExternalLink, ImageIcon, Grid } from 'lucide-react';
import { useState } from 'react';
import { StealthText } from '@/components/ui/stealth-text';

interface NFT {
  contract: string;
  tokenId: string;
  name: string;
  collectionName: string;
  image: string;
  type: string;
  description?: string;
  chainId: number;
}

export default function NFTGallery({ nfts }: { nfts: NFT[] }) {
  if (!nfts || nfts.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-[#1F1F1F]/40 border border-dashed border-[#1F1F1F]/10 rounded-[2.5rem]">
            <Grid size={48} className="mb-4 opacity-50" />
            <p className="font-black uppercase tracking-widest text-xs">No Collectibles Found</p>
        </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {nfts.map((nft, i) => (
        <motion.div
           key={`${nft.contract}-${nft.tokenId}`}
           initial={{ opacity: 0, scale: 0.9 }}
           animate={{ opacity: 1, scale: 1 }}
           transition={{ delay: i * 0.05 }}
           className="group relative bg-white border border-transparent hover:border-[#1F1F1F]/5 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl hover:shadow-black/5 transition-all duration-500"
        >
           <div className="aspect-square bg-[#F2F2EF] relative overflow-hidden">
             {nft.image ? (
                <img 
                  src={nft.image} 
                  alt={nft.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
             ) : (
                <div className="w-full h-full flex items-center justify-center text-[#1F1F1F]/20">
                    <ImageIcon size={32} />
                </div>
             )}
             
             <div className="absolute top-3 right-3 px-2 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[8px] font-black uppercase tracking-widest text-white">
                {nft.type}
             </div>
           </div>

           <div className="p-5 space-y-1">
             <div className="text-[9px] font-bold text-[#1F1F1F]/40 uppercase tracking-widest truncate">
               {nft.collectionName}
             </div>
             <div className="text-sm font-black text-[#1F1F1F] leading-tight truncate">
               {nft.name}
             </div>
           </div>

           {/* Hover Overlay */}
           <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
              <a 
                href={`https://opensea.io/assets/${nft.contract}/${nft.tokenId}`}
                target="_blank" 
                rel="noreferrer"
                className="px-6 py-2 bg-white rounded-full text-xs font-black uppercase tracking-widest text-black flex items-center gap-2 hover:scale-105 transition-transform"
              >
                View On OpenSea <ExternalLink size={12} />
              </a>
           </div>
        </motion.div>
      ))}
    </div>
  );
}

