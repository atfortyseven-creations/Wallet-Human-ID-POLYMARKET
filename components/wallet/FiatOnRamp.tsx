"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, DollarSign, ExternalLink, ArrowRight, Loader2 } from 'lucide-react';
import { getMoonPayUrl, getFiatQuote, type FiatQuote } from '@/lib/wallet/fiat';
import { getChainName } from '@/lib/wallet/chains';

interface FiatOnRampProps {
  walletAddress: string;
}

export default function FiatOnRamp({ walletAddress }: FiatOnRampProps) {
  const [amount, setAmount] = useState<string>('100');
  const [crypto, setCrypto] = useState('ETH');
  const [quote, setQuote] = useState<FiatQuote | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGetQuote = async () => {
    setLoading(true);
    try {
      const q = await getFiatQuote(parseFloat(amount), crypto);
      setQuote(q);
    } catch (error) {
      console.error('Quote error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBuy = () => {
    const url = getMoonPayUrl(walletAddress, crypto, parseFloat(amount));
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="bg-[#EAEADF] rounded-3xl p-6 border-2 border-[#1F1F1F]/10">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-[#1F1F1F] rounded-full flex items-center justify-center">
          <CreditCard size={24} className="text-[#EAEADF]" />
        </div>
        <div>
          <h2 className="text-xl font-black text-[#1F1F1F]">Buy Crypto</h2>
          <p className="text-sm text-[#1F1F1F]/70">Credit Card / Bank Transfer</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Input */}
        <div className="relative">
          <label className="block text-sm font-bold text-[#1F1F1F] mb-2">You Spend (USD)</label>
          <div className="relative">
            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1F1F1F]/50" size={20} />
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white/50 rounded-2xl text-xl font-black text-[#1F1F1F] outline-none focus:bg-white/80 transition-all"
            />
          </div>
        </div>

        {/* Crypto Select */}
        <div>
          <label className="block text-sm font-bold text-[#1F1F1F] mb-2">You Receive</label>
          <div className="grid grid-cols-3 gap-2">
            {['ETH', 'USDC', 'MATIC'].map((c) => (
              <button
                key={c}
                onClick={() => setCrypto(c)}
                className={`py-3 rounded-xl font-bold transition-all ${
                  crypto === c
                    ? 'bg-[#1F1F1F] text-[#EAEADF]'
                    : 'bg-white/50 hover:bg-white/80 border border-[#1F1F1F]/10'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Quote Button */}
        <button
          onClick={handleGetQuote}
          disabled={loading}
          className="w-full py-3 bg-white/50 hover:bg-white/80 rounded-xl font-bold text-[#1F1F1F] transition-all flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="animate-spin" /> : 'Get Quote'}
        </button>

        {/* Quote Result */}
        <AnimatePresence>
          {quote && !loading && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="p-4 bg-white/50 rounded-2xl border border-[#1F1F1F]/10 space-y-2 mt-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[#1F1F1F]/70">Rate</span>
                  <span className="font-bold text-[#1F1F1F]">1 {crypto} = ${quote.quoteCurrencyPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#1F1F1F]/70">Fees</span>
                  <span className="font-bold text-[#1F1F1F]">${(quote.feeAmount + quote.networkFeeAmount).toFixed(2)}</span>
                </div>
                <div className="h-px bg-[#1F1F1F]/10 my-2" />
                <div className="flex justify-between items-center">
                  <span className="font-bold text-[#1F1F1F]">Receive Estimate</span>
                  <span className="text-xl font-black text-[#1F1F1F]">
                    {quote.quoteCurrencyAmount.toFixed(4)} {crypto}
                  </span>
                </div>

                <button
                  onClick={handleBuy}
                  className="w-full py-4 mt-4 bg-[#1F1F1F] text-[#EAEADF] rounded-xl font-bold hover:bg-[#1F1F1F]/90 transition-all flex items-center justify-center gap-2 shadow-lg"
                >
                  Proceed to Payment
                  <ArrowRight size={20} />
                </button>
                
                <p className="text-center text-xs text-[#1F1F1F]/50 mt-2">
                  Powered by MoonPay
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
