"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Send, ArrowRight, CheckCircle2, Loader2, AlertCircle,
  ExternalLink, Copy, ChevronDown, Search, Wallet
} from "lucide-react";
import { useSendTransaction, useWriteContract, useReadContract, useGasPrice, useEstimateGas, useChainId, useEnsAddress, useSwitchChain, useChains, useBalance, useWaitForTransactionReceipt } from "wagmi";
import { parseEther, parseUnits, isAddress, formatUnits, encodeFunctionData } from "viem";
import { useSystemAccount as useAccount } from '@/hooks/useSystemAccount';
import { ethers } from "ethers";
import { toast } from "sonner";
import { useWalletStore } from "@/lib/store/wallet-store";
import { ERC20_ABI } from "@/lib/wallet/erc20";

type TxStatus = "IDLE" | "SIGNING" | "PENDING" | "SUCCESS" | "ERROR";

interface Asset {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  balance: string;
  logoURI?: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const NATIVE_ASSET = (chainId: number): Asset => ({
  symbol: chainId === 137 ? "MATIC" : "ETH",
  name: chainId === 137 ? "Polygon" : "Ethereum",
  address: "native",
  decimals: 18,
  balance: "0.0000",
});

const POLYGON_RPC = "https://polygon-rpc.com";

export default function UniversalSendModal({ isOpen, onClose }: Props) {
  const wagmi = useAccount();
  const chainId = useChainId();
  const store = useWalletStore();

  // Detect wallet mode
  const isWagmiConnected = wagmi.isConnected;
  const isSystemWallet = !!store.privateKey && !!store.address;
  const activeAddress = isWagmiConnected ? wagmi.address : store.address;
  const hasWallet = isWagmiConnected || isSystemWallet;

  // Form state
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedAsset, setSelectedAsset] = useState<Asset>(NATIVE_ASSET(chainId));
  const [showAssetDropdown, setShowAssetDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [tokens, setTokens] = useState<Asset[]>([]);
  const [status, setStatus] = useState<TxStatus>("IDLE");
  const [txHash, setTxHash] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [gasPriority, setGasPriority] = useState<"low" | "medium" | "high">("medium");

  // Wagmi hooks
  const { sendTransaction, isPending: isSendPending, data: wagmiNativeHash } = useSendTransaction();
  const { writeContract, isPending: isWritePending, data: wagmiTokenHash } = useWriteContract();
  const { data: nativeBalance } = useBalance({ address: wagmi.address });
  const { data: tokenBalance } = useBalance({
    address: wagmi.address,
    token: selectedAsset.address !== "native" ? selectedAsset.address as `0x${string}` : undefined,
    query: { enabled: isWagmiConnected && selectedAsset.address !== "native" }
  });

  const { isSuccess: nativeConfirmed } = useWaitForTransactionReceipt({ hash: wagmiNativeHash });
  const { isSuccess: tokenConfirmed } = useWaitForTransactionReceipt({ hash: wagmiTokenHash });

  // Sync wagmi confirmation
  useEffect(() => {
    if (nativeConfirmed && wagmiNativeHash) {
      setStatus("SUCCESS");
      setTxHash(wagmiNativeHash);
    }
  }, [nativeConfirmed, wagmiNativeHash]);

  useEffect(() => {
    if (tokenConfirmed && wagmiTokenHash) {
      setStatus("SUCCESS");
      setTxHash(wagmiTokenHash);
    }
  }, [tokenConfirmed, wagmiTokenHash]);

  // Sync status for wagmi pending
  useEffect(() => {
    if ((isSendPending || isWritePending) && status === "SIGNING") {
      setStatus("PENDING");
    }
  }, [isSendPending, isWritePending]);

  // Fetch token list
  useEffect(() => {
    if (!activeAddress || !isOpen) return;
    fetch(`/api/wallet/tokens?address=${activeAddress}&chainId=${chainId}`)
      .then(r => r.ok ? r.json() : { tokens: [] })
      .then(d => setTokens(d.tokens || []))
      .catch(() => {});
  }, [activeAddress, chainId, isOpen]);

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      setStatus("IDLE");
      setRecipient("");
      setAmount("");
      setTxHash("");
      setErrorMsg("");
      setSearchQuery("");
      setShowAssetDropdown(false);
    }
  }, [isOpen]);

  // Update native asset when chainId changes
  useEffect(() => {
    if (selectedAsset.address === "native") {
      setSelectedAsset(NATIVE_ASSET(chainId));
    }
  }, [chainId]);

  const allAssets = useMemo(() => {
    const native = {
      ...NATIVE_ASSET(chainId),
      balance: nativeBalance ? parseFloat(nativeBalance.formatted).toFixed(4) : "0.0000",
    };
    const erc20s = tokens.map(t => ({ ...t, balance: t.balance || "0.0000" }));
    return [native, ...erc20s];
  }, [chainId, tokens, nativeBalance]);

  const currentDisplayBalance = useMemo(() => {
    if (selectedAsset.address === "native") return nativeBalance?.formatted || store.balance || "0.0";
    return tokenBalance?.formatted || "0.0";
  }, [selectedAsset, nativeBalance, tokenBalance, store.balance]);

  const filteredAssets = allAssets.filter(a =>
    !searchQuery ||
    a.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleMax = () => {
    const bal = parseFloat(currentDisplayBalance);
    const buffer = selectedAsset.address === "native" ? (chainId === 1 ? 0.005 : 0.001) : 0;
    setAmount(Math.max(0, bal - buffer).toFixed(6));
  };

  const getExplorerUrl = () => {
    const explorers: Record<number, string> = {
      1: "https://etherscan.io/tx/",
      137: "https://polygonscan.com/tx/",
      8453: "https://basescan.org/tx/",
      42161: "https://arbiscan.io/tx/",
      10: "https://optimistic.etherscan.io/tx/",
    };
    return (explorers[chainId] || "https://polygonscan.com/tx/") + txHash;
  };

  const validate = () => {
    if (!isAddress(recipient)) { toast.error("Invalid destination address"); return false; }
    if (!amount || parseFloat(amount) <= 0) { toast.error("Invalid amount"); return false; }
    if (parseFloat(amount) > parseFloat(currentDisplayBalance)) { toast.error("Insufficient balance"); return false; }
    return true;
  };

  // === SEND VIA SYSTEM WALLET (local private key) ===
  const sendViaSystemWallet = async () => {
    if (!store.privateKey) { toast.error("System wallet locked. Please unlock your vault."); return; }
    setStatus("SIGNING");
    try {
      let hash: string | null = null;
      if (selectedAsset.address === "native") {
        // Use built-in store method for native
        hash = await store.sendTransaction(recipient, amount, gasPriority);
      } else {
        // ERC-20 transfer via ethers directly
        const provider = new ethers.JsonRpcProvider(POLYGON_RPC);
        const wallet = new ethers.Wallet(store.privateKey, provider);
        const contract = new ethers.Contract(selectedAsset.address, [
          "function transfer(address to, uint256 amount) returns (bool)"
        ], wallet);
        const amountBN = ethers.parseUnits(amount, selectedAsset.decimals);
        setStatus("PENDING");
        const tx = await contract.transfer(recipient, amountBN);
        hash = tx.hash;
        toast.loading("Waiting for confirmation...", { id: "tx" });
        await tx.wait(1);
        toast.dismiss("tx");
      }
      if (hash) {
        setTxHash(hash);
        setStatus("SUCCESS");
        store.updateBalance();
      }
    } catch (err: any) {
      setStatus("ERROR");
      setErrorMsg(err?.message?.split("\n")[0] || "Transaction failed");
    }
  };

  // === SEND VIA WAGMI (MetaMask/WalletConnect) ===
  const sendViaWagmi = async () => {
    setStatus("SIGNING");
    try {
      if (selectedAsset.address === "native") {
        sendTransaction(
          { to: recipient as `0x${string}`, value: parseEther(amount) },
          {
            onError: (err) => { setStatus("ERROR"); setErrorMsg(err.message.split("\n")[0]); }
          }
        );
      } else {
        writeContract(
          {
            address: selectedAsset.address as `0x${string}`,
            abi: ERC20_ABI,
            functionName: "transfer",
            args: [recipient as `0x${string}`, parseUnits(amount, selectedAsset.decimals)],
          },
          {
            onError: (err) => { setStatus("ERROR"); setErrorMsg(err.message.split("\n")[0]); }
          }
        );
      }
    } catch (err: any) {
      setStatus("ERROR");
      setErrorMsg(err?.message?.split("\n")[0] || "Wallet rejected transaction");
    }
  };

  const handleSend = async () => {
    if (!validate()) return;
    if (isSystemWallet && !isWagmiConnected) {
      await sendViaSystemWallet();
    } else if (isWagmiConnected) {
      await sendViaWagmi();
    }
  };

  const isProcessing = status === "SIGNING" || status === "PENDING";
  const isSigning = status === "SIGNING";
  const isPending = status === "PENDING";

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 16 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="fixed inset-0 z-[70] flex items-center justify-center pointer-events-none p-4"
      >
        <div className="w-full max-w-md pointer-events-auto bg-white border border-gray-200 rounded-[28px] shadow-2xl overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center">
                <Send size={16} className="text-purple-600" />
              </div>
              <div>
                <h2 className="text-base font-black text-gray-900 uppercase tracking-wide">Send Assets</h2>
                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">
                  {isSystemWallet && !isWagmiConnected ? "System Wallet" : "MetaMask / WalletConnect"}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
              <X size={18} className="text-gray-500" />
            </button>
          </div>

          {/* No wallet connected */}
          {!hasWallet && (
            <div className="p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center mx-auto mb-4">
                <Wallet size={28} className="text-orange-400" />
              </div>
              <h3 className="font-black text-gray-900 text-lg mb-2">Wallet Not Connected</h3>
              <p className="text-sm text-gray-500">Please connect MetaMask or unlock your System Wallet to send assets.</p>
            </div>
          )}

          {/* SUCCESS STATE */}
          {status === "SUCCESS" && (
            <div className="p-8 text-center space-y-4">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}
                className="w-16 h-16 rounded-full bg-green-50 border-2 border-green-200 flex items-center justify-center mx-auto">
                <CheckCircle2 size={32} className="text-green-500" />
              </motion.div>
              <div>
                <h3 className="font-black text-gray-900 text-xl">Transaction Sent!</h3>
                <p className="text-sm text-gray-500 mt-1">Your transaction has been confirmed on-chain.</p>
              </div>
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 flex items-center justify-between">
                <span className="font-mono text-xs text-gray-500">{txHash.slice(0, 18)}...{txHash.slice(-8)}</span>
                <div className="flex gap-2">
                  <button onClick={() => { navigator.clipboard.writeText(txHash); toast.success("Hash copied!"); }}
                    className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors">
                    <Copy size={12} className="text-gray-500" />
                  </button>
                  <a href={getExplorerUrl()} target="_blank" rel="noreferrer"
                    className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors">
                    <ExternalLink size={12} className="text-gray-500" />
                  </a>
                </div>
              </div>
              <button onClick={onClose}
                className="w-full py-3 bg-gray-900 text-white font-black text-sm rounded-xl hover:bg-gray-800 transition-colors">
                Done
              </button>
            </div>
          )}

          {/* ERROR STATE */}
          {status === "ERROR" && (
            <div className="p-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-red-50 border-2 border-red-200 flex items-center justify-center mx-auto">
                <AlertCircle size={32} className="text-red-500" />
              </div>
              <div>
                <h3 className="font-black text-gray-900 text-xl">Transaction Failed</h3>
                <p className="text-xs text-gray-500 mt-2 bg-red-50 p-3 rounded-xl border border-red-100 font-mono text-left">{errorMsg}</p>
              </div>
              <button onClick={() => setStatus("IDLE")}
                className="w-full py-3 bg-gray-900 text-white font-black text-sm rounded-xl hover:bg-gray-800 transition-colors">
                Try Again
              </button>
            </div>
          )}

          {/* MAIN FORM */}
          {hasWallet && status === "IDLE" && (
            <div className="p-6 space-y-5">

              {/* Asset Selector */}
              <div className="relative z-30">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Asset</label>
                <button
                  onClick={() => setShowAssetDropdown(!showAssetDropdown)}
                  className="w-full flex items-center justify-between bg-gray-50 border border-gray-200 hover:border-gray-300 rounded-xl px-4 py-3 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-sm font-black text-purple-600">
                      {selectedAsset.symbol.charAt(0)}
                    </div>
                    <div className="text-left">
                      <div className="font-black text-sm text-gray-900">{selectedAsset.symbol}</div>
                      <div className="text-[10px] text-gray-400">{selectedAsset.name}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-gray-400">{currentDisplayBalance}</span>
                    <ChevronDown size={14} className={`text-gray-400 transition-transform ${showAssetDropdown ? "rotate-180" : ""}`} />
                  </div>
                </button>

                <AnimatePresence>
                  {showAssetDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl z-40 overflow-hidden max-h-64 flex flex-col"
                    >
                      <div className="p-2 border-b border-gray-100">
                        <div className="relative">
                          <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input
                            autoFocus
                            placeholder="Search tokens..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full pl-8 pr-3 py-2 text-xs bg-gray-50 border border-gray-100 rounded-lg outline-none focus:border-purple-300"
                          />
                        </div>
                      </div>
                      <div className="overflow-y-auto">
                        {filteredAssets.map((asset, i) => (
                          <button key={i}
                            onClick={() => { setSelectedAsset(asset); setShowAssetDropdown(false); setSearchQuery(""); }}
                            className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-7 h-7 rounded-full bg-purple-50 flex items-center justify-center text-xs font-black text-purple-600">
                                {asset.symbol.charAt(0)}
                              </div>
                              <div className="text-left">
                                <div className="font-bold text-sm text-gray-900">{asset.symbol}</div>
                                <div className="text-[10px] text-gray-400">{asset.name}</div>
                              </div>
                            </div>
                            <span className="text-xs font-mono text-gray-400">{parseFloat(asset.balance || "0").toFixed(4)}</span>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Recipient */}
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">To Address</label>
                <div className="relative">
                  <input
                    value={recipient}
                    onChange={e => setRecipient(e.target.value)}
                    placeholder="0x..."
                    className="w-full bg-gray-50 border border-gray-200 focus:border-purple-300 rounded-xl py-3 px-4 pr-10 text-sm font-mono text-gray-900 placeholder:text-gray-300 outline-none transition-colors"
                  />
                  {recipient && isAddress(recipient) && (
                    <CheckCircle2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500" />
                  )}
                  {recipient && !isAddress(recipient) && (
                    <AlertCircle size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-red-400" />
                  )}
                </div>
              </div>

              {/* Amount */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Amount</label>
                  <span className="text-[10px] text-gray-400">
                    Balance: <span className="font-mono text-gray-700">{parseFloat(currentDisplayBalance).toFixed(4)}</span>
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-gray-50 border border-gray-200 focus:border-purple-300 rounded-xl py-4 pl-4 pr-28 text-2xl font-black text-gray-900 placeholder:text-gray-200 outline-none transition-colors"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    <button onClick={handleMax}
                      className="px-2.5 py-1 bg-gray-900 text-white rounded-lg text-[9px] font-black uppercase tracking-widest">
                      MAX
                    </button>
                    <span className="text-xs font-black text-gray-400 pr-1">{selectedAsset.symbol}</span>
                  </div>
                </div>
              </div>

              {/* Gas Priority */}
              {isSystemWallet && !isWagmiConnected && selectedAsset.address === "native" && (
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Gas Priority</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["low", "medium", "high"] as const).map(p => (
                      <button key={p}
                        onClick={() => setGasPriority(p)}
                        className={`py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors ${gasPriority === p ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Send Button */}
              <button
                disabled={isProcessing || !amount || !recipient}
                onClick={handleSend}
                className="w-full py-4 bg-gray-900 hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed rounded-2xl font-black text-sm uppercase tracking-widest text-white transition-all active:scale-[0.98] flex items-center justify-center gap-3"
              >
                {isProcessing ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    {isSigning ? "Waiting for Signature..." : "Broadcasting..."}
                  </>
                ) : (
                  <>
                    Send {selectedAsset.symbol} <ArrowRight size={14} />
                  </>
                )}
              </button>
            </div>
          )}

          {/* SIGNING / PENDING overlay */}
          {isProcessing && (
            <div className="px-6 pb-6">
              <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 flex items-center gap-3">
                <Loader2 size={16} className="text-purple-500 animate-spin shrink-0" />
                <div>
                  <div className="text-xs font-black text-purple-700 uppercase tracking-wider">
                    {isSigning ? "Awaiting Wallet Signature" : "Broadcasting to Network"}
                  </div>
                  <div className="text-[10px] text-purple-500 mt-0.5">
                    {isSigning ? "Please confirm in your wallet..." : "Transaction submitted, waiting for confirmation..."}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
