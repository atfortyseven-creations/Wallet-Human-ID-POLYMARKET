"use client";

import { motion } from 'framer-motion';
import { ShieldAlert, Network, Lock, Info, Server } from 'lucide-react';
import { SAAS_PLANS } from '@/lib/saas/plans';
import { Button } from '@/components/ui/button';

export function SecurityPanel({ tier }: { tier: string }) {
    const config = SAAS_PLANS[tier as keyof typeof SAAS_PLANS];
    const isPremium = config.features.ipWhitelist || config.features.hmacRequired;

    if (!isPremium) {
        return (
            <div className="bg-[#0a0a0a]/40 border border-white/5 rounded-2xl p-8 text-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <Lock className="mx-auto text-white/20 mb-4" size={40} />
                <h3 className="text-lg font-black text-white mb-2">Elite Security Locked</h3>
                <p className="text-white/40 text-sm max-w-sm mx-auto mb-6">
                    IP Whitelisting and HMAC Signature enforcement are strictly available on Pro and Elite plans.
                </p>
                <Button className="bg-white/10 hover:bg-white/20 text-white">
                    Upgrade to Pro Access
                </Button>
            </div>
        );
    }

    return (
        <div className="bg-[#0a0a0a]/80 backdrop-blur-xl border border-indigo-500/20 rounded-2xl p-6 relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[50px] rounded-full" />
            
            <h2 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3 mb-6">
                <ShieldAlert className="text-indigo-400" />
                Advanced Security
            </h2>

            <div className="grid md:grid-cols-2 gap-6 relative z-10">
                {/* IP Whitelist */}
                <div className="p-5 rounded-xl bg-black/40 border border-white/10">
                    <div className="flex items-center gap-3 mb-3">
                        <Network className="text-indigo-300" size={20} />
                        <h4 className="text-white font-bold">IP Whitelist</h4>
                    </div>
                    <p className="text-xs text-white/50 mb-4">
                        Restrict API Key usage to specific static IPs or CIDR blocks. Any request originating outside these blocks will be rejected by our edge network.
                    </p>
                    <div className="bg-white/5 rounded border border-white/5 p-3 mb-4 min-h-[60px] flex items-center justify-center">
                        <span className="text-sm font-mono text-white/30">No IPs configured</span>
                    </div>
                    <Button variant="outline" size="sm" className="w-full border-white/10 text-white/70">
                        Manage IP Addresses
                    </Button>
                </div>

                {/* HMAC Config */}
                <div className="p-5 rounded-xl bg-black/40 border border-white/10">
                    <div className="flex items-center gap-3 mb-3">
                        <Server className="text-indigo-300" size={20} />
                        <h4 className="text-white font-bold">HMAC Signatures</h4>
                    </div>
                    <p className="text-xs text-white/50 mb-4">
                        Cryptographically sign your requests to prevent Man-in-the-Middle and Replay attacks. Required for trade executions and WebSocket streams.
                    </p>
                    
                    <div className="flex items-center gap-2 mb-4 p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20 text-xs text-indigo-300">
                        <Info size={14} className="shrink-0" />
                        Status: <span className="font-bold underline cursor-help">Configured (Enforced)</span>
                    </div>

                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1 border-white/10 text-white/70">
                            Rotate Secret
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1 border-white/10 text-white/70">
                            View Docs
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

