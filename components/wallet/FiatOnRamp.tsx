"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, ExternalLink, RefreshCw } from 'lucide-react';

export default function FiatOnRamp() {
  const [amount, setAmount] = useState('100');
  const [currency, setCurrency] = useState('USD');
  const [crypto, setCrypto] = useState('ETH');

  const moonPayUrl = `https://buy.moonpay.com?apiKey=${process.env.NEXT_PUBLIC_MOONPAY_KEY}&currencyCode=${crypto}&baseCurrencyCode=${currency}&baseCurrencyAmount=${amount}`;

  return (
    <div className="bg-white/50 backdrop-blur-md p-6 rounded-3xl border-2 border-[#1F1F1F]/10">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-black text-[#1F1F1F]">Buy Crypto</h3>
        <CreditCard className="text-[#1F1F1F]/30" />
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-xs font-bold text-[#1F1F1F]/60 mb-1 block">You Pay</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="flex-1 bg-white px-4 py-3 rounded-xl font-mono text-lg font-bold outline-none border border-transparent focus:border-[#1F1F1F]/20"
            />
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="bg-white px-3 rounded-xl font-bold outline-none cursor-pointer"
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-[#1F1F1F]/60 mb-1 block">You Receive (Est.)</label>
          <div className="flex gap-2">
            <input
              readOnly
              value={amount ? (parseFloat(amount) / 3200).toFixed(4) : '0.00'} // Mock rate
              className="flex-1 bg-[#1F1F1F]/5 px-4 py-3 rounded-xl font-mono text-lg font-bold outline-none text-[#1F1F1F]/50"
            />
            <select
              value={crypto}
              onChange={(e) => setCrypto(e.target.value)}
              className="bg-white px-3 rounded-xl font-bold outline-none cursor-pointer"
            >
              <option value="ETH">ETH</option>
              <option value="USDC">USDC</option>
              <option value="MATIC">MATIC</option>
            </select>
          </div>
        </div>

        <a
          href={moonPayUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 bg-[#1F1F1F] text-[#EAEADF] py-4 rounded-xl font-bold hover:bg-[#1F1F1F]/90 transition-all mt-4"
        >
          Continue with MoonPay
          <ExternalLink size={16} />
        </a>

        <div className="flex items-center justify-center gap-2 text-xs text-[#1F1F1F]/40 mt-2">
          <RefreshCw size={12} />
          <span>Quotes update every 30s</span>
        </div>
      </div>
    </div>
  );
}
