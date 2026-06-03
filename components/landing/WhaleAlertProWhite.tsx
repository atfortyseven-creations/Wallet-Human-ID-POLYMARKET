"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowRight, Shield, Activity, Globe, Zap, 
  Database, Cpu, CheckCircle2, LogIn, Layers, LifeBuoy
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import { RemoteLottie } from '@/components/ui/RemoteLottie';
import { SystemFooter } from '@/components/landing/SystemFooter';

//  Types 
interface PricingTier {
  id: string;
  name: string;
  priceMonthly: number;
  tagline: string;
  accentColor: string;
  badge?: string;
  highlight?: boolean;
  features: { text: string; included: boolean }[];
}

const PRICING_TIERS: PricingTier[] = [
  {
    id: 'STARTER',
    name: 'Whale Starter',
    priceMonthly: 0,
    tagline: 'Basic on-chain visibility.',
    accentColor: '#888888',
    features: [
      { text: 'Real-time Whale Alerts', included: true },
      { text: 'Basic Market Analytics', included: true },
      { text: 'Community Chat Access', included: true },
      { text: 'Priority Node Access', included: false }
    ]
  },
  {
    id: 'PRO',
    name: 'Whale Pro',
    priceMonthly: 49,
    tagline: 'Professional tracking suite.',
    accentColor: '#00C076',
    badge: 'Popular',
    highlight: true,
    features: [
      { text: 'All Starter Features', included: true },
      { text: 'MEV Detection & Alerts', included: true },
      { text: 'Advanced Portfolio Tracking', included: true },
      { text: '0.1s Telemetry Latency', included: true }
    ]
  },
  {
    id: 'INSTITUTIONAL',
    name: 'Whale Alert Pro',
    priceMonthly: 299,
    tagline: 'The ultimate firm-wide edge.',
    accentColor: '#9945FF',
    features: [
      { text: 'All Pro Features', included: true },
      { text: 'API Access & Webhooks', included: true },
      { text: 'Custom Forensic Reporting', included: true },
      { text: 'Dedicated Account Manager', included: true }
    ]
  },
  {
    id: 'LEGENDARY',
    name: 'Legendary',
    priceMonthly: 999,
    tagline: 'Zero-latency execution.',
    accentColor: '#FF9500',
    features: [
      { text: 'All Institutional Features', included: true },
      { text: 'Co-located Node Hosting', included: true },
      { text: 'Direct Market Execution', included: true },
      { text: '24/7 Forensic Concierge', included: true }
    ]
  }
];

//  Components 

