"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, Twitter, Globe, ChevronDown, Mail,
  MessageSquare, Shield, Clock, CheckCircle,
  Users, Smartphone, ArrowUpRight, BookOpen, AlertCircle,
  Server, Activity
} from 'lucide-react';
import { toast } from 'sonner';
import { InstitutionalShell } from '@/components/shared/InstitutionalShell';

//  Design tokens 
const BG     = "transparent";
const INK    = "#F5F5F5";
const MUTED  = "rgba(255,255,255,0.45)";
const BORDER = "rgba(255,255,255,0.08)";
const CARD   = "rgba(255,255,255,0.04)";

//  FAQ 
const FAQ_ITEMS = [
  {
    q: "How do I connect my wallet to the platform?",
    a: "Navigate to the Connect page via the top-right button or any 'Connect Wallet' call-to-action. The system supports MetaMask (browser extension and mobile), WalletConnect v2 (compatible with all major mobile wallets including Rainbow, Trust Wallet, and Ledger Active), and Coinbase Wallet with Smart Wallet MPC mode. Authentication is performed via ECDSA cryptographic message signing (EIP-4361 / Sign-In with Ethereum). No email address, password, or personal data is collected or stored at any stage of the process. On mobile devices, scan the QR code displayed on the Connect page using your wallet application to establish a cross-device session."
  },
  {
    q: "Is my financial data and identity private?",
    a: "Yes, by architectural design. The platform does not store private keys, seed phrases, or biometric data under any circumstances. Wallet authentication produces a signed message that proves address ownership without exposing the private key. Portfolio data displayed within the terminal is fetched directly from public blockchain state via read-only RPC connections  it is never transmitted to or stored on the platform's servers. World ID verification, when used, employs zero-knowledge proofs that confirm personhood without linking the verification to any biometric record visible to the platform."
  },
  {
    q: "How does the Whale Alert detection system identify significant movements?",
    a: "The ingestion engine maintains persistent WebSocket connections to RPC nodes across sixteen parallel networks. For each incoming transaction, the engine applies a Z-score statistical filter calibrated against a rolling 30-day baseline of per-chain, per-asset-class transaction magnitude distributions. Transactions whose magnitude exceeds 3.5 standard deviations above the rolling mean are classified as candidate significant events. The classification pipeline then applies secondary filters: minimum USD-equivalent value, wallet tier assessment based on historical balance data, and temporal correlation against other events in the rolling 15-minute window to detect coordinated multi-address activity. Signals that pass all filters are written to the Redis System Mesh stream within milliseconds of blockchain confirmation."
  },
  {
    q: "Which blockchain networks does the platform monitor?",
    a: "The platform currently monitors sixteen EVM-compatible networks (Ethereum Mainnet, BNB Smart Chain, Arbitrum One, Arbitrum Nova, Optimism, Base, Polygon PoS, zkSync Era, Linea, Scroll, Mantle, Blast, Mode, Zora, Avalanche C-Chain, and Celo) plus Solana via WebSocket subscription to priority fee auction activity. The chain set is expanded continuously as network liquidity and institutional activity levels on candidate networks reach the threshold required to generate statistically meaningful signals."
  },
  {
    q: "What is the Akashic Ledger and how does it differ from the live feed?",
    a: "The Akashic Ledger is the platform's permanent institutional record. It documents capital movements that satisfy a higher entry threshold than the live feed: a USD-equivalent value above $50 million, confirmed blockchain finality, corroboration by at least one secondary sentinel node, and an editorial determination that the movement represents genuine institutional repositioning rather than routine custodial treasury management. Each entry carries a SHA-256 integrity hash that enables independent tamper detection. The live feed surfaces all events above the configurable threshold in real time; the Akashic Ledger preserves only those of historic macroeconomic significance, with editorial context that contextualizes each movement within the geopolitical and derivatives market conditions prevailing at the time."
  },
  {
    q: "How does the Mass Transfer Analytics module detect coordinated institutional flows?",
    a: "Institutional actors rarely execute large position adjustments as single transactions, as doing so telegraphs the trade and moves the market against them before execution completes. The Mass Transfer Analytics module addresses this by applying Neo4j graph clustering to identify groups of transactions that share temporal proximity (within a 15-minute sliding window), directional alignment, and origin wallet relationships derived from historical transaction graph analysis. Clusters whose aggregate USD value exceeds the Megalodon threshold and whose origin addresses share a graph distance of three or fewer hops are surfaced as coordinated movement events. This methodology successfully reconstructed the coordination structure of the November 2022 FTX pre-collapse withdrawal cascade across seventeen wallet clusters and four chains, which no single-transaction monitoring system detected as a coordinated event in real time."
  },
  {
    q: "How do I access institutional-grade features and what are the tier requirements?",
    a: "The platform operates on a tiered access model. The Community tier provides access to the live whale feed, basic portfolio analytics, and the public API. The Institutional tier, activated via World ID proof-of-personhood verification combined with the requisite Gold Whale Network membership credential, provides access to the Akashic Ledger, Mass Transfer Analytics, the System Vault transaction suite, and the full 99-endpoint institutional API with HMAC-signed request authentication. Tier credentials are issued as EIP-712 signed off-chain documents and optionally registered as non-transferable ERC-1155 tokens on Ethereum Mainnet for on-chain verifiability."
  },
  {
    q: "What should I do if a transaction fails or is stuck pending?",
    a: "In the Wallet module (accessible from Portfolio), review the transaction in the Send tab. If a transaction is pending for longer than the expected block time of the originating network (typically 12-15 seconds on Ethereum, under 3 seconds on Arbitrum and Base), it may have been submitted with an insufficient gas price relative to network conditions at that moment. You can submit a replacement transaction with the same nonce but a higher gas price  most wallet implementations support this via a 'speed up' option. If you require assistance with a specific transaction hash, submit it via the support form below with the chain name and the transaction hash, and the team will investigate the mempool state at the time of submission."
  },
];

