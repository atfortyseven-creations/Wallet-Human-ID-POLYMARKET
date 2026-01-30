import React, { useState } from 'react';
import { ArrowUpRight, ArrowDownLeft, Repeat, CreditCard, LayoutGrid, Image as ImageIcon, History, Newspaper } from 'lucide-react';
import { FeatureCardsSection } from '@/components/landing/FeatureCardsSection';
import { SecurityGrowthSection } from '@/components/landing/SecurityGrowthSection';

export function WalletActions() {
    const [activeTab, setActiveTab] = useState('Tokens');

    const ACTIONS = [
        { label: 'Comprar', icon: <CreditCard size={24} />, color: 'bg-blue-600 hover:bg-blue-500' },
        { label: 'Intercambio', icon: <Repeat size={24} />, color: 'bg-zinc-700 hover:bg-zinc-600' },
        { label: 'Enviar', icon: <ArrowUpRight size={24} />, color: 'bg-zinc-700 hover:bg-zinc-600' },
        { label: 'Recibir', icon: <ArrowDownLeft size={24} />, color: 'bg-zinc-700 hover:bg-zinc-600' },
    ];

    const TABS = [
        { id: 'Tokens', label: 'Tokens' },
        { id: 'DeFi', label: 'DeFi' },
        { id: 'NFT', label: 'NFT' },
        { id: 'Feed', label: 'Feed' }
    ];

    return (
        <div className="w-full">
            {/* 4 Action Buttons */}
            <div className="grid grid-cols-4 gap-4 mb-8 max-w-md mx-auto">
                {ACTIONS.map((action) => (
                    <button 
                        key={action.label}
                        className="flex flex-col items-center gap-2 group"
                    >
                        <div className={`
                            w-12 h-12 md:w-14 md:h-14 rounded-2xl 
                            flex items-center justify-center text-white 
                            shadow-lg shadow-black/20 transition-all duration-300
                            group-hover:scale-105 group-active:scale-95
                            ${action.color}
                        `}>
                            {action.icon}
                        </div>
                        <span className="text-xs font-medium text-white/70 group-hover:text-white transition-colors">
                            {action.label}
                        </span>
                    </button>
                ))}
            </div>

            {/* Tabs Navigation */}
            <div className="flex border-b border-white/10 mb-6">
                {TABS.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`
                            flex-1 py-3 text-sm font-bold text-center relative transition-colors
                            ${activeTab === tab.id ? 'text-blue-400' : 'text-white/40 hover:text-white'}
                        `}
                    >
                        {tab.label}
                        {activeTab === tab.id && (
                            <div className="absolute bottom-0 left-0 w-full h-[2px] bg-blue-500 shadow-[0_0_10px_#3b82f6]" />
                        )}
                    </button>
                ))}
            </div>

                {/* Content Area */}
                <div className="min-h-[400px] animate-fade-in">
                    {activeTab === 'Tokens' && (
                        <div className="text-center py-10 text-white/30 text-sm">
                            <p>No tokens found except native assets.</p>
                            <button className="mt-4 text-blue-400 hover:text-blue-300 font-bold">Import tokens</button>
                        </div>
                    )}
                     {activeTab === 'DeFi' && (
                        <div className="text-center py-10 text-white/30 text-sm">
                            <p>No active positions.</p>
                        </div>
                    )}
                     {activeTab === 'NFT' && (
                        <div className="text-center py-10 text-white/30 text-sm">
                            <p>No NFTs in this wallet.</p>
                        </div>
                    )}
                     {activeTab === 'Feed' && (
                        <div className="flex flex-col gap-10 pb-10">
                            {/* Reusing Landing Page Components for the Feed */}
                            <div className="scale-90 origin-top -mt-10">
                                <FeatureCardsSection />
                            </div>
                            <div className="scale-90 origin-top -mt-20">
                                <SecurityGrowthSection />
                            </div>
                        </div>
                    )}
                </div>
        </div>
    );
}
