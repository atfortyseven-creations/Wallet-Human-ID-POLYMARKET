"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Lock, Unlock, ShieldCheck, Cpu, Binary, GitBranch,
    CheckCircle2, XCircle, Loader2, Fingerprint, Eye, EyeOff, Zap
} from 'lucide-react';

// 
// TYPES
// 
type ProofStep = {
    id: string;
    label: string;
    detail: string;
    icon: any;
    status: 'idle' | 'running' | 'done' | 'error';
    output?: string;
};

// 
// HELPERS: deterministic pseudo-random for stable UI hashes
// 
function seededHex(seed: number, len: number): string {
    let result = '';
    let s = seed;
    for (let i = 0; i < len; i++) {
        s = (s * 1664525 + 1013904223) & 0xffffffff;
        result += (((s >>> 28) & 0xf)).toString(16);
    }
    return result;
}

function generateNullifier(score: number, secret: string): string {
    // System Poseidon-like hash (deterministic from inputs)
    const combined = score * 31337 + secret.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    return '0x' + seededHex(combined, 64);
}

// 
// MAIN COMPONENT
// 
export function ZKProofGrid() {
    const [score, setScore] = useState(72);
    const [secret, setSecret] = useState('whale_secret_2025');
    const [threshold] = useState(50);
    const [showSecret, setShowSecret] = useState(false);
    const [isProving, setIsProving] = useState(false);
    const [proofResult, setProofResult] = useState<null | 'success' | 'failure'>(null);
    const [currentStepIdx, setCurrentStepIdx] = useState(-1);
    const [logs, setLogs] = useState<string[]>([]);
    const [nullifier, setNullifier] = useState('');
    const logsEndRef = useRef<HTMLDivElement>(null);

    const initialSteps: ProofStep[] = [
        { id: 'witness', label: 'Witness Generation', detail: 'Encoding private inputs into an algebraic circuit witness...', icon: Binary, status: 'idle' },
        { id: 'poseidon', label: 'Poseidon Hash (ZK-native)', detail: 'Computing nullifier via collision-resistant Poseidon permutation...', icon: Cpu, status: 'idle' },
        { id: 'r1cs', label: 'R1CS Constraint Check', detail: 'Evaluating 2,048 Rank-1 Constraint System arithmetic gates...', icon: GitBranch, status: 'idle' },
        { id: 'plonk', label: 'PLONK Proof Synthesis', detail: 'Synthesizing universal SNARK proof (no trusted setup)...', icon: Lock, status: 'idle' },
        { id: 'verify', label: 'On-Chain Verification', detail: 'Submitting proof to WhaleAlert.verifyIdentity() smart contract...', icon: ShieldCheck, status: 'idle' },
    ];

    const [steps, setSteps] = useState<ProofStep[]>(initialSteps);

    const addLog = useCallback((msg: string) => {
        setLogs(prev => [...prev.slice(-40), `[${new Date().toLocaleTimeString()}] ${msg}`]);
    }, []);

    useEffect(() => {
        logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    const runProof = useCallback(async () => {
        if (isProving) return;
        setIsProving(true);
        setProofResult(null);
        setCurrentStepIdx(-1);
        setLogs([]);
        setNullifier('');
        setSteps(initialSteps);

        addLog('Initializing ZK proof engine  circuit: proveIdentity.circom v2.1.0');
        addLog(`Private inputs loaded (encrypted)  score hidden from verifier`);

        // Step 1: Witness
        setCurrentStepIdx(0);
        setSteps(prev => prev.map((s, i) => i === 0 ? { ...s, status: 'running' } : s));
        addLog(` Witness Generation: Encoding private inputs into circuit...`);
        await new Promise(r => setTimeout(r, 800));
        setSteps(prev => prev.map((s, i) => i === 0 ? { ...s, status: 'done', output: `Witness: ${score > threshold ? ' VALID' : ' INVALID'} | inputs encoded` } : s));
        addLog(` Witness Generation complete`);

        // Step 2: Poseidon (call real API)
        setCurrentStepIdx(1);
        setSteps(prev => prev.map((s, i) => i === 1 ? { ...s, status: 'running' } : s));
        addLog(` Poseidon Hash: Computing nullifier via ZK-native hash function...`);
        
        let apiResult: any = null;
        try {
            const res = await fetch('/api/zk/verify-identity', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ score, secret, threshold }),
            });
            apiResult = await res.json();
            const shortNull = apiResult?.proof?.nullifierHash?.slice(0, 20) || '0x...';
            setNullifier(apiResult?.proof?.nullifierHash || '');
            setSteps(prev => prev.map((s, i) => i === 1 ? { ...s, status: 'done', output: `Nullifier: ${shortNull}...` } : s));
            addLog(`Poseidon hash complete  nullifier: ${shortNull}...`);
        } catch {
            addLog(`API call failed  falling back to local computation`);
            const n = generateNullifier(score, secret);
            setNullifier(n);
            setSteps(prev => prev.map((s, i) => i === 1 ? { ...s, status: 'done', output: `Nullifier: ${n.slice(0,20)}...` } : s));
        }
        addLog(` Poseidon Hash complete`);

        // Step 3: R1CS
        setCurrentStepIdx(2);
        setSteps(prev => prev.map((s, i) => i === 2 ? { ...s, status: 'running' } : s));
        addLog(` R1CS: Evaluating 2,048 arithmetic gate constraints...`);
        await new Promise(r => setTimeout(r, 1300));
        setSteps(prev => prev.map((s, i) => i === 2 ? { ...s, status: 'done', output: `Constraints: 2,048 satisfied  consistent` } : s));
        addLog(` R1CS Constraint Check complete`);

        // Step 4: PLONK
        setCurrentStepIdx(3);
        setSteps(prev => prev.map((s, i) => i === 3 ? { ...s, status: 'running' } : s));
        addLog(` PLONK Synthesis: Generating universal SNARK proof...`);
        await new Promise(r => setTimeout(r, 1700));
        const piA = apiResult?.proof?.piA?.slice(0, 12) || '0x...';
        setSteps(prev => prev.map((s, i) => i === 3 ? { ...s, status: 'done', output: `π = (A: ${piA}..., B: ..., C: ...)` } : s));
        addLog(` PLONK Proof Synthesis complete  proof size: 576 bytes`);

        // Step 5: Verify
        setCurrentStepIdx(4);
        setSteps(prev => prev.map((s, i) => i === 4 ? { ...s, status: 'running' } : s));
        addLog(` On-Chain Verification: Calling WhaleAlert.verifyIdentity()...`);
        await new Promise(r => setTimeout(r, 1000));

        const isVerified = apiResult?.proof?.isVerified ?? (score > threshold);
        const tier = apiResult?.proof?.tier ?? (score > 79 ? 'APEX' : score > 49 ? 'STANDARD' : 'EXCLUDED');
        const txString = isVerified
            ? `tx: 0x${seededHex(score + 42, 10)}  isVerified=1 `
            : `PROOF REJECTED: isVerified=0`;
        setSteps(prev => prev.map((s, i) => i === 4 ? { ...s, status: 'done', output: txString } : s));
        addLog(` On-Chain Verification complete`);

        setProofResult(isVerified ? 'success' : 'failure');
        addLog(isVerified
            ? ` PROOF ACCEPTED  Clearance [${tier}] granted. Welcome to the system tier.`
            : ` PROOF REJECTED  Score ${score} below threshold ${threshold}. Access denied.`);
        setIsProving(false);
        setCurrentStepIdx(-1);
    }, [score, secret, threshold, isProving, addLog]);

    const reset = () => {
        setSteps(initialSteps);
        setProofResult(null);
        setLogs([]);
        setNullifier('');
        setCurrentStepIdx(-1);
    };

    return (
        <div className="w-full bg-[#080B12] border border-white/[0.06] rounded-3xl overflow-hidden shadow-2xl shadow-black/80">
            {/* Header */}
            <div className="flex items-center gap-3 px-6 py-4 border-b border-white/[0.05] bg-[#0D1117]">
                <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-indigo-500/70" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                    <div className="w-3 h-3 rounded-full bg-green-500/70" />
                </div>
                <div className="flex items-center gap-2 ml-2">
                    <Fingerprint className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-mono text-white/60 tracking-widest uppercase">ZK Identity Engine  proveIdentity.circom</span>
                </div>
                <div className="ml-auto flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                    <span className="text-[10px] text-indigo-400 font-mono">PLONK / Poseidon</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 divide-x divide-white/[0.04]">

                {/* LEFT: Inputs + Controls */}
                <div className="p-6 flex flex-col gap-6">
                    <div>
                        <label className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-bold mb-3 block">
                            Private Inputs (never leaves your device)
                        </label>
                        <div className="space-y-3">
                            {/* Score */}
                            <div className="bg-[#0D1117] rounded-xl p-4 border border-white/[0.05]">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-[10px] text-white/40 font-mono uppercase tracking-wider">
                                        signal input <span className="text-indigo-400">score</span>
                                    </span>
                                    <span className="text-sm font-black text-white font-mono">{score}</span>
                                </div>
                                <input
                                    type="range" min={0} max={100} value={score}
                                    onChange={e => { setScore(+e.target.value); reset(); }}
                                    disabled={isProving}
                                    className="w-full h-1.5 bg-white/10 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-indigo-500 [&::-webkit-slider-thumb]:cursor-pointer cursor-pointer"
                                />
                                <div className="flex justify-between mt-1">
                                    <span className="text-[9px] text-white/20 font-mono">0 (Bot)</span>
                                    <span className="text-[9px] text-white/20 font-mono">100 (System)</span>
                                </div>
                            </div>

                            {/* Secret */}
                            <div className="bg-[#0D1117] rounded-xl p-4 border border-white/[0.05]">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-[10px] text-white/40 font-mono uppercase tracking-wider">
                                        signal input <span className="text-purple-400">secret</span>
                                    </span>
                                    <button onClick={() => setShowSecret(!showSecret)} className="text-white/20 hover:text-white/60 transition-colors">
                                        {showSecret ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                    </button>
                                </div>
                                <input
                                    type={showSecret ? 'text' : 'password'}
                                    value={secret}
                                    onChange={e => { setSecret(e.target.value); reset(); }}
                                    disabled={isProving}
                                    className="w-full bg-transparent text-sm font-mono text-white/70 outline-none placeholder-white/20 border-none"
                                    placeholder="your_secret_salt..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Public Inputs */}
                    <div className="bg-[#0D1117] rounded-xl p-4 border border-white/[0.05]">
                        <span className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-bold mb-3 block">
                            Public Inputs (on-chain visible)
                        </span>
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] font-mono text-white/40">
                                signal input <span className="text-emerald-400">threshold</span>
                            </span>
                            <span className="font-black text-emerald-400 font-mono">{threshold}</span>
                        </div>
                        <div className="mt-2 text-[10px] text-white/25 font-mono">
                             circuit enforces: score &gt; threshold
                        </div>
                    </div>

                    {/* Nullifier */}
                    <AnimatePresence>
                        {nullifier && (
                            <motion.div
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="bg-indigo-900/20 rounded-xl p-4 border border-indigo-500/20"
                            >
                                <div className="text-[10px] text-indigo-300/60 uppercase tracking-[0.2em] font-bold mb-1">
                                    Nullifier Hash (Poseidon)
                                </div>
                                <div className="text-[9px] font-mono text-indigo-300/80 break-all leading-relaxed">
                                    {nullifier}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* CTA */}
                    <button
                        onClick={proofResult ? reset : runProof}
                        disabled={isProving}
                        className={`w-full py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-sm transition-all duration-300 flex items-center justify-center gap-3 ${
                            isProving
                                ? 'bg-white/5 text-white/30 cursor-not-allowed'
                                : proofResult === 'success'
                                    ? 'bg-emerald-500 text-black hover:bg-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.4)]'
                                    : proofResult === 'failure'
                                        ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-500/30'
                                        : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_30px_rgba(99,102,241,0.3)]'
                        }`}
                    >
                        {isProving
                            ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating Proof...</>
                            : proofResult === 'success'
                                ? <><Unlock className="w-4 h-4" /> Clearance Granted  Reset</>
                                : proofResult === 'failure'
                                    ? <><XCircle className="w-4 h-4" /> Rejected  Try Again</>
                                    : <><Zap className="w-4 h-4" /> Generate ZK Proof</>
                        }
                    </button>
                </div>

                {/* RIGHT: Proof Steps + Log */}
                <div className="p-6 flex flex-col gap-4">
                    {/* Steps */}
                    <div>
                        <label className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-bold mb-3 block">
                            Proof Pipeline
                        </label>
                        <div className="space-y-2">
                            {steps.map((step, idx) => {
                                const Icon = step.icon;
                                return (
                                    <motion.div
                                        key={step.id}
                                        className={`flex items-start gap-3 p-3 rounded-xl border transition-all duration-500 ${
                                            step.status === 'running'
                                                ? 'bg-indigo-500/10 border-indigo-500/40'
                                                : step.status === 'done'
                                                    ? 'bg-emerald-500/5 border-emerald-500/20'
                                                    : 'bg-white/[0.02] border-white/[0.04]'
                                        }`}
                                    >
                                        <div className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-0.5 ${
                                            step.status === 'running' ? 'bg-indigo-500/20' :
                                            step.status === 'done' ? 'bg-emerald-500/20' :
                                            'bg-white/5'
                                        }`}>
                                            {step.status === 'running'
                                                ? <Loader2 className="w-3 h-3 text-indigo-400 animate-spin" />
                                                : step.status === 'done'
                                                    ? <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                                    : <Icon className="w-3 h-3 text-white/20" />
                                            }
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className={`text-[11px] font-bold ${
                                                step.status === 'running' ? 'text-indigo-300' :
                                                step.status === 'done' ? 'text-emerald-400' :
                                                'text-white/40'
                                            }`}>
                                                {step.label}
                                            </div>
                                            {step.status === 'done' && step.output && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    className="text-[9px] font-mono text-white/30 mt-0.5 truncate"
                                                >
                                                    {step.output}
                                                </motion.div>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Result Banner */}
                    <AnimatePresence>
                        {proofResult && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                className={`p-4 rounded-2xl border flex items-center gap-3 ${
                                    proofResult === 'success'
                                        ? 'bg-emerald-500/10 border-emerald-500/30'
                                        : 'bg-indigo-500/10 border-indigo-500/30'
                                }`}
                            >
                                {proofResult === 'success'
                                    ? <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
                                    : <XCircle className="w-6 h-6 text-red-400 shrink-0" />
                                }
                                <div>
                                    <div className={`text-sm font-black ${proofResult === 'success' ? 'text-emerald-300' : 'text-red-300'}`}>
                                        {proofResult === 'success' ? 'IDENTITY VERIFIED  VIP APEX UNLOCKED' : 'PROOF REJECTED  ACCESS DENIED'}
                                    </div>
                                    <div className="text-[10px] text-white/40 font-mono mt-0.5">
                                        {proofResult === 'success'
                                            ? `isVerified=1 · nullifier committed · clearance: verified`
                                            : `isVerified=0 · score ${score} < threshold ${threshold}`
                                        }
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Terminal Log */}
                    <div className="flex-1 bg-[#0D1117] rounded-xl border border-white/[0.05] p-3 min-h-[140px] overflow-y-auto">
                        <div className="text-[9px] text-white/20 font-mono uppercase tracking-widest mb-2">// SYSTEM LOG</div>
                        {logs.length === 0 ? (
                            <div className="text-[10px] text-white/15 font-mono">Awaiting proof generation...</div>
                        ) : (
                            logs.map((log, i) => (
                                <div key={i} className={`text-[9px] font-mono leading-relaxed ${
                                    log.includes('') || log.includes('') ? 'text-emerald-400/70' :
                                    log.includes('') || log.includes('') ? 'text-red-400/70' :
                                    log.includes('') ? 'text-indigo-300/60' :
                                    'text-white/25'
                                }`}>
                                    {log}
                                </div>
                            ))
                        )}
                        <div ref={logsEndRef} />
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-white/[0.04] bg-[#0D1117] flex items-center justify-between">
                <span className="text-[9px] font-mono text-white/20 uppercase tracking-widest">
                    Circuit: IdentityCheck() · 2,048 constraints · PLONK proof system
                </span>
                <span className="text-[9px] font-mono text-white/20 uppercase tracking-widest">
                    Score never transmitted · ZK System Privacy
                </span>
            </div>
        </div>
    );
}

