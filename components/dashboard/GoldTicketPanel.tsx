"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  useConnect, useSignMessage,
  useReadContract, useSwitchChain, useAccount,
  useSendTransaction
} from 'wagmi';
import { parseEther } from 'viem';
import { useSystemAccount } from '@/hooks/useSystemAccount';
import { injected } from 'wagmi/connectors';
import { WhaleLogo } from '@/components/shared/WhaleLogo';
import { useRouter } from 'next/navigation';

//  Treasury 
const TREASURY_WALLET = '0x78831C25c86eA2a78A6127fC2Ccb95E612D87b4a' as const;
const OPTIMISM_CHAIN_ID = 10;
const MAX_SUPPLY = 200;

//  Helpers 
const truncAddr = (a: string) => `${a.slice(0, 6)}${a.slice(-4)}`;
const fmtEth = (wei: bigint) => (Number(wei) / 1e18).toFixed(4);
const pct = (a: number, b: number) => Math.min(100, Math.round((a / b) * 100));

//  Advanced Gold Sealing Engine (SVG & Framer Motion) 

function createSmoothPath(points: {x: number, y: number}[]): string {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${points[0].x} ${points[0].y} L ${points[0].x} ${points[0].y}`;
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length - 2; i++) {
    const xc = (points[i].x + points[i + 1].x) / 2;
    const yc = (points[i].y + points[i + 1].y) / 2;
    d += ` Q ${points[i].x} ${points[i].y}, ${xc} ${yc}`;
  }
  d += ` Q ${points[points.length - 2].x} ${points[points.length - 2].y}, ${points[points.length - 1].x} ${points[points.length - 1].y}`;
  return d;
}

function AdvancedGoldSealingOverlay({ 
  strokes 
}: { 
  strokes: {x:number, y:number}[][] 
}) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.5 } }}
      className="absolute inset-0 z-50 pointer-events-none rounded-2xl overflow-hidden"
    >
        <svg className="w-full h-full">
           <defs>
              <linearGradient id="liquidGold" x1="0%" y1="0%" x2="100%" y2="100%">
                 <stop offset="0%" stopColor="#BF953F" />
                 <stop offset="50%" stopColor="#FCF6BA" />
                 <stop offset="100%" stopColor="#B38728" />
              </linearGradient>
              <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                 <feGaussianBlur stdDeviation="2" result="blur1" />
                 <feGaussianBlur stdDeviation="4" result="blur2" />
                 <feMerge>
                    <feMergeNode in="blur2" />
                    <feMergeNode in="blur1" />
                    <feMergeNode in="SourceGraphic" />
                 </feMerge>
              </filter>
           </defs>

           {strokes.map((stroke, i) => (
              <motion.path
                 key={i}
                 d={createSmoothPath(stroke)}
                 fill="none"
                 stroke="url(#liquidGold)"
                 strokeWidth="4" 
                 strokeLinecap="round"
                 strokeLinejoin="round"
                 filter="url(#goldGlow)"
                 initial={{ pathLength: 0, opacity: 0.9 }}
                 animate={{ pathLength: 1, opacity: 1 }}
                 transition={{ 
                   duration: Math.max(0.8, stroke.length * 0.015), 
                   delay: i * 0.1, 
                   ease: "easeInOut"
                 }}
              />
           ))}
        </svg>
    </motion.div>
  );
}

//  Sub-components 

function SupplyBar({ minted, max }: { minted: number; max: number }) {
  const fill = pct(minted, max);
  const remaining = max - minted;
  const isAlmostFull = remaining <= 20;
  const urgencyColor = isAlmostFull ? '#050505' : '#050505';

  return (
    <div className="w-full space-y-4">
      <div className="flex items-end justify-between">
        <div>
          <span className="text-4xl font-black font-mono text-[#050505] tracking-tighter leading-none">
            {minted}
          </span>
          <span className="text-sm font-black font-mono text-[#888888] ml-2">/ {max}</span>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-black/30">Remaining Tickets</p>
          <p className="text-2xl font-black font-mono tracking-tighter text-[#050505]">
            {remaining}
          </p>
        </div>
      </div>

      <div className="relative h-3 bg-black/5 rounded-full overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ background: urgencyColor }}
          initial={{ width: 0 }}
          animate={{ width: `${fill}%` }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
        />
        <motion.div
          className="absolute inset-y-0 w-24"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)' }}
          animate={{ left: ['-100%', '100%'] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        />
      </div>

      <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em]">
        <span className="text-[#050505]">{fill}% PUBLIC MINT SLOTS CLAIMED</span>
        {isAlmostFull && (
          <motion.span
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="flex items-center gap-2 text-[#050505]"
          >
            <span className="font-mono font-black">[!]</span> FEW TICKETS LEFT
          </motion.span>
        )}
      </div>
    </div>
  );
}

function StatChip({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={`flex flex-col gap-2 px-6 py-5 rounded-3xl border ${accent ? 'bg-black/5 border-black/20' : 'bg-white border-black/[0.06] shadow-xl'}`}>
      <p className="text-[10px] font-black text-black/30 uppercase tracking-[0.2em]">{label}</p>
      <p className={`text-base font-black font-mono tracking-tighter text-black`}>{value}</p>
    </div>
  );
}

function SignaturePad({ 
  onSignature, onStrokesUpdate, disabled, isMinting 
}: { 
  onSignature: (d: string) => void, onStrokesUpdate: (s: {x:number, y:number}[][]) => void, disabled: boolean, isMinting: boolean 
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const previewTimer = useRef<NodeJS.Timeout | null>(null);
  
  const currentStrokeRef = useRef<{x: number, y: number}[]>([]);
  const [signatureStrokes, setSignatureStrokes] = useState<{x:number, y:number}[][]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width  = rect.width  * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.scale(dpr, dpr);
  }, []);

  const getPos = (e: React.PointerEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const start = (e: React.PointerEvent) => {
    if (disabled) return;
    setShowPreview(false);
    if (previewTimer.current) clearTimeout(previewTimer.current);
    e.currentTarget.setPointerCapture(e.pointerId);
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    setIsDrawing(true);
    if (!hasDrawn) setHasDrawn(true);
    currentStrokeRef.current = [pos];
  };

  const draw = (e: React.PointerEvent) => {
    if (!isDrawing || disabled) return;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const pos = getPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    currentStrokeRef.current.push(pos);
  };

  const stop = () => {
    if (!isDrawing || disabled) return;
    setIsDrawing(false);
    const newStrokes = [...signatureStrokes, currentStrokeRef.current];
    setSignatureStrokes(newStrokes);
    onStrokesUpdate(newStrokes);
    currentStrokeRef.current = [];
    onSignature("VECTOR_MODE"); 

    previewTimer.current = setTimeout(() => {
        setShowPreview(true);
    }, 2000);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
           <AnimatePresence>
               {(showPreview || isMinting) && hasDrawn && (
                   <AdvancedGoldSealingOverlay strokes={signatureStrokes} />
               )}
           </AnimatePresence>

           <canvas
             ref={canvasRef}
             onPointerDown={start}
             onPointerMove={draw}
             onPointerUp={stop}
             onPointerOut={stop}
             className={`w-full h-32 rounded-2xl bg-black/[0.02] border border-black/10 touch-none cursor-crosshair will-change-contents relative z-10 ${(showPreview || disabled) ? 'opacity-50 cursor-not-allowed' : ''}`}
             style={{ touchAction: 'none' }} 
           />
      </div>

      <div className="flex items-center justify-between gap-3">
         <label className="text-[10px] font-black uppercase tracking-[0.2em] text-black/30 shrink-0">Your Signature</label>
         <div className="flex items-center gap-2">
           {hasDrawn && !disabled && (
             <button onClick={() => {
               const ctx = canvasRef.current?.getContext('2d');
               ctx?.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
               setHasDrawn(false);
               setSignatureStrokes([]);
               setShowPreview(false);
               onStrokesUpdate([]);
               onSignature("");
             }} className="text-[10px] font-black uppercase tracking-[0.2em] text-[#FF3B30] hover:scale-105 transition-all whitespace-nowrap">Reset</button>
           )}
         </div>
      </div>
    </div>
  );
}

function GlobalLedger({ feed }: { feed: any[] }) {
  return (
      <div className="w-full h-full bg-white flex flex-col">
         <div className="px-6 py-4 border-b border-black/[0.04] bg-[#FFFFFF] shrink-0 flex items-center justify-between">
             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#050505]">PUBLIC SIGNATURE LEDGER</span>
             <span className="text-[8px] font-black text-black/40 uppercase tracking-[0.3em]">{feed?.length || 0} ENTRIES</span>
         </div>
         <div className="grid text-[9px] font-black text-black/30 uppercase tracking-[0.2em] bg-white border-b border-black/[0.04] shrink-0"
              style={{ gridTemplateColumns: '1.4fr 0.9fr 0.9fr 1.2fr 0.8fr' }}>
              <div className="px-4 py-3">User / Wallet</div>
              <div className="px-4 py-3">Ticket</div>
              <div className="px-4 py-3">Date</div>
              <div className="px-4 py-3">TX Hash</div>
              <div className="px-4 py-3 text-right">Status</div>
         </div>
         <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-black/[0.04]">
            {feed?.length === 0 && (
                <div className="p-12 text-center flex flex-col items-center gap-4">
                    <div className="w-8 h-8 rounded-full border-2 border-black/5 border-t-black/20 animate-spin" />
                    <span className="text-[10px] font-black text-black/20 uppercase tracking-[0.3em]">
                        Synchronizing Ledger Entries...
                    </span>
                </div>
            )}
            {feed?.map((f: any, i: number) => {
                let txHash = "";
                let cryptoSignature = "";
                let visualSig = "";
                let isVector = false;
                let isPaid = false;
                if (f.signatureData && f.signatureData.includes('isVector')) {
                    const parsedData = JSON.parse(f.signatureData);
                    isVector = true;
                    visualSig = parsedData.signature;
                } else if (f.signatureData) {
                    try {
                        const parsed = JSON.parse(f.signatureData);
                        txHash = parsed.txHash || "";
                        cryptoSignature = parsed.cryptoSignature || "";
                        visualSig = parsed.signature || "";
                        isPaid = !!txHash;
                    } catch {
                        visualSig = f.signatureData;
                    }
                }

                return (
                    <div key={i} className="grid items-center hover:bg-black/[0.02] transition-colors" style={{ gridTemplateColumns: '1.4fr 0.9fr 0.9fr 1.2fr 0.8fr' }}>
                        <div className="px-4 py-4 flex flex-col justify-center">
                             <div className="flex items-center gap-3 mb-1">
                                  <span className="text-xs font-black font-mono text-black">{f.userAddress.slice(0,8)}...{f.userAddress.slice(-6)}</span>
                                  {isVector && visualSig ? (
                                      <div className="w-16 h-8 bg-black/[0.02] rounded-lg overflow-hidden flex items-center justify-center p-1">
                                          <svg viewBox="0 0 500 150" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
                                              {JSON.parse(visualSig).map((stroke: any, i: number) => (
                                                  <path key={i} d={createSmoothPath(stroke)} fill="none" stroke="#000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                                              ))}
                                          </svg>
                                      </div>
                                  ) : visualSig && visualSig.startsWith('data:image') && (
                                      <img src={visualSig} alt="sig" className="h-6 w-auto opacity-70 mix-blend-darken" />
                                  )}
                             </div>
                             {f.twitterHandle && (
                                <span className="text-[9px] font-black text-black/40 uppercase tracking-[0.1em]">@{f.twitterHandle}</span>
                             )}
                        </div>
                        <div className="px-4 py-4 flex flex-col justify-center gap-1">
                             <span className="text-[10px] font-black uppercase text-black tracking-[0.1em]">{f.serialCode || 'MEMBER'}</span>
                             <span className="text-[8px] font-black text-black/40 uppercase tracking-[0.2em]">Optimism L2</span>
                        </div>
                        <div className="px-4 py-4 text-[10px] font-black font-mono text-black/60 uppercase">
                             {new Date(f.claimedAt).toLocaleDateString()}<br/>
                             <span className="text-[9px] text-black/40">{new Date(f.claimedAt).toLocaleTimeString()}</span>
                        </div>
                        <div className="px-4 py-4 flex flex-col justify-center gap-1">
                             {txHash ? (
                                 <a
                                   href={`https://optimistic.etherscan.io/tx/${txHash}`}
                                   target="_blank"
                                   rel="noopener noreferrer"
                                   className="text-[10px] font-black font-mono text-emerald-600 hover:underline flex items-center gap-1"
                                 >
                                   {txHash.slice(0,8)}...{txHash.slice(-6)}
                                   <span className="text-[9px]">[↗]</span>
                                 </a>
                             ) : (
                                 <span className="text-[9px] font-black text-black/20 font-mono uppercase tracking-wider">—</span>
                             )}
                             {cryptoSignature && (
                                 <span className="text-[8px] font-black text-black/30 font-mono truncate max-w-[140px]" title={cryptoSignature}>
                                     ECDSA: {cryptoSignature.slice(0,10)}...
                                 </span>
                             )}
                        </div>
                         <div className="px-4 py-2 flex justify-end">
                              {isPaid ? (
                                  <div className="flex flex-col items-end gap-1">
                                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 shadow-sm select-none">
                                          <span className="font-mono text-[10px] font-black shrink-0">[✓]</span>
                                          <span className="text-[9px] font-black font-mono uppercase tracking-wider">PAID & SIGNED</span>
                                      </div>
                                      <span className="text-[8px] font-black text-emerald-600/70 uppercase tracking-widest">+0.00111 ETH</span>
                                  </div>
                              ) : visualSig ? (
                                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#7C3AED]/10 border border-[#7C3AED]/20 text-[#7C3AED] shadow-sm select-none">
                                      <span className="font-mono text-[10px] font-black shrink-0">[@]</span>
                                      <span className="text-[9px] font-black font-mono uppercase tracking-wider">BETA SPONSORED</span>
                                  </div>
                              ) : (
                                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/5 border border-black/[0.06] text-black/40 select-none">
                                      <span className="font-mono text-[10px] font-black shrink-0">[OK]</span>
                                      <span className="text-[9px] font-black font-mono uppercase tracking-wider">SEALED</span>
                                  </div>
                              )}
                         </div>
                    </div>
                );
            })}
         </div>
      </div>
  );
}