function PricingCard(tier: PricingTier) {
  const { isConnected } = useAccount();
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      className={`group relative flex flex-col p-10 rounded-[2rem] border transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 ${
        tier.highlight ? 'bg-slate-950 text-white border-slate-800 shadow-2xl' : 'bg-white border-slate-100 hover:border-slate-300'
      }`}
    >
      {tier.badge && (
        <div className="absolute top-8 right-8 px-4 py-1.5 bg-[#0044CC] text-white rounded-full font-mono text-[9px] font-black uppercase tracking-widest shadow-lg animate-pulse">
          {tier.badge}
        </div>
      )}
      
      <span className="font-mono text-[11px] font-black uppercase tracking-[0.3em] mb-8 opacity-40">{tier.id}</span>
      <h3 className="text-4xl font-bold tracking-tight mb-4">{tier.name}</h3>
      <div className="flex items-baseline gap-2 mb-2">
        <span className="text-6xl font-black tracking-tighter">{tier.priceMonthly}</span>
        <span className="text-xs font-mono font-bold uppercase tracking-widest opacity-40">/month</span>
      </div>
      <p className={`font-medium mb-10 leading-relaxed text-sm ${tier.highlight ? 'text-slate-400' : 'text-slate-500'}`}>{tier.tagline}</p>
      
      <div className="space-y-4 mb-12 flex-1">
        {tier.features.map((f, i) => (
          <div key={i} className="flex items-center gap-4">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border ${
              f.included ? (tier.highlight ? 'bg-[#0044CC] border-[#0044CC]' : 'bg-slate-950 border-slate-800') : 'opacity-20'
            }`}>
              {f.included && <CheckCircle2 size={12} className="text-white" />}
            </div>
            <span className={`text-[12px] font-bold tracking-wide ${f.included ? 'opacity-100' : 'opacity-20'}`}>
              {f.text}
            </span>
          </div>
        ))}
      </div>
      
      <Link 
        href="/connect" 
        className={`w-full py-5 rounded-[1rem] font-mono text-[11px] font-black uppercase tracking-[0.2em] text-center transition-all ${
          tier.highlight ? 'bg-white text-slate-950 hover:bg-slate-100 shadow-xl' : 'bg-slate-950 text-white hover:bg-black'
        }`}
      >
        {tier.id === 'STARTER' ? (
          isConnected ? 'Actual Plan' : 'Try'
        ) : (
          'Purchase Whale'
        )}
      </Link>
    </motion.div>
  );
}

export default function WhaleAlertProWhite() {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { isConnected } = useAccount();
  const [isDisconnectGuarded, setIsDisconnectGuarded] = useState(false);

  useEffect(() => {
    setMounted(true);
    // [ABSOLUTE DISCONNECT FIREWALL] wagmi may auto-reconnect even after logout.
    // If the guard is active, treat the wallet as disconnected so we redirect to /connect
    // instead of bypassing auth by going directly to /portfolio.
    try {
      const guarded =
        sessionStorage.getItem('__disconnected__') === '1' ||
        localStorage.getItem('__disconnected__') === '1';
      setIsDisconnectGuarded(guarded);
    } catch { /* storage blocked */ }
  }, []);

  // The effective connected state respects the explicit disconnect guard.
  const isEffectivelyConnected = isConnected && !isDisconnectGuarded;

  const handleEnterTerminal = () => {
    if (isEffectivelyConnected) router.push('/portfolio');
    else router.push('/connect');
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#0A0A0A] font-sans overflow-x-hidden selection:bg-[#0044CC]/20">
      
      {/*  NAVIGATION  */}
      <nav className="fixed top-0 w-full z-[100] px-6 md:px-12 py-6 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-8 pointer-events-auto">
          <Link href="/" className="group flex items-center gap-4 bg-white/90 backdrop-blur-xl border border-slate-200 px-6 py-3 rounded-2xl hover:border-slate-300 transition-all shadow-sm">
            <div className="relative w-6 h-6">
              <Image src="/official-whale-monochrome.png" alt="System Whale" fill className="object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="text-[12px] font-black uppercase tracking-tight leading-none">Whale Alert</span>
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Network</span>
            </div>
          </Link>
          
          <div className="hidden lg:flex items-center gap-2 bg-white/90 backdrop-blur-xl border border-slate-200 px-2 py-1.5 rounded-2xl shadow-sm">
            <Link href="/dashboard" className="flex items-center gap-2 px-4 py-2 hover:bg-black/5 rounded-xl transition-all group">
              <Activity size={16} className="text-[#0044CC]" />
              <span className="text-[11px] font-bold tracking-wide text-slate-600 group-hover:text-slate-950">Terminal</span>
            </Link>
            <Link href="/portfolio" className="flex items-center gap-2 px-4 py-2 hover:bg-black/5 rounded-xl transition-all group">
              <Layers size={16} className="text-slate-400 group-hover:text-slate-950" />
              <span className="text-[11px] font-bold tracking-wide text-slate-600 group-hover:text-slate-950">Whale Profile</span>
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-4 sm:gap-8 pointer-events-auto">
          <div className="hidden md:flex items-center gap-8">
            {['Capabilities', 'Pricing', 'FAQ'].map(item => (
              <a key={item} href={`#${item.toLowerCase()}`} className="text-[12px] font-bold tracking-wide text-slate-500 hover:text-slate-950 transition-colors">{item}</a>
            ))}
          </div>
          <button
            onClick={handleEnterTerminal}
            className="flex items-center gap-3 px-8 py-4 bg-[#0A0A0A] text-white text-[12px] font-bold tracking-wider rounded-2xl hover:bg-black transition-all shadow-xl"
          >
            {mounted && isEffectivelyConnected ? (
              <><span>Enter Dashboard</span><div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" /></>
            ) : (
              <><LogIn size={14} /><span>Connect Wallet</span></>
            )}
          </button>
        </div>
      </nav>

      {/*  HERO SECTION (NESTR STYLE)  */}
      <section className="pt-40 pb-20 px-6 lg:px-12 max-w-[1400px] mx-auto flex flex-col lg:flex-row items-center gap-16 lg:gap-24 min-h-[90vh]">
        <div className="w-full lg:w-1/2 space-y-10 relative z-10 text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-4 px-6 py-2 bg-white border border-slate-200 rounded-full shadow-sm"
          >
            <div className="w-2 h-2 rounded-full bg-[#0044CC] animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-600">System Analytics v3.0</span>
          </motion.div>
          
          <h1 className="text-[48px] sm:text-[64px] lg:text-[80px] font-black text-[#0A0A0A] leading-[1.0] tracking-tight">
            See the market <br />
            <span className="text-[#0044CC]">before it moves.</span>
          </h1>
          
          <p className="text-[18px] sm:text-[22px] font-medium text-slate-500 leading-relaxed max-w-2xl mx-auto lg:mx-0">
            Whale Alert Network is the institutional platform for self-managing crypto portfolios. We intercept global mempool data so you can track massive liquidity shifts instantly.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-6 justify-center lg:justify-start pt-4">
            <button
              onClick={handleEnterTerminal}
              className="flex items-center justify-center gap-4 px-10 py-5 w-full sm:w-auto bg-[#0044CC] text-white rounded-2xl text-[14px] font-bold tracking-wide hover:bg-[#003399] transition-colors shadow-[0_10px_30px_rgba(0,68,204,0.3)]"
            >
              Start Tracking Now <ArrowRight size={18} />
            </button>
            <a href="#capabilities" className="flex items-center justify-center gap-4 px-10 py-5 w-full sm:w-auto bg-white border border-slate-200 text-[#0A0A0A] rounded-2xl text-[14px] font-bold tracking-wide hover:bg-black/5 transition-colors">
              How it works
            </a>
          </div>
        </div>
        
        <div className="w-full lg:w-1/2 relative aspect-square flex items-center justify-center bg-white rounded-[3rem] border border-slate-100 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.05)]">
            <RemoteLottie path="Isometric data analysis.json" className="scale-110 w-full max-w-[600px]" />
        </div>
      </section>

      {/*  WHY WHALE ALERT NETWORK: BLOCKS  */}
      <section id="capabilities" className="py-24 px-6 lg:px-12 space-y-32">
        
        {/* Block 1 */}
        <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row items-center gap-16 lg:gap-32">
            <div className="w-full lg:w-1/2 order-2 lg:order-1 bg-white rounded-[3rem] border border-slate-100 shadow-sm p-12 flex items-center justify-center aspect-square">
                <RemoteLottie path="Connected world.json" className="w-full max-w-[600px] scale-110" />
            </div>
            <div className="w-full lg:w-1/2 order-1 lg:order-2 space-y-8">
                <div className="w-12 h-12 rounded-2xl bg-[#0044CC]/10 flex items-center justify-center mb-6">
                    <Globe size={24} className="text-[#0044CC]" />
                </div>
                <h2 className="text-[36px] sm:text-[48px] font-black text-[#0A0A0A] leading-[1.1] tracking-tight">
                    Global Mempool Interception.
                </h2>
                <p className="text-[18px] text-slate-500 leading-relaxed font-medium">
                    The blockchain is a global ledger, but retail traders only see transactions after they are confirmed. By the time the news breaks, the market has already moved.
                </p>
                <p className="text-[18px] text-slate-500 leading-relaxed font-medium">
                    Our infrastructure intercepts pending transactions directly from the mempools of 14 major networks. We parse this raw data in milliseconds, allowing you to witness institutional capital flight or accumulation before it reflects on the price chart. You see the future; they see the past.
                </p>
                <div className="flex items-center gap-6 pt-4 border-t border-slate-100 mt-8">
                    <div className="flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-[#0044CC]" /> <span className="font-bold text-sm">14 Networks</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-[#0044CC]" /> <span className="font-bold text-sm">&lt; 100ms Latency</span>
                    </div>
                </div>
            </div>
        </div>

        {/* Block 2 */}
        <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row items-center gap-16 lg:gap-32">
            <div className="w-full lg:w-1/2 space-y-8">
                <div className="w-12 h-12 rounded-2xl bg-[#0044CC]/10 flex items-center justify-center mb-6">
                    <Activity size={24} className="text-[#0044CC]" />
                </div>
                <h2 className="text-[36px] sm:text-[48px] font-black text-[#0A0A0A] leading-[1.1] tracking-tight">
                    Institutional Trade Detection.
                </h2>
                <p className="text-[18px] text-slate-500 leading-relaxed font-medium">
                    Whales attempt to hide their massive orders by splitting them across decentralized exchanges or utilizing dark pools. Our heuristic engine acts as an inescapable net.
                </p>
                <p className="text-[18px] text-slate-500 leading-relaxed font-medium">
                    By clustering wallet behaviors and tracing topological graphs in real-time, the System Protocol flags OTC deals, sudden liquidity injections, and coordinated dumping behaviors instantly. We translate complex hexadecimal contract interactions into plain-English, actionable alerts.
                </p>
            </div>
            <div className="w-full lg:w-1/2 bg-white rounded-[3rem] border border-slate-100 shadow-sm p-12 flex items-center justify-center aspect-square">
                <RemoteLottie path="Trade.json" className="w-full max-w-[600px] scale-125" />
            </div>
        </div>

        {/* Block 3 */}
        <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row items-center gap-16 lg:gap-32">
            <div className="w-full lg:w-1/2 order-2 lg:order-1 bg-white rounded-[3rem] border border-slate-100 shadow-sm p-12 flex items-center justify-center aspect-square">
                <RemoteLottie path="DeeWork About Blockchain.json" className="w-full max-w-[600px] scale-110" />
            </div>
            <div className="w-full lg:w-1/2 order-1 lg:order-2 space-y-8">
                <div className="w-12 h-12 rounded-2xl bg-[#0044CC]/10 flex items-center justify-center mb-6">
                    <Database size={24} className="text-[#0044CC]" />
                </div>
                <h2 className="text-[36px] sm:text-[48px] font-black text-[#0A0A0A] leading-[1.1] tracking-tight">
                    Decentralized Node Mesh.
                </h2>
                <p className="text-[18px] text-slate-500 leading-relaxed font-medium">
                    During extreme market volatility, public RPC endpoints fail. Centralized APIs go down precisely when you need them most. We built an architecture that refuses to break.
                </p>
                <p className="text-[18px] text-slate-500 leading-relaxed font-medium">
                    The Whale Alert Network is powered by a globally distributed mesh of dedicated blockchain nodes. This physical layer ensures absolute redundancy. If an entire region goes offline, our traffic instantly routes through alternative clusters, guaranteeing 99.99% uptime and zero mock data.
                </p>
            </div>
        </div>

      </section>

      {/*  PRICING SECTION  */}
      <section id="pricing" className="py-32 px-6 lg:px-12 bg-white border-t border-slate-100">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center space-y-6 mb-20">
            <h2 className="text-[48px] sm:text-[64px] font-black text-[#0A0A0A] tracking-tight">Straightforward <span className="text-[#0044CC]">Pricing.</span></h2>
            <p className="text-[20px] text-slate-500 max-w-2xl mx-auto font-medium">Choose the analytics tier that fits your operational needs. Cancel or upgrade your smart contract subscription at any time.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {PRICING_TIERS.map((tier, i) => (
              <PricingCard key={i} {...tier} />
            ))}
          </div>
        </div>
      </section>

      {/*  FAQ SECTION  */}
      <section id="faq" className="py-32 px-6 lg:px-12 bg-[#FFFFFF] border-t border-slate-100">
        <div className="max-w-[1000px] mx-auto">
            <div className="text-center mb-20 space-y-6">
                <h2 className="text-[48px] font-black text-[#0A0A0A] tracking-tight">Frequently Asked Questions</h2>
            </div>
            
            <div className="space-y-6">
                {[
                    { q: "Is the data really live?", a: "Yes. Our proprietary node network streams mempool data with a latency of under 100ms. We do not rely on delayed third-party APIs. You are observing the blockchain's state before blocks are even mined." },
                    { q: "How is my privacy protected?", a: "We operate on a Zero-Knowledge paradigm. We use End-to-End Encryption (E2EE) and never store your wallet's private keys. All session data is cryptographically ephemeral and bound to your local device." },
                    { q: "Do I need to be a programmer to use this?", a: "No. The System Engine translates complex hexadecimal contract data into clear, human-readable alerts and beautiful UI dashboards." },
                    { q: "Can I cancel my tier at any time?", a: "Absolutely. Subscriptions are managed transparently. You can modify or terminate your access instantly through the settings dashboard with zero friction." }
                ].map((item, i) => (
                    <div key={i} className="bg-white border border-slate-100 rounded-3xl p-8 sm:p-10 hover:shadow-lg transition-all duration-300">
                        <h3 className="text-[20px] font-bold text-[#0A0A0A] mb-4">{item.q}</h3>
                        <p className="text-slate-500 font-medium leading-relaxed text-[16px]">{item.a}</p>
                    </div>
                ))}
            </div>
        </div>
      </section>

      <SystemFooter />

    </div>
  );
}
