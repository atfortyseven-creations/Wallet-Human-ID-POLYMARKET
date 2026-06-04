import { useState } from 'react';
import { useGhostNetwork } from '@/lib/event-horizon/ghost-network/rpc-protector';
import { Shield, EyeOff, Zap } from 'lucide-react';

export const StealthModeToggle = () => {
    const { connectPrivateRPC } = useGhostNetwork();
    const [isActive, setIsActive] = useState(false);

    const activateStealth = async () => {
        try {
            await connectPrivateRPC();
            setIsActive(true);
        } catch (e) {
            console.error("Stealth activation failed", e);
        }
    };

    return (
        <div className="flex items-center gap-4 p-4 border border-zinc-800 bg-zinc-950/50 rounded-xl backdrop-blur-md">
            <div className={`p-3 rounded-full ${isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-500'}`}>
                {isActive ? <EyeOff size={24} /> : <Shield size={24} />}
            </div>
            
            <div className="flex-1">
                <h3 className="font-bold text-lg text-zinc-100 italic">
                    {isActive ? "GHOST PROTOCOL: ACTIVE" : "PUBLIC MEMPOOL DETECTED"}
                </h3>
                <p className="text-xs text-zinc-400">
                    {isActive 
                        ? "Transactions are bypassing the public mempool. Immune to sandwich attacks." 
                        : "Your transactions are visible to predator bots (Axel)."}
                </p>
            </div>

            <button 
                onClick={activateStealth}
                disabled={isActive}
                className={`
                    px-4 py-2 rounded-lg font-mono text-xs font-bold uppercase tracking-wider transition-all
                    ${isActive 
                        ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' 
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_20px_rgba(79,70,229,0.5)]'}
                `}
            >
                {isActive ? "Stealth Engaged" : "Activate Stealth"}
            </button>
        </div>
    );
};

