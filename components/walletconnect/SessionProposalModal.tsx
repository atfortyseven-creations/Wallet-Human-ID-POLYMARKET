'use client';

import React, { useState } from 'react';
import { useWalletConnectStore } from '@/lib/store/wallet-connect-store';
import { approveSession, rejectSession } from '@/lib/walletconnect/walletKit';
import { useWalletStore } from '@/lib/store/wallet-store';
import { X, ShieldAlert, Check, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export function SessionProposalModal() {
    const { proposals, removeProposal } = useWalletConnectStore();
    const { address } = useWalletStore();
    const [isProcessing, setIsProcessing] = useState(false);

    if (proposals.length === 0) return null;

    const proposal = proposals[0]; // Handle the first proposal
    const { proposer } = proposal.params;

    const handleApprove = async () => {
        if (!address) {
            toast.error('No System Wallet connected');
            return;
        }
        setIsProcessing(true);
        try {
            await approveSession(proposal, address);
            toast.success(`Connected to ${proposer.metadata.name}`);
            removeProposal(proposal.id);
        } catch (e: any) {
            console.error('Session Approval Failed', e);
            toast.error('Connection Failed', { description: e.message || 'Unknown error' });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleReject = async () => {
        setIsProcessing(true);
        try {
            await rejectSession(proposal);
            toast.info(`Rejected connection to ${proposer.metadata.name}`);
        } catch (e) {
            console.error(e);
        } finally {
            removeProposal(proposal.id);
            setIsProcessing(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-black/10 overflow-hidden flex flex-col">
                <div className="p-6 text-center border-b border-black/5 bg-[#FFFFFF]">
                    <div className="w-16 h-16 mx-auto bg-black/5 rounded-2xl flex items-center justify-center mb-4 border border-black/10 overflow-hidden">
                        {proposer.metadata.icons && proposer.metadata.icons[0] ? (
                            <img src={proposer.metadata.icons[0]} alt={proposer.metadata.name} className="w-full h-full object-cover" />
                        ) : (
                            <ShieldAlert size={24} className="text-black/40" />
                        )}
                    </div>
                    <h2 className="text-xl font-black font-aztec-mono uppercase tracking-widest text-black">{proposer.metadata.name}</h2>
                    <p className="text-[10px] text-black/50 font-mono tracking-widest mt-1 uppercase truncate px-4">{proposer.metadata.url}</p>
                </div>

                <div className="p-6 space-y-6">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <ShieldAlert size={14} className="text-amber-500" />
                            <span className="text-[10px] font-black uppercase text-black/60 tracking-widest">Requested Permissions</span>
                        </div>
                        <ul className="space-y-2 text-[11px] font-mono text-black/80 bg-amber-500/5 p-4 rounded-xl border border-amber-500/20">
                            <li className="flex items-center gap-2"><Check size={12} className="text-emerald-500"/> View Wallet Balance & Activity</li>
                            <li className="flex items-center gap-2"><Check size={12} className="text-emerald-500"/> Send Request for Transactions</li>
                            <li className="flex items-center gap-2"><Check size={12} className="text-emerald-500"/> Request Cryptographic Signatures</li>
                        </ul>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-black/60 tracking-widest">Connect with System Identity</label>
                        <div className="p-3 border border-black/10 rounded-xl bg-black/5 flex items-center justify-between">
                            {address ? (
                                <div className="flex flex-col">
                                    <span className="text-[11px] font-black font-mono text-black">{address.slice(0, 10)}...{address.slice(-8)}</span>
                                    <span className="text-[9px] font-mono text-emerald-600 uppercase tracking-widest">Ready to Connect</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 text-red-500 font-mono text-[11px] uppercase tracking-widest font-black">
                                    <AlertTriangle size={14} /> Identity Locked
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-black/5 flex gap-3 border-t border-black/10">
                    <button 
                        onClick={handleReject}
                        disabled={isProcessing}
                        className="flex-1 py-3.5 rounded-xl font-aztec-mono text-[11px] font-black uppercase tracking-widest bg-white border border-black/10 text-black hover:bg-black/5 transition-all"
                    >
                        Decline
                    </button>
                    <button 
                        onClick={handleApprove}
                        disabled={isProcessing || !address}
                        className="flex-1 py-3.5 rounded-xl font-aztec-mono text-[11px] font-black uppercase tracking-widest bg-black text-white hover:bg-black/80 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isProcessing ? 'Connecting...' : 'Approve'}
                    </button>
                </div>
            </div>
        </div>
    );
}
