"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Twitter, Youtube, Share2, Send, CheckCircle2, Loader2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { useAztecNative } from '@/context/AztecNativeContext';

type QuestSlug = 'twitter-follow' | 'youtube-follow' | 'tg-join' | 'page-share';

interface Quest {
    slug: QuestSlug;
    title: string;
    description: string;
    reward: number;
    icon: React.ReactNode;
    color: string;
    actionUrl?: string;
}

const QUESTS: Quest[] = [
    { slug: 'youtube-follow', title: 'Subscribe to YouTube', description: 'Follow @WhaleNetwork for ultimate alpha.', reward: 200, icon: <Youtube size={16} />, color: 'text-red-500 bg-red-500/10 border-red-500/20', actionUrl: 'https://www.youtube.com/@WhaleNetwork' },
    { slug: 'tg-join', title: 'Join Telegram', description: 'Enter t.me/humanityledger.', reward: 200, icon: <Send size={16} />, color: 'text-blue-500 bg-blue-500/10 border-blue-500/20', actionUrl: 'https://t.me/humanityledger' },
    { slug: 'twitter-follow', title: 'Follow on Twitter', description: 'Follow @WhaleNetwork.', reward: 50, icon: <Twitter size={16} />, color: 'text-sky-400 bg-sky-400/10 border-sky-400/20', actionUrl: 'https://twitter.com/WhaleNetwork' },
    { slug: 'page-share', title: 'Share Humanity Ledger', description: 'Share this page with your network.', reward: 15, icon: <Share2 size={16} />, color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' }
];

export function AztecRewardsCard() {
    const { aztecAddress, refresh } = useAztecNative();
    const [claimed, setClaimed] = useState<Record<string, boolean>>({});
    const [loading, setLoading] = useState<Record<string, boolean>>({});

    useEffect(() => {
        if (!aztecAddress) return;
        fetch(`/api/aztec/quests?aztecAddress=\${aztecAddress}`)
            .then(res => res.json())
            .then(data => {
                if (data.quests) {
                    const statusMap: Record<string, boolean> = {};
                    data.quests.forEach((q: any) => {
                        if (q.status === 'CLAIMED') statusMap[q.slug] = true;
                    });
                    setClaimed(statusMap);
                }
            }).catch(console.error);
    }, [aztecAddress]);

    const handleClaim = async (quest: Quest) => {
        if (!aztecAddress) {
            toast.error("Please connect your Aztec Identity first.");
            return;
        }

        // UX: Open URL first if applicable
        if (quest.actionUrl) {
            window.open(quest.actionUrl, '_blank');
        } else if (quest.slug === 'page-share') {
            try {
                await navigator.share({ title: 'Humanity Ledger', url: window.location.href });
            } catch (e) {
                navigator.clipboard.writeText(window.location.href);
                toast.success("Link copied to clipboard!");
            }
        }

        setLoading(prev => ({ ...prev, [quest.slug]: true }));

        // Small delay to simulate verification
        setTimeout(async () => {
            try {
                const res = await fetch('/api/aztec/quests', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ slug: quest.slug, questId: quest.slug, aztecAddress })
                });
                
                const data = await res.json();
                if (res.ok) {
                    setClaimed(prev => ({ ...prev, [quest.slug]: true }));
                    toast.success(`+\${quest.reward} QDs Claimed! \${data.message || ''}`);
                    refresh(); // Update the global balance
                } else {
                    toast.error(data.error || "Failed to claim reward. You may have already claimed this on this IP.");
                }
            } catch (e) {
                toast.error("Network error during claim.");
            } finally {
                setLoading(prev => ({ ...prev, [quest.slug]: false }));
            }
        }, 2000);
    };

    return (
        <div className="w-full mt-6 border border-zinc-900/10 bg-white p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none transform translate-x-1/2 -translate-y-1/2" />
            
            <div className="flex items-start justify-between mb-6 relative z-10">
                <div>
                    <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-zinc-900 mb-1 flex items-center gap-2">
                        Social Quests
                        <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 text-[8px] rounded-sm">EARN QDs</span>
                    </h3>
                    <p className="text-[10px] text-zinc-500 font-mono">Complete tasks to increase your QD balance. IP-tracked with slashing rules.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                {QUESTS.map(quest => {
                    const isClaimed = claimed[quest.slug];
                    const isLoading = loading[quest.slug];

                    return (
                        <div key={quest.slug} className="flex items-center justify-between p-4 border border-zinc-900/10 bg-zinc-50 hover:bg-zinc-100/50 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center border \${quest.color}`}>
                                    {quest.icon}
                                </div>
                                <div>
                                    <div className="text-[11px] font-bold uppercase tracking-widest text-zinc-900">{quest.title}</div>
                                    <div className="text-[9px] text-zinc-500 font-mono">{quest.description}</div>
                                </div>
                            </div>
                            
                            <button
                                onClick={() => handleClaim(quest)}
                                disabled={isClaimed || isLoading}
                                className={`flex items-center justify-center min-w-[80px] h-8 px-4 text-[9px] font-black uppercase tracking-widest transition-all \${
                                    isClaimed 
                                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 cursor-not-allowed'
                                    : 'bg-zinc-900 text-white hover:bg-zinc-800 active:scale-95 shadow-sm'
                                }`}
                            >
                                {isLoading ? (
                                    <Loader2 size={12} className="animate-spin" />
                                ) : isClaimed ? (
                                    <span className="flex items-center gap-1"><CheckCircle2 size={10} /> DONE</span>
                                ) : (
                                    `+\${quest.reward} QD`
                                )}
                            </button>
                        </div>
                    );
                })}
            </div>

            <div className="mt-6 pt-4 border-t border-zinc-900/10 flex items-center gap-3 text-[9px] font-mono text-zinc-500">
                <AlertTriangle size={12} className="text-amber-500" />
                <p>Rewards are IP-indexed. Unfollowing or leaving groups will result in an automatic <span className="text-red-500 font-bold">SLASH</span> of QDs from your Aztec Identity.</p>
            </div>
        </div>
    );
}
