"use client";

import React, { useState } from 'react';

type MainTab = 'SEND' | 'SWAP' | 'BRIDGE' | 'BUY';
type SendTab = 'STANDARD' | 'PRIVATE' | 'ENS';

interface SecureWalletModalProps {
  isOpen?: boolean;
  initialTab?: MainTab | null;
  onClose: () => void;
  userAssets?: any[];
  forceToken?: string;
  asEmbedded?: boolean;
}

const TokenSelector = ({ symbol = 'ETH', iconText = 'ET', border = false }: { symbol?: string, iconText?: string, border?: boolean }) => (
  <button className={`bg-gray-100 hover:bg-gray-200 transition-colors flex items-center space-x-2 px-3 py-2 rounded-sm ${border ? 'border border-gray-200' : ''}`}>
    <div className="w-5 h-5 bg-gray-300 text-black rounded-full flex items-center justify-center text-[9px] font-black tracking-tighter">
      {iconText}
    </div>
    <span className="font-black text-sm">{symbol}</span>
    <span className="text-[9px] font-black text-gray-400 ml-1">v</span>
  </button>
);

const SwapIcon = () => (
  <div className="flex justify-center -my-3 relative z-10">
    <button className="bg-white border border-gray-100 w-10 h-10 rounded-sm flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm">
      <span className="text-black font-black text-xs">[~]</span>
    </button>
  </div>
);

const SendView = () => {
  const [activeSendTab, setActiveSendTab] = useState<SendTab>('STANDARD');

  return (
    <div className="flex flex-col space-y-5 h-full animate-in fade-in duration-300">
      {/* Send Sub-tabs */}
      <div className="flex space-x-6 border-b border-gray-100 pt-2">
        <button 
          onClick={() => setActiveSendTab('STANDARD')}
          className={`pb-3 text-[11px] font-black tracking-widest transition-all border-b-2 ${
            activeSendTab === 'STANDARD' ? 'border-black text-black' : 'border-transparent text-gray-400 hover:text-black'
          }`}
        >
          STANDARD
        </button>
        <button 
          onClick={() => setActiveSendTab('PRIVATE')}
          className={`pb-3 text-[11px] font-black tracking-widest transition-all border-b-2 flex items-center space-x-1 ${
            activeSendTab === 'PRIVATE' ? 'border-black text-black' : 'border-transparent text-gray-400 hover:text-black'
          }`}
        >
          <span>PRIVATE</span>
          <span className="text-[9px] text-gray-300 ml-1">[SECURE]</span>
        </button>
        <button 
          onClick={() => setActiveSendTab('ENS')}
          className={`pb-3 text-[11px] font-black tracking-widest transition-all border-b-2 ${
            activeSendTab === 'ENS' ? 'border-black text-black' : 'border-transparent text-gray-400 hover:text-black'
          }`}
        >
          ENS
        </button>
      </div>

      {/* Amount Input */}
      <div className="border border-gray-100 rounded-3xl p-5 hover:border-gray-200 transition-colors">
        <div className="text-gray-400 text-[10px] font-black tracking-widest mb-3">AMOUNT</div>
        <div className="flex justify-between items-center mb-6">
          <input 
            type="text" 
            placeholder="0.00" 
            className="text-[2rem] font-black text-gray-200 focus:text-black outline-none w-1/2 bg-transparent placeholder-gray-200 transition-colors"
          />
          <TokenSelector />
        </div>
        <div className="flex justify-between items-center text-[10px] font-black text-gray-400 tracking-widest">
          <span>$0.00</span>
          <span>BALANCE: 0.00</span>
        </div>
      </div>

      {/* To Input */}
      <div className="border border-gray-100 rounded-sm p-4 flex items-center hover:border-gray-200 transition-colors mb-2 mt-auto">
        <div className="text-gray-400 text-[10px] font-black tracking-widest w-12">TO</div>
        <input 
          type="text" 
          placeholder="0x..." 
          className="flex-1 text-gray-400 text-lg font-mono outline-none bg-transparent placeholder-gray-300"
        />
        <button className="w-8 h-8 bg-gray-100 hover:bg-gray-200 transition-colors rounded-sm flex items-center justify-center">
          <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
          </svg>
        </button>
      </div>

      {/* Footer Button */}
      <button className="w-full bg-gray-200 text-gray-400 font-black text-[11px] tracking-widest py-4 rounded-sm mt-4 transition-colors cursor-not-allowed">
        REVIEW SEND {'->'}
      </button>
    </div>
  );
};

