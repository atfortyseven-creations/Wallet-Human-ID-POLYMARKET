/**
 * ProposeMarket Component (Void Edition)
 * 
 * Sybil-resistant market proposal submission with World ID verification
 * Implements democratic market creation governance
 */

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { IDKitWidget, ISuccessResult, VerificationLevel } from '@worldcoin/idkit';
import { Vote, CheckCircle2, AlertCircle, Loader2, Users, Info } from 'lucide-react';
import { useAccount, usePublicClient } from 'wagmi';
import { toast } from 'sonner';
import { VoidButton, VoidInput, VoidCard } from '@/components/VoidUI';
import { useCTF } from '@/hooks/useCTF';
import { useFPMM } from '@/hooks/useFPMM';
import { getConditionId } from '@/lib/gnosis-ctf';
import { keccak256, encodePacked } from 'viem';

interface ProposalFormData {
    question: string;
    description: string;
    outcomes: string[];
    resolutionCriteria: string;
    category: string;
}

export function ProposeMarket() {
    const { address, isConnected } = useAccount();
    const [isVerified, setIsVerified] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [worldIdProof, setWorldIdProof] = useState<ISuccessResult | null>(null);

    const [formData, setFormData] = useState<ProposalFormData>({
        question: '',
        description: '',
        outcomes: ['Yes', 'No'],
        resolutionCriteria: '',
        category: 'Crypto',
    });

    const handleWorldIDSuccess = (result: ISuccessResult) => {
        setWorldIdProof(result);
        setIsVerified(true);
        toast.success('World ID verified! You can now submit your proposal.');
    };

    // --- Chain Hooks ---
    const { prepareCondition } = useCTF();
    const { deployMarket } = useFPMM();
    const publicClient = usePublicClient();
    const [statusValues, setStatusValues] = useState<string>("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // 1. Validations
        if (!isConnected || !address) {
            toast.error('Connect wallet first');
            return;
        }
        // Temporary Bypass for Testing if World ID is flaky in dev, 
        // but explicit request was "with World ID".
        if (!isVerified || !worldIdProof) {
            toast.error('Please verify with World ID first');
            return;
        }

        setIsSubmitting(true);
        setStatusValues("Initializing...");

        try {
            // 2. Generate Deterministic IDs
            // Random nonce for Question ID to ensure uniqueness
            const randomNonce = Math.floor(Math.random() * 1_000_000_000);
            const questionId = keccak256(encodePacked(['address', 'string', 'uint256'], [address, formData.question, BigInt(randomNonce)]));

            // Derive Condition ID (Oracle = Creator for this version)
            const oracle = address;
            const outcomeSlotCount = 2; // YES / NO
            const conditionId = getConditionId(oracle, questionId, outcomeSlotCount);

            // 3. STEP A: Prepare Condition (On-Chain)
            setStatusValues("Step 1/2: Preparing Condition on Chain...");
            toast.info("Please sign transaction 1/2: Prepare Condition");

            const hash1 = await prepareCondition(questionId, outcomeSlotCount);
            if (!hash1) throw new Error("Condition preparation failed");

            // Wait for confirmation
            setStatusValues("Waiting for Condition confirmation...");
            if (publicClient) {
                await publicClient.waitForTransactionReceipt({ hash: hash1 });
            }

            // 4. STEP B: Deploy Market (On-Chain)
            setStatusValues("Step 2/2: Creating Market (FPMM)...");
            toast.info("Please sign transaction 2/2: Create Market");

            const hash2 = await deployMarket(conditionId);
            if (!hash2) throw new Error("Market deployment failed");

            setStatusValues("Waiting for Market confirmation...");
            if (publicClient) {
                await publicClient.waitForTransactionReceipt({ hash: hash2 });
            }

            // 5. Indexing (Arcvhive in DB)
            setStatusValues("Archiving Proposal...");
            // We use the existing API to log it, but now it's "REAL"
            await fetch('/api/governance/propose', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    creatorAddress: address,
                    worldIdProof: {
                        merkle_root: worldIdProof.merkle_root,
                        nullifier_hash: worldIdProof.nullifier_hash,
                        proof: worldIdProof.proof,
                        verification_level: worldIdProof.verification_level,
                    },
                    // We could send the tx hashes too if the API supported it
                }),
            });

            toast.success('Market Successfully Created & Active!');

            // Reset
            setFormData({
                question: '',
                description: '',
                outcomes: ['Yes', 'No'],
                resolutionCriteria: '',
                category: 'Crypto',
            });
            setIsVerified(false);
            setWorldIdProof(null);

        } catch (error) {
            console.error('Error in proposal flow:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to create market');
        } finally {
            setIsSubmitting(false);
            setStatusValues("");
        }
    };

    const updateOutcome = (index: number, value: string) => {
        const newOutcomes = [...formData.outcomes];
        newOutcomes[index] = value;
        setFormData({ ...formData, outcomes: newOutcomes });
    };

    const addOutcome = () => {
        if (formData.outcomes.length < 10) {
            setFormData({ ...formData, outcomes: [...formData.outcomes, ''] });
        }
    };

    const removeOutcome = (index: number) => {
        if (formData.outcomes.length > 2) {
            const newOutcomes = formData.outcomes.filter((_, i) => i !== index);
            setFormData({ ...formData, outcomes: newOutcomes });
        }
    };

    return (
        <div className="w-full h-full flex flex-col">

            {/* World ID Verification Card */}
            <VoidCard className={`mb-6 p-4 flex items-center justify-between transition-colors ${isVerified ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-surface/50'}`}>
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${isVerified ? 'bg-emerald-500/20 text-emerald-400' : 'bg-neutral-800 text-neutral-400'}`}>
                        {isVerified ? <CheckCircle2 size={20} /> : <Users size={20} />}
                    </div>
                    <div>
                        <h3 className={`text-sm font-bold ${isVerified ? 'text-emerald-400' : 'text-neutral-300'}`}>
                            {isVerified ? 'Human Verified' : 'Sybil Resistance'}
                        </h3>
                        <p className="text-xs text-neutral-500">
                            {isVerified ? 'Ready to propose' : 'Verify UID to unlock governance'}
                        </p>
                    </div>
                </div>

                {!isVerified && (
                    <IDKitWidget
                        app_id={process.env.NEXT_PUBLIC_WLD_APP_ID as `app_${string}`}
                        action="polymarket-wallet"
                        verification_level={VerificationLevel.Orb}
                        onSuccess={handleWorldIDSuccess}
                    >
                        {({ open }: { open: () => void }) => (
                            <VoidButton onClick={open} size="sm" variant="secondary">
                                Verify UID
                            </VoidButton>
                        )}
                    </IDKitWidget>
                )}
            </VoidCard>

            {/* Proposal Form */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto pr-2 space-y-5 custom-scrollbar">

                <div className="grid grid-cols-2 gap-4">
                    <VoidInput
                        label="Category"
                        placeholder="Crypto"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        disabled={!isVerified}
                    />
                    <VoidInput
                        label="Question"
                        placeholder="Will ETH flip BTC?"
                        value={formData.question}
                        onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                        disabled={!isVerified}
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-mono text-neutral-500 uppercase tracking-wider ml-1">Description</label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Detailed explanation of the market..."
                        rows={3}
                        className="w-full bg-surface/50 border border-glass-border rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-700 focus:outline-none focus:border-white/20 transition-all font-mono resize-none disabled:opacity-50"
                        required
                        disabled={!isVerified}
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-mono text-neutral-500 uppercase tracking-wider ml-1">Outcomes</label>
                    <div className="grid grid-cols-2 gap-2">
                        {formData.outcomes.map((outcome, index) => (
                            <div key={index} className="flex gap-2">
                                <input
                                    type="text"
                                    value={outcome}
                                    onChange={(e) => updateOutcome(index, e.target.value)}
                                    placeholder={`Outcome ${index + 1}`}
                                    className="w-full bg-surface/50 border border-glass-border rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-white/20 transition-all font-mono disabled:opacity-50"
                                    required
                                    disabled={!isVerified}
                                />
                                {formData.outcomes.length > 2 && (
                                    <button
                                        type="button"
                                        onClick={() => removeOutcome(index)}
                                        className="px-2 text-red-500/50 hover:text-red-500 transition-colors"
                                        disabled={!isVerified}
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                    {formData.outcomes.length < 10 && (
                        <button
                            type="button"
                            onClick={addOutcome}
                            className="text-xs text-midgard hover:text-white transition-colors ml-1 mt-1"
                            disabled={!isVerified}
                        >
                            + Add Outcome
                        </button>
                    )}
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-mono text-neutral-500 uppercase tracking-wider ml-1">Resolution Criteria</label>
                    <textarea
                        value={formData.resolutionCriteria}
                        onChange={(e) => setFormData({ ...formData, resolutionCriteria: e.target.value })}
                        placeholder="Resolution source and rules..."
                        rows={2}
                        className="w-full bg-surface/50 border border-glass-border rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-700 focus:outline-none focus:border-white/20 transition-all font-mono resize-none disabled:opacity-50"
                        required
                        disabled={!isVerified}
                    />
                </div>

                <VoidButton
                    type="submit"
                    disabled={!isVerified || isSubmitting || !isConnected}
                    variant="primary"
                    glow
                    className="w-full"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>{statusValues || "PROCESSING..."}</span>
                        </>
                    ) : (
                        'SUBMIT TO CHAIN'
                    )}
                </VoidButton>

                <div className="flex items-center gap-2 text-[10px] text-neutral-600 justify-center">
                    <Info size={10} />
                    <span>Requires 100 votes to activate • 7 days voting period</span>
                </div>
            </form>
        </div>
    );
}
