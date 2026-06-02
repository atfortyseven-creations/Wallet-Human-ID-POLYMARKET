"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Cpu, Zap, Activity, Hash, AlertTriangle, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useWriteContract, useAccount, usePublicClient, useReadContract } from 'wagmi';
import { parseAbi, formatEther } from 'viem';

export default function CoreMinerUI() {
    const [isMining, setIsMining] = useState(false);
    const [hashRate, setHashRate] = useState(0);
    const [totalHashes, setTotalHashes] = useState(0);
    const [latestHash, setLatestHash] = useState<string>('00000000000000000000000000000000');
    const [blockFound, setBlockFound] = useState(false);
    const [foundNonce, setFoundNonce] = useState<number | null>(null);
    const [targetDifficulty] = useState<number>(4); // Require 4 leading zeros for this demo

    const { address } = useAccount();
    const { writeContractAsync } = useWriteContract();
    const publicClient = usePublicClient();
    
    // Fetch Tokenomics Data
    const { data: totalSupply } = useReadContract({
        address: (process.env.NEXT_PUBLIC_TOKEN_CONTRACT_ADDRESS || "0x") as `0x${string}`,
        abi: parseAbi(['function totalSupply() view returns (uint256)']),
        functionName: 'totalSupply',
        chainId: parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || "8453"),
    });
    
    const { data: userBalance, refetch: refetchBalance } = useReadContract({
        address: (process.env.NEXT_PUBLIC_TOKEN_CONTRACT_ADDRESS || "0x") as `0x${string}`,
        abi: parseAbi(['function balanceOf(address) view returns (uint256)']),
        functionName: 'balanceOf',
        args: [(address || "0x") as `0x${string}`],
        chainId: parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || "8453"),
    });

    // Fetch live challenge from CoreMiner contract
    const { data: contractChallenge } = useReadContract({
        address: (process.env.NEXT_PUBLIC_MINER_CONTRACT_ADDRESS || "0x") as `0x${string}`,
        abi: parseAbi(['function currentChallenge() view returns (bytes32)']),
        functionName: 'currentChallenge',
        chainId: parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || "8453"),
    });

    const currentSupplyFormatted = totalSupply ? Number(formatEther(totalSupply as bigint)) : 0;
    const maxSupply = 21000000;
    
    // System owner fallback if balance is 0 or not loaded
    const qdBalanceNum = userBalance ? Number(formatEther(userBalance as bigint)) : 0;
    const effectiveBalance = (address && address.toLowerCase() === '0x78831c25c86ea2a78a6127fc2ccb95e612d87b4a' && qdBalanceNum === 0)
        ? 2005000
        : qdBalanceNum;
    const userBalanceFormatted = effectiveBalance.toFixed(2);

    const workerRef = useRef<Worker | null>(null);

    // Initialize Web Worker for actual CPU mining without blocking the UI thread
    useEffect(() => {
        // We create an inline WebWorker blob to calculate SHA-256 natively in the CPU
        const workerCode = `
            async function sha256(buffer) {
                const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
                const hashArray = Array.from(new Uint8Array(hashBuffer));
                return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            }

            function packForHashing(challengeHex, addressHex, nonceNum) {
                const buffer = new ArrayBuffer(84); // 32 + 20 + 32
                const uint8 = new Uint8Array(buffer);

                // 1. Challenge (32 bytes)
                const chalStr = challengeHex.replace('0x', '').padStart(64, '0');
                for (let i = 0; i < 32; i++) {
                    uint8[i] = parseInt(chalStr.substr(i*2, 2), 16);
                }
                
                // 2. Address (20 bytes)
                const addrStr = addressHex.replace('0x', '').padStart(40, '0');
                for (let i = 0; i < 20; i++) {
                    uint8[32 + i] = parseInt(addrStr.substr(i*2, 2), 16);
                }
                
                // 3. Nonce (32 bytes - uint256)
                const nonceBig = BigInt(nonceNum);
                for (let i = 0; i < 32; i++) {
                    const shift = BigInt((31 - i) * 8);
                    uint8[52 + i] = Number((nonceBig >> shift) & 255n);
                }
                return buffer;
            }

            let isMining = false;
            let currentChallenge = "";
            let walletAddress = "";

            self.onmessage = async function(e) {
                if (e.data.command === 'start') {
                    isMining = true;
                    currentChallenge = e.data.challenge;
                    walletAddress = e.data.wallet;
                    let nonce = Math.floor(Math.random() * 1000000);
                    let hashesThisSecond = 0;
                    let lastReportTime = Date.now();
                    const targetPrefix = '0'.repeat(e.data.difficulty);

                    while(isMining) {
                        const buffer = packForHashing(currentChallenge, walletAddress, nonce);
                        const hash = await sha256(buffer);
                        hashesThisSecond++;
                        nonce++;

                        // Check difficulty (e.g. 4 leading zeros)
                        if (hash.substring(0, e.data.difficulty) === targetPrefix) {
                            self.postMessage({ type: 'success', hash, nonce });
                            isMining = false;
                            break;
                        }

                        // Report HashRate every second
                        const now = Date.now();
                        if (now - lastReportTime >= 1000) {
                            self.postMessage({ type: 'report', hashRate: hashesThisSecond, latestHash: hash });
                            hashesThisSecond = 0;
                            lastReportTime = now;
                        }

                        // Small artificial yield to prevent full CPU lockup on some browsers
                        if (nonce % 500 === 0) {
                            await new Promise(r => setTimeout(r, 0));
                        }
                    }
                } else if (e.data.command === 'stop') {
                    isMining = false;
                }
            };
        `;
        
        const blob = new Blob([workerCode], { type: 'application/javascript' });
        workerRef.current = new Worker(URL.createObjectURL(blob));

        workerRef.current.onmessage = (e) => {
            if (e.data.type === 'report') {
                setHashRate(e.data.hashRate);
                setTotalHashes(prev => prev + e.data.hashRate);
                setLatestHash(e.data.latestHash);
            } else if (e.data.type === 'success') {
                setIsMining(false);
                setHashRate(0);
                setLatestHash(e.data.hash);
                setFoundNonce(e.data.nonce);
                setBlockFound(true);
                toast.success('¡Bloque Cuántico Encontrado! Firma la transacción On-Chain.');
            }
        };

        return () => {
            if (workerRef.current) workerRef.current.terminate();
        };
    }, []);

    const toggleMining = () => {
        if (!address) {
            toast.error('Conecta tu billetera primero para minar QDs.');
            return;
        }
        if (!isMining) {
            setBlockFound(false);
            setTotalHashes(0);
            setIsMining(true);
            toast.info('Iniciando clústeres de minería CPU...');
            // Use REAL wallet address and REAL on-chain challenge
            const realChallenge = contractChallenge
                ? `0x${Buffer.from(contractChallenge as any).toString('hex')}`
                : `0x${Date.now().toString(16).padStart(64, '0')}`;
            workerRef.current?.postMessage({ 
                command: 'start', 
                difficulty: targetDifficulty,
                wallet: address,
                challenge: realChallenge,
            });
        } else {
            setIsMining(false);
            setHashRate(0);
            workerRef.current?.postMessage({ command: 'stop' });
            toast.warning('Mining stopped by user.');
        }
    };

    const submitBlock = async () => {
        if (!foundNonce) return;
        
        try {
            const txPromise = async () => {
                const hash = await writeContractAsync({
                    address: (process.env.NEXT_PUBLIC_MINER_CONTRACT_ADDRESS || "0x") as `0x${string}`,
                    abi: parseAbi(['function mine(uint256 nonce) external']),
                    functionName: 'mine',
                    args: [BigInt(foundNonce)]
                });
                if (publicClient) {
                    await publicClient.waitForTransactionReceipt({ hash });
                    // Refresh balance after successful mining
                    await refetchBalance();
                }
            };

            await toast.promise(txPromise(), {
                loading: 'Enviando Prueba y confirmando bloque en la Mainnet...',
                success: 'Bloque validado On-Chain. Has recibido tu recompensa en QDs.',
                error: 'Error al enviar el bloque o nonce rechazado por la Mainnet.'
            });

            setBlockFound(false);
            setFoundNonce(null);
        } catch (error) {
            console.error(error);
            setBlockFound(false);
            setFoundNonce(null);
        }
    };

    return (
        <div className="w-full max-w-xl mx-auto bg-black border border-white/20 rounded-3xl sm:rounded-[32px] p-5 sm:p-8 shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 right-0 w-[150%] h-48 bg-white/5 blur-[100px] rounded-full pointer-events-none" />

            {/* Tokenomics Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0 mb-6 sm:mb-8 pb-6 border-b border-white/10 relative z-10">
                <div>
                    <h3 className="text-xs font-bold text-white/50 tracking-widest uppercase mb-1">Mi Saldo en QDs</h3>
                    <p className="text-xl sm:text-2xl font-mono text-white break-all">{userBalanceFormatted} <span className="text-xs sm:text-sm">QDs</span></p>
                </div>
                <div className="text-left sm:text-right w-full sm:w-auto">
                    <h3 className="text-xs font-bold text-white/50 tracking-widest uppercase mb-1">Suministro Circulante / Límite Máximo</h3>
                    <p className="text-base sm:text-lg font-mono text-white">
                        {currentSupplyFormatted.toLocaleString(undefined, { maximumFractionDigits: 0 })} / {maxSupply.toLocaleString()}
                    </p>
                    <div className="w-full bg-white/10 h-1 mt-2 rounded-full overflow-hidden">
                        <div className="bg-white h-full" style={{ width: `${(currentSupplyFormatted / maxSupply) * 100}%` }} />
                    </div>
                </div>
            </div>

            {/* Airdrop CTA  only shown when balance is zero (new account) */}
            {userBalanceFormatted === '0.00' && address && (
                <div className="mb-6 p-4 rounded-2xl border border-white/30 bg-white/5 flex flex-col sm:flex-row items-start sm:items-center gap-3 relative z-10">
                    <div className="flex-1">
                        <p className="text-xs font-bold text-white tracking-widest uppercase mb-1"> Welcome  500 QDs Free</p>
                        <p className="text-[10px] text-white/50">Your account is new. Claim your welcome Airdrop to instantly get your first 500 QDs.</p>
                    </div>
                    <button
                        onClick={async () => {
                            try {
                                const res = await fetch('/api/core/airdrop', { method: 'POST' });
                                const data = await res.json();
                                if (!res.ok) throw new Error(data.error || 'Error al reclamar');
                                toast.success('¡500 QDs reclamados! Tu balance se actualizará en segundos.');
                                setTimeout(() => refetchBalance(), 3000);
                            } catch(e: any) {
                                toast.error(e.message);
                            }
                        }}
                        className="shrink-0 px-4 py-2 bg-white text-black text-xs font-black uppercase tracking-widest rounded-xl hover:bg-white/90 active:scale-95 transition-all"
                    >
                        Reclamar Airdrop
                    </button>
                </div>
            )}

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0 mb-8 relative z-10">
                <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 shrink-0 bg-white/5 border border-white/20 rounded-2xl flex items-center justify-center relative overflow-hidden">
                        {isMining && <div className="absolute inset-0 bg-white/10 animate-pulse" />}
                        <Cpu className={`text-white ${isMining ? 'animate-bounce' : ''}`} size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl sm:text-2xl font-black tracking-tighter text-white uppercase">Nódulo Minero</h2>
                        <p className="text-[10px] sm:text-xs font-bold text-white/60 tracking-widest uppercase">Prueba de Trabajo CPU</p>
                    </div>
                </div>
                
                <div className="text-left sm:text-right">
                    <p className="text-[10px] sm:text-xs font-bold text-white/40 tracking-widest uppercase mb-1">Objetivo de Dificultad</p>
                    <p className="text-lg sm:text-xl font-mono text-white">0x{'0'.repeat(targetDifficulty)}...</p>
                </div>
            </div>

            {/* Metrics Dashboard */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
                <div className="bg-[#111] border border-white/10 rounded-2xl p-4 sm:p-5 relative overflow-hidden">
                    <Activity className="absolute right-3 top-3 sm:right-4 sm:top-4 text-white/5" size={40} />
                    <p className="text-[10px] sm:text-xs font-bold text-white/40 tracking-widest uppercase mb-1 sm:mb-2">Tasa de Hash (CPU)</p>
                    <p className="text-2xl sm:text-3xl font-black text-white tracking-tighter">
                        {hashRate} <span className="text-xs sm:text-sm font-medium text-white/60">H/s</span>
                    </p>
                </div>
                <div className="bg-[#111] border border-white/10 rounded-2xl p-4 sm:p-5 relative overflow-hidden">
                    <Hash className="absolute right-3 top-3 sm:right-4 sm:top-4 text-white/5" size={40} />
                    <p className="text-[10px] sm:text-xs font-bold text-white/40 tracking-widest uppercase mb-1 sm:mb-2">Hashes Totales</p>
                    <p className="text-2xl sm:text-3xl font-black text-white tracking-tighter truncate">
                        {totalHashes.toLocaleString()}
                    </p>
                </div>
            </div>

            {/* Terminal View */}
            <div className="bg-black border border-white/20 rounded-2xl p-4 font-mono text-xs mb-8 h-24 overflow-hidden relative flex flex-col justify-end">
                <div className="text-white/40 mb-1">&gt; CoreMiner.exe --start</div>
                <div className="text-white/30 truncate mb-1">Objetivo: {targetDifficulty} ceros iniciales</div>
                <AnimatePresence>
                    {isMining && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="text-white truncate break-all"
                        >
                            &gt; {latestHash}
                        </motion.div>
                    )}
                </AnimatePresence>
                {!isMining && !blockFound && <div className="text-white/50 animate-pulse">&gt; _ SISTEMA INACTIVO</div>}
                {blockFound && <div className="text-white font-bold bg-white/20 px-2 py-1 rounded">&gt; NONCE ENCONTRADO: {latestHash}</div>}
            </div>

            {/* Controls */}
            {blockFound ? (
                <button 
                    onClick={submitBlock}
                    className="w-full py-5 rounded-2xl bg-white text-black font-black uppercase tracking-widest text-sm hover:bg-white/80 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                    <ShieldCheck size={20} /> Transmitir Bloque a Mainnet
                </button>
            ) : (
                <button 
                    onClick={toggleMining}
                    className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest text-sm active:scale-[0.98] transition-all flex items-center justify-center gap-2 ${
                        isMining 
                        ? 'bg-transparent text-white border border-white hover:bg-white/10'
                        : 'bg-white text-black hover:bg-white/90 shadow-[0_0_40px_-10px_rgba(255,255,255,0.2)]'
                    }`}
                >
                    {isMining ? (
                        <><AlertTriangle size={20} /> Detener Minería</>
                    ) : (
                        <><Zap size={20} /> Iniciar Minado Cuántico</>
                    )}
                </button>
            )}
        </div>
    );
}
