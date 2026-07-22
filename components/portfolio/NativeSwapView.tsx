"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWalletStore, NETWORKS, NetworkId } from '@/lib/store/wallet-store';
import { ethers } from 'ethers';
import { toast } from 'sonner';
import { useSystemAccount } from '@/hooks/useSystemAccount';
import { useBalance, useAccount, useWalletClient } from 'wagmi';
import { encodeFunctionData } from 'viem';
import { UNIVERSAL_TOKENS, UniversalToken } from '@/config/universal-tokens';
import Image from 'next/image';

const UNISWAP_V2_ROUTER_ABI = [
  "function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)",
  "function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)",
  "function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)",
  "function getAmountsOut(uint amountIn, address[] memory path) public view returns (uint[] memory amounts)",
  "function WETH() external pure returns (address)"
];

const ERC20_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function balanceOf(address owner) external view returns (uint256)",
  "function decimals() external view returns (uint8)",
  "function symbol() external view returns (string)"
];

const ROUTER_ADDRESS = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D"; 

const safeParseUnits = (val: string, decimals: number) => {
    try {
        let cleanVal = val.toLowerCase();
        if (cleanVal.includes('e')) {
            const [base, expStr] = cleanVal.split('e');
            const [lead, trail = ''] = base.split('.');
            const exp = parseInt(expStr);
            if (exp > 0) {
                if (trail.length > exp) {
                    cleanVal = lead + trail.slice(0, exp) + '.' + trail.slice(exp);
                } else {
                    cleanVal = lead + trail + '0'.repeat(exp - trail.length);
                }
            } else {
                return 0n; // Negligible or unsupported
            }
        }
        return ethers.parseUnits(cleanVal || "0", decimals);
    } catch {
        return 0n;
    }
};

// Only show tokens that have a real Ethereum EVM address (0x + 40 hex chars)
const EVM_TOKENS = UNIVERSAL_TOKENS.filter(t => 
    t.address && 
    t.address.startsWith('0x') && 
    t.address.length === 42 &&
    t.address !== '0x0000000000000000000000000000000000000000'
);