export function GoldTicketPanel() {
  const { address, isConnected, chainId, isSystemHandshake } = useSystemAccount();
  const { isConnected: isWagmiConnected } = useAccount();
  const router = useRouter();
  const { switchChain } = useSwitchChain();
  const { signMessage, isPending: isSigning } = useSignMessage();
  const { sendTransactionAsync } = useSendTransaction();
  const [dbStats, setDbStats] = useState<any>(null);
  const [signatureData, setSignatureData] = useState<string>("");
  const [signatureStrokes, setSignatureStrokes] = useState<{x:number, y:number}[][]>([]);
  const [isMinting, setIsMinting] = useState(false);

  const fetchStats = useCallback(async (isMounted: boolean = true) => {
    try {
      const res = await fetch(`/api/golden-ticket/claim${address ? `?address=${address}` : ''}`);
      if (!res.ok) throw new Error('API fetch failed');
      const data = await res.json();

      if (isMounted) {
          setDbStats({
              totalClaimed: data.totalClaimed ?? 0,
              feed: data.feed ?? [],
              ticket: data.ticket ?? null
          });
      }
    } catch (e) {
      console.error('[GoldTicket:Stats] Error:', e);
    }
  }, [address]);

  useEffect(() => {
    let isMounted = true;
    fetchStats(isMounted);
    const id = setInterval(() => fetchStats(isMounted), 15000);
    return () => {
      isMounted = false;
      clearInterval(id);
    };
  }, [fetchStats]);

  const handleMint = useCallback(async () => {
    if (!isConnected) { router.push('/connect'); return; }

    if (!isWagmiConnected) {
      toast.error('Wallet connection required for minting', {
        description: 'A connected Web3 wallet is required to sign the cryptographic ledger entry.',
        duration: 6000,
      });
      router.push('/connect');
      return;
    }

    if (signatureData.length < 5) {
      toast.error('Draw your signature on the pad first');
      return;
    }
    if (isMinting || isSigning) return;

    setIsMinting(true);

    const performClaim = async (cryptoSignature: string, txHash?: string) => {
      const t2 = toast.loading('Synchronizing System Identity...');
      try {
        const vectorData = JSON.stringify(signatureStrokes);
        const res = await fetch('/api/golden-ticket/claim', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            walletAddress: address,
            cryptoSignature: cryptoSignature,
            txHash: txHash || null,
            signatureData: JSON.stringify({ 
               signature: vectorData, 
               isVector: true, 
               timestamp: new Date().toISOString() 
            })
          })
        });
        toast.dismiss(t2);
        const json = await res.json();
        if (res.ok) {
          toast.success('Registration Complete  Welcome to the System Ledger ');
          fetchStats();
        } else if (res.status === 409) {
          toast.info('Access level already established.');
          fetchStats();
        } else {
          toast.error(`Mint failed: ${json.error || 'Unknown server error'}`);
        }
      } catch (e) {
        toast.dismiss(t2);
        toast.error('Server error saving your ticket. Try again.');
      } finally {
        setIsMinting(false);
      }
    };

    try {
      const signToastId = toast.loading('Awaiting cryptographic wallet signature (Gasless)...');
      signMessage(
        { message: `WHALE ALERT NETWORK GOLD ACCESS VERIFICATION: ${address}` },
        {
          onSuccess: async (cryptoSignature: string) => {
            toast.dismiss(signToastId);
            await performClaim(cryptoSignature, undefined);
          },
          onError: async (err: any) => {
            toast.dismiss(signToastId);
            toast.error('Signature rejected. You must sign the message to claim your identity.');
            setIsMinting(false);
          }
        }
      );
    } catch (error: any) {
      toast.error(`Mint execution failed: ${error?.shortMessage || error?.message || 'Transaction rejected'}`);
      setIsMinting(false);
    }
  }, [isConnected, isWagmiConnected, signatureData, signatureStrokes, isMinting, isSigning, address, signMessage, fetchStats, router]);

  const hasTicket = dbStats?.ticket || false;

  const renderReceipt = () => {
    if (!hasTicket) return null;
    const ticketData = dbStats.ticket;
    let txHash = "";
    let cryptoSignature = "";
    if (ticketData.signatureData) {
      try {
        const parsed = JSON.parse(ticketData.signatureData);
        txHash = parsed.txHash || "";
        cryptoSignature = parsed.cryptoSignature || "";
      } catch {}
    }

    return (
      <div className="bg-white/95 backdrop-blur-xl border border-[#7C3AED]/20 rounded-2xl p-6 shadow-[0_20px_50px_rgba(124,58,237,0.05)] flex flex-col justify-between h-full relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-[#7C3AED]/5 rounded-full blur-2xl pointer-events-none" />
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-black bg-black/5 px-3 py-1 rounded-full">
              ON-CHAIN RECEIPT
            </span>
            <span className="text-[9px] font-black text-black/30 font-mono">
              #{String(ticketData.ticketNumber || 0).padStart(4, '0')}
            </span>
          </div>

          <div className="border-t border-dashed border-black/10 pt-4 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-black/40 font-mono uppercase tracking-wider text-[9px] font-bold">Ticket Number</span>
              <span className="font-mono font-black text-black">{ticketData.serialCode}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-black/40 font-mono uppercase tracking-wider text-[9px] font-bold">Minted By</span>
              <span className="font-mono font-black text-black">{truncAddr(address!)}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-black/40 font-mono uppercase tracking-wider text-[9px] font-bold">Network</span>
              <span className="font-mono font-black text-[#7C3AED]">Optimism L2</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-black/40 font-mono uppercase tracking-wider text-[9px] font-bold">Mint Fee Paid</span>
              <span className="font-mono font-black text-[#7C3AED]">FREE (PROTOCOL SPONSORED)</span>
            </div>
            {txHash && (
              <div className="flex justify-between items-center text-xs">
                <span className="text-black/40 font-mono uppercase tracking-wider text-[9px] font-bold">Transaction Hash</span>
                <a
                  href={`https://optimistic.etherscan.io/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono font-black text-black hover:underline flex items-center gap-1"
                >
                  {txHash.slice(0, 8)}...{txHash.slice(-6)}
                  <span className="font-mono font-black text-[10px]">[↗]</span>
                </a>
              </div>
            )}
            <div className="flex justify-between items-center text-xs">
              <span className="text-black/40 font-mono uppercase tracking-wider text-[9px] font-bold">Status</span>
              <span className="flex items-center gap-1 text-black font-mono font-black text-[10px] uppercase tracking-wider">
                <span className="font-mono font-black text-[10px]">[OK]</span> LIVE ON-CHAIN
              </span>
            </div>
          </div>
        </div>

        <div className="border-t border-black/5 pt-4 mt-4 flex items-center justify-between shrink-0">
          <div className="flex flex-col gap-0.5 min-w-0">
            <span className="text-[8px] font-bold text-black/30 uppercase tracking-[0.2em] font-mono">ECDSA Signature Proof</span>
            <span className="text-[9px] font-mono text-black/60 truncate max-w-[130px]">
              {cryptoSignature || "Signed Cryptographically"}
            </span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/5 border border-black/10 text-black shadow-sm shrink-0">
            <span className="font-mono font-black text-black shrink-0">[OK]</span>
            <span className="text-[9px] font-bold font-mono uppercase tracking-wider">SECURED</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="relative w-full h-full min-h-0 flex flex-col p-4 md:p-8 gap-5 overflow-y-auto no-scrollbar bg-white">
      
      <div className="w-full flex justify-end mb-4 flex-shrink-0">
          <button 
             onClick={handleMint}
             disabled={isMinting || isSigning || hasTicket}
             className="px-6 py-3 bg-white border border-slate-200 text-black rounded-xl font-black uppercase tracking-[0.15em] text-[10px] transition-all shadow-sm hover:shadow-md hover:bg-black/5 active:scale-95 disabled:opacity-40"
          >
             {hasTicket ? 'ALREADY MINTED' : isMinting ? 'CLAIMING...' : 'MINT YOUR SIGNATURE'}
          </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-4 flex-shrink-0">
          
          <div className="bg-white/80 backdrop-blur-xl border border-black/5 rounded-2xl flex flex-col justify-center p-6 shadow-[0_8px_32px_rgba(0,0,0,0.04)]">
               <div className="shrink-0 pt-2 pb-6 border-b border-black/5 w-full flex flex-col gap-0.5 mb-4">
                    <div className="flex items-center gap-2 mb-1">
                      <WhaleLogo className="w-5 h-5 opacity-80" />
                      <h1 className="text-xl md:text-2xl font-black uppercase tracking-tighter text-[#050505]">
                          Public Ticket Mint
                      </h1>
                    </div>
                    <p className="text-[10px] text-[#050505]/40 font-bold uppercase tracking-[0.2em] leading-tight">
                        Claim your unique public ticket on Optimism and sign the ledger.
                    </p>
                </div>
               <div className="bg-[#FFFFFF] border border-black/[0.04] p-6 rounded-2xl space-y-6">
                  <SupplyBar minted={dbStats?.totalClaimed || 0} max={MAX_SUPPLY} />
               </div>
          </div>

          {!hasTicket ? (
            <div className="bg-white/80 backdrop-blur-xl border border-black/5 rounded-2xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.04)] flex flex-col">
                <div className="flex justify-between items-center mb-2">
                   <h3 className="text-sm font-black uppercase tracking-widest text-[#050505]">Sign & Claim Your Ticket</h3>
                   <span className="text-[9px] text-[#888888] uppercase">Sign</span>
                </div>
                 <div className="flex-1">
                    <SignaturePad 
                      onSignature={setSignatureData} 
                      onStrokesUpdate={setSignatureStrokes}
                      disabled={hasTicket}
                      onMint={handleMint}
                      mintLabel={
                        isMinting || isSigning ? 'CLAIMING...' : `CLAIM TICKET (FREE MINT)`
                      }
                    />
                 </div>
            </div>
          ) : (
            renderReceipt()
          )}
      </div>

      {/*  GLOBAL LEDGER  */}
      <div className="flex-1 bg-white/80 backdrop-blur-xl border border-black/5 rounded-2xl min-h-0 shadow-[0_8px_32px_rgba(0,0,0,0.04)] overflow-hidden flex flex-col">
         <GlobalLedger feed={dbStats?.feed || []} />
      </div>

    </div>
  );
}
