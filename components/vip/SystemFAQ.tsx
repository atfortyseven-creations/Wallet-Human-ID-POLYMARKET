"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, HelpCircle, Zap, Shield, Globe, Cpu, BarChart3, Database, Fingerprint, Activity } from 'lucide-react';

interface FAQItem {
    q: string;
    a: string;
    tag: string;
}

const FAQ_DATA: FAQItem[][] = [
    // PAGE 1: Core Architecture
    [
        { q: "How does Whale Alert Network exceed standard transaction tracking?", a: "While explorers provide raw ledger data, we provide forensic reconstruction of intents. Our engine decodes complex multichain sequences that explorers often mislabel as generic transfers.", tag: "ARCHITECTURE" },
        { q: "What is the real-time latency difference?", a: "We operate on a proprietary mempool stream that precedes traditional RPC providers by 50-150ms, allowing users to identify move signatures before they are finalized.", tag: "PERFORMANCE" },
        { q: "Does the system support L2 native forensic analysis?", a: "Yes. Unlike generic systems, we analyze Arbitrum and Optimism sequencer batches directly to identify liquidity shifts at the rollup level.", tag: "NETWORKS" },
        { q: "How is identity tracking superior to legacy platforms?", a: "Our system identifies 'Ghost Wallets'addresses that move funds without explicit entity labelingusing behavioral fingerprinting rather than simple public tags.", tag: "INTELLIGENCE" },
        { q: "What role does ZK-Analytics play?", a: "We use zero-knowledge proofs to allow high-tier alerts without compromising the original provider's anonymity, preserving the alpha of the source.", tag: "PRIVACY" },
        { q: "Is the institutional data feed compatible with standard Protobuf?", a: "Our v4 schema is fully compliant with modern gRPC streams, allowing direct ingestion into institutional algorithmic trading systems.", tag: "PROTOCOL" },
        { q: "How do we handle block reorgs on high-speed chains?", a: "We use a 'Virtual State Buffer' that validates transaction finality across three concurrent confirmation forks before flagging an alert.", tag: "RELIABILITY" },
        { q: "What protection does the system offer against MEV?", a: "Our alerts include a 'Slippage Risk Score' (SRS) that predicts if a transaction is likely to be front-run by institutional bots.", tag: "SECURITY" },
        { q: "Can the system detect hardware wallet signatures?", a: "We can identify patterns consistent with Ledger/Trezor cold storage movements, differentiating them from high-velocity hot wallet churn.", tag: "FORENSICS" },
        { q: "What is the System Analytics Network (SIN)?", a: "It is our decentralized node layer that ensures data integrity and resistance to regulatory censorship of on-chain information.", tag: "GOVERNANCE" }
    ],
    // PAGE 2: Security & Privacy
    [
        { q: "How does our forensic engine differ from compliance tools?", a: "Compliance tools are focused on reporting; we are focused on alpha. We prioritize identifying profit-driving movements over mere regulatory reporting.", tag: "SECURITY" },
        { q: "Can users verify the accuracy of the alerts?", a: "Every alert includes a direct cryptographically signed hash that can be verified against the raw ledger state in real-time.", tag: "VERIFICATION" },
        { q: "Is user search history private?", a: "All search queries are processed via MPC (Multi-Party Computation) layers, ensuring that not even our engineers can see your specific interests.", tag: "PRIVACY" },
        { q: "How do we identify institutional migrations?", a: "Our system maintains a database of 2.4 million identified institutional wallets, updated every 10 minutes by our stochastic engine.", tag: "DATA" },
        { q: "What is the 'Stochastic Impact' score?", a: "It is a predictive metric (0-100) that estimates the likely price volatility a transaction will cause within the next 4 hours.", tag: "PREDICTION" },
        { q: "Does the system monitor cross-chain bridges?", a: "Yes, we track all major bridges (Across, Stargate, etc.) to identify when capital is shifting between ecosystems.", tag: "BRIDGES" },
        { q: "How do we handle obfuscated transactions?", a: "Our 'Entropy Filter' analyzes the volume and timing of mixer exits to re-link fragmented liquidity to its original source.", tag: "FORENSICS" },
        { q: "What is the advantage of our 'Ivory-and-Ink' theme?", a: "It is designed for institutional focuseliminating visual noise while highlighting critical delta changes with high-contrast tactical accents.", tag: "UX" },
        { q: "Can I receive alerts via private Telegram bots?", a: "Yes, the system supports PGP-encrypted webhooks for delivery of analytics to external secure endpoints.", tag: "ALERTS" },
        { q: "How do we detect automated market-making?", a: "We identify HFT signatures that indicate automated accumulation vs. manual institutional disposals.", tag: "ALGORITHMS" }
    ],
    // PAGE 3: Market Analysis
    [
        { q: "How does our tracker compare to legacy 'Smart Money' filters?", a: "We focus on 'Legendary' statuswallets with >$100M AUM and sustained 24-month profitability, rather than just transaction count.", tag: "INTEL" },
        { q: "Do we monitor NFT movements?", a: "We track high-value ERC-721/1155 transfers (>$50k) as indicators of overall ecosystem sentiment and liquidity shifts.", tag: "NFT" },
        { q: "What is the 'Tactical Momentum' panel?", a: "A real-time visualizer of directional buy/sell pressure across 24 assets, calculated from aggregated order flow.", tag: "MOMENTUM" },
        { q: "Does the system support Bitcoin Ordinals tracking?", a: "Our engine indexes Bitcoin scripts to identify high-value inscription movements and their impact on network congestion.", tag: "BITCOIN" },
        { q: "How is 'Global Intensity' calculated?", a: "It's an aggregate of total USD value moved globally in the last 60 minutes, normalized against a 30-day moving average.", tag: "METRICS" },
        { q: "Can I create custom 'Target Lists'?", a: "Users can define specific wallet clusters to monitor, with custom alert thresholds for each group.", tag: "CUSTOMIZATION" },
        { q: "How do we handle stablecoin de-pegging signals?", a: "The system monitors 3pool and AMM imbalances 24/7, flagging 1\u03c3-3\u03c3 deviations as high-priority systemic risk alerts.", tag: "STABLES" },
        { q: "What is the optional local verification setup?", a: "For advanced analytics tiers you can run a lightweight verifier that compares our published feeds against chain data—but it is optional, not required for normal use.", tag: "NODES" },
        { q: "Do we provide API access for hedge funds?", a: "Yes, our Institutional API offers raw data streams with 99.99% uptime and <10ms internal processing overhead.", tag: "API" },
        { q: "How does the system identify 'Wash Trading'?", a: "We flag recursive A-B-C-A transaction patterns that artificially inflate volume without changing net asset ownership.", tag: "INTEGRITY" }
    ],
    // PAGE 4: DeFi Mastery
    [
        { q: "How do we track Flash Loan attacks in progress?", a: "We monitor the pool balance of major lending protocols; any sudden 10% draw-down triggers an 'Immediate Forensic Trace'.", tag: "DEFI" },
        { q: "What is the 'Health' metric for Aave?", a: "We calculate the liquidation proximity of the top 50 borrowers to predict potential systemic cascading events.", tag: "LENDING" },
        { q: "Can the system detect stealth token launches?", a: "We monitor new contract deployments with initial liquidity >50 ETH to identify early institutional-backed projects.", tag: "LAUNCHES" },
        { q: "How does our 'DEX Flow' panel differ from public trackers?", a: "We filter out bot-driven noise to show only 'Organic Asset Migration'actual human-driven capital shifts.", tag: "DEX" },
        { q: "Is the system compatible with Uniswap V4 hooks?", a: "Our engine is ready to analyze hooks for fee-dynamic adjustments that institutional actors use to minimize trade impact.", tag: "V4" },
        { q: "How do we track 'Vampire Attacks' between protocols?", a: "We monitor TVL migration patterns to alert users which protocols are gaining or losing system dominance.", tag: "GOVERNANCE" },
        { q: "What is the 'Impermanent Loss' risk alert?", a: "A tool for LPs that signals when high volatility is likely to wipe out trading fee gains in a specific pair.", tag: "LIQUIDITY" },
        { q: "Can we identify 'Team Wallet' disposals?", a: "We track dev-related wallets identified during the genesis event to flag potential rug-pull or early exit behaviors.", tag: "SECURITY" },
        { q: "How do we monitor 'Curated Lists' on Curve?", a: "We index vote-escrowed (ve) token shifts to predict governance-driven incentive changes before they go live.", tag: "CURVE" },
        { q: "What is the 'Yield Farmer' Protocol?", a: "Identification of $1M+ capital entries into new yield optimizers, indicating high-risk high-reward institutional interest.", tag: "YIELD" }
    ],
    // PAGE 5: Multi-Chain Logistics
    [
        { q: "How does the system handle Cosmos IBC?", a: "We track packet transfers between zones to identify capital flow across the entire Cosmos Hub ecosystem.", tag: "COSMOS" },
        { q: "Can we track movements on Polkadot Parachains?", a: "Our XCM (Cross-Consensus Messaging) analyzer identifies when value move between Acala, Moonbeam, and the Relay Chain.", tag: "DOT" },
        { q: "Does the system monitor Base (Coinbase L2)?", a: "Full integration with the Base sequencer to identify institutional onboarding from the Coinbase ecosystem.", tag: "L2" },
        { q: "How do we track activity on Bitcoin Lightning Network?", a: "We monitor channel capacity shifts and routing node liquidity to identify broad network usage trends.", tag: "BITCOIN" },
        { q: "What is the 'Rollup Exit' monitor?", a: "A countdown and alert system for the 7-day challenge period of optimistic rollups, flagging when capital is exiting to L1.", tag: "ROLLUPS" },
        { q: "Can the system detect 'Cross-Chain Arbitrage'?", a: "We correlate price differences between DEXs on different chains to predict where capital will bridge next.", tag: "ARBITRAGE" },
        { q: "How do we handle ZK-Rollup proof verification events?", a: "We monitor the L1 settlement contracts for zkSync and Starknet to confirm finality of batch transactions.", tag: "ZK" },
        { q: "Is there support for 'Modular Blockchains' like Celestia?", a: "We analyze DA (Data Availability) layers to estimate the cost of transaction throughput for institutional builders.", tag: "MODULAR" },
        { q: "How do we track transfers on Tron network?", a: "Full indexing of TRC-20 (USDT) transfers to monitor the primary rails for global OTC liquidity.", tag: "TRON" },
        { q: "What is the 'Multi-Chain Portfolio' view?", a: "A unified dashboard showing total holdings across 20+ supported networks in a single institutional view.", tag: "PORTFOLIO" }
    ],
    // PAGE 6: Institutional Asset Selection
    [
        { q: "How do we select which assets are tracked?", a: "We prioritize assets by 'System Volatility'liquid assets where institutional behavior has a statistically significant impact on price trajectory.", tag: "ASSETS" },
        { q: "Can the system track obscure ERC-20 tokens?", a: "While we index all, we only flag those meeting a minimum $1M 'Institutional Depth' threshold to avoid distraction.", tag: "FILTER" },
        { q: "What is the 'Global Liquidity Atlas'?", a: "A 3D map showing the physical and digital distribution of capital across major global exchanges and private vaults.", tag: "VISUALS" },
        { q: "How do we handle re-staking protocols like EigenLayer?", a: "We track the 'Delegation Flow' to identify when large capital nodes are shifting their risk profile across multiple AVSs.", tag: "RE-STAKING" },
        { q: "Is there a limit to the number of tracked wallets?", a: "No. Our horizontally scalable elastic-compute engine handles billions of events across millions of identified signatures.", tag: "SCALING" },
        { q: "How do we identify 'Exchange Proxy' addresses?", a: "We characterize wallets based on inflow/outflow frequency and time-correlation with known exchange hot-wallet rotations.", tag: "EXCHANGES" },
        { q: "What is the 'Actor Velocity' indicator?", a: "A high-frequency metric tracking how quickly an asset moves through institutional hands vs. retail churn.", tag: "METRICS" },
        { q: "Does the system monitor Decentralized Stablecoins?", a: "Yes, we monitor the collateral-to-debt ratios of large actors to predict treasury-driven liquidation events.", tag: "STABLES" },
        { q: "Can we track 'Governance Hijacking' alerts?", a: "We flag sudden concentration of voting power in DAO contracts that could signal a hostile takeover attempt.", tag: "GOVERNANCE" },
        { q: "What is the 'Institutional Grade' guarantee?", a: "A 99.9% data accuracy SLA verified by independent on-chain auditing nodes in the System Analytics Network.", tag: "QUALITY" }
    ],
    // PAGE 7: Forensic Trace Depth
    [
        { q: "How many layers deep can the forensic engine trace?", a: "Up to 50 hops, resolving complex multi-address fragmentation used to hide the origin of institutional funds.", tag: "DEPTH" },
        { q: "Can the system detect 'Time-Delayed' dispersals?", a: "Yes. Our engine uses temporal correlation to link funds that are moved in small, fixed-interval increments over many days.", tag: "HEURISTICS" },
        { q: "What is the 'Fingerprint Pulse'?", a: "A behavioral analysis tool that identifies a specific actor's 'trading DNA' across multiple anonymous addresses.", tag: "BIOMETRICS" },
        { q: "How do we classify 'VC Portfolio' movements?", a: "We maintain a database of wallets linked to tier-1 venture capital firms to alert on early disposal of vested tokens.", tag: "VENTURE" },
        { q: "Does the system monitor 'Dusting Attacks'?", a: "We filter out low-value clutter while flagging large-scale dusting campaigns that might be precursor to an exploit.", tag: "SECURITY" },
        { q: "What is the 'System Audit' trail?", a: "A downloadable PDF report of any event, suitable for institutional compliance and internal risk review.", tag: "COMPLIANCE" },
        { q: "How do we track 'Private OTC' deal signatures?", a: "We identify large off-market transfers that are often followed by public market-making adjustments.", tag: "OTC" },
        { q: "Can we identify 'Miner Sell-Off' patterns?", a: "We monitor major mining pool outflows to predict supply-side pressure before it hits the order books.", tag: "MINING" },
        { q: "What is the 'Computational Cost' of a deep trace?", a: "For VIP users, deep traces are offloaded to our dedicated server-side GPU farm, providing answers in under 1 second.", tag: "RESOURCES" },
        { q: "How do we handle 'Wrapped' assets cross-chain?", a: "We link the burn on the source chain with the mint on the destination chain to provide a unified capital move alert.", tag: "BRIDGING" }
    ],
    // PAGE 8: Privacy vs Forensics
    [
        { q: "Is the Whale Alert Network system compliant with GDPR?", a: "Yes. We analyze public ledger data only and do not associate any PII (Personally Identifiable Information) with wallet addresses.", tag: "PRIVACY" },
        { q: "How can I keep my own movements private?", a: "Use private transfers and wallets that separate public activity from personal flows. Combine that with cautious address reuse and reputable privacy tools.", tag: "PRIVACY" },
        { q: "What is the 'Zero-Knowledge' alert verify?", a: "A feature allowing us to prove the existence of a move without revealing the destination address until it is settled.", tag: "ZK" },
        { q: "How do we manage 'Data Systemty'?", a: "Users own their alert filters; no data is shared with third-party advertising or surveillance firms.", tag: "ETHICS" },
        { q: "Can the system detect identity disclosure attempts?", a: "We flag public social media correlations to warn users when their private wallet may have been compromised by public OSINT.", tag: "SECURITY" },
        { q: "What is the 'MPC' search advantage?", a: "Multi-party computation ensures that your specific search queries are mathematically impossible for us to decrypt or store.", tag: "TECH" },
        { q: "Does the system support 'Encrypted Storage'?", a: "All user settings, watchlists, and custom labels are encrypted client-side using industry-standard AES-256.", tag: "STORAGE" },
        { q: "How do we protect against 'Social Engineering'?", a: "The VIP portal requires MFA and hardware key verification for sensitive asset management.", tag: "IDENTITY" },
        { q: "Can I use the system via a VPN or TOR?", a: "Our nodes are globally distributed to ensure accessible analytics regardless of your geographic location.", tag: "ACCESS" },
        { q: "What is the 'Global Privacy Consensus'?", a: "A collaborative effort with other Web3 tools to establish standards for ethical on-chain analytics gathering.", tag: "GOVERNANCE" }
    ],
    // PAGE 9-10: Diverse institutional content
    [
        { q: "Whale Alert Network v1.0: What is the current focus?", a: "Maximum sterilization of the interface and sub-15ms sync for institutional-grade terminals.", tag: "UPDATE" },
        { q: "Institutional Pipeline: How do we process 1M events?", a: "Using an event-driven Kafka architecture that ensures zero message loss even during peak volatility.", tag: "PIPE" },
        { q: "System Analytics: What is the Atlas of Networks?", a: "A specialized forensic map that visualizes the 'arteries' of value flow between primary and secondary blockchains.", tag: "ATLAS" },
        { q: "Web3 Integration: How do we compare with macro tools?", a: "Legacy tools are for macro analysis; we are for tactical, real-time capital execution alerts.", tag: "COMPARE" },
        { q: "Computational Power: What is the GPU advantage?", a: "We use CUDA-optimized kernels for fast pattern recognition of market-maker bot behavior.", tag: "COMPUTE" },
        { q: "API Performance: 99.99% Uptime SLA?", a: "Our globally redundant load balancers ensure institutional reliability during high-stress periods.", tag: "API" },
        { q: "Market Psychology: Can we predict sentiment?", a: "By analyzing the 'hold duration' of high-tier tokens, we can estimate if actors are in accumulation or distribution phase.", tag: "ML" },
        { q: "Atomic Execution: What is a flash-sync event?", a: "When the entire Whale Alert Network synchronizes a high-impact move across all clients in under 100ms.", tag: "SYNC" },
        { q: "Security Armor: How do we prevent DDoS?", a: "Our infrastructure is protected by an Anycast network that disperses malicious traffic across 150 points of presence.", tag: "CYBER" },
        { q: "Financial Freedom: Why Systemty matters?", a: "Information is the ultimate weapon in the Web3 space. Our tools empower individuals with institutional-grade data.", tag: "MISSION" }
    ],
    [
        { q: "Network Density: How many chains are tracked?", a: "We currently monitor 24 major L1 and L2 networks with full archival node depth.", tag: "CHAINS" },
        { q: "Transaction Validation: How many nodes verify an alert?", a: "A minimum of 3 independent full nodes must agree on the ledger state before an alert is dispatched.", tag: "TRUST" },
        { q: "Tier Definitions: Standard vs Pro?", a: "Standard (Core), Pro (Institutional), Elite (Enterprise). Each has distinct alert priority levels.", tag: "TIERS" },
        { q: "Global Liquidity: Where is the money moving?", a: "The Dashboard provides a real-time 'Capital Flow Heatmap' showing net migration into differing ecosystem vaults.", tag: "MAPS" },
        { q: "EVM Reconstruction: What is forensic replay?", a: "The ability to step through a transaction's execution trace to see exactly how internal calls interacted with DeFi contracts.", tag: "TRACE" },
        { q: "Mempool Access: How early are our alerts?", a: "Our private relay network sees transactions the moment they are broadcasted, before they are picked up by public explorers.", tag: "MEV" },
        { q: "Institutional Alpha: Can I use this for arbitrage?", a: "While not a trading platform, the raw data provides the necessary 'first-to-know' advantage required for alpha capture.", tag: "TRADING" },
        { q: "System Customization: Can I change the UI theme?", a: "The Ivory-and-Ink theme is our definitive master-spec for maximum clarity and institutional focus.", tag: "UI" },
        { q: "Data Preservation: Is history archived?", a: "We maintain 10 years of institutional history on Arweave to ensure that forensic data is permanent and immutable.", tag: "HISTORY" },
        { q: "Community Governance: Who owns the system?", a: "The System Infrastructure Group manages the protocol with oversight from the DAO of institutional participants.", tag: "DAO" }
    ]
];

