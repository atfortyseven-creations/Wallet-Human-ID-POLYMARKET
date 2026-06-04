'use client';

import React, { useState } from 'react';
import { getWeb3Wallet } from '@/lib/walletconnect/walletKit';
import { parseUri } from '@walletconnect/utils';
import { X, Link2, Scan } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
    onClose: () => void;
}

export function WCScannerModal({ onClose }: Props) {
    const [uri, setUri] = useState('');
    const [isConnecting, setIsConnecting] = useState(false);

    const handleConnect = async () => {
        if (!uri) return;
        try {
            // Validate URI format
            parseUri(uri);
            
            setIsConnecting(true);
            const wallet = getWeb3Wallet();
            if (!wallet) throw new Error('WalletKit not initialized yet');
            
            await wallet.core.pairing.pair({ uri });
            toast.success('Pairing initiated. Awaiting proposal...');
            onClose();
        } catch (e: any) {
            console.error(e);
            toast.error('Invalid URI', { description: 'The WalletConnect URI provided is malformed or expired.' });
        } finally {
            setIsConnecting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100000] bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-black/10 overflow-hidden relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-black/40 hover:text-black transition-colors z-10 bg-black/5 p-1.5 rounded-full">
                    <X size={18} />
                </button>
                
                <div className="p-6 pb-4 border-b border-black/5 bg-[#FFFFFF] text-center">
                    <div className="w-12 h-12 mx-auto bg-black text-white rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-black/20">
                        <Link2 size={20} />
                    </div>
                    <h2 className="text-lg font-black font-aztec-mono uppercase tracking-widest text-black">Connect dApp</h2>
                    <p className="text-[10px] text-black/50 font-mono tracking-widest mt-1 uppercase px-4">Paste a WalletConnect URI to bridge your System Wallet.</p>
                </div>

                <div className="p-6 space-y-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-black/60 tracking-widest ml-1">WalletConnect URI</label>
                        <textarea 
                            value={uri}
                            onChange={(e) => setUri(e.target.value)}
                            placeholder="wc:..."
                            rows={4}
                            className="w-full bg-black/5 border border-black/10 rounded-xl p-4 text-[11px] font-mono text-black focus:outline-none focus:border-black/30 focus:ring-1 focus:ring-black/30 transition-all resize-none break-all"
                        />
                    </div>
                </div>

                <div className="p-4 bg-black/5 flex gap-3 border-t border-black/10">
                    <button 
                        onClick={handleConnect}
                        disabled={isConnecting || uri.length < 10}
                        className="flex-1 py-3.5 rounded-xl font-aztec-mono text-[11px] font-black uppercase tracking-widest bg-black text-white hover:bg-black/80 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isConnecting ? 'Bridging...' : <><Scan size={14} /> Establish Link</>}
                    </button>
                </div>
            </div>
        </div>
    );
}
