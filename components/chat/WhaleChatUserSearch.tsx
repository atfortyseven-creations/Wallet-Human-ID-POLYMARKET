"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, UserPlus, ShieldCheck, MapPin } from 'lucide-react';
import { getLocalContacts, saveLocalContact } from '@/lib/wallet/localAddressBook';

interface WhaleChatUserSearchProps {
  myAddress: string;
  onClose: () => void;
  onAddContact: (address: string) => void;
}

// Simulated Web3 Identity Registry (like ENS or Lens Protocol)
const MOCK_REGISTRY = [
  { address: '0x1111111111111111111111111111111111111111', nickname: '@satoshi', name: 'Satoshi Nakamoto', country: 'Japan', avatar: '' },
  { address: '0x2222222222222222222222222222222222222222', nickname: '@vitalik', name: 'Vitalik Buterin', country: 'Global (Earth)', avatar: '' },
  { address: '0x3333333333333333333333333333333333333333', nickname: '@elon', name: 'Elon Musk', country: 'United States', avatar: '' },
  { address: '0x4444444444444444444444444444444444444444', nickname: '@whale', name: 'Whale Admin', country: 'Ocean', avatar: '' },
];

export function WhaleChatUserSearch({ myAddress, onClose, onAddContact }: WhaleChatUserSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<typeof MOCK_REGISTRY>([]);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    // Simulate network delay for decentralized lookup
    const timer = setTimeout(() => {
      const lowerQuery = query.toLowerCase();
      // If it looks like a raw ETH address (0x...), return it directly as a result
      if (lowerQuery.startsWith('0x') && lowerQuery.length === 42) {
        setResults([{ address: lowerQuery, nickname: 'Raw Address', name: 'Unknown User', country: 'Unknown', avatar: '' }]);
      } else {
        const matches = MOCK_REGISTRY.filter(u => 
          u.nickname.toLowerCase().includes(lowerQuery) || 
          u.name.toLowerCase().includes(lowerQuery)
        );
        setResults(matches);
      }
      setIsSearching(false);
    }, 600);

    return () => clearTimeout(timer);
  }, [query]);

  const handleAdd = (user: typeof MOCK_REGISTRY[0]) => {
    saveLocalContact(myAddress, { peerAddress: user.address, name: user.nickname, avatar: user.avatar });
    onAddContact(user.address);
    onClose();
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100000] bg-black/60 backdrop-blur-md flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-lg bg-white rounded-[32px] overflow-hidden shadow-2xl flex flex-col max-h-[80vh]"
      >
        {/* Header Search Bar */}
        <div className="p-6 border-b border-black/5 bg-[#f9f9fb] flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-black">Global Network Search</h2>
            <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full transition-colors">
              <X size={20} className="text-black/50" />
            </button>
          </div>
          
          <div className="relative">
            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1c7aff]" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by @nickname or 0xAddress..."
              className="w-full bg-white border-2 border-[#1c7aff]/20 focus:border-[#1c7aff] rounded-2xl py-4 pl-12 pr-4 text-[16px] font-bold text-black outline-none transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Results Area */}
        <div className="flex-1 overflow-y-auto p-4 bg-white min-h-[300px]">
          {isSearching ? (
            <div className="h-full flex flex-col items-center justify-center gap-4 text-[#1c7aff]">
              <div className="w-8 h-8 border-4 border-[#1c7aff]/20 border-t-[#1c7aff] rounded-full animate-spin" />
              <p className="text-[13px] font-bold uppercase tracking-widest">Querying Web3 Registry...</p>
            </div>
          ) : query.length < 2 ? (
            <div className="h-full flex flex-col items-center justify-center gap-4 text-black/30">
              <Search size={48} className="opacity-20" />
              <p className="text-[15px] font-medium text-center">Type at least 2 characters to search the global network.</p>
            </div>
          ) : results.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center gap-4 text-black/40">
              <span className="text-4xl">🐋</span>
              <p className="text-[15px] font-medium text-center">No users found matching "{query}"</p>
            </div>
          ) : (
            <div className="space-y-3">
              {results.map(user => (
                <div key={user.address} className="flex items-center justify-between p-4 rounded-2xl border border-black/5 hover:border-[#1c7aff]/30 hover:bg-[#1c7aff]/5 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#1c7aff] to-purple-500 flex items-center justify-center text-white font-black text-lg shadow-sm">
                      {user.nickname.replace('@', '').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2" title="Verified Web3 Identity">
                        <span className="text-[16px] font-black text-black">{user.nickname}</span>
                        <ShieldCheck size={14} className="text-[#30d158]" />
                      </div>
                      <div className="flex items-center gap-1.5 text-black/50 mt-0.5">
                        <MapPin size={12} />
                        <span className="text-[12px] font-medium">{user.country}</span>
                      </div>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => handleAdd(user)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#1c7aff] hover:bg-blue-600 text-white rounded-full font-bold text-[13px] transition-colors shadow-md"
                  >
                    <UserPlus size={16} />
                    <span>Connect</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