export function SystemFAQ() {
    const [page, setPage] = useState(0);
    const totalPages = FAQ_DATA.length;

    const nextPage = () => setPage((prev) => (prev + 1) % totalPages);
    const prevPage = () => setPage((prev) => (prev - 1 + totalPages) % totalPages);

    return (
        <section className="px-8 pb-32 max-w-[1400px] mx-auto">
            <div className="bg-white rounded-[2rem] overflow-hidden shadow-sm relative border border-black/10">
                {/* Header: Pagination */}
                <div className="p-10 border-b border-black/5 flex flex-col items-center gap-10 bg-[#FFFFFF]">
                    <div className="flex flex-col items-center gap-4">
                        <h2 className="text-4xl font-black text-[#0A0A0A] uppercase tracking-tighter">
                            Protocol FAQ
                        </h2>
                    </div>

                    <div className="w-full relative px-12">
                        <div className="flex items-center justify-center gap-4 overflow-x-auto no-scrollbar py-2">
                            {Array.from({ length: totalPages }).map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setPage(i)}
                                    className={`shrink-0 h-10 px-6 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                                        page === i 
                                        ? 'bg-black text-white scale-105' 
                                        : 'bg-black/5 text-black/40 hover:bg-black/10'
                                    }`}
                                >
                                    Module {i + 1}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="p-12 min-h-[600px] relative bg-white">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={page}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                            className="grid grid-cols-1 md:grid-cols-2 gap-px bg-black/10 border border-black/10"
                        >
                            {FAQ_DATA[page].map((item, idx) => {
                                const questionNumber = (page * 10) + idx + 1;
                                return (
                                    <div 
                                        key={idx} 
                                        className="bg-white p-10 flex flex-col gap-6 hover:bg-[#FFFFFF] transition-colors duration-500 group relative"
                                    >
                                        <div className="space-y-4 relative z-10">
                                            <div className="inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-black/20">
                                                <span>{item.tag}</span>
                                                <div className="w-1 h-1 bg-black/10 rounded-full" />
                                                <span>REF: {questionNumber.toString().padStart(3, '0')}</span>
                                            </div>
                                            <h3 className="text-lg font-black text-[#0A0A0A] leading-tight uppercase tracking-tight">
                                                {questionNumber}. {item.q}
                                            </h3>
                                            <p className="text-[14px] text-[#0A0A0A]/50 leading-relaxed font-serif italic">
                                                {item.a}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Footer */}
                <div className="p-8 border-t border-black/5 flex items-center justify-between bg-[#FFFFFF]">
                    <button 
                        onClick={prevPage}
                        className="flex items-center gap-3 px-8 py-4 rounded-xl bg-black/5 text-black/40 hover:bg-black/10 hover:text-black transition-all text-[10px] font-black uppercase tracking-widest"
                    >
                        <ChevronLeft size={16} /> Prev
                    </button>
                    <div className="flex items-center gap-4">
                        <span className="text-[10px] font-black text-black/20 uppercase tracking-widest">Page {page + 1} / {totalPages}</span>
                    </div>
                    <button 
                        onClick={nextPage}
                        className="flex items-center gap-3 px-8 py-4 rounded-xl bg-black text-white hover:bg-black/80 transition-all text-[10px] font-black uppercase tracking-widest"
                    >
                        Next <ChevronRight size={16} />
                    </button>
                </div>
            </div>

            <style jsx>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </section>
    );
}
