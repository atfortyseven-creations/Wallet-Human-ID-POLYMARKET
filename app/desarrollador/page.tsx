'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { SiteHeader } from '@/components/site/SiteHeader';
import { HumanDefiFooter } from '@/components/landing/HumanDefiFooter';
import FluidBeigeBackground from '@/components/layout/FluidBeigeBackground';
import { DevFeatureSection } from '@/components/developer/DevFeatureSection';

export default function DesarrolladorPage() {
    return (
        <div className="min-h-screen bg-[#F5F5DC] text-neutral-900 font-sans selection:bg-orange-200 selection:text-orange-900 pb-20 overflow-x-hidden">
            
            {/* BACKGROUND LAYER */}
            <div className="fixed inset-0 z-0 pointer-events-none transform-gpu">
                 <FluidBeigeBackground />
            </div>

            <SiteHeader />

            <main className="relative z-10 pt-32">
                
                {/* HERO SECTION */}
                <section className="px-6 pb-24 text-center max-w-5xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-neutral-900 to-neutral-600">
                            TRUST THROUGH TRANSPARENCY
                        </h1>
                        <p className="text-xl md:text-2xl text-neutral-500 font-medium max-w-3xl mx-auto leading-relaxed">
                            This is not magic. It's verifiable code. 
                            <br/>Explore the engine that powers the world's first Human-Centric DeFi protocol.
                        </p>
                    </motion.div>
                </section>

                {/* SECTION 1: CORE ARCHITECTURE (TitaniumGate) */}
                <DevFeatureSection 
                    title="The Neuro-Core: TitaniumGate"
                    description="The central nervous system of the application. It orchestrates user state transitions with military precision, preventing illegal access vectors before they even render."
                    lottieSrc="https://lottie.host/98c5806c-843e-4363-8a9d-59d4c153724c/Example3DNetwork.lottie"
                    align="left"
                    details={[
                        "State Machine Logic: INTRO -> AUTH -> APP. Zero overlap.",
                        "Context-Aware Routing: Prevents 'flash of unauthenticated content'.",
                        "Global State Broadcasting: Real-time synchronization across all UI components."
                    ]}
                    codeSnippet={`// components/layout/TitaniumGate.tsx
export function TitaniumGate({ children }) {
  const [state, setState] = useState<GateState>('INTRO');
  // ... verifies auth token & orchestrates flow
  return (
    <GateStateContext.Provider value={{ state }}>
       {state === 'INTRO' && <IntroSequence />}
       {state === 'AUTH' && <AuthModal />}
       {state === 'APP' && children}
    </GateStateContext.Provider>
  );
}`}
                />

                {/* SECTION 2: SECURITY (lib/security.ts) */}
                <DevFeatureSection 
                    title="Active Defense Matrix"
                    description="Security is not an afterthought; it's the foundation. Our security modules actively monitor, log, and neutralize threats in real-time."
                    lottieSrc="https://lottie.host/570e30d6-11f8-4e8c-8f2c-e53b67946808/ShieldAnimation.lottie"
                    align="right"
                    details={[
                        "Brute-Force Heuristics: Auto-bans IPs after 5 failed attempts in 15 mins.",
                        "Immutable Audit Logs: Every sensitive action (Login, IP Change) is permanently recorded in Postgres via Prisma.",
                        "Session Hardening: JWTs are rotated and validated against browser fingerprinting."
                    ]}
                    codeSnippet={`// lib/security.ts
export async function detectBruteForce(ip: string) {
  const failures = await prisma.securityEvent.count({
    where: { type: 'FAILED_LOGIN', ipAddress: ip, ... }
  });
  if (failures >= 5) {
     await blockIP(ip, 'Brute force detected');
     return true; // Access Denied
  }
}`}
                />

                {/* SECTION 3: FINANCIAL ENGINE (lib/fpmm-math.ts) */}
                <DevFeatureSection 
                    title="Gnosis FPMM Mathematics"
                    description="We use the industry-standard Fixed Product Market Maker (FPMM) algorithm to ensure guaranteed liquidity for every trade, regardless of market size."
                    lottieSrc="https://lottie.host/8d48bb95-7124-4224-bcae-2144799011af/lHDi1Xo9qO.lottie"
                    align="left"
                    details={[
                        "Formula: k = x * y (Constant Product).",
                        "Slippage Protection: Front-running protection built into the contract interaction.",
                        "Price Discovery: Automated based on ratio of reserves. No central book."
                    ]}
                    codeSnippet={`// lib/fpmm-math.ts
export const calcBuyAmount = (investment, reserveA, reserveB) => {
  // Gnosis CPMM Logic
  // Guarantees solvency by ensuring product k remains constant
  // after fees are applied.
  return amountOut; 
};`}
                />

                {/* SECTION 4: IDENTITY (lib/worldid.ts) */}
                <DevFeatureSection 
                    title="Sovereign Identity (Zero-Knowledge)"
                    description="Prove you are human without revealing who you are. We verify the biological uniqueness of the user, not their government ID."
                    lottieSrc="https://lottie.host/d273752e-402f-413a-b5e0-40e13778534d/FingerprintID.lottie"
                    align="right"
                    details={[
                        "Merkle Tree Proofs: Your biometric data never leaves your device.",
                        "Sybil Resistance: One person, one vote. Mathematically enforced.",
                        "Privacy-First: We only receive a 'nullifier' hash, impossible to reverse-engineer."
                    ]}
                     codeSnippet={`// lib/worldid.ts
export const verifyProof = async (proof) => {
  const response = await fetch('https://developer.worldcoin.org/api/v1/verify', {
    method: 'POST',
    body: JSON.stringify({ ...proof, action: 'login' })
  });
  if (!response.ok) throw new Error('Invalid ZK Proof');
  return true; // Verified Human
};`}
                />

                {/* SECTION 5: ACCOUNT ABSTRACTION (lib/accountAbstraction.ts) */}
                 <DevFeatureSection 
                    title="Gasless Infrastructure (ERC-4337)"
                    description="The blockchain should be invisible. We sponsor your gas fees using a Paymaster, so you only focus on your investment, not the network costs."
                    lottieSrc="https://lottie.host/98c5806c-843e-4363-8a9d-59d4c153724c/Example3DNetwork.lottie" // Reusing network/geometric one
                    align="left"
                    details={[
                        "Smart Accounts: Every user gets a contract wallet, not just an EOA.",
                        "Paymaster Policy: Use our sponsorship policy to cover gas for all whitelist interactions.",
                        "Bundler Integration: Transactions are bundled and mined efficiently."
                    ]}
                    codeSnippet={`// lib/accountAbstraction.ts
export const createSmartAccount = async (signer) => {
  // Wraps EOA in ERC-4337 Smart Account
  return {
     type: "LightAccount",
     sponsorGas: true, // Paymaster Active
     policyId: "POLYGON_GASLESS_POLICY"
  };
};`}
                />

            </main>
            
            <div className="relative z-10 px-6">
                 <HumanDefiFooter />
            </div>

        </div>
    );
}