const SwapView = () => {
  return (
    <div className="flex flex-col h-full animate-in fade-in duration-300 pt-4">
      {/* Network Info */}
      <div className="flex justify-between items-center mb-6 px-1">
        <div className="text-[10px] text-gray-400 font-black tracking-widest flex items-center space-x-2">
          <span>NETWORK:</span>
          <span className="text-black">ETHEREUM</span>
        </div>
        <div className="text-[10px] text-gray-400 font-black tracking-widest flex items-center space-x-2">
          <span>MAX SLIPPAGE:</span>
          <span className="text-black text-sm">0.5%</span>
        </div>
      </div>

      {/* You Pay */}
      <div className="border border-gray-100 rounded-3xl p-5 relative hover:border-gray-200 transition-colors">
        <div className="text-gray-400 text-[10px] font-black tracking-widest mb-3">YOU PAY</div>
        <div className="flex justify-between items-center mb-6">
          <input 
            type="text" 
            placeholder="0.00" 
            className="text-[2rem] font-black text-gray-200 focus:text-black outline-none w-1/2 bg-transparent placeholder-gray-200 transition-colors"
          />
          <TokenSelector />
        </div>
        <div className="flex justify-between items-center text-[10px] font-black text-gray-400 tracking-widest">
          <span>BALANCE: 0.00</span>
          <button className="text-gray-500 hover:text-black transition-colors">MAX</button>
        </div>
      </div>

      <SwapIcon />

      {/* You Receive */}
      <div className="border border-gray-100 rounded-3xl p-5 hover:border-gray-200 transition-colors mt-auto">
        <div className="text-gray-400 text-[10px] font-black tracking-widest mb-3">YOU RECEIVE</div>
        <div className="flex justify-between items-center mb-6">
          <input 
            type="text" 
            placeholder="0.00" 
            className="text-[2rem] font-black text-gray-400 focus:text-black outline-none w-1/2 bg-transparent placeholder-gray-400 transition-colors"
          />
          <TokenSelector />
        </div>
      </div>

      {/* Footer Button */}
      <button className="w-full bg-gray-200 text-gray-400 font-black text-[11px] tracking-widest py-4 rounded-sm mt-6 transition-colors cursor-not-allowed">
        EXECUTE SWAP {'->'}
      </button>
    </div>
  );
};

const BridgeView = () => {
  return (
    <div className="flex flex-col h-full animate-in fade-in duration-300 pt-4">
      {/* From Chain */}
      <div className="border border-gray-100 rounded-3xl p-5 relative hover:border-gray-200 transition-colors">
        <div className="flex justify-between items-center mb-5">
          <div className="text-gray-400 text-[10px] font-black tracking-widest">FROM CHAIN & TOKEN</div>
          <button className="bg-gray-100 text-[10px] font-black text-gray-600 px-3 py-1.5 rounded-sm flex items-center space-x-2">
            <div className="w-3 h-3 bg-white border border-gray-200 rounded-full flex items-center justify-center">
               <img src="https://cryptologos.cc/logos/ethereum-eth-logo.svg?v=025" alt="ETH" className="w-2 h-2" />
            </div>
            <span>ETHEREUM</span>
          </button>
        </div>
        <div className="flex justify-between items-center mb-6">
          <input 
            type="text" 
            placeholder="0.00" 
            className="text-[2rem] font-black text-gray-200 focus:text-black outline-none w-1/2 bg-transparent placeholder-gray-200 transition-colors"
          />
          <TokenSelector />
        </div>
        <div className="flex justify-between items-center text-[10px] font-black text-gray-400 tracking-widest">
          <span>BALANCE: 0.00</span>
          <button className="text-gray-500 hover:text-black transition-colors">MAX</button>
        </div>
      </div>

      <SwapIcon />

      {/* To Chain */}
      <div className="border border-gray-100 rounded-3xl p-5 hover:border-gray-200 transition-colors mt-auto">
        <div className="flex justify-between items-center mb-5">
          <div className="text-gray-400 text-[10px] font-black tracking-widest">TO CHAIN & TOKEN</div>
          <button className="bg-black !!text-white text-[10px] font-black px-3 py-1.5 rounded-sm flex items-center space-x-2">
            <span>BNB SMART CHAIN</span>
          </button>
        </div>
        <div className="flex justify-between items-center mb-6">
          <input 
            type="text" 
            placeholder="0.00" 
            className="text-[2rem] font-black text-gray-400 focus:text-black outline-none w-1/2 bg-transparent placeholder-gray-400 transition-colors"
          />
          <TokenSelector />
        </div>
      </div>

      {/* Footer Button */}
      <button className="w-full bg-gray-200 text-gray-400 font-black text-[11px] tracking-widest py-4 rounded-sm mt-6 transition-colors cursor-not-allowed">
        EXECUTE BRIDGE {'->'}
      </button>
    </div>
  );
};

