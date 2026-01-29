'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettings } from '@/src/context/SettingsContext';
import {
    X, Settings, Shield, Zap, Database, Bell, Users,
    CreditCard, Beaker, Link, Info, MessageCircle, Lock
} from 'lucide-react';

export function SettingsModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const { activeTab: contextActiveTab, t, currency, setCurrency, language, setLanguage, searchEngine, setSearchEngine, lockApp } = useSettings();
    const [localActiveTab, setLocalActiveTab] = useState('general');

    // Use local state for activeTab since it's not in the context interface provided in the instructions
    const activeTab = localActiveTab;
    const setActiveTab = setLocalActiveTab;

    // HELPER: Sidebar Items with Translation
    const SECTIONS = [
        { id: 'general', label: t('nav_general'), icon: Settings },
        { id: 'security', label: t('nav_security'), icon: Shield },
        { id: 'advanced', label: t('nav_advanced'), icon: Zap },
        { id: 'contacts', label: t('nav_contacts'), icon: Users },
        { id: 'notifications', label: t('nav_notifications'), icon: Bell },
        { id: 'backup', label: t('nav_backup'), icon: Database },
        { id: 'walletconnect', label: t('nav_walletconnect'), icon: Link },
        { id: 'buy', label: t('nav_buy'), icon: CreditCard },
        { id: 'experimental', label: t('nav_experimental'), icon: Beaker },
        { id: 'about', label: t('nav_about'), icon: Info },
        { id: 'support', label: t('nav_support'), icon: MessageCircle },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'general':
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-300 block mb-2">{t('label_currency')}</label>
                                <select
                                    value={currency}
                                    onChange={(e) => setCurrency(e.target.value as any)}
                                    className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-white focus:border-[#00f2ea] focus:ring-1 focus:ring-[#00f2ea] outline-none transition-all"
                                >
                                    <option value="USD">USD - United States Dollar</option>
                                    <option value="EUR">EUR - Euro</option>
                                    <option value="GBP">GBP - British Pound</option>
                                    <option value="JPY">JPY - Japanese Yen</option>
                                    <option value="MXN">MXN - Mexican Peso</option>
                                </select>
                                <p className="text-xs text-gray-500 mt-2 ml-1">{t('desc_currency')}</p>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-300 block mb-2">{t('label_language')}</label>
                                <select
                                    value={language}
                                    onChange={(e) => setLanguage(e.target.value as any)}
                                    className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-white focus:border-[#00f2ea] focus:ring-1 focus:ring-[#00f2ea] outline-none transition-all"
                                >
                                    <option value="en">English (US)</option>
                                    <option value="es">Español (Latam)</option>
                                    <option value="fr">Français</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-300 block mb-2">{t('label_search')}</label>
                                <select
                                    value={searchEngine}
                                    onChange={(e) => setSearchEngine(e.target.value as any)}
                                    className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-white focus:border-[#00f2ea] focus:ring-1 focus:ring-[#00f2ea] outline-none transition-all"
                                >
                                    <option value="Google">Google</option>
                                    <option value="DuckDuckGo">DuckDuckGo (Private)</option>
                                    <option value="Brave">Brave Search</option>
                                </select>
                            </div>
                        </div>
                    </div>
                );

            case 'security':
                return <div className="p-4 text-center text-gray-500 bg-white/5 rounded-xl">{t('btn_reveal')} (Secure Enclave Active)</div>;

            case 'advanced':
                return <div className="space-y-4"><h3 className="text-white">RPC Configuration</h3><input disabled placeholder="https://mainnet.infura.io/v3..." className="w-full bg-black/20 p-3 rounded border border-white/10" /></div>;

            case 'contacts':
                return <div className="p-4 text-center text-gray-500">{t('placeholder_empty')}</div>;

            case 'notifications':
                return <div className="space-y-2"><div className="flex justify-between text-white"><span>Push Alerts</span><div className="w-10 h-5 bg-green-500 rounded-full" /></div></div>;

            case 'backup':
                return <div className="p-4 border border-dashed border-gray-600 rounded text-center text-gray-400">Sync with iCloud / Google Drive</div>;

            case 'walletconnect':
                return <div className="p-4 text-center text-gray-500">No active sessions.</div>;

            case 'buy':
                return <div className="p-4 text-center text-gray-500">MoonPay Integration Loading...</div>;
            case 'experimental':
                return <div className="p-4 text-center text-orange-400 border border-orange-500/20 bg-orange-500/5 rounded">Beta Features Enabled</div>;

            case 'about':
                return <div className="text-center p-8"><h1 className="text-2xl font-bold text-white">HumanID.fi</h1><p className="text-gray-500">v2.4.1 (Sovereign Build)</p></div>;

            case 'support':
                return <div className="text-center"><a href="#" className="text-blue-400 underline">Contact Support Team</a></div>;
            default:
                return null;
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100]"
                    />

                    {/* Modal Window */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 md:inset-auto md:top-10 md:bottom-10 md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 
                                   w-full md:w-[900px] md:h-[700px] bg-[#0D0D12] border border-white/10 md:rounded-3xl shadow-2xl z-[101] overflow-hidden flex flex-col md:flex-row"
                    >
                        {/* LEFT SIDEBAR (Menu) */}
                        <div className="w-full md:w-64 bg-black/20 border-r border-white/5 flex flex-col">
                            <div className="p-6 border-b border-white/5 hidden md:block">
                                <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                                    <Settings className="text-[#00f2ea]" size={20} /> {t('settings_title')}
                                </h2>
                            </div>

                            <div className="flex-1 overflow-x-auto md:overflow-y-auto py-2 scrollbar-hide flex md:flex-col">
                                {SECTIONS.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => setActiveTab(item.id)}
                                        className={`flex-shrink-0 md:w-full flex items-center gap-3 px-6 py-3 text-sm transition-all relative group
                                            ${activeTab === item.id ? 'text-[#00f2ea] bg-[#00f2ea]/5' : 'text-gray-400 hover:text-white hover:bg-white/5'}
                                        `}
                                    >
                                        <item.icon size={18} className={activeTab === item.id ? "opacity-100" : "opacity-70 group-hover:opacity-100"} />
                                        <span className="whitespace-nowrap">{item.label}</span>
                                        {activeTab === item.id && (
                                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#00f2ea] rounded-r-full hidden md:block" />
                                        )}
                                        {activeTab === item.id && (
                                            <div className="absolute left-0 right-0 bottom-0 h-1 bg-[#00f2ea] rounded-t-full md:hidden" />
                                        )}
                                    </button>
                                ))}
                            </div>

                            {/* Actions Footer */}
                            <div className="p-4 border-t border-white/5 space-y-1 hidden md:block">
                                <button
                                    onClick={lockApp}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:text-red-300 rounded-lg hover:bg-red-500/10 transition-colors"
                                >
                                    <Lock size={18} /> {t('btn_lock')}
                                </button>
                            </div>
                        </div>

                        {/* RIGHT CONTENT (Dynamic) */}
                        <div className="flex-1 flex flex-col min-w-0 bg-[#0D0D12]">
                            {/* Header Mobile Only */}
                            <div className="md:hidden flex justify-between items-center p-4 border-b border-white/5">
                                <h3 className="text-white font-bold">{SECTIONS.find(s => s.id === activeTab)?.label}</h3>
                                <button onClick={onClose}><X size={24} className="text-gray-400" /></button>
                            </div>

                            {/* Desktop Header */}
                            <div className="hidden md:flex justify-between items-center p-8 pb-4">
                                <div>
                                    <h2 className="text-2xl font-bold text-white mb-1">
                                        {SECTIONS.find(s => s.id === activeTab)?.label}
                                    </h2>
                                    <p className="text-sm text-gray-500">{t('settings_title')}</p>
                                </div>
                                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                    <X size={24} className="text-gray-400" />
                                </button>
                            </div>

                            {/* Scrollable Content Area */}
                            <div className="flex-1 overflow-y-auto p-6 md:p-8 scrollbar-hide">
                                {renderContent()}
                            </div>
                        </div>

                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
