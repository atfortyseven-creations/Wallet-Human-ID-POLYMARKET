import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, AlertCircle } from 'lucide-react';

interface SyndicateModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: any;
  onGroupCreated?: (group: any) => void;
}

export function SyndicateModal({ isOpen, onClose, client, onGroupCreated }: SyndicateModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [addresses, setAddresses] = useState<string[]>([]);
  const [currentAddress, setCurrentAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddAddress = () => {
    if (currentAddress.trim() && !addresses.includes(currentAddress.trim())) {
      setAddresses([...addresses, currentAddress.trim()]);
      setCurrentAddress('');
    }
  };

  const handleRemoveAddress = (addressToRemove: string) => {
    setAddresses(addresses.filter(a => a !== addressToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!client) {
      setError('Client not initialized');
      return;
    }
    if (addresses.length === 0) {
      setError('Please add at least one address');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const group = await client.conversations.newGroup(addresses, {
        name,
        description
      });
      
      onGroupCreated?.(group);
      onClose();
      setName('');
      setDescription('');
      setAddresses([]);
      setCurrentAddress('');
    } catch (err: any) {
      console.error('Failed to create group:', err);
      setError(err.message || 'Failed to create group');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full max-w-md p-6 bg-white border shadow-xl rounded-3xl border-black/5"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-gray-900">New Syndicate</h2>
              <button
                onClick={onClose}
                className="p-2 text-gray-500 transition-colors rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block mb-1 text-sm font-bold text-gray-700">
                  Group Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. DeFi Alpha"
                  className="w-full px-4 py-3 text-gray-900 transition-colors bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-300"
                  required
                />
              </div>

              <div>
                <label className="block mb-1 text-sm font-bold text-gray-700">
                  Description
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What's this group for?"
                  className="w-full px-4 py-3 text-gray-900 transition-colors bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-300"
                />
              </div>

              <div>
                <label className="block mb-1 text-sm font-bold text-gray-700">
                  Members
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={currentAddress}
                    onChange={(e) => setCurrentAddress(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAddress())}
                    placeholder="0x... or ENS"
                    className="flex-1 px-4 py-3 text-gray-900 transition-colors bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-300"
                  />
                  <button
                    type="button"
                    onClick={handleAddAddress}
                    className="px-4 py-3 font-bold text-white transition-colors bg-black rounded-2xl hover:bg-gray-800"
                  >
                    Add
                  </button>
                </div>
                
                <div className="max-h-32 overflow-y-auto space-y-2">
                  {addresses.map((address) => (
                    <div key={address} className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-xl">
                      <span className="text-sm font-medium text-gray-700 truncate">
                        {address}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveAddress(address)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 rounded-xl">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || addresses.length === 0}
                className="flex items-center justify-center w-full gap-2 px-6 py-4 font-bold text-white transition-all bg-black rounded-2xl hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Users className="w-5 h-5" />
                    Create Syndicate
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}