const BuyView = () => {
  return (
    <div className="flex flex-col items-center h-full animate-in fade-in duration-300 pt-6">
      {/* Badge */}
      <div className="border border-gray-200 text-black text-[9px] font-black tracking-widest px-4 py-2 rounded-sm mb-6">
        FIAT ON-RAMP
      </div>

      {/* Header */}
      <h3 className="text-[1.35rem] font-black tracking-tight mb-3">DIRECT DEPOSIT</h3>
      <p className="text-gray-500 text-[11px] text-center max-w-[280px] leading-relaxed mb-8">
        Convert fiat to crypto instantly via MoonPay. 
        <br/>Assets delivered to your on-chain address.
      </p>

      {/* Token Tabs */}
      <div className="flex space-x-0 w-full mb-6">
        <button className="flex-1 py-3.5 text-[10px] font-black tracking-widest bg-black !!text-white border border-black rounded-l-sm transition-colors">ETH</button>
        <button className="flex-1 py-3.5 text-[10px] font-black tracking-widest bg-white text-gray-400 border-y border-gray-100 hover:border-gray-200 hover:text-black transition-colors">BTC</button>
        <button className="flex-1 py-3.5 text-[10px] font-black tracking-widest bg-white text-gray-400 border border-l-0 border-gray-100 hover:border-gray-200 hover:text-black transition-colors">USDC</button>
        <button className="flex-1 py-3.5 text-[10px] font-black tracking-widest bg-white text-gray-400 border border-l-0 border-gray-100 hover:border-gray-200 hover:text-black rounded-r-sm transition-colors">MATIC</button>
      </div>

      {/* Fiat Allocation */}
      <div className="border border-gray-100 rounded-3xl p-5 w-full hover:border-gray-200 transition-colors mb-4 mt-auto">
        <div className="text-gray-400 text-[10px] font-black tracking-widest mb-4">FIAT ALLOCATION</div>
        <div className="flex items-center mb-6">
          <span className="text-gray-300 text-3xl font-black mr-2">$</span>
          <input 
            type="text" 
            defaultValue="100" 
            className="text-3xl font-black text-black outline-none w-1/2 bg-transparent"
          />
          <div className="flex-1 text-right text-gray-400 font-black text-sm">USD</div>
        </div>
        <div className="flex justify-between items-center text-[10px] font-black pt-4 border-t border-gray-50 border-dashed">
          <span className="text-gray-400 tracking-widest">EST. RECEIPT (LIVE)</span>
          <span className="text-black">~0.052265 ETH</span>
        </div>
      </div>

      {/* Destination Wallet */}
      <div className="bg-gray-50 rounded-sm p-4 w-full flex items-center justify-between mb-6">
        <div className="text-gray-400 text-[10px] font-black tracking-widest">DESTINATION WALLET</div>
        <div className="bg-white border border-gray-200 text-black text-[11px] font-bold px-3 py-2 rounded-sm shadow-sm tracking-wide">
          0x78831C...D87b4a
        </div>
      </div>

      {/* Footer Button */}
      <button className="w-full bg-black !!text-white hover:bg-gray-900 font-black text-[11px] tracking-widest py-4 rounded-sm transition-colors">
        INITIALIZE SECURE INGRESS {'->'}
      </button>
    </div>
  );
};

export const SecureWalletModal: React.FC<SecureWalletModalProps> = ({ 
  isOpen = true, 
  initialTab = 'SEND', 
  onClose,
  userAssets,
  forceToken,
  asEmbedded
}) => {
  const [activeMainTab, setActiveMainTab] = useState<MainTab>(
    (initialTab === 'SEND' || initialTab === 'SWAP' || initialTab === 'BRIDGE' || initialTab === 'BUY') 
      ? initialTab 
      : 'SEND'
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 font-sans antialiased selection:bg-black selection:!text-white">
      {/* Modal Container */}
      <div className="bg-white rounded-[2rem] w-full max-w-[420px] shadow-2xl overflow-hidden relative border border-gray-100 flex flex-col h-[700px]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-7 pb-4">
          <div className="flex items-center space-x-3">
            <div className="bg-black !!text-white text-[10px] font-black tracking-widest px-3 py-1.5 rounded-sm">
              SECURE
            </div>
            <h2 className="text-2xl font-black tracking-tight">WALLET</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-black transition-colors text-[10px] font-black tracking-widest"
          >
            [ CLOSE ]
          </button>
        </div>

        {/* Main Tabs */}
        <div className="px-7 py-2">
          <div className="bg-gray-100/80 rounded-[1.5rem] p-1.5 flex justify-between items-center relative">
            {['SEND', 'SWAP', 'BRIDGE', 'BUY'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveMainTab(tab as MainTab)}
                className={`flex-1 text-center py-3 rounded-[1rem] text-[10px] font-black tracking-widest transition-all duration-300 ${
                  activeMainTab === tab 
                    ? 'bg-black !!text-white shadow-md' 
                    : 'text-gray-400 hover:text-black hover:bg-gray-200/50'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="px-7 pb-7 flex-1 overflow-y-auto custom-scrollbar flex flex-col">
          {activeMainTab === 'SEND' && <SendView />}
          {activeMainTab === 'SWAP' && <SwapView />}
          {activeMainTab === 'BRIDGE' && <BridgeView />}
          {activeMainTab === 'BUY' && <BuyView />}
        </div>
      </div>
    </div>
  );
};

export default SecureWalletModal;
