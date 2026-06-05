"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowDownUp, Settings, Zap, Search, Loader2, X, AlertCircle } from 'lucide-react';
import { type SwapQuote, formatSwapRoute } from '@/lib/wallet/swap';
import { type GasEstimate } from '@/lib/wallet/gas';
import { type TokenMetadata } from '@/lib/wallet/tokens';
import { useAccount } from 'wagmi';
import { useTransactionHandler } from '@/hooks/useTransactionHandler';
import { TokenLogo } from '@/components/ui/TokenLogo';

import { safeToFixed, safeToLocaleString } from '@/lib/utils/number-format';
interface SwapInterfaceProps {
  userAddress: string;
  chainId: number;
  assets?: any[];
  onSwap: (txData: any) => void;
}

export default function SwapInterface({ userAddress, chainId, assets = [], onSwap }: SwapInterfaceProps) {
  const { handleExternalTransaction, isConnected: isExternalConnected } = useTransactionHandler();
  const { address: wagmiAddress } = useAccount();
  
  // Set default fromToken to the first asset with balance if available
  const [fromToken, setFromToken] = useState<TokenMetadata | null>(() => {
    if (assets.length > 0) {
      return {
        symbol: assets[0].symbol,
        name: assets[0].name,
        address: assets[0].tokenAddress || 'native',
        decimals: assets[0].decimals || 18,
        logoURI: assets[0].logoURI || assets[0].logo,
        chainId: chainId
      };
    }
    return null;
  });

  const [toToken, setToToken] = useState<TokenMetadata | null>(null);
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [slippage, setSlippage] = useState(0.5);
  const [quote, setQuote] = useState<SwapQuote | null>(null);
  const [gasEstimate, setGasEstimate] = useState<GasEstimate | null>(null);
  const [loading, setLoading] = useState(false);
  const [showGasSettings, setShowGasSettings] = useState(false);
  const [selectedGasSpeed, setSelectedGasSpeed] = useState<'slow' | 'normal' | 'fast'>('normal');

  // Get quote whenever amounts or tokens change
  useEffect(() => {
    if (fromToken && toToken && fromAmount && parseFloat(fromAmount) > 0) {
      fetchQuote();
    }
  }, [fromToken, toToken, fromAmount]);

  const fetchQuote = async () => {
    if (!fromToken || !toToken || !fromAmount) return;
    
    setLoading(true);
    try {
      const amountWei = (BigInt(Math.floor(parseFloat(fromAmount) * 10 ** fromToken.decimals))).toString();
      
      const res = await fetch(`/api/wallet/swap?action=quote&chainId=${chainId}&fromToken=${fromToken.address}&toToken=${toToken.address}&amount=${amountWei}`);
      if (!res.ok) throw new Error('Failed to fetch quote');
      
      const swapQuote = await res.json();
      setQuote(swapQuote);
      
      const toAmountValue = swapQuote.toAmount || swapQuote.dstAmount || '0';
      const toAmountFormatted = (parseFloat(toAmountValue) / 10 ** toToken.decimals).toFixed(6);
      setToAmount(toAmountFormatted);

      const gasRes = await fetch(`/api/wallet/gas?chainId=${chainId}`);
      if (gasRes.ok) {
        const gas = await gasRes.json();
        setGasEstimate(gas);
      }
    } catch (error) {
      console.error('Error fetching quote:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSwap = async () => {
    if (!fromToken || !toToken || !fromAmount || !quote) return;
    
    setLoading(true);
    try {
      const amountWei = (BigInt(Math.floor(parseFloat(fromAmount) * 10 ** fromToken.decimals))).toString();
      const effectiveAddress = isExternalConnected ? wagmiAddress : userAddress;

      const res = await fetch(`/api/wallet/swap?action=tx&chainId=${chainId}&fromToken=${fromToken.address}&toToken=${toToken.address}&amount=${amountWei}&address=${effectiveAddress}`);
      if (!res.ok) throw new Error('Failed to build swap');
      
      const txData = await res.json();

      if (isExternalConnected) {
        await handleExternalTransaction({
          to: txData.to,
          data: txData.tx.data,
          value: txData.tx.value,
          chainId
        });
      } else {
        onSwap(txData);
      }
    } catch (error) {
      console.error('Error building swap:', error);
    } finally {
      setLoading(false);
    }
  };

  const switchTokens = () => {
    const prevFrom = fromToken;
    setFromToken(toToken);
    setToToken(prevFrom);
    setFromAmount(toAmount);
    setToAmount('');
  };

  return (
    <div className="w-full relative min-h-[480px]">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 px-2">
          <h2 className="text-3xl font-black text-[#1F1F1F] italic tracking-tighter">SWAP</h2>
          <button
            onClick={() => setShowGasSettings(!showGasSettings)}
            className="p-2.5 bg-white border-2 border-[#1F1F1F] rounded-2xl shadow-[4px_4px_0px_0px_#1F1F1F] hover:translate-y-0.5 hover:translate-x-0.5 hover:shadow-none transition-all"
          >
            <Settings size={20} className="text-[#1F1F1F]" />
          </button>
        </div>

        {/* From Token */}
        <div className="bg-white border-2 border-[#1F1F1F] rounded-3xl p-5 shadow-[4px_4px_0px_0px_#1F1F1F] space-y-3 relative group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-[#1F1F1F]/40 tracking-widest">You Pay</span>
            <span className="text-[10px] font-black text-[#1F1F1F]/60">
              Balance: {fromToken ? (assets.find(a => a.symbol === fromToken.symbol)?.balanceFormatted || '0.00') : '0.00'}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <input
              type="number"
              value={fromAmount}
              onChange={(e) => setFromAmount(e.target.value)}
              placeholder="0.0"
              className="flex-1 bg-transparent text-4xl font-black text-[#1F1F1F] outline-none placeholder:text-[#1F1F1F]/10 tabular-nums"
            />
            <SelectTokenButton token={fromToken} onSelect={setFromToken} chainId={chainId} assets={assets} />
          </div>
        </div>

        {/* Swap Direction Button */}
        <div className="flex justify-center -my-6 relative z-10">
          <button
            onClick={switchTokens}
            className="p-4 bg-[#1F1F1F] text-[#EAEADF] rounded-full border-4 border-[#EAEADF] shadow-xl hover:rotate-180 transition-all duration-500 active:scale-95"
          >
            <ArrowDownUp size={24} />
          </button>
        </div>

        {/* To Token */}
        <div className="bg-white border-2 border-[#1F1F1F] rounded-3xl p-5 shadow-[4px_4px_0px_0px_#1F1F1F] space-y-3 relative group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-[#1F1F1F]/40 tracking-widest">You Receive</span>
            <span className="text-[10px] font-black text-[#1F1F1F]/60">
              Balance: {toToken ? (assets.find(a => a.symbol === toToken.symbol)?.balanceFormatted || '0.00') : '0.00'}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <input
              type="number"
              value={toAmount}
              readOnly
              placeholder="0.0"
              className="flex-1 bg-transparent text-4xl font-black text-[#1F1F1F] outline-none placeholder:text-[#1F1F1F]/10 tabular-nums"
            />
            <SelectTokenButton token={toToken} onSelect={setToToken} chainId={chainId} assets={assets} />
          </div>
        </div>

        {/* Quote Details */}
        <AnimatePresence>
          {quote && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="bg-black/5 rounded-2xl p-4 space-y-2 border border-[#1F1F1F]/5"
            >
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span className="text-[#1F1F1F]/40 uppercase tracking-tighter">Rate</span>
                <span className="text-[#1F1F1F]">
                  1 {fromToken?.symbol} = {safeToFixed(quote.price, 6)} {toToken?.symbol}
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] font-bold">
                <span className="text-[#1F1F1F]/40 uppercase tracking-tighter">Price Impact</span>
                <span className={quote.priceImpact > 1 ? 'text-rose-500' : 'text-emerald-600'}>
                  {safeToFixed(quote.priceImpact, 2)}%
                </span>
              </div>

              {gasEstimate && (
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span className="text-[#1F1F1F]/40 uppercase tracking-tighter">Network Fee</span>
                  <span className="text-[#1F1F1F]">~${gasEstimate[selectedGasSpeed].totalCostUSD}</span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Swap Button */}
        <button
          onClick={handleSwap}
          disabled={!quote || loading}
          className={`
            w-full py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] text-sm
            flex items-center justify-center gap-2 transition-all
            ${!quote || loading 
              ? 'bg-[#1F1F1F]/20 text-[#1F1F1F]/40 cursor-not-allowed' 
              : 'bg-[#1F1F1F] text-[#EAEADF] border-2 border-[#1F1F1F] shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)] hover:translate-y-1 hover:translate-x-1 hover:shadow-none'
            }
          `}
        >
          {loading ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <>
              <Zap size={20} fill="currentColor" />
              Swap Assets
            </>
          )}
        </button>
      </div>

      {/* Gas Settings Panel Overlay */}
      <AnimatePresence>
        {showGasSettings && gasEstimate && (
          <GasSettingsPanel
            gasEstimate={gasEstimate}
            selectedSpeed={selectedGasSpeed}
            onSelectSpeed={setSelectedGasSpeed}
            slippage={slippage}
            onSlippageChange={setSlippage}
            onClose={() => setShowGasSettings(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Token Select Button Component
function SelectTokenButton({ 
  token, 
  onSelect, 
  chainId,
  assets
}: { 
  token: TokenMetadata | null; 
  onSelect: (token: TokenMetadata) => void;
  chainId: number;
  assets: any[];
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="shrink-0 flex items-center gap-2 pl-2 pr-4 py-2 bg-[#1F1F1F] text-white rounded-2xl border-2 border-[#1F1F1F] shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] hover:translate-y-0.5 hover:translate-x-0.5 hover:shadow-none transition-all"
      >
        {token ? (
          <>
            <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center overflow-hidden">
               <TokenLogo 
                 symbol={token.symbol} 
                 address={token.address} 
                 logoURI={token.logoURI} 
                 className="w-full h-full" 
                 fallbackClassName="w-full h-full text-[10px]"
               />
            </div>
            <span className="font-black text-sm tracking-tighter">{token.symbol}</span>
          </>
        ) : (
          <span className="font-black text-xs uppercase tracking-widest pl-2">Select</span>
        )}
        <ArrowDownUp size={14} className="opacity-40" />
      </button>

      {isOpen && (
        <TokenSelectDialog 
          chainId={chainId}
          assets={assets}
          onSelect={(t) => {
            onSelect(t);
            setIsOpen(false);
          }}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
}

// Gas Settings Panel Component
function GasSettingsPanel({
  gasEstimate,
  selectedSpeed,
  onSelectSpeed,
  slippage,
  onSlippageChange,
  onClose,
}: {
  gasEstimate: GasEstimate;
  selectedSpeed: 'slow' | 'normal' | 'fast';
  onSelectSpeed: (speed: 'slow' | 'normal' | 'fast') => void;
  slippage: number;
  onSlippageChange: (slippage: number) => void;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="absolute inset-x-0 -top-4 -bottom-4 z-50 bg-[#EAEADF] rounded-[2rem] p-6 flex flex-col border-4 border-[#1F1F1F]"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-black text-[#1F1F1F] italic uppercase tracking-tighter">Settings</h3>
        <button 
          onClick={onClose} 
          className="p-2 bg-white border-2 border-[#1F1F1F] rounded-xl font-black text-[10px] uppercase hover:bg-[#1F1F1F] hover:text-white transition-colors"
        >
          Close
        </button>
      </div>

      <div className="space-y-6">
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-widest text-[#1F1F1F]/40">Gas Velocity</label>
          <div className="grid grid-cols-3 gap-2">
            {(['slow', 'normal', 'fast'] as const).map((speed) => (
              <button
                key={speed}
                onClick={() => onSelectSpeed(speed)}
                className={`p-3 rounded-2xl border-2 transition-all flex flex-col items-center gap-1 ${
                  selectedSpeed === speed
                    ? 'bg-[#1F1F1F] border-[#1F1F1F] text-white'
                    : 'bg-white border-[#1F1F1F]/10 text-[#1F1F1F] hover:border-[#1F1F1F]/40'
                }`}
              >
                <div className="text-[10px] font-black uppercase tracking-widest">{speed}</div>
                <div className="text-xs font-black">${gasEstimate[speed].totalCostUSD}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-widest text-[#1F1F1F]/40">Slippage Tolerance</label>
          <div className="flex gap-2">
            {[0.1, 0.5, 1.0].map((value) => (
              <button
                key={value}
                onClick={() => onSlippageChange(value)}
                className={`flex-1 py-3 rounded-2xl border-2 font-black text-xs transition-all ${
                  slippage === value
                    ? 'bg-[#1F1F1F] border-[#1F1F1F] text-white shadow-lg'
                    : 'bg-white border-[#1F1F1F]/10 text-[#1F1F1F]/60'
                }`}
              >
                {value}%
              </button>
            ))}
            <div className="relative flex-1">
               <input
                 type="number"
                 value={slippage}
                 onChange={(e) => onSlippageChange(parseFloat(e.target.value))}
                 className="w-full h-full bg-white border-2 border-[#1F1F1F] rounded-2xl font-black text-xs text-center outline-none"
                 step="0.1"
               />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Legendary Token Select Dialog
function TokenSelectDialog({
  chainId,
  assets,
  onSelect,
  onClose,
}: {
  chainId: number;
  assets: any[];
  onSelect: (token: TokenMetadata) => void;
  onClose: () => void;
}) {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<TokenMetadata[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const initial: TokenMetadata[] = assets.map(a => ({
      symbol: a.symbol,
      name: a.name,
      address: a.tokenAddress || 'native',
      decimals: a.decimals || 18,
      logoURI: a.logoURI || a.logo,
      chainId: chainId
    }));
    setResults(initial);
  }, [assets, chainId]);

  const handleSearch = async (val: string) => {
    setSearch(val);
    if (val.length < 2) {
      const initial: TokenMetadata[] = assets.map(a => ({
        symbol: a.symbol,
        name: a.name,
        address: a.tokenAddress || 'native',
        decimals: a.decimals || 18,
        logoURI: a.logoURI || a.logo,
        chainId: chainId
      }));
      setResults(initial);
      return;
    }

    setSearching(true);
    try {
      const res = await fetch(`/api/wallet/tokens/search?chainId=${chainId}&q=${val}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data.tokens || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div 
        className="absolute inset-x-0 -top-4 -bottom-4 z-50 bg-[#EAEADF] rounded-[2rem] p-6 flex flex-col border-4 border-[#1F1F1F] animate-in slide-in-from-bottom-4 duration-300" 
        onClick={e => e.stopPropagation()}
    >
        <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-black text-[#1F1F1F] italic tracking-tighter uppercase">SELECT TOKEN</h3>
            <button onClick={onClose} className="p-2 hover:bg-[#1F1F1F]/5 rounded-full"><X size={20}/></button>
        </div>

        <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1F1F1F]/30" size={16} />
            <input 
                autoFocus
                type="text" 
                placeholder="Search name or address..." 
                value={search}
                onChange={e => handleSearch(e.target.value)}
                className="w-full bg-white border-2 border-[#1F1F1F] rounded-2xl pl-12 pr-4 py-4 text-sm font-black text-[#1F1F1F] outline-none placeholder:text-[#1F1F1F]/20 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] focus:shadow-none transition-all"
            />
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-[#1F1F1F]/10">
            {searching ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <Loader2 className="animate-spin text-[#1F1F1F]/20" size={32} />
                    <span className="text-[10px] font-black uppercase text-[#1F1F1F]/30">Scouring the chain...</span>
                </div>
            ) : results.length > 0 ? (
                results.map((t, i) => (
                    <button
                        key={i}
                        onClick={() => onSelect(t)}
                        className="w-full flex items-center justify-between p-3 bg-white border-2 border-[#1F1F1F]/5 rounded-2xl hover:border-[#1F1F1F] transition-all group active:scale-[0.98]"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[#f8f8f8] flex items-center justify-center overflow-hidden border border-[#1F1F1F]/5">
                                <TokenLogo 
                                    symbol={t.symbol} 
                                    address={t.address} 
                                    logoURI={t.logoURI} 
                                    className="w-full h-full" 
                                    fallbackClassName="w-full h-full text-xs"
                                />
                            </div>
                            <div className="text-left">
                                <div className="text-sm font-black text-[#1F1F1F] tracking-tighter">{t.symbol}</div>
                                <div className="text-[10px] font-bold text-[#1F1F1F]/40 uppercase tracking-widest truncate max-w-[120px]">{t.name}</div>
                            </div>
                        </div>
                        {assets.find(a => a.symbol === t.symbol) && (
                            <div className="text-right">
                                <div className="text-xs font-black text-emerald-600 truncate">
                                    {assets.find(a => a.symbol === t.symbol).balanceFormatted}
                                </div>
                            </div>
                        )}
                    </button>
                ))
            ) : (
                <div className="text-center py-20">
                    <span className="text-[10px] font-black uppercase text-[#1F1F1F]/20 tracking-widest">No matching assets found</span>
                </div>
            )}
        </div>
    </div>
  );
}

