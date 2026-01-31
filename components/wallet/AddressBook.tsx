"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Star, Edit2, Trash2, X, Check } from 'lucide-react';
import { resolveENSName, isValidENSName } from '@/lib/wallet/ens';

interface AddressBookEntry {
  id: string;
  authUserId: string;
  name: string;
  address: string;
  ensName?: string | null;
  label?: string | null;
  note?: string | null;
  isFavorite: boolean;
}

interface AddressBookProps {
  authUserId: string;
}

export default function AddressBook({ authUserId }: AddressBookProps) {
  const [entries, setEntries] = useState<AddressBookEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);

  useEffect(() => {
    loadAddressBook();
  }, [authUserId]);

  const loadAddressBook = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      
      const response = await fetch(`/api/wallet/address-book?${params}`);
      if (!response.ok) throw new Error('Failed to fetch address book');
      
      const data = await response.json();
      setEntries(data.entries || []);
    } catch (error) {
      console.error('Error loading address book:', error);
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEntry = async (entry: Partial<AddressBookEntry>) => {
    try {
      const response = await fetch('/api/wallet/address-book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: entry.name,
          address: entry.address,
          ensName: entry.ensName,
          label: entry.label,
          note: entry.note,
          isFavorite: entry.isFavorite,
        }),
      });

      if (!response.ok) throw new Error('Failed to add entry');
      
      await loadAddressBook();
      setShowAddDialog(false);
    } catch (error) {
      console.error('Error adding entry:', error);
      alert('Failed to add contact. Please try again.');
    }
  };

  const handleToggleFavorite = async (id: string) => {
    try {
      const response = await fetch('/api/wallet/address-book', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, toggleFavoriteFlag: true }),
      });

      if (!response.ok) throw new Error('Failed to toggle favorite');
      
      await loadAddressBook();
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this contact?')) {
      try {
        const response = await fetch(`/api/wallet/address-book?id=${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) throw new Error('Failed to delete entry');
        
        await loadAddressBook();
      } catch (error) {
        console.error('Error deleting entry:', error);
      }
    }
  };

  useEffect(() => {
    const debounce = setTimeout(() => {
      loadAddressBook();
    }, 300);

    return () => clearTimeout(debounce);
  }, [searchQuery]);

  const filteredEntries = selectedLabel
    ? entries.filter(e => e.label === selectedLabel)
    : entries;

  const labels = Array.from(new Set(entries.map(e => e.label).filter(Boolean)));

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-[#1F1F1F]">Address Book</h2>
          <p className="text-sm text-[#1F1F1F]/70">{entries.length} contact{entries.length !== 1 && 's'}</p>
        </div>

        <button
          onClick={() => setShowAddDialog(true)}
          className="px-4 py-2 bg-[#1F1F1F] text-[#EAEADF] rounded-xl font-bold hover:bg-[#1F1F1F]/90 transition-all flex items-center gap-2"
        >
          <Plus size={20} />
          Add Contact
        </button>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1F1F1F]/50" size={20} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search contacts..."
            className="w-full pl-12 pr-4 py-3 bg-white/50 backdrop-blur-sm rounded-2xl outline-none focus:bg-white/80 transition-all"
          />
        </div>

        {labels.length > 0 && (
          <select
            value={selectedLabel || ''}
            onChange={(e) => setSelectedLabel(e.target.value || null)}
            className="px-4 py-3 bg-white/50 rounded-2xl outline-none focus:bg-white/80 transition-all font-bold"
          >
            <option value="">All Labels</option>
            {labels.map((label) => (
              <option key={label} value={label!}>{label}</option>
            ))}
          </select>
        )}
      </div>

      {/* Entries List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#1F1F1F] border-t-transparent" />
        </div>
      ) : filteredEntries.length === 0 ? (
        <div className="text-center py-12 text-[#1F1F1F]/70">
          <p className="text-lg font-bold mb-2">No Contacts Found</p>
          <button
            onClick={() => setShowAddDialog(true)}
            className="mt-4 px-6 py-2 bg-[#1F1F1F] text-[#EAEADF] rounded-xl font-bold hover:bg-[#1F1F1F]/90 transition-all"
          >
            Add Your First Contact
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {filteredEntries.map((entry, index) => (
              <AddressBookCard
                key={entry.id}
                entry={entry}
                index={index}
                onToggleFavorite={() => handleToggleFavorite(entry.id)}
                onDelete={() => handleDelete(entry.id)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Add Dialog */}
      <AnimatePresence>
        {showAddDialog && (
          <AddContactDialog
            onClose={() => setShowAddDialog(false)}
            onAdd={handleAddEntry}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Address Book Card
function AddressBookCard({ 
  entry, 
  index,
  onToggleFavorite, 
  onDelete 
}: { 
  entry: AddressBookEntry;
  index: number;
  onToggleFavorite: () => void;
  onDelete: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ delay: index * 0.05 }}
      className="p-4 bg-white/50 backdrop-blur-sm rounded-2xl border border-[#1F1F1F]/10 hover:bg-white/80 transition-all"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 bg-[#1F1F1F] rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-[#EAEADF] font-bold text-sm">{entry.name[0].toUpperCase()}</span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold text-[#1F1F1F] truncate">{entry.name}</span>
              {entry.isFavorite && <Star size={14} className="text-yellow-500 fill-current flex-shrink-0" />}
              {entry.label && (
                <span className="px-2 py-0.5 bg-[#1F1F1F]/10 rounded-full text-xs font-bold text-[#1F1F1F] flex-shrink-0">
                  {entry.label}
                </span>
              )}
            </div>
            
            <div className="text-sm font-mono text-[#1F1F1F]/70 truncate">
              {entry.ensName || entry.address}
            </div>

            {entry.note && (
              <p className="text-xs text-[#1F1F1F]/60 mt-1 line-clamp-1">{entry.note}</p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 ml-4">
          <button
            onClick={onToggleFavorite}
            className="p-2 rounded-xl hover:bg-[#1F1F1F]/10 transition-all"
          >
            <Star size={16} className={entry.isFavorite ? 'text-yellow-500 fill-current' : 'text-[#1F1F1F]/50'} />
          </button>
          
          <button
            onClick={onDelete}
            className="p-2 rounded-xl hover:bg-red-500/10 transition-all"
          >
            <Trash2 size={16} className="text-red-500" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// Add Contact Dialog
function AddContactDialog({ 
  onClose, 
  onAdd 
}: { 
  onClose: () => void;
  onAdd: (entry: Partial<AddressBookEntry>) => void;
}) {
  const [name, setName] = useState('');
  const [addressOrENS, setAddressOrENS] = useState('');
  const [label, setLabel] = useState('');
  const [note, setNote] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [resolvedAddress, setResolvedAddress] = useState<string | null>(null);

  const handleResolve = async () => {
    if (isValidENSName(addressOrENS)) {
      setResolving(true);
      try {
        const address = await resolveENSName(addressOrENS);
        setResolvedAddress(address);
      } catch (error) {
        console.error('Error resolving ENS:', error);
      } finally {
        setResolving(false);
      }
    } else {
      setResolvedAddress(null);
    }
  };

  useEffect(() => {
    const debounce = setTimeout(() => {
      handleResolve();
    }, 500);

    return () => clearTimeout(debounce);
  }, [addressOrENS]);

  const handleSubmit = () => {
    const address = resolvedAddress || addressOrENS;
    
    if (!name || !address) {
      alert('Name and address are required');
      return;
    }

    onAdd({
      name,
      address,
      ensName: resolvedAddress ? addressOrENS : undefined,
      label: label || undefined,
      note: note || undefined,
      isFavorite,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-md bg-[#EAEADF] rounded-3xl shadow-2xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-[#1F1F1F]/10 transition-colors"
        >
          <X size={24} className="text-[#1F1F1F]" />
        </button>

        <h2 className="text-2xl font-black text-[#1F1F1F] mb-6">Add Contact</h2>

        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-bold text-[#1F1F1F] mb-2">Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Alice"
              className="w-full px-4 py-3 bg-white/50 rounded-xl outline-none focus:bg-white/80 transition-all"
            />
          </div>

          {/* Address or ENS */}
          <div>
            <label className="block text-sm font-bold text-[#1F1F1F] mb-2">Address or ENS Name *</label>
            <input
              type="text"
              value={addressOrENS}
              onChange={(e) => setAddressOrENS(e.target.value)}
              placeholder="0x... or vitalik.eth"
              className="w-full px-4 py-3 bg-white/50 rounded-xl outline-none focus:bg-white/80 transition-all"
            />
            
            {resolving && (
              <div className="text-xs text-[#1F1F1F]/70 mt-1">Resolving ENS...</div>
            )}
            
            {resolvedAddress && (
              <div className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <Check size={12} />
                Resolved: {resolvedAddress.slice(0, 10)}...{resolvedAddress.slice(-8)}
              </div>
            )}
          </div>

          {/* Label */}
          <div>
            <label className="block text-sm font-bold text-[#1F1F1F] mb-2">Label (Optional)</label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Friend, Exchange, Work..."
              className="w-full px-4 py-3 bg-white/50 rounded-xl outline-none focus:bg-white/80 transition-all"
            />
          </div>

          {/* Note */}
          <div>
            <label className="block text-sm font-bold text-[#1F1F1F] mb-2">Note (Optional)</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note about this contact..."
              rows={3}
              className="w-full px-4 py-3 bg-white/50 rounded-xl outline-none focus:bg-white/80 transition-all resize-none"
            />
          </div>

          {/* Favorite */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isFavorite}
              onChange={(e) => setIsFavorite(e.target.checked)}
              className="w-5 h-5 rounded"
            />
            <span className="text-sm font-bold text-[#1F1F1F]">Add to favorites</span>
          </label>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            className="w-full py-3 bg-[#1F1F1F] text-[#EAEADF] rounded-xl font-bold hover:bg-[#1F1F1F]/90 transition-all"
          >
            Add Contact
          </button>
        </div>
      </motion.div>
    </div>
  );
}
