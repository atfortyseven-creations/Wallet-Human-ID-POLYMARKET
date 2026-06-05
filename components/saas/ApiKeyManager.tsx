"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Key, Plus, Trash2, Shield, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SAAS_PLANS } from '@/lib/saas/plans';

// Types for the UI
type ApiKey = {
    id: string;
    name: string;
    key: string;
    createdAt: string;
    lastUsedAt: string | null;
};

export function ApiKeyManager({ tier, keys }: { tier: keyof typeof SAAS_PLANS; keys: ApiKey[] }) {
    const config = SAAS_PLANS[tier as keyof typeof SAAS_PLANS];
    const maxKeys = config.limits.maxApiKeys;
    const canCreate = keys.length < maxKeys;

    const [isCreating, setIsCreating] = useState(false);
    const [newName, setNewName] = useState('');
    const [visibleKeyId, setVisibleKeyId] = useState<string | null>(null);

    const toggleKeyVisibility = (id: string) => {
        setVisibleKeyId(prev => prev === id ? null : id);
    };

    return (
        <div className="bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 relative overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h2 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                        <Key className="text-indigo-400" />
                        API Keys
                    </h2>
                    <p className="text-white/40 text-sm mt-1">
                        Manage your API authentication credentials.
                    </p>
                </div>
                
                <div className="text-right">
                    <span className="text-2xl font-black text-white">{keys.length}</span>
                    <span className="text-white/40">/{maxKeys}</span>
                    <p className="text-[10px] uppercase font-black tracking-widest text-indigo-400 mt-1">
                        Keys Allowed
                    </p>
                </div>
            </div>

            {/* Warning if maxed */}
            {!canCreate && (
                <div className="mb-6 p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-start gap-3">
                    <AlertTriangle className="text-orange-400 shrink-0 mt-0.5" size={18} />
                    <div>
                        <p className="text-orange-300 text-sm font-medium">Maximum Key Limit Reached</p>
                        <p className="text-orange-300/60 text-xs mt-1">
                            Your {config.name} plan allows up to {maxKeys} keys. Please upgrade to create more or delete an existing key.
                        </p>
                    </div>
                </div>
            )}

            {/* List */}
            <div className="space-y-4 mb-6">
                {keys.map((key) => (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={key.id} 
                        className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors flex flex-col md:flex-row gap-4 justify-between items-start md:items-center"
                    >
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="font-bold text-white">{key.name}</span>
                                <span className="text-[10px] uppercase tracking-wider bg-white/10 text-white/70 px-2 py-0.5 rounded-full">
                                    Active
                                </span>
                            </div>
                            <div className="flex items-center gap-3">
                                <code className="text-sm font-mono text-indigo-300 bg-indigo-500/10 px-2 py-1 rounded">
                                    {visibleKeyId === key.id ? key.key : 'hdi_live_'}
                                </code>
                                <button onClick={() => toggleKeyVisibility(key.id)} className="text-white/40 hover:text-white transition-colors">
                                    {visibleKeyId === key.id ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            <p className="text-xs text-white/30 mt-2">
                                Created {new Date(key.createdAt).toLocaleDateString()}
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <Button variant="outline" className="border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-300 h-9 px-3">
                                <Trash2 size={16} className="mr-2" />
                                Revoke
                            </Button>
                        </div>
                    </motion.div>
                ))}

                {keys.length === 0 && (
                     <div className="text-center py-12 border border-dashed border-white/10 rounded-xl">
                         <Key className="mx-auto text-white/20 mb-3" size={32} />
                         <p className="text-white/50">No API keys generated yet.</p>
                     </div>
                )}
            </div>

            {/* Create Tool */}
            <AnimatePresence>
                {isCreating ? (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-white/5 border border-white/10 rounded-xl p-4 overflow-hidden"
                    >
                        <h4 className="text-sm font-bold text-white mb-3">Create New API Key</h4>
                        <div className="flex gap-3">
                            <Input 
                                placeholder="Key Name (e.g., Trading Bot)"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                className="bg-black/50 border-white/10 focus-visible:ring-indigo-500"
                            />
                            <Button 
                                className="bg-indigo-500 hover:bg-indigo-600 text-white shrink-0"
                                onClick={() => setIsCreating(false)} // Close creation modal
                            >
                                Generate
                            </Button>
                            <Button variant="ghost" className="text-white/50" onClick={() => setIsCreating(false)}>
                                Cancel
                            </Button>
                        </div>
                    </motion.div>
                ) : (
                    <Button 
                        disabled={!canCreate}
                        onClick={() => setIsCreating(true)}
                        className="w-full bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 h-12"
                    >
                        <Plus className="mr-2" />
                        Create New API Key
                    </Button>
                )}
            </AnimatePresence>
        </div>
    );
}

