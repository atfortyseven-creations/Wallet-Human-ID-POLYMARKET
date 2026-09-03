import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWalletStore } from '@/lib/store/wallet-store';
import { X, Globe, Shield, EyeOff, FileText, Database, CreditCard, Activity, Bell } from 'lucide-react';

export function SettingsView({ onClose }: { onClose: () => void }) {
    const { address, activeNetwork } = useWalletStore();
    const [activeTab, setActiveTab] = useState('general');

    // Local states for toggles
    const [hideBalances, setHideBalances] = useState(false);
    const [strictMode, setStrictMode] = useState(true);
    const [testnets, setTestnets] = useState(false);
    const [notifications, setNotifications] = useState(true);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 backdrop-blur-sm p-4">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="bg-white rounded-[24px] shadow-2xl w-full max-w-[440px] overflow-hidden flex flex-col font-sans border border-black/5"
            >
                <header className="px-6 py-5 border-b border-zinc-100 flex items-center justify-between bg-white shrink-0">
                    <div>
                        <h2 className="text-[17px] font-black text-black tracking-tight">Portfolio Settings</h2>
                        <p className="text-[12px] text-zinc-500 font-medium mt-0.5">Manage your Humanity Ledger configuration</p>
                    </div>
                    <button onClick={onClose} className="w-9 h-9 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-500 hover:bg-zinc-100 hover:text-black transition-colors">
                        <X size={18} />
                    </button>
                </header>

                <div className="px-6 pt-3 pb-0 bg-white flex gap-2 border-b border-zinc-100 overflow-x-auto scrollbar-hide shrink-0">
                    {['General', 'Privacy', 'Network', 'Data'].map((tab) => (
                        <button 
                            key={tab}
                            onClick={() => setActiveTab(tab.toLowerCase())}
                            className={`pb-3 px-1 text-[12px] font-bold uppercase tracking-wider transition-all border-b-2 ${
                                activeTab === tab.toLowerCase() ? 'border-black text-black' : 'border-transparent text-zinc-400 hover:text-zinc-600'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <div className="p-4 h-[320px] overflow-y-auto bg-[#FAFAFA]">
                    <AnimatePresence mode="wait">
                        {activeTab === 'general' && (
                            <motion.div key="general" initial={{opacity:0, x:-10}} animate={{opacity:1, x:0}} exit={{opacity:0, x:10}} className="flex flex-col gap-2">
                                <SettingRow icon={CreditCard} title="Base Currency" desc="Display portfolio values in fiat." value="EUR (€)" />
                                <SettingRow icon={Globe} title="Language" desc="Application interface language." value="English" />
                                <SettingRow icon={Bell} title="Push Notifications" desc="Alerts for incoming transfers." toggle={notifications} onToggle={() => setNotifications(!notifications)} />
                            </motion.div>
                        )}
                        {activeTab === 'privacy' && (
                            <motion.div key="privacy" initial={{opacity:0, x:-10}} animate={{opacity:1, x:0}} exit={{opacity:0, x:10}} className="flex flex-col gap-2">
                                <SettingRow icon={EyeOff} title="Hide Balances" desc="Obscure sensitive portfolio values." toggle={hideBalances} onToggle={() => setHideBalances(!hideBalances)} />
                                <SettingRow icon={Shield} title="Strict Privacy Mode" desc="Require biometric/password for swaps." toggle={strictMode} onToggle={() => setStrictMode(!strictMode)} />
                            </motion.div>
                        )}
                        {activeTab === 'network' && (
                            <motion.div key="network" initial={{opacity:0, x:-10}} animate={{opacity:1, x:0}} exit={{opacity:0, x:10}} className="flex flex-col gap-2">
                                <SettingRow icon={Database} title="RPC Endpoint" desc="Current active blockchain node." value="Auto (Alchemy)" />
                                <SettingRow icon={Activity} title="Show Testnets" desc="Display Sepolia & testnet balances." toggle={testnets} onToggle={() => setTestnets(!testnets)} />
                            </motion.div>
                        )}
                        {activeTab === 'data' && (
                            <motion.div key="data" initial={{opacity:0, x:-10}} animate={{opacity:1, x:0}} exit={{opacity:0, x:10}} className="flex flex-col gap-2">
                                <SettingRow icon={FileText} title="Export CSV History" desc="Download complete transaction history." action="Download" />
                                <SettingRow icon={Database} title="Clear Local Cache" desc="Reset cached portfolio balances." action="Clear" />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
}

function SettingRow({ icon: Icon, title, desc, value, toggle, onToggle, action }: any) {
    return (
        <div className="flex items-center justify-between p-3.5 bg-white rounded-2xl shadow-sm border border-black/5 hover:border-black/10 transition-colors">
            <div className="flex items-center gap-4">
                <div className="w-9 h-9 rounded-full bg-[#F2F2F7] flex items-center justify-center text-black">
                    <Icon size={16} />
                </div>
                <div className="flex flex-col">
                    <span className="text-[13.5px] font-black text-black leading-tight">{title}</span>
                    <span className="text-[11.5px] text-zinc-500 font-medium mt-0.5">{desc}</span>
                </div>
            </div>
            {value && <span className="text-[12px] font-bold text-black bg-[#F2F2F7] px-2.5 py-1 rounded-lg">{value}</span>}
            {toggle !== undefined && (
                <button onClick={onToggle} className={`w-10 h-5 rounded-full flex items-center px-0.5 transition-colors ${toggle ? 'bg-black' : 'bg-zinc-200'}`}>
                    <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${toggle ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
            )}
            {action && (
                <button className="text-[11px] font-bold text-black uppercase tracking-wider bg-[#F2F2F7] hover:bg-zinc-200 px-3.5 py-1.5 rounded-xl transition-colors">
                    {action}
                </button>
            )}
        </div>
    );
}