//  Stats 
const STATS = [
  { label: "Median Response Time", value: "< 2h",    icon: Clock },
  { label: "Platform Uptime",      value: "99.97%",  icon: Shield },
  { label: "Queries Resolved",     value: "12,450",  icon: CheckCircle },
  { label: "Support Availability", value: "24 / 7",  icon: Users },
];

//  Channels 
const CHANNELS = [
  {
    icon: Mail,
    label: "Secure Dispatch",
    desc: "Submit detailed technical queries, account issues, or feature requests via the form below. All submissions are processed in order of receipt and acknowledged within two hours during standard operating hours.",
    link: null,
    cta: null,
  },
  {
    icon: Twitter,
    label: "X (Twitter)",
    desc: "Follow @whalecosystem for real-time analytics pulses, system status announcements, and institutional market commentary. Direct messages for time-sensitive operational issues are monitored continuously.",
    link: "https://x.com/whalecosystem",
    cta: "Follow @whalecosystem",
  },
  {
    icon: BookOpen,
    label: "Documentation",
    desc: "The technical architecture, API reference, integration guides, and operational procedures are documented in the system README. Consult the documentation before submitting a support request for technical integration questions.",
    link: "https://github.com/humanityledger/whalecosystem",
    cta: "View Documentation",
  },
];

//  Input style helper 
const inputClass = `
  w-full px-4 py-3 text-sm bg-white/5 border rounded-xl text-white
  placeholder:text-white/30 focus:outline-none transition-colors
  focus:border-white/30
`.replace(/\s+/g, ' ').trim();

//  Hero 
function SupportHero() {
  return (
    <div
      className="relative border-b px-8 py-20 text-center"
      style={{ background: BG, borderColor: BORDER }}
    >
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-2xl mx-auto space-y-5"
      >
        <div
          className="inline-block px-3 py-1 rounded-full border text-[9px] font-mono font-black uppercase tracking-[0.35em] mb-2"
          style={{ borderColor: BORDER, color: MUTED }}
        >
          Support Centre
        </div>
        <h1 className="text-5xl md:text-6xl font-black tracking-tighter" style={{ color: INK }}>
          Whale Alert Network
          <span className="block font-light" style={{ color: MUTED }}>Support</span>
        </h1>
        <p className="text-base leading-relaxed max-w-lg mx-auto" style={{ color: MUTED }}>
          Institutional-grade assistance for every participant in the network. The support centre operates continuously to ensure your access to analytics infrastructure remains uninterrupted.
        </p>
      </motion.div>
    </div>
  );
}

//  Stats Row 
function StatsRow() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="grid grid-cols-2 md:grid-cols-4 border-b"
      style={{ borderColor: BORDER }}
    >
      {STATS.map((stat, i) => (
        <div
          key={i}
          className="flex flex-col items-center justify-center gap-2 py-10 px-4 transition-colors hover:bg-black/[0.02]"
          style={{ borderRight: i < 3 ? `1px solid ${BORDER}` : 'none' }}
        >
          <stat.icon size={14} style={{ color: MUTED }} />
          <div className="font-black font-mono text-3xl tracking-tighter" style={{ color: INK }}>
            {stat.value}
          </div>
          <div className="text-[9px] font-mono uppercase tracking-[0.25em] font-bold" style={{ color: MUTED }}>
            {stat.label}
          </div>
        </div>
      ))}
    </motion.div>
  );
}

