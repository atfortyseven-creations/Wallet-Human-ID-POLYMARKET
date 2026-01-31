"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowDownUp, Settings, Zap, TrendingDown, AlertCircle } from 'lucide-react';
import { getSwapQuote, buildSwapTransaction, formatSwapRoute, type SwapQuote } from '@/lib/wallet/swap';
import { getGasEstimates, type GasEstimate } from '@/lib/wallet/gas';
import { searchTokens, type TokenMetadata } from '@/lib/wallet/tokens';

interface SwapInterfaceProps {
  userAddress: string;
  chainId: number;
  onSwap: (txData: any) => void;
}

export default function SwapInterface({ userAddress, chainId, onSwap }: SwapInterfaceProps) {
  const [fromToken, setFromToken] = useState<TokenMetadata | null>(null);
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
      const amountWei = (BigInt(parseFloat(fromAmount) * 10 ** fromToken.decimals)).toString();
      
      const swapQuote = await getSwapQuote(chainId, {
        fromTokenAddress: fromToken.address,
        toTokenAddress: toToken.address,
        amount: amountWei,
        fromAddress: userAddress,
        slippage,
      });

      setQuote(swapQuote);
      
      // Format to amount
      const toAmountFormatted = (parseFloat(swapQuote.toAmount) / 10 ** toToken.decimals).toFixed(6);
      setToAmount(toAmountFormatted);

      // Get gas estimates
      const gas = await getGasEstimates(chainId, 200000n);
      setGasEstimate(gas);
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
      const amountWei = (BigInt(parseFloat(fromAmount) * 10 ** fromToken.decimals)).toString();
      
      const txData = await buildSwapTransaction(chainId, {
        fromTokenAddress: fromToken.address,
        toTokenAddress: toToken.address,
        amount: amountWei,
        fromAddress: userAddress,
        slippage,
      });

      onSwap(txData);
    } catch (error) {
      console.error('Error building swap:', error);
    } finally {
      setLoading(false);
    }
  };

  const switchTokens = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    setFromAmount(toAmount);
    setToAmount('');
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="bg-[#EAEADF] rounded-3xl shadow-xl p-6 space-y-4 border-2 border-[#1F1F1F]/10">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-black text-[#1F1F1F]">Swap</h2>
          <button
            onClick={() => setShowGasSettings(!showGasSettings)}
            className="p-2 rounded-full hover:bg-[#1F1F1F]/10 transition-colors"
          >
            <Settings size={20} className="text-[#1F1F1F]" />
          </button>
        </div>

        {/* From Token */}
        <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-sm text-[#1F1F1F]/70">
            <span>You Pay</span>
            <span>Balance: 0.00</span>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="number"
              value={fromAmount}
              onChange={(e) => setFromAmount(e.target.value)}
              placeholder="0.0"
              className="flex-1 bg-transparent text-3xl font-bold text-[#1F1F1F] outline-none"
            />
            <SelectTokenButton token={fromToken} onSelect={setFromToken} chainId={chainId} />
          </div>
        </div>

        {/* Swap Direction Button */}
        <div className="flex justify-center -my-2 relative z-10">
          <button
            onClick={switchTokens}
            className="p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-all hover:rotate-180 duration-300"
          >
            <ArrowDownUp size={20} className="text-[#1F1F1F]" />
          </button>
        </div>

        {/* To Token */}
        <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-sm text-[#1F1F1F]/70">
            <span>You Receive</span>
            <span>Balance: 0.00</span>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="number"
              value={toAmount}
              readOnly
              placeholder="0.0"
              className="flex-1 bg-transparent text-3xl font-bold text-[#1F1F1F] outline-none"
            />
            <SelectTokenButton token={toToken} onSelect={setToToken} chainId={chainId} />
          </div>
        </div>

        {/* Quote Details */}
        <AnimatePresence>
          {quote && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-[#1F1F1F]/5 rounded-2xl p-4 space-y-3 text-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-[#1F1F1F]/70">Rate</span>
                <span className="font-bold text-[#1F1F1F]">
                  1 {fromToken?.symbol} = {parseFloat(quote.price).toFixed(6)} {toToken?.symbol}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#1F1F1F]/70">Price Impact</span>
                <div className="flex items-center gap-1">
                  {quote.priceImpact > 1 && <AlertCircle size={14} className="text-orange-500" />}
                  <span className={`font-bold ${quote.priceImpact > 1 ? 'text-orange-500' : 'text-[#1F1F1F]'}`}>
                    {quote.priceImpact.toFixed(2)}%
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#1F1F1F]/70">Route</span>
                <span className="font-bold text-[#1F1F1F]">{formatSwapRoute(quote.route)}</span>
              </div>

              {gasEstimate && (
                <div className="flex items-center justify-between">
                  <span className="text-[#1F1F1F]/70">Gas Fee</span>
                  <span className="font-bold text-[#1F1F1F]">
                    ${gasEstimate[selectedGasSpeed].totalCostUSD}
                  </span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Swap Button */}
        <button
          onClick={handleSwap}
          disabled={!quote || loading}
          className="w-full py-4 bg-[#1F1F1F] text-[#EAEADF] rounded-2xl font-bold hover:bg-[#1F1F1F]/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-[#EAEADF] border-t-transparent" />
              Loading...
            </>
          ) : (
            <>
              <Zap size={20} />
              Swap
            </>
          )}
        </button>
      </div>

      {/* Gas Settings Panel */}
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
  chainId 
}: { 
  token: TokenMetadata | null; 
  onSelect: (token: TokenMetadata) => void;
  chainId: number;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-white rounded-xl font-bold hover:bg-white/80 transition-all flex items-center gap-2 border border-[#1F1F1F]/10"
      >
        {token ? (
          <>
            {token.logoURI && <img src={token.logoURI} alt={token.symbol} className="w-6 h-6 rounded-full" />}
            {token.symbol}
          </>
        ) : (
          'Select Token'
        )}
      </button>

      {isOpen && (
        <TokenSelectDialog 
          chainId={chainId}
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="mt-4 bg-[#EAEADF] rounded-3xl shadow-xl p-6 space-y-4 border-2 border-[#1F1F1F]/10"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-black text-[#1F1F1F]">Settings</h3>
        <button onClick={onClose} className="text-[#1F1F1F]/70 hover:text-[#1F1F1F]">Close</button>
      </div>

      {/* Gas Speed Selector */}
      <div className="space-y-2">
        <label className="text-sm font-bold text-[#1F1F1F]">Gas Speed</label>
        <div className="grid grid-cols-3 gap-2">
          {(['slow', 'normal', 'fast'] as const).map((speed) => (
            <button
              key={speed}
              onClick={() => onSelectSpeed(speed)}
              className={`p-3 rounded-xl text-center transition-all ${
                selectedSpeed === speed
                  ? 'bg-[#1F1F1F] text-[#EAEADF]'
                  : 'bg-white/50 hover:bg-white/80'
              }`}
            >
              <div className="font-bold capitalize">{speed}</div>
              <div className="text-xs">${gasEstimate[speed].totalCostUSD}</div>
              <div className="text-xs opacity-70">{gasEstimate[speed].estimatedTime}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Slippage Tolerance */}
      <div className="space-y-2">
        <label className="text-sm font-bold text-[#1F1F1F]">Slippage Tolerance</label>
        <div className="flex gap-2">
          {[0.1, 0.5, 1.0].map((value) => (
            <button
              key={value}
              onClick={() => onSlippageChange(value)}
              className={`flex-1 py-2 rounded-xl font-bold transition-all ${
                slippage === value
                  ? 'bg-[#1F1F1F] text-[#EAEADF]'
                  : 'bg-white/50 hover:bg-white/80'
              }`}
            >
              {value}%
            </button>
          ))}
          <input
            type="number"
            value={slippage}
            onChange={(e) => onSlippageChange(parseFloat(e.target.value))}
            className="w-20 px-3 py-2 bg-white/50 rounded-xl font-bold text-center outline-none"
            step="0.1"
          />
        </div>
      </div>
    </motion.div>
  );
}

// Token Select Dialog (simplified - would be more complex in production)
function TokenSelectDialog({
  chainId,
  onSelect,
  onClose,
}: {
  chainId: number;
  onSelect: (token: TokenMetadata) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#EAEADF] rounded-3xl p-6 max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-2xl font-black text-[#1F1F1F] mb-4">Select Token</h3>
        {/* Token list would go here */}
        <p className="text-[#1F1F1F]/70 text-center py-8">Token selection UI</p>
      </motion.div>
    </div>
  );
}
