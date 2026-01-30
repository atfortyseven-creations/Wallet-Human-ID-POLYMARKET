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
            {/* 4 Action Buttons - Premium Squircle Design */}
            <div className="grid grid-cols-4 gap-4 mb-10 max-w-lg mx-auto">
                {ACTIONS.map((action) => (
                    <button 
                        key={action.label}
                        className="flex flex-col items-center gap-3 group"
                    >
                        <div className={`
                            w-16 h-16 rounded-[24px] 
                            flex items-center justify-center text-white 
                            shadow-[0_8px_20px_-6px_rgba(0,0,0,0.15)] 
                            transition-all duration-300 ease-out
                            group-hover:scale-110 group-hover:shadow-[0_15px_30px_-10px_rgba(0,0,0,0.2)]
                            group-active:scale-95
                            ${action.label === 'Comprar' ? 'bg-blue-600' : 'bg-neutral-800'}
                        `}>
                            {action.icon}
                        </div>
                        <span className="text-xs font-bold text-neutral-600 group-hover:text-neutral-900 transition-colors">
                            {action.label}
                        </span>
                    </button>
                ))}
            </div>

            {/* Tabs Navigation - Minimalist */}
            <div className="flex border-b border-neutral-200/60 mb-8 mx-4">
                {TABS.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`
                            flex-1 py-4 text-sm font-bold text-center relative transition-colors tracking-wide
                            ${activeTab === tab.id ? 'text-blue-600' : 'text-neutral-400 hover:text-neutral-600'}
                        `}
                    >
                        {tab.label}
                        {activeTab === tab.id && (
                            <div className="absolute bottom-0 left-0 w-full h-[3px] bg-blue-600 rounded-t-full shadow-[0_0_15px_rgba(37,99,235,0.4)]" />
                        )}
                    </button>
                ))}
            </div>

            {/* Content Area - Light Mode Compatible */}
            <div className="min-h-[400px] animate-fade-in relative z-10">
                {activeTab === 'Tokens' && (
                    <div className="text-center py-16 text-neutral-400 text-sm">
                        <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4 text-neutral-300">
                             <LayoutGrid size={24} />
                        </div>
                        <p className="font-medium">No tokens found.</p>
                        <button className="mt-4 text-blue-600 hover:text-blue-700 font-bold hover:underline">Import tokens</button>
                    </div>
                )}
                 {activeTab === 'DeFi' && (
                    <div className="text-center py-16 text-neutral-400 text-sm">
                         <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4 text-neutral-300">
                             <History size={24} />
                        </div>
                        <p className="font-medium">No active positions.</p>
                    </div>
                )}
                 {activeTab === 'NFT' && (
                    <div className="text-center py-16 text-neutral-400 text-sm">
                         <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4 text-neutral-300">
                             <ImageIcon size={24} />
                        </div>
                        <p className="font-medium">No NFTs in this wallet.</p>
                    </div>
                )}
                 {activeTab === 'Feed' && (
                    <div className="flex flex-col gap-10 pb-10">
                        {/* Reusing Landing Page Components for the Feed - Scaled correctly */}
                        <div className="scale-95 origin-top -mt-4 opacity-90 hover:opacity-100 transition-opacity duration-500">
                            <FeatureCardsSection />
                        </div>
                        <div className="scale-95 origin-top -mt-10 opacity-90 hover:opacity-100 transition-opacity duration-500">
                            <SecurityGrowthSection />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
