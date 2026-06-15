'use client';

import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, AlertTriangle, RefreshCw, Lock } from 'lucide-react';
import { toast } from 'sonner';

const WALKAWAY_ADDRESS = '0x78831C25c86eA2a78A6127fC2Ccb95E612D87b4a'; // Placeholder or actual deployed address
const ABI = [
    "function lastHeartbeat() view returns (uint256)",
    "function sendHeartbeat() external",
    "function checkWalkaway() external",
    "function owner() view returns (address)"
];

export const WalkawayPanel = () => {
    const [daysLeft, setDaysLeft] = useState(180);
    const [isFounder, setIsFounder] = useState(false);
    const [loading, setLoading] = useState(false);
    const [lastBeat, setLastBeat] = useState<number | null>(null);

    // Initial on-chain sync
    useEffect(() => {
        const syncStatus = async () => {
            if (!(window as any).ethereum) return;
            try {
                const provider = new ethers.BrowserProvider((window as any).ethereum);
                const accounts = await provider.listAccounts();
                if (accounts.length === 0) return;
                
                const currentAddress = accounts[0].address;
                const contract = new ethers.Contract(WALKAWAY_ADDRESS, ABI, provider);
                
                const [hb, owner] = await Promise.all([
                    contract.lastHeartbeat(),
                    contract.owner()
                ]);

                const hbValue = Number(hb);
                setLastBeat(hbValue * 1000);
                
                // Calculate remaining days
                const expiry = hbValue + (180 * 24 * 60 * 60);
                const now = Math.floor(Date.now() / 1000);
                const diff = Math.max(0, expiry - now);
                setDaysLeft(Math.floor(diff / (24 * 60 * 60)));

                setIsFounder(currentAddress.toLowerCase() === owner.toLowerCase());
            } catch (e) {
                console.error("Failed to sync Walkaway contract:", e);
                // Fallback for demo if contract not deployed
                setLastBeat(Date.now() - 3600000);
            }
        };

        syncStatus();
    }, []);

    const handleHeartbeat = async () => {
        if (!(window as any).ethereum) {
            toast.error("Web3 Provider Required", { description: "Install MetaMask or use an institutional browser." });
            return;
        }

        setLoading(true);
        try {
            const provider = new ethers.BrowserProvider((window as any).ethereum);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(WALKAWAY_ADDRESS, ABI, signer);
            
            toast.loading("Broadcasting Heartbeat Signal...", { id: "hb-load" });
            const tx = await contract.sendHeartbeat();
            await tx.wait();
            
            toast.success("Vitality Confirmed", { id: "hb-load", description: "Walkaway timer has been reset to 180 days." });
            setDaysLeft(180);
            setLastBeat(Date.now());
        } catch (error: any) {
            console.error(error);
            toast.error("Handover Failed", { id: "hb-load", description: error?.reason || "Execution failed on-chain." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="border-[#FF3B30]/30 bg-[#FFFFFF] shadow-sm relative overflow-hidden rounded-2xl group">
            <div className="absolute inset-0 bg-gradient-to-br from-[#FF3B30]/5 to-transparent pointer-events-none" />
            <CardHeader className="flex flex-row items-center justify-between border-b border-[#F0F0F0] pb-4">
                <div className="space-y-0.5">
                    <CardTitle className="text-[#050505] tracking-widest text-[11px] uppercase font-black flex items-center gap-1.5">
                        <Lock size={14} className="text-[#FF3B30]" /> Walkaway Switch v3
                    </CardTitle>
                    <p className="text-[9px] text-[#888888] uppercase tracking-widest font-bold">
                        Decentralized Ownership Handover
                    </p>
                </div>
                <Badge variant="outline" className="px-3 py-1 font-black bg-[#FF3B30]/10 text-[#FF3B30] border-[#FF3B30]/20 uppercase tracking-widest text-[8px]">
                    PROTECTED
                </Badge>
            </CardHeader>
            <CardContent className="pt-6 space-y-5">
                <div className="flex flex-col items-center justify-center py-5 border border-[#E5E5E5] rounded-xl bg-[#FFFFFF]">
                    <p className="text-[9px] uppercase tracking-[0.2em] text-[#888888] mb-1 font-black">Time until Auto-Handover</p>
                    <div className="flex items-baseline gap-1.5">
                        <span className="text-5xl font-black text-[#FF3B30] tracking-tighter">
                            {daysLeft}
                        </span>
                        <span className="text-xs font-bold text-[#FF3B30]/60 uppercase">Days</span>
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="p-3.5 rounded-xl bg-[#FF3B30]/5 border border-[#FF3B30]/10 space-y-1.5">
                        <div className="flex items-center gap-1.5 text-[9px] font-black uppercase text-[#FF3B30]">
                            <AlertTriangle size={12} />
                            Governance Clause
                        </div>
                        <p className="text-[10px] leading-relaxed text-[#050505] font-medium">
                            If no heartbeat is detected for 180 consecutive days, all protocol administrative privileges are automatically transferred to the community-governed multi-signature vault.
                        </p>
                    </div>

                    {isFounder ? (
                        <Button 
                            onClick={handleHeartbeat}
                            disabled={loading}
                            className="w-full bg-[#FF3B30] hover:bg-[#FF3B30]/90 text-white font-black uppercase tracking-widest text-[10px] h-10 gap-2 rounded-xl shadow-sm"
                        >
                            {loading ? <RefreshCw className="animate-spin" size={14} /> : <Lock size={14} />}
                            Confirm Founder Vitality
                        </Button>
                    ) : (
                        <div className="text-center space-y-2.5">
                            <Button 
                                variant="outline" 
                                className="w-full border-[#FF3B30]/20 text-[#FF3B30] hover:bg-[#FF3B30]/5 font-black uppercase tracking-widest text-[10px] h-10 rounded-xl"
                            >
                                Verify Threshold Status
                            </Button>
                            <p className="text-[9px] text-[#888888] uppercase tracking-widest leading-relaxed font-bold">
                                Only the founding identity can reset the timer.
                            </p>
                        </div>
                    )}
                </div>

                {lastBeat && (
                    <div className="flex justify-between items-center text-[9px] uppercase tracking-widest text-[#888888] font-black border-t border-[#F0F0F0] pt-3">
                        <span>Last Signal Trace</span>
                        <span className="text-[#050505]">{new Date(lastBeat).toLocaleString()}</span>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