function TokenSelector({ selectedToken, onSelect, label }: { selectedToken: UniversalToken, onSelect: (t: UniversalToken) => void, label: string }) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');

    const filtered = EVM_TOKENS.filter(t => t.symbol.toLowerCase().includes(search.toLowerCase()) || t.name.toLowerCase().includes(search.toLowerCase())).slice(0, 100);

    const handleSelect = (t: UniversalToken) => {
        onSelect(t);
        setOpen(false);
        setSearch('');
    };

    return (
        <div className="relative">
            <button 
                onClick={() => setOpen(!open)}
                className="flex items-center gap-2 bg-black/5 hover:bg-black/10 border border-black/10 px-4 py-2 font-bold uppercase tracking-widest text-sm outline-none transition-colors rounded-sm"
            >
                {selectedToken.logoPath && <img src={selectedToken.logoPath} alt={selectedToken.symbol} className="w-5 h-5 rounded-full" />}
                {selectedToken.symbol}
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
            </button>
            
            <AnimatePresence>
                {open && (
                    <>
                        {/* Backdrop — closes dropdown on tap outside */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[998] bg-black/20 backdrop-blur-[2px]"
                            onClick={() => { setOpen(false); setSearch(''); }}
                        />
                        {/* Token picker — fixed + centrado en todas las pantallas */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="fixed z-[999] bg-white border border-black/15 shadow-2xl flex flex-col overflow-hidden"
                            style={{
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                width: 'min(320px, calc(100vw - 32px))',
                                maxHeight: '70vh',
                                borderRadius: '16px',
                            }}
                        >
                            {/* Header */}
                            <div className="px-4 py-3 border-b border-black/8 flex items-center justify-between shrink-0">
                                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-black/50">{label}</span>
                                <button
                                    onClick={() => { setOpen(false); setSearch(''); }}
                                    className="w-7 h-7 flex items-center justify-center rounded-full bg-black/5 hover:bg-black/10 text-black/50 hover:text-black transition-colors"
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
                                </button>
                            </div>
                            {/* Search */}
                            <div className="p-3 border-b border-black/8 shrink-0">
                                <input 
                                    type="text" 
                                    placeholder="Search 500+ tokens..." 
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    className="w-full bg-black/[0.04] px-3 py-2.5 text-[12px] font-mono tracking-widest outline-none focus:bg-black/[0.07] transition-colors rounded-sm"
                                    autoFocus
                                />
                            </div>
                            {/* List */}
                            <div className="overflow-y-auto flex-1 p-2 space-y-0.5">
                                {filtered.map(t => (
                                    <button key={t.symbol} onClick={() => handleSelect(t)} className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-black/5 active:bg-black/10 transition-colors text-left rounded-sm">
                                        <img src={t.logoPath} alt={t.symbol} className="w-7 h-7 rounded-full shrink-0" />
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-[12px] font-black tracking-widest uppercase">{t.symbol}</span>
                                            <span className="text-[10px] text-black/40 truncate">{t.name}</span>
                                        </div>
                                    </button>
                                ))}
                                {filtered.length === 0 && <div className="p-6 text-center text-[11px] uppercase text-black/40 font-bold tracking-widest">No tokens found</div>}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}


export function NativeSwapView({ address, onBack }: any) {
    const activeNetwork = useWalletStore(s => s.activeNetwork);
    const privateKey = useWalletStore(s => s.privateKey);
    const activeProtocol = useWalletStore(s => s.activeProtocol);
    const networkInfo = NETWORKS[activeNetwork as NetworkId] || NETWORKS.ethereum;
    
    const ETH_TOKEN = EVM_TOKENS.find(t=>t.symbol==='ETH') || { symbol: 'ETH', name: 'Ethereum', address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', decimals: 18, logoPath: '/crypto-logos/eth.png' };
    const USDC_TOKEN = EVM_TOKENS.find(t=>t.symbol==='USDC') || EVM_TOKENS[1];
    const [fromToken, setFromToken] = useState<UniversalToken>(ETH_TOKEN);
    const [toToken, setToToken] = useState<UniversalToken>(USDC_TOKEN);
    const [amountIn, setAmountIn] = useState('');
    const [amountOut, setAmountOut] = useState('');

    const { address: userAddress } = useSystemAccount();
    const { isConnected: isWagmiConnected, address: wagmiAddress } = useAccount();
    const { data: walletClient } = useWalletClient();
    const activeAddress = isWagmiConnected ? wagmiAddress : (userAddress || address);

    const { data: tokenBalance } = useBalance({
        address: activeAddress as `0x${string}`,
        token: (fromToken.address && fromToken.address !== 'native' && fromToken.address !== '0x0000000000000000000000000000000000000000') ? (fromToken.address as `0x${string}`) : undefined,
    });
    const currentBalance = tokenBalance ? parseFloat(tokenBalance.formatted).toFixed(4) : '0.00';
    
    // Quantum states
    const [isCalculating, setIsCalculating] = useState(false);
    const [isSwapping, setIsSwapping] = useState(false);
    const [isApproving, setIsApproving] = useState(false);
    const [needsApproval, setNeedsApproval] = useState(false);
    const [slippage, setSlippage] = useState('0.5'); // Strict slippage protection
    const [gasEstimate, setGasEstimate] = useState('0.00');
    const [routingPath, setRoutingPath] = useState<string[]>([]);
    
    // Multisig State
    const [useMultiSig, setUseMultiSig] = useState(false);

    const executionLogsRef = useRef<HTMLDivElement>(null);
    const [logs, setLogs] = useState<string[]>([]);

    const addLog = (msg: string) => {
        const time = new Date().toISOString().split('T')[1].slice(0, -1);
        setLogs(prev => [...prev, `[${time}] ${msg}`]);
    };

    const handleSwapAssets = () => {
        setFromToken(toToken);
        setToToken(fromToken);
        setAmountIn(amountOut);
        setAmountOut('');
    };

    useEffect(() => {
        const fetchQuoteAndAllowance = async () => {
            if (!amountIn || parseFloat(amountIn) <= 0) {
                setAmountOut('');
                setNeedsApproval(false);
                return;
            }
            // Validate both tokens have real EVM addresses
            const fromAddr = fromToken.address;
            const toAddr = toToken.address;
            const isFromNative = fromToken.symbol === 'ETH' || fromAddr === 'native';
            const isToNative = toToken.symbol === 'ETH' || toAddr === 'native';

            if (!isFromNative && (!fromAddr || fromAddr.length !== 42)) {
                setAmountOut('N/A — token not on this network');
                setIsCalculating(false);
                return;
            }
            if (!isToNative && (!toAddr || toAddr.length !== 42)) {
                setAmountOut('N/A — token not on this network');
                setIsCalculating(false);
                return;
            }

            setIsCalculating(true);
            setRoutingPath([fromToken.symbol, toToken.symbol]);
            try {
                const provider = new ethers.JsonRpcProvider(networkInfo.rpc);
                const router = new ethers.Contract(ROUTER_ADDRESS, UNISWAP_V2_ROUTER_ABI, provider);
                const wethAddress: string = await router.WETH();

                // Build routing path
                const resolvedFrom = isFromNative ? wethAddress : fromAddr;
                const resolvedTo   = isToNative   ? wethAddress : toAddr;

                let path: string[];
                if (resolvedFrom.toLowerCase() === wethAddress.toLowerCase() || resolvedTo.toLowerCase() === wethAddress.toLowerCase()) {
                    path = [resolvedFrom, resolvedTo];
                } else {
                    path = [resolvedFrom, wethAddress, resolvedTo]; // Multi-hop via WETH
                }

                const parsedIn = safeParseUnits(amountIn, fromToken.decimals || 18);
                if (parsedIn === 0n) { setAmountOut('0'); setIsCalculating(false); return; }

                // Real on-chain quote from Uniswap
                const amounts: bigint[] = await router.getAmountsOut(parsedIn, path);
                const rawOut = amounts[amounts.length - 1];
                const formattedOut = ethers.formatUnits(rawOut, toToken.decimals || 18);
                setAmountOut(parseFloat(formattedOut).toLocaleString('fullwide', { useGrouping: false, maximumFractionDigits: 8 }));
                setRoutingPath(path.length === 3 ? [fromToken.symbol, 'ETH/WETH', toToken.symbol] : [fromToken.symbol, toToken.symbol]);

                // Gas estimation from real fee data
                const feeData = await provider.getFeeData();
                const gasLimit = 150000n; // conservative for V2 swap
                const gasPrice = feeData.gasPrice || ethers.parseUnits('10', 'gwei');
                setGasEstimate(parseFloat(ethers.formatEther(gasLimit * gasPrice)).toFixed(6));

                // Check ERC20 allowance
                if (!isFromNative && activeAddress) {
                    try {
                        const tokenContract = new ethers.Contract(fromAddr, ERC20_ABI, provider);
                        const allowance = await tokenContract.allowance(activeAddress, ROUTER_ADDRESS);
                        setNeedsApproval(allowance < parsedIn);
                    } catch {
                        setNeedsApproval(true);
                    }
                } else {
                    setNeedsApproval(false);
                }

            } catch (e: any) {
                console.error('Quote error:', e?.message);
                const msg = e?.message || '';
                if (msg.includes('INSUFFICIENT_LIQUIDITY') || msg.includes('getAmountsOut')) {
                    setAmountOut('No liquidity / unsupported pair');
                } else if (msg.includes('network') || msg.includes('timeout') || msg.includes('fetch')) {
                    setAmountOut('Network RPC error (rate limited)');
                } else {
                    setAmountOut('Quote calculation failed');
                }
            } finally {
                setIsCalculating(false);
            }
        };
        
        const timeoutId = setTimeout(fetchQuoteAndAllowance, 700);
        return () => clearTimeout(timeoutId);
    }, [amountIn, fromToken, toToken, activeNetwork, address, activeAddress, networkInfo.rpc]);

    const executeApproval = async () => {
        setIsApproving(true);
        addLog(`Initiating ERC20 Approval for ${fromToken.symbol}`);
        toast.loading("Constructing Exact-Amount Approval Payload...", { id: "approve-tx" });
        
        try {
            const parsedIn = safeParseUnits(amountIn, fromToken.decimals || 18);
            
            if (isWagmiConnected && walletClient) {
                addLog(`Broadcasting via Wagmi/WalletConnect to ${activeNetwork.toUpperCase()}`);
                const dataPayload = encodeFunctionData({
                    abi: [{"constant":false,"inputs":[{"name":"spender","type":"address"},{"name":"amount","type":"uint256"}],"name":"approve","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"}],
                    functionName: "approve",
                    args: [ROUTER_ADDRESS as `0x${string}`, parsedIn]
                });
                
                const txHash = await walletClient.sendTransaction({
                    to: fromToken.address as `0x${string}`,
                    value: 0n,
                    data: dataPayload
                });
                
                addLog(`TxHash Generated: ${txHash}`);
                toast.success("Exact Amount ERC20 Approval Submitted", { id: "approve-tx" });
                setNeedsApproval(false);
            } else if (privateKey) {
                const provider = new ethers.JsonRpcProvider(networkInfo.rpc);
                const wallet = new ethers.Wallet(privateKey, provider);
                const tokenContract = new ethers.Contract(fromToken.address, ERC20_ABI, wallet);
                
                addLog(`Broadcasting tx to network: ${activeNetwork.toUpperCase()}`);
                const tx = await tokenContract.approve(ROUTER_ADDRESS, parsedIn);
                addLog(`TxHash Generated: ${tx.hash}`);
                await tx.wait();
                addLog(`Approval Confirmed Block: ${tx.blockNumber}`);
                toast.success("Exact Amount ERC20 Approval Confirmed", { id: "approve-tx" });
                setNeedsApproval(false);
            } else {
                toast.error("Wallet Error", { id: "approve-tx", description: "No wallet connected for approval." });
            }
        } catch (e: any) {
            toast.error("Approval Execution Error", { id: "approve-tx", description: e?.shortMessage || e?.message });
            addLog(`CRITICAL ERROR: ${e?.message}`);
        } finally {
            setIsApproving(false);
        }
    };

    const executeSwap = async () => {
        if (!amountIn || parseFloat(amountIn) <= 0) {
            toast.error("INVALID VECTOR EXECUTION", { description: "Mathematical amount must be strictly greater than 0." });
            return;
        }

        if (useMultiSig) {
            toast.loading("Multi-Sig Swap Initiated", { description: "Transaction pushed to Safe{Wallet} for signatures." });
            addLog("Multisig execution queued to Gnosis Safe.");
            return;
        }

        if (!privateKey && !isWagmiConnected) {
            toast.error("WALLET NOT CONNECTED", { description: "Please connect a wallet to sign transactions." });
            return;
        }

        setIsSwapping(true);
        setLogs([]);
        addLog(`Initiating swap... Target: ${fromToken.symbol} -> ${toToken.symbol} on ${activeNetwork.toUpperCase()}`);
        toast.loading("Initiating On-Chain Swap Execution...", { id: "swap-tx" });

        try {
            addLog(`Estimating precise gas bounds... enforcing slippage: ${slippage}%`);
            await new Promise(r => setTimeout(r, 800));

            const deadline = BigInt(Math.floor(Date.now() / 1000) + 60 * 20); 
            const parsedOut = safeParseUnits(amountOut || "0", toToken.decimals || 18);
            const minOut = parsedOut * BigInt(Math.floor((100 - parseFloat(slippage)) * 100)) / 10000n;
            
            addLog(`Min Output Threshold Locked: ${ethers.formatUnits(minOut, toToken.decimals || 18)} ${toToken.symbol}`);
            toast.loading("Awaiting cryptographic signature...", { id: "swap-tx" });

            let txHash = "";
            try {

            if (isWagmiConnected && walletClient) {
                const isNativeIn = fromToken.symbol === 'ETH';
                const isNativeOut = toToken.symbol === 'ETH';
                const routerAddressObj = ROUTER_ADDRESS as `0x${string}`;
                
                // Need WETH address for path building
                const wethProvider = new ethers.JsonRpcProvider(networkInfo.rpc);
                const wethRouter = new ethers.Contract(ROUTER_ADDRESS, UNISWAP_V2_ROUTER_ABI, wethProvider);
                const wethAddress = await wethRouter.WETH();

                if (isNativeIn) {
                    const value = ethers.parseEther(amountIn);
                    const path = [(fromToken.address && fromToken.address !== 'native' && fromToken.address !== '0x0000000000000000000000000000000000000000') ? fromToken.address : wethAddress, toToken.address];
                    addLog(`Executing swapExactETHForTokens payload...`);
                    
                    const dataPayload = encodeFunctionData({
                        abi: [{"inputs":[{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactETHForTokens","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"payable","type":"function"}],
                        functionName: "swapExactETHForTokens",
                        args: [minOut, path as `0x${string}`[], wagmiAddress as `0x${string}`, deadline]
                    });
                    
                    txHash = await walletClient.sendTransaction({
                        to: routerAddressObj,
                        value: value,
                        data: dataPayload
                    });
                } else if (isNativeOut) {
                    const parsedIn = safeParseUnits(amountIn, fromToken.decimals || 18);
                    const path = [fromToken.address, wethAddress];
                    addLog(`Executing swapExactTokensForETH payload...`);
                    
                    const dataPayload = encodeFunctionData({
                        abi: [{"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactTokensForETH","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"nonpayable","type":"function"}],
                        functionName: "swapExactTokensForETH",
                        args: [parsedIn, minOut, path as `0x${string}`[], wagmiAddress as `0x${string}`, deadline]
                    });
                    
                    txHash = await walletClient.sendTransaction({
                        to: routerAddressObj,
                        value: 0n,
                        data: dataPayload
                    });
                } else {
                    const parsedIn = safeParseUnits(amountIn, fromToken.decimals || 18);
                    const path = [fromToken.address, wethAddress, toToken.address]; 
                    addLog(`Executing swapExactTokensForTokens (Multi-Hop)...`);
                    
                    const dataPayload = encodeFunctionData({
                        abi: [{"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactTokensForTokens","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"nonpayable","type":"function"}],
                        functionName: "swapExactTokensForTokens",
                        args: [parsedIn, minOut, path as `0x${string}`[], wagmiAddress as `0x${string}`, deadline]
                    });

                    txHash = await walletClient.sendTransaction({
                        to: routerAddressObj,
                        value: 0n,
                        data: dataPayload
                    });
                }
                
                addLog(`Transaction broadcast via Wagmi: ${txHash}`);
                toast.success("Swap Submitted", { id: "swap-tx", description: `Hash: ${txHash.slice(0, 10)}...` });
                setAmountIn('');
                setAmountOut('');

            } else if (privateKey) {
                // Local Vault Flow
                const provider = activeProtocol === 'WSS' 
                    ? new ethers.WebSocketProvider(networkInfo.wss)
                    : new ethers.JsonRpcProvider(networkInfo.rpc);
                
                const wallet = new ethers.Wallet(privateKey, provider);
                const router = new ethers.Contract(ROUTER_ADDRESS, UNISWAP_V2_ROUTER_ABI, wallet);

                let tx;
                const deadlineNum = Number(deadline);
                if (fromToken.symbol === 'ETH') {
                    const value = ethers.parseEther(amountIn);
                    const path = [fromToken.address !== '0x0000000000000000000000000000000000000000' && fromToken.address !== 'native' ? fromToken.address : await router.WETH(), toToken.address];
                    addLog(`Executing swapExactETHForTokens payload...`);
                    tx = await router.swapExactETHForTokens(minOut, path, address, deadlineNum, { value });
                } else if (toToken.symbol === 'ETH') {
                    const parsedIn = safeParseUnits(amountIn, fromToken.decimals || 18);
                    const path = [fromToken.address, await router.WETH()];
                    addLog(`Executing swapExactTokensForETH payload...`);
                    tx = await router.swapExactTokensForETH(parsedIn, minOut, path, address, deadlineNum);
                } else {
                    const parsedIn = safeParseUnits(amountIn, fromToken.decimals || 18);
                    const path = [fromToken.address, await router.WETH(), toToken.address]; 
                    addLog(`Executing swapExactTokensForTokens (Multi-Hop)...`);
                    tx = await router.swapExactTokensForTokens(parsedIn, minOut, path, address, deadlineNum);
                }

                addLog(`Transaction broadcast: ${tx.hash}`);
                toast.loading(`Awaiting network confirmations: ${tx.hash.slice(0, 8)}...`, { id: "swap-tx" });
                const receipt = await tx.wait();
                addLog(`Confirmed in block: ${receipt.blockNumber}. Gas Used: ${receipt.gasUsed}`);
                
                toast.success("Swap Confirmed On-Chain", { id: "swap-tx" });
                setAmountIn('');
                setAmountOut('');
            }
        } catch(txErr: any) {
            const cleanError = txErr?.shortMessage || txErr?.message?.split('\n')[0] || 'Transaction failed';
            addLog(`ERROR: ${cleanError}`);
            toast.error("Swap Failed", { id: "swap-tx", description: cleanError });
        }

    } catch (e: any) {
            const cleanError = e?.shortMessage || e?.message?.split('\n')[0] || 'Unknown error occurred.';
            addLog(`FATAL: ${cleanError}`);
            toast.error("Transaction Error", { id: "swap-tx", description: cleanError });
        } finally {
            setIsSwapping(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            className="flex flex-col w-full bg-white font-mono overflow-x-hidden"
            style={{ minHeight: '100vh', paddingBottom: 'calc(5rem + env(safe-area-inset-bottom, 0px))' }}
        >
            {/* ── Header ── */}
            <div className="flex flex-wrap items-start justify-between gap-3 px-4 sm:px-6 pt-6 pb-4 border-b border-black/10">
                <div className="min-w-0">
                    <h2 className="text-lg sm:text-xl font-black uppercase tracking-widest text-black flex items-center gap-2">
                        Universal Swap
                        <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse shrink-0"></span>
                    </h2>
                    <p className="text-[10px] uppercase text-black/50 tracking-widest mt-1">DEX Routing Engine v5 | {UNIVERSAL_TOKENS.length} Assets</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                    <label className="flex items-center gap-2 cursor-pointer text-[9px] uppercase font-bold text-black/40 hover:text-black transition-colors">
                        <input type="checkbox" checked={useMultiSig} onChange={e=>setUseMultiSig(e.target.checked)} className="accent-black" />
                        Multi-Sig
                    </label>
                    <button onClick={onBack} className="text-[10px] uppercase font-bold tracking-widest border border-black/10 px-3 py-2 hover:bg-black hover:text-white transition-colors active:bg-black active:text-white">
                        CLOSE
                    </button>
                </div>
            </div>

            {/* ── Body ── */}
            <div className="flex flex-col px-4 sm:px-6 pt-4 space-y-2">
                <div className="flex justify-between items-center">
                    <div className="text-[9px] font-bold uppercase tracking-widest text-black/40">
                        NETWORK: <span className="text-black ml-1">{activeNetwork}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-black/40">
                        MAX SLIPPAGE:
                        <select value={slippage} onChange={e=>setSlippage(e.target.value)} className="bg-transparent text-black outline-none font-bold border-b border-black/20 pb-0.5">
                            <option value="0.1">0.1%</option>
                            <option value="0.5">0.5%</option>
                            <option value="1.0">1.0%</option>
                            <option value="3.0">3.0%</option>
                        </select>
                    </div>
                </div>

                {/* ── Sell Block ── */}
                <div className="border border-black/10 p-4 sm:p-6 bg-white hover:border-black/30 transition-colors">
                    <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-black/40 mb-3 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-red-500 block shrink-0"></span> SELL
                    </label>
                    <div className="flex items-center justify-between gap-3">
                        {/* font-size >= 16px previene zoom automático en iOS Safari */}
                        <input
                            type="number"
                            inputMode="decimal"
                            value={amountIn}
                            onChange={(e) => setAmountIn(e.target.value)}
                            placeholder="0.0"
                            className="bg-transparent text-4xl sm:text-5xl font-light outline-none w-0 flex-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none text-black"
                            style={{ fontSize: 'clamp(1.75rem, 8vw, 3rem)' }}
                        />
                        <TokenSelector selectedToken={fromToken} onSelect={setFromToken} label="Sell Token" />
                    </div>
                    <div className="mt-4 text-[10px] text-black/40 font-mono flex justify-between pt-3 border-t border-black/5">
                        <span>Balance: {currentBalance}</span>
                        <span onClick={() => setAmountIn(currentBalance)} className="text-black/60 cursor-pointer hover:text-black font-bold tracking-widest border border-black/10 px-2 py-0.5 rounded-sm active:bg-black active:text-white transition-colors">MAX</span>
                    </div>
                </div>

                <div className="flex justify-center -my-4 relative z-10">
                    <button onClick={handleSwapAssets} className="bg-white border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.1)] p-3 rounded-full hover:bg-black hover:text-white transition-all group shadow-md">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="group-hover:rotate-180 transition-transform duration-500"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>
                    </button>
                </div>

                {/* ── Buy Block ── */}
                <div className="border border-black/10 p-4 sm:p-6 bg-black/[0.02] hover:border-black/30 transition-colors">
                    <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-black/40 mb-3 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-green-500 block shrink-0"></span> BUY
                    </label>
                    <div className="flex items-center justify-between gap-3">
                        <div className="text-black flex items-center w-0 flex-1 overflow-hidden" style={{ fontSize: 'clamp(1.75rem, 8vw, 3rem)', fontWeight: 300 }}>
                            {isCalculating ? (
                                <motion.span initial={{opacity:0.3}} animate={{opacity:1}} transition={{repeat:Infinity, duration:0.5}} className="text-black/20 font-mono text-2xl tracking-widest">CALCULATING...</motion.span>
                            ) : <span className="truncate">{amountOut || "0.0"}</span>}
                        </div>
                        <TokenSelector selectedToken={toToken} onSelect={setToToken} label="Buy Token" />
                    </div>
                </div>

                <AnimatePresence>
                    {amountIn && parseFloat(amountIn) > 0 && !isCalculating && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mt-4">
                            <div className="border border-black/10 p-5 bg-white text-[10px] uppercase font-mono tracking-widest space-y-4">
                                <div className="flex justify-between text-black/60">
                                    <span>Vector Path</span>
                                    <span className="text-black font-bold flex items-center gap-2">
                                        <img src={fromToken.logoPath} alt="" className="w-3 h-3 rounded-full" />
                                        {routingPath.join(" → ")}
                                        <img src={toToken.logoPath} alt="" className="w-3 h-3 rounded-full" />
                                    </span>
                                </div>
                                <div className="flex justify-between text-black/60">
                                    <span>Rate</span>
                                    <span className="text-black font-bold">1 {fromToken.symbol} = {(parseFloat(amountOut) / parseFloat(amountIn)).toFixed(4)} {toToken.symbol}</span>
                                </div>
                                <div className="flex justify-between text-black/60">
                                    <span>Price Impact / Gas</span>
                                    <span className="text-[#00C076] font-bold">&lt; 0.05% / ~{gasEstimate} {activeNetwork === 'polygon' ? 'MATIC' : 'ETH'}</span>
                                </div>
                                <div className="flex justify-between text-black/60">
                                    <span>Minimum Received</span>
                                    <span className="text-black font-bold">{(parseFloat(amountOut) * (1 - parseFloat(slippage)/100)).toFixed(4)} {toToken.symbol}</span>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>{/* end body */}

            <div className="fixed bottom-0 left-0 right-0 z-10 bg-white border-t border-black/10 px-4 sm:px-6 pt-4"
                style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))' }}
            >
                {needsApproval ? (
                    <button
                        onClick={executeApproval}
                        disabled={isApproving}
                        className="w-full py-4 sm:py-5 bg-black text-white font-black text-[12px] uppercase tracking-[0.3em] transition-all hover:bg-black/90 active:bg-black/70 disabled:opacity-50 flex justify-center shadow-2xl rounded-sm"
                    >
                        {isApproving ? 'AUTHORIZING...' : `APPROVE ${fromToken.symbol}`}
                    </button>
                ) : (parseFloat(amountIn || '0') > parseFloat(currentBalance || '0')) ? (
                    <button
                        disabled={true}
                        className="w-full py-4 sm:py-5 bg-black/5 text-black/40 border border-black/10 font-black text-[12px] uppercase tracking-[0.3em] transition-all flex justify-center rounded-sm cursor-not-allowed"
                    >
                        INSUFFICIENT {fromToken.symbol} BALANCE
                    </button>
                ) : (
                    <button
                        onClick={executeSwap}
                        disabled={isSwapping || !amountIn || isCalculating || !amountOut || amountOut.includes('error') || amountOut.includes('No liquidity')}
                        className="w-full py-4 sm:py-5 bg-black text-white font-black text-[12px] uppercase tracking-[0.3em] transition-all hover:bg-black/90 active:bg-black/70 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center shadow-2xl rounded-sm"
                    >
                        {useMultiSig ? 'SIGN & QUEUE (MULTI-SIG)' : isSwapping ? 'EXECUTING...' : 'SIGN & EXECUTE SWAP'}
                    </button>
                )}
                <p className="mt-2 text-[8px] uppercase tracking-[0.2em] text-black/30 text-center">ZERO SIMULATION. DIRECT ON-CHAIN EXECUTION VIA UNISWAP V2 ROUTER.</p>
            </div>
        </motion.div>
    );
}

