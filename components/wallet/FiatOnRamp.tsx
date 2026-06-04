"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, ExternalLink, RefreshCw, AlertCircle } from 'lucide-react';
import { getMoonPayUrl } from '@/lib/wallet/fiat';
import { useWalletStore } from '@/lib/store/wallet-store';

export default function FiatOnRamp() {
  const [amount, setAmount] = useState('10');
  const [currency, setCurrency] = useState('EUR');
  const [crypto, setCrypto] = useState('BTC');
  const [prices, setPrices] = useState<Record<string, number>>({ BTC: 0, ETH: 0, USDC: 1, MATIC: 0 });
  const [isLoadingPrices, setIsLoadingPrices] = useState(true);

  // [PRODUCTION FIX] Use real connected wallet address instead of null address
  const { address } = useWalletStore();
  const walletAddress = address || '';

  // [PRODUCTION FIX] Fetch real-time prices instead of hardcoded values
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        setIsLoadingPrices(true);
        const response = await fetch('/api/prices?symbols=BTC,ETH,MATIC,USDC');
        if (response.ok) {
          const data = await response.json();
          setPrices(data);
        } else {
          // Fallback to CoinGecko if our API fails
          const cgResponse = await fetch(
            'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,matic-network,usd-coin&vs_currencies=usd'
          );
          if (cgResponse.ok) {
            const cgData = await cgResponse.json();
            setPrices({
              BTC: cgData.bitcoin?.usd || 0,
              ETH: cgData.ethereum?.usd || 0,
              MATIC: cgData['matic-network']?.usd || 0,
              USDC: cgData['usd-coin']?.usd || 1
            });
          }
        }
      } catch (error: unknown) {
        console.error('Failed to fetch prices:', error);
      } finally {
        setIsLoadingPrices(false);
      }
    };

    fetchPrices();
    // Refresh prices every 30 seconds
    const interval = setInterval(fetchPrices, 30000);
    return () => clearInterval(interval);
  }, []);
  
  const moonPayUrl = getMoonPayUrl(
    walletAddress,
    crypto,
    parseFloat(amount) || 0
  );

  const estimatedCrypto = amount && prices[crypto] > 0
    ? (parseFloat(amount) / prices[crypto]).toFixed(6)
    : '0.00';

  return (
    <div className="bg-white/50 backdrop-blur-md p-6 rounded-3xl border-2 border-[#1F1F1F]/10">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-black text-[#1F1F1F]">Buy Crypto</h3>
        <CreditCard className="text-[#1F1F1F]/30" />
      </div>

      {!walletAddress && (
        <div className="mb-4 p-3 bg-orange-500/10 border border-orange-500/20 rounded-xl flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-orange-500 mt-0.5 shrink-0" />
          <p className="text-xs text-orange-700 font-medium">
            Please connect your wallet first to purchase crypto.
          </p>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="text-xs font-bold text-[#1F1F1F]/60 mb-1 block">You Pay</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="1"
              step="1"
              className="flex-1 bg-white px-4 py-3 rounded-xl font-mono text-lg font-bold outline-none border border-transparent focus:border-[#1F1F1F]/20"
            />
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="bg-white px-3 rounded-xl font-bold outline-none cursor-pointer"
            >
              <option value="EUR">EUR</option>
              <option value="USD">USD</option>
              <option value="GBP">GBP</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-[#1F1F1F]/60 mb-1 block">You Receive (Est.)</label>
          <div className="flex gap-2">
            <input
              readOnly
              value={isLoadingPrices ? 'Loading...' : estimatedCrypto}
              className="flex-1 bg-[#1F1F1F]/5 px-4 py-3 rounded-xl font-mono text-lg font-bold outline-none text-[#1F1F1F]/50"
            />
            <select
              value={crypto}
              onChange={(e) => setCrypto(e.target.value)}
              className="bg-white px-3 rounded-xl font-bold outline-none cursor-pointer"
            >
              <option value="BTC">BTC</option>
              <option value="ETH">ETH</option>
              <option value="USDC">USDC</option>
              <option value="MATIC">MATIC</option>
            </select>
          </div>
        </div>

        <a
          href={walletAddress ? moonPayUrl : '#'}
          target={walletAddress ? "_blank" : undefined}
          rel="noopener noreferrer"
          onClick={(e) => {
            if (!walletAddress) {
              e.preventDefault();
              alert('Please connect your wallet first');
            }
          }}
          className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold transition-all mt-4 ${
            walletAddress
              ? 'bg-[#1F1F1F] text-[#EAEADF] hover:bg-[#1F1F1F]/90'
              : 'bg-[#1F1F1F]/30 text-[#EAEADF]/50 cursor-not-allowed'
          }`}
        >
          Continue with MoonPay
          <ExternalLink size={16} />
        </a>

        <div className="flex items-center justify-center gap-2 text-xs text-[#1F1F1F]/40 mt-2">
          <RefreshCw size={12} className={isLoadingPrices ? 'animate-spin' : ''} />
          <span>Quotes update every 30s</span>
        </div>
      </div>
    </div>
  );
}

