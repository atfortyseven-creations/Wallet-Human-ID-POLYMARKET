"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, ArrowDown, Loader2, Zap, CheckCircle2, AlertCircle,
  ExternalLink, RefreshCw, ChevronDown, Copy
} from "lucide-react";
import { useSendTransaction, useWriteContract, useReadContract, useGasPrice, useEstimateGas, useChainId, useEnsAddress, useWalletClient, usePublicClient } from "wagmi";
import { parseEther, parseUnits, formatUnits, isAddress, encodeFunctionData } from "viem";
import { useSystemAccount as useAccount } from '@/hooks/useSystemAccount';
import { ethers } from "ethers";
import { toast } from "sonner";
import { useWalletStore } from "@/lib/store/wallet-store";

interface SwapModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SUPPORTED_TOKENS = [
  { symbol: "ETH", name: "Ethereum", icon: "⟠", chain: 1, address: "0x0000000000000000000000000000000000000000", decimals: 18 },
  { symbol: "MATIC", name: "Polygon", icon: "⬡", chain: 137, address: "0x0000000000000000000000000000000000000000", decimals: 18 },
  { symbol: "USDC", name: "USD Coin", icon: "$", chain: 137, address: "0x3c499c542cef5e3811e1192ce70d8cc03d5c3359", decimals: 6 },
  { symbol: "USDT", name: "Tether", icon: "₮", chain: 137, address: "0xc2132d05d31c914a87c6611c10748aeb04b58e8f", decimals: 6 },
  { symbol: "WETH", name: "Wrapped ETH", icon: "🔷", chain: 1, address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", decimals: 18 },
];

type SwapStatus = "IDLE" | "QUOTING" | "SIGNING" | "BROADCASTING" | "SUCCESS" | "ERROR";

export default function SwapModal({ isOpen, onClose }: SwapModalProps) {
  const wagmi = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const chainId = useChainId();
  const store = useWalletStore();

  const isWagmiConnected = wagmi.isConnected;
  const isSystemWallet = !!store.privateKey && !!store.address;
  const activeAddress = isWagmiConnected ? wagmi.address : store.address;
  const hasWallet = isWagmiConnected || isSystemWallet;

  const [fromToken, setFromToken] = useState(SUPPORTED_TOKENS[0]);
  const [toToken, setToToken] = useState(SUPPORTED_TOKENS[2]);
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [status, setStatus] = useState<SwapStatus>("IDLE");
  const [txHash, setTxHash] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [quoteData, setQuoteData] = useState<any>(null);
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);
  const [slippage, setSlippage] = useState(0.5);

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      setStatus("IDLE");
      setFromAmount("");
      setToAmount("");
      setTxHash("");
      setErrorMsg("");
      setQuoteData(null);
    }
  }, [isOpen]);

  const fetchQuote = useCallback(async () => {
    if (!fromAmount || parseFloat(fromAmount) <= 0 || !activeAddress) return;
    if (fromToken.symbol === toToken.symbol) {
      setToAmount(fromAmount);
      return;
    }
    setStatus("QUOTING");
    try {
      const amountInWei = parseUnits(fromAmount, fromToken.decimals).toString();
      const res = await fetch(
        `https://li.quest/v1/quote?fromChain=${chainId}&toChain=${chainId}&fromToken=${fromToken.address}&toToken=${toToken.address}&fromAmount=${amountInWei}&fromAddress=${activeAddress}`
      );
      if (!res.ok) throw new Error("Could not fetch quote");
      const data = await res.json();
      const estimatedOut = formatUnits(BigInt(data.estimate.toAmount), data.action.toToken.decimals);
      setToAmount(parseFloat(estimatedOut).toFixed(6));
      setQuoteData(data);
      setStatus("IDLE");
    } catch (e) {
      setToAmount("");
      setQuoteData(null);
      setStatus("IDLE");
    }
  }, [fromAmount, fromToken, toToken, chainId, activeAddress]);

  useEffect(() => {
    const t = setTimeout(fetchQuote, 600);
    return () => clearTimeout(t);
  }, [fetchQuote]);

  const flipTokens = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    setFromAmount(toAmount);
    setToAmount("");
    setQuoteData(null);
  };

  const getExplorerUrl = () => {
    const ex: Record<number, string> = {
      1: "https://etherscan.io/tx/",
      137: "https://polygonscan.com/tx/",
      8453: "https://basescan.org/tx/",
    };
    return (ex[chainId] || "https://polygonscan.com/tx/") + txHash;
  };

  const executeSwap = async () => {
    if (!quoteData) { toast.error("No route found. Please try again."); return; }
    if (!hasWallet) { toast.error("Connect a wallet first"); return; }

    const { transactionRequest } = quoteData;
    setStatus("SIGNING");

    try {
      let hash = "";

      if (isWagmiConnected && walletClient) {
        // MetaMask / WalletConnect flow
        hash = await walletClient.sendTransaction({
          to: transactionRequest.to as `0x${string}`,
          data: transactionRequest.data as `0x${string}`,
          value: BigInt(transactionRequest.value || "0"),
          gas: transactionRequest.gasLimit ? BigInt(transactionRequest.gasLimit) : undefined,
        });
        setStatus("BROADCASTING");
        if (publicClient) await publicClient.waitForTransactionReceipt({ hash: hash as `0x${string}` });
      } else if (isSystemWallet && store.privateKey) {
        // System wallet flow
        const rpc = store.activeNetwork === "polygon" ? "https://polygon-rpc.com" : "https://cloudflare-eth.com";
        const provider = new ethers.JsonRpcProvider(rpc);
        const wallet = new ethers.Wallet(store.privateKey, provider);
        setStatus("BROADCASTING");
        const tx = await wallet.sendTransaction({
          to: transactionRequest.to,
          data: transactionRequest.data,
          value: BigInt(transactionRequest.value || "0"),
        });
        hash = tx.hash;
        await tx.wait(1);
        store.updateBalance();
      }

      setTxHash(hash);
      setStatus("SUCCESS");
    } catch (err: any) {
      setStatus("ERROR");
      setErrorMsg(err?.message?.split("\n")[0] || "Swap failed");
    }
  };

  const isProcessing = status === "SIGNING" || status === "BROADCASTING" || status === "QUOTING";

  if (!isOpen) return null;

  const TokenDropdown = ({
    tokens, selected, onSelect, show, onToggle
  }: { tokens: typeof SUPPORTED_TOKENS, selected: typeof SUPPORTED_TOKENS[0], onSelect: (t: any) => void, show: boolean, onToggle: () => void }) => (
    <div className="relative">
      <button
        onClick={onToggle}
        className="flex items-center gap-2 bg-white border border-gray-200 hover:border-gray-300 rounded-xl px-3 py-2 transition-all shrink-0"
      >
        <span className="text-base">{selected.icon}</span>
        <span className="font-black text-sm text-gray-900">{selected.symbol}</span>
        <ChevronDown size={12} className={`text-gray-400 transition-transform ${show ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="absolute top-full right-0 mt-2 w-44 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden"
          >
            {tokens.map((t, i) => (
              <button key={i}
                onClick={() => { onSelect(t); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 transition-colors text-left"
              >
                <span className="text-base">{t.icon}</span>
                <div>
                  <div className="font-bold text-sm text-gray-900">{t.symbol}</div>
                  <div className="text-[10px] text-gray-400">{t.name}</div>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm" />

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 16 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="fixed inset-0 z-[70] flex items-center justify-center pointer-events-none p-4"
      >
        <div className="w-full max-w-md pointer-events-auto bg-white border border-gray-200 rounded-[28px] shadow-2xl overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center">
                <Zap size={16} className="text-indigo-600" />
              </div>
              <div>
                <h2 className="text-base font-black text-gray-900 uppercase tracking-wide">Smart Swap</h2>
                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">
                  Powered by LI.FI — Best Route
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={fetchQuote} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors" title="Refresh Quote">
                <RefreshCw size={13} className={`text-gray-400 ${status === "QUOTING" ? "animate-spin" : ""}`} />
              </button>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <X size={18} className="text-gray-500" />
              </button>
            </div>
          </div>

          {/* No Wallet */}
          {!hasWallet && (
            <div className="p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center mx-auto mb-4 text-2xl">💼</div>
              <h3 className="font-black text-gray-900 text-lg mb-2">Wallet Not Connected</h3>
              <p className="text-sm text-gray-500">Please connect MetaMask or unlock your System Wallet to swap.</p>
            </div>
          )}

          {/* SUCCESS */}
          {status === "SUCCESS" && (
            <div className="p-8 text-center space-y-4">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}
                className="w-16 h-16 rounded-full bg-green-50 border-2 border-green-200 flex items-center justify-center mx-auto">
                <CheckCircle2 size={32} className="text-green-500" />
              </motion.div>
              <div>
                <h3 className="font-black text-gray-900 text-xl">Swap Complete!</h3>
                <p className="text-sm text-gray-500 mt-1">Your swap has been confirmed on-chain.</p>
              </div>
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 flex items-center justify-between">
                <span className="font-mono text-xs text-gray-500">{txHash.slice(0, 18)}...{txHash.slice(-6)}</span>
                <div className="flex gap-2">
                  <button onClick={() => { navigator.clipboard.writeText(txHash); toast.success("Copied!"); }}
                    className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors">
                    <Copy size={12} className="text-gray-500" />
                  </button>
                  <a href={getExplorerUrl()} target="_blank" rel="noreferrer"
                    className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors">
                    <ExternalLink size={12} className="text-gray-500" />
                  </a>
                </div>
              </div>
              <button onClick={onClose} className="w-full py-3 bg-gray-900 text-white font-black text-sm rounded-xl hover:bg-gray-800 transition-colors">Done</button>
            </div>
          )}

          {/* ERROR */}
          {status === "ERROR" && (
            <div className="p-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-red-50 border-2 border-red-200 flex items-center justify-center mx-auto">
                <AlertCircle size={32} className="text-red-500" />
              </div>
              <div>
                <h3 className="font-black text-gray-900 text-xl">Swap Failed</h3>
                <p className="text-xs text-gray-500 mt-2 bg-red-50 p-3 rounded-xl border border-red-100 font-mono text-left">{errorMsg}</p>
              </div>
              <button onClick={() => setStatus("IDLE")}
                className="w-full py-3 bg-gray-900 text-white font-black text-sm rounded-xl hover:bg-gray-800 transition-colors">
                Try Again
              </button>
            </div>
          )}

          {/* MAIN SWAP FORM */}
          {hasWallet && (status === "IDLE" || status === "QUOTING" || status === "SIGNING" || status === "BROADCASTING") && (
            <div className="p-5 space-y-3">

              {/* FROM */}
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
                <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
                  <span>You Pay</span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    value={fromAmount}
                    onChange={e => setFromAmount(e.target.value)}
                    placeholder="0.00"
                    className="flex-1 bg-transparent text-3xl font-black text-gray-900 outline-none placeholder:text-gray-200 min-w-0"
                  />
                  <TokenDropdown
                    tokens={SUPPORTED_TOKENS}
                    selected={fromToken}
                    onSelect={t => { setFromToken(t); setShowFromDropdown(false); }}
                    show={showFromDropdown}
                    onToggle={() => { setShowFromDropdown(!showFromDropdown); setShowToDropdown(false); }}
                  />
                </div>
              </div>

              {/* FLIP BUTTON */}
              <div className="flex justify-center relative">
                <button
                  onClick={flipTokens}
                  className="absolute -translate-y-1/2 top-1/2 w-9 h-9 bg-white border-2 border-gray-200 rounded-xl flex items-center justify-center hover:border-purple-300 hover:bg-purple-50 transition-all shadow-sm group"
                >
                  <ArrowDown size={14} className="text-gray-400 group-hover:text-purple-500 transition-colors" />
                </button>
              </div>

              {/* TO */}
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
                <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
                  <span>You Receive</span>
                  {status === "QUOTING" && (
                    <span className="flex items-center gap-1 text-indigo-500">
                      <Loader2 size={10} className="animate-spin" /> Finding best route...
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={toAmount}
                    readOnly
                    placeholder="0.00"
                    className={`flex-1 bg-transparent text-3xl font-black outline-none placeholder:text-gray-200 min-w-0 transition-opacity ${status === "QUOTING" ? "opacity-30 text-gray-400" : "text-gray-900"}`}
                  />
                  <TokenDropdown
                    tokens={SUPPORTED_TOKENS}
                    selected={toToken}
                    onSelect={t => { setToToken(t); setShowToDropdown(false); }}
                    show={showToDropdown}
                    onToggle={() => { setShowToDropdown(!showToDropdown); setShowFromDropdown(false); }}
                  />
                </div>
              </div>

              {/* Route Info */}
              <AnimatePresence>
                {quoteData && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3 flex items-center justify-between overflow-hidden"
                  >
                    <div className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">
                      Best Route via {quoteData?.tool || "LI.FI"}
                    </div>
                    <div className="flex items-center gap-1.5 text-green-600 text-[10px] font-black">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                      Live
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Slippage */}
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Slippage</span>
                <div className="flex gap-1">
                  {[0.1, 0.5, 1.0].map(s => (
                    <button key={s}
                      onClick={() => setSlippage(s)}
                      className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase transition-colors ${slippage === s ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
                    >
                      {s}%
                    </button>
                  ))}
                </div>
              </div>

              {/* Execute Button */}
              <button
                disabled={!fromAmount || !quoteData || isProcessing}
                onClick={executeSwap}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-30 disabled:cursor-not-allowed rounded-2xl font-black text-sm uppercase tracking-widest text-white transition-all active:scale-[0.98] flex items-center justify-center gap-3 mt-2"
              >
                {status === "QUOTING" ? (
                  <><Loader2 size={16} className="animate-spin" /> Finding Route...</>
                ) : status === "SIGNING" ? (
                  <><Loader2 size={16} className="animate-spin" /> Sign in Wallet...</>
                ) : status === "BROADCASTING" ? (
                  <><Loader2 size={16} className="animate-spin" /> Confirming...</>
                ) : (
                  <><Zap size={16} fill="currentColor" /> Execute Swap</>
                )}
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
