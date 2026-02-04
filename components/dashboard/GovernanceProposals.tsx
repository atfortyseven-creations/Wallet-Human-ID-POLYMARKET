import { useState } from 'react';
import { IDKitWidget, ISuccessResult, VerificationLevel } from '@worldcoin/idkit';
import { Vote, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useAccount } from 'wagmi';
import useSWR from 'swr';
import { ChronosLens } from '@/components/oracle/ChronosLens';
import { useFactCheck } from '@/hooks/useFactCheck';


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

export function GovernanceProposals() {
    const { isAuthenticated } = useAuth();
    const { address } = useAccount();
    const { data: proposals, isLoading, mutate } = useSWR<Proposal[]>('/api/governance/proposals', fetcher, {
        refreshInterval: 10000 
    });

    const [votingProposal, setVotingProposal] = useState<string | null>(null);

    const handleVote = async (proposalId: string, outcomeIndex: number, proof: ISuccessResult) => {
        setVotingProposal(proposalId);

        if (!address) {
            toast.error('Conecta tu wallet primero');
            setVotingProposal(null);
            return;
        }

        try {
            const vote = outcomeIndex === 0 ? 'FOR' : 'AGAINST';

            const res = await fetch('/api/governance/vote', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    proposalId,
                    vote,
                    voterAddress: address,
                    worldIdProof: {
                        merkle_root: proof.merkle_root,
                        nullifier_hash: proof.nullifier_hash,
                        proof: proof.proof,
                        verification_level: proof.verification_level,
                    },
                }),
            });

            if (!res.ok) {
                const error = await res.text();
                throw new Error(error || 'Fallo al votar');
            }

            toast.success(`¡Voto registrado: ${vote}!`);
            mutate();
        } catch (error: any) {
            console.error('Error voting:', error);
            toast.error(error.message || 'Error al votar');
        } finally {
            setVotingProposal(null);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
            </div>
        );
    }

    if (!proposals || proposals.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <Vote className="w-12 h-12 text-zinc-600 mb-4" />
                <p className="text-sm text-zinc-500">
                    No hay encuestas activas.
                </p>
                <p className="text-xs text-zinc-600 mt-2">
                    Haz clic en Governance para crear la primera.
                </p>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-[50vh]">
             <div className="flex justify-center mb-4">
                    <img 
                        src="/fingerprint-inverted.png" 
                        alt="Human Verification" 
                        className="w-32 h-32 opacity-20 invert brightness-0 contrast-200 animate-pulse" 
                        style={{ filter: 'invert(1) brightness(2)' }}
                    />
            </div>
        </div>
    );
}