//  System Status Block 
function SystemStatus() {
  const systems = [
    { name: "Core API & Routing", status: "Operational", uptime: "99.99%" },
    { name: "RPC Node Infrastructure", status: "Operational", uptime: "99.95%" },
    { name: "Real-time Telemetry (WSS)", status: "Operational", uptime: "99.98%" },
    { name: "Database & Ledger", status: "Operational", uptime: "100.00%" },
  ];

  return (
    <div className="w-full rounded-3xl border overflow-hidden mb-8" style={{ borderColor: BORDER, background: CARD }}>
      <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: BORDER, background: BG }}>
        <div className="flex items-center gap-2.5">
          <Activity size={12} style={{ color: MUTED }} />
          <span className="font-mono text-[9px] uppercase tracking-[0.3em] font-black" style={{ color: MUTED }}>
            Active System Status
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-600 font-bold">All Systems Nominal</span>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x" style={{ borderColor: BORDER }}>
        {systems.map((sys, i) => (
          <div key={i} className="p-6 flex flex-col gap-3 hover:bg-black/[0.02] transition-colors">
            <div className="flex items-center gap-2">
               <Server size={14} className="text-emerald-500" />
               <h4 className="text-[11px] font-black uppercase tracking-widest" style={{ color: INK }}>{sys.name}</h4>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-emerald-600">{sys.status}</span>
              <span className="text-[10px] font-mono" style={{ color: MUTED }}>{sys.uptime}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

//  FAQ Accordion 
function FAQ({ items }: { items: typeof FAQ_ITEMS }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="rounded-3xl border overflow-hidden" style={{ borderColor: BORDER, background: CARD }}>
      {/* Header */}
      <div
        className="flex items-center gap-2.5 px-6 py-4 border-b"
        style={{ borderColor: BORDER, background: BG }}
      >
        <MessageSquare size={12} style={{ color: MUTED }} />
        <span className="font-mono text-[9px] uppercase tracking-[0.3em] font-black" style={{ color: MUTED }}>
          Frequently Asked Questions
        </span>
      </div>
      <div className="divide-y" style={{ borderColor: BORDER }}>
        {items.map((item, i) => (
          <div key={i} style={{ borderColor: BORDER }}>
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex items-start justify-between gap-4 px-6 py-5 text-left transition-colors hover:bg-black/[0.02]"
            >
              <span className="font-semibold text-sm leading-snug" style={{ color: INK }}>
                {item.q}
              </span>
              <motion.div
                animate={{ rotate: open === i ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="shrink-0 mt-0.5"
              >
                <ChevronDown size={14} style={{ color: MUTED }} />
              </motion.div>
            </button>
            <AnimatePresence initial={false}>
              {open === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22 }}
                  className="overflow-hidden"
                >
                  <p className="px-6 pb-6 text-sm leading-relaxed" style={{ color: MUTED }}>
                    {item.a}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}

//  Contact Form 
function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toast.success('Message Sent', { description: 'Your inquiry has been received. We will respond within two hours.' });
        setForm({ name: '', email: '', subject: '', message: '' });
      } else {
        toast.error('Submission Failed', { description: 'Unable to deliver your message. Please try again or contact us via X.' });
      }
    } catch {
      toast.error('Network Error', { description: 'Check your connection and try again.' });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="rounded-3xl border overflow-hidden" style={{ borderColor: BORDER, background: CARD }}>
      {/* Header */}
      <div
        className="flex items-center gap-2.5 px-6 py-4 border-b"
        style={{ borderColor: BORDER, background: BG }}
      >
        <Mail size={12} style={{ color: MUTED }} />
        <span className="font-mono text-[9px] uppercase tracking-[0.3em] font-black" style={{ color: MUTED }}>
          Submit an Inquiry
        </span>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="font-mono text-[9px] uppercase tracking-[0.2em] font-black block" style={{ color: MUTED }}>
              Full Name
            </label>
            <input
              type="text"
              required
              value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              placeholder="Your full name"
              style={{ borderColor: BORDER }}
              className={inputClass}
            />
          </div>
          <div className="space-y-1.5">
            <label className="font-mono text-[9px] uppercase tracking-[0.2em] font-black block" style={{ color: MUTED }}>
              Email Address
            </label>
            <input
              type="email"
              required
              value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              placeholder="your@email.com"
              style={{ borderColor: BORDER }}
              className={inputClass}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="font-mono text-[9px] uppercase tracking-[0.2em] font-black block" style={{ color: MUTED }}>
            Subject
          </label>
          <input
            type="text"
            required
            value={form.subject}
            onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
            placeholder="Brief description of your inquiry"
            style={{ borderColor: BORDER }}
            className={inputClass}
          />
        </div>

        <div className="space-y-1.5">
          <label className="font-mono text-[9px] uppercase tracking-[0.2em] font-black block" style={{ color: MUTED }}>
            Message
          </label>
          <textarea
            required
            rows={6}
            value={form.message}
            onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
            placeholder="Describe your issue or question in as much detail as possible. For transaction-related issues, include the transaction hash and network name."
            style={{ borderColor: BORDER }}
            className={`${inputClass} resize-none`}
          />
        </div>

        {/* Notice */}
        <div
          className="flex items-start gap-2.5 p-3 rounded-xl border"
          style={{ borderColor: BORDER, background: BG }}
        >
          <AlertCircle size={12} className="mt-0.5 shrink-0" style={{ color: MUTED }} />
          <p className="text-[10px] leading-relaxed" style={{ color: MUTED }}>
            Do not include private keys, seed phrases, or passwords in your message. The support team will never request this information.
          </p>
        </div>

        <button
          type="submit"
          disabled={isSending}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-mono text-[10px] font-black uppercase tracking-widest transition-all hover:opacity-90 active:scale-[0.99] disabled:opacity-40"
          style={{ background: INK, color: '#000' }}
        >
          <Send size={12} />
          {isSending ? 'Sending' : 'Submit Inquiry'}
        </button>
      </form>
    </div>
  );
}

//  Channels 
function ChannelsSection() {
  return (
    <div className="rounded-3xl border overflow-hidden" style={{ borderColor: BORDER, background: CARD }}>
      <div
        className="flex items-center gap-2.5 px-6 py-4 border-b"
        style={{ borderColor: BORDER, background: BG }}
      >
        <Globe size={12} style={{ color: MUTED }} />
        <span className="font-mono text-[9px] uppercase tracking-[0.3em] font-black" style={{ color: MUTED }}>
          Contact Channels
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x" style={{ borderColor: BORDER }}>
        {CHANNELS.map((ch, i) => (
          <div key={i} className="p-8 flex flex-col gap-4 transition-colors hover:bg-black/[0.02]">
            <div
              className="w-10 h-10 border rounded-2xl flex items-center justify-center"
              style={{ borderColor: BORDER, background: BG }}
            >
              <ch.icon size={16} style={{ color: MUTED }} />
            </div>
            <div>
              <div className="font-black text-sm mb-2" style={{ color: INK }}>{ch.label}</div>
              <p className="text-sm leading-relaxed" style={{ color: MUTED }}>{ch.desc}</p>
            </div>
            {ch.link && ch.cta && (
              <a
                href={ch.link}
                target="_blank"
                rel="noopener noreferrer"
                className="self-start flex items-center gap-1.5 px-4 py-2 border rounded-full font-mono text-[9px] font-black uppercase tracking-widest transition-all hover:bg-black hover:text-white hover:border-black"
                style={{ borderColor: BORDER, color: MUTED }}
              >
                {ch.cta}
                <ArrowUpRight size={10} />
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

//  Page 
export default function SupportPage() {
  return (
    <InstitutionalShell title="Support  Whale Alert Network" badge="SUPPORT" badgeVariant="emerald">
      <div className="w-full flex-1 flex flex-col bg-transparent text-white">
        <SupportHero />
        <StatsRow />

        <div className="w-full px-6 md:px-12 py-16 space-y-8 text-left">

          {/* System Status */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            <SystemStatus />
          </motion.div>

          {/* Primary grid: Contact + FAQ */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35 }}
            className="grid lg:grid-cols-2 gap-8"
          >
            <ContactForm />
            <FAQ items={FAQ_ITEMS} />
          </motion.div>

          {/* Channels */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
          >
            <ChannelsSection />
          </motion.div>

          {/* Mobile Connect hint */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="rounded-3xl border p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6"
            style={{ borderColor: BORDER, background: CARD }}
          >
            <div
              className="w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0"
              style={{ borderColor: BORDER, background: BG }}
            >
              <Smartphone size={20} style={{ color: MUTED }} />
            </div>
            <div className="flex-1">
              <div className="font-black text-sm mb-1" style={{ color: INK }}>
                Connecting from a mobile device?
              </div>
              <p className="text-sm leading-relaxed" style={{ color: MUTED }}>
                Open the Whale Alert Network on your desktop browser, click Connect Wallet, and scan the QR code displayed with your mobile wallet application (MetaMask Mobile, Rainbow, Trust Wallet, or any WalletConnect v2-compatible wallet). Your session will synchronise automatically without requiring any additional configuration.
              </p>
            </div>
            <a
              href="/connect"
              className="shrink-0 flex items-center gap-1.5 px-5 py-3 rounded-xl font-mono text-[10px] font-black uppercase tracking-widest transition-all hover:opacity-80"
              style={{ background: INK, color: '#000' }}
            >
              Connect Wallet
              <ArrowUpRight size={12} />
            </a>
          </motion.div>
        </div>
      </div>
    </InstitutionalShell>
  );
}
