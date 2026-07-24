"use client";

import { useState, useEffect } from 'react';
import { Loader2, FileText, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { useSystemAccount as useAccount } from '@/hooks/useSystemAccount';
import { useAztecNative } from '@/context/AztecNativeContext';
import useSWR from 'swr';

interface Proposal {
    id: string;
    question: string;
    description: string;
    outcomes: string[];
    category: string;
    creatorAddress: string;
    votes?: number;
    createdAt?: string;
}

const fetcher = (url: string) => fetch(url).then(r => r.json());

const VOTE_COST_QD = 10;

export function GovernanceProposals() {
    const { address } = useAccount();
    const { spendQDs, balance } = useAztecNative();
    const { data: rawProposals, isLoading, error, mutate } = useSWR<Proposal[] | any>('/api/governance/proposals', fetcher, {
        refreshInterval: 10_000,
        dedupingInterval: 5_000,
    });

    // Guard: API can return { error } on failure instead of an array
    const proposals: Proposal[] = Array.isArray(rawProposals) ? rawProposals : [];

    const [votingProposal, setVotingProposal] = useState<string | null>(null);

    const handleVote = async (proposalId: string, outcomeIndex: number) => {
        if (!address) {
            toast.error('Connect your wallet first');
            return;
        }

        if (balance < VOTE_COST_QD) {
            toast.error(`Insufficient Quantum Dollars. Voting requires ${VOTE_COST_QD} QDs.`);
            return;
        }

        setVotingProposal(proposalId);
        try {
            const voteStr = outcomeIndex === 0 ? 'FOR' : (outcomeIndex === 1 ? 'AGAINST' : 'ABSTAIN');
            
            // 1. Spend QDs
            const success = await spendQDs(VOTE_COST_QD, `Vote on Proposal: ${proposalId.slice(0,8)}`);
            if (!success) {
                // spendQDs already toasts an error
                return;
            }

            // 2. Register Vote
            const res = await fetch('/api/governance/vote', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    proposalId, 
                    vote: voteStr,
                }),
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to register vote.');
            }
            toast.success(`Vote registered successfully.`);
            mutate();
        } catch (error: any) {
            console.error('Error voting:', error);
            toast.error(error.message || 'Error while voting');
        } finally {
            setVotingProposal(null);
        }
    };

    const [isMounted, setIsMounted] = useState(false);
    
    // Fix hydration mismatch
    useEffect(() => { setIsMounted(true); }, []);

    if (!isMounted) return null;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-black" />
            </div>
        );
    }

    if (error || rawProposals?.error) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center bg-red-50 border border-red-200 rounded-xl">
                <p className="text-sm font-medium text-red-600">
                    Failed to load proposals: {error?.message || rawProposals?.error || 'Unknown error'}
                </p>
            </div>
        );
    }

    if (proposals.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center bg-white border border-black/10 rounded-xl">
                <FileText className="w-8 h-8 text-black/40 mb-4" />
                <p className="text-sm font-medium text-black/70">
                    No active proposals.
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col space-y-6 w-full mx-auto font-sans bg-white text-black max-w-4xl px-2 sm:px-0">
            <div className="flex items-end justify-between border-b border-black/10 pb-4">
                <div>
                    <h2 className="text-2xl font-semibold tracking-tight text-black">
                        Governance
                    </h2>
                    <p className="text-sm text-black/60 mt-1">
                        Participate in protocol decisions. Each vote requires {VOTE_COST_QD} QDs.
                    </p>
                </div>
                <div className="text-sm font-medium text-black/80">
                    {proposals.length} {proposals.length === 1 ? 'Proposal' : 'Proposals'}
                </div>
            </div>

            <div className="space-y-6">
                {proposals.map((proposal: Proposal) => (
                    <div key={proposal.id} className="bg-white border border-black/10 hover:border-black/30 rounded-lg p-6 transition-colors group">
                        
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-xs font-semibold px-2.5 py-1 bg-black/5 text-black/70 rounded">
                                {proposal.category}
                            </span>
                            <span className="text-xs font-medium text-black/50">
                                {proposal.votes || 0} Votes Cast
                            </span>
                        </div>

                        <h3 className="text-lg font-semibold text-black mb-2 leading-snug">{proposal.question}</h3>
                        <p className="text-sm text-black/60 mb-6 leading-relaxed">
                            {proposal.description}
                        </p>

                        <div className="flex flex-col sm:flex-row gap-3">
                            {proposal.outcomes.map((outcome, idx) => {
                                const isVoting = votingProposal === proposal.id;
                                return (
                                    <button
                                        key={idx}
                                        onClick={() => handleVote(proposal.id, idx)}
                                        disabled={isVoting}
                                        className="flex-1 py-2.5 px-4 rounded-md border border-black/15 text-sm font-medium text-black bg-white hover:bg-black/5 hover:border-black/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {isVoting ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <CheckCircle2 className="w-4 h-4 text-black/40" />
                                        )}
                                        {outcome} ({VOTE_COST_QD} QD)
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
