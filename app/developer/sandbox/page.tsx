import type { Metadata } from "next";
import { NoirCircuitSandbox } from "@/components/developer/NoirCircuitSandbox";

export const metadata: Metadata = {
  title: "ZK Circuit Prover Sandbox | Whale Network",
  description:
    "Interactive Noir circuit IDE. Compile Aztec ZK circuits, generate Barretenberg proofs, " +
    "and verify them on the Aztec L2 sequencer.",
  keywords: ["Noir", "Aztec Network", "Zero-Knowledge", "ZK Proofs", "Barretenberg", "UltraHonk", "Whale Network"],
  openGraph: {
    title: "ZK Circuit Prover Sandbox | Whale Network",
    description: "Compile, witness, prove, and verify Noir circuits in real-time.",
    url: "https://humanidfi.com/developer/sandbox",
    siteName: "Whale Network",
  },
};

export default function SandboxPage() {
  return (
    <main
      className="min-h-screen bg-[#050505] text-white selection:bg-blue-500/30 flex flex-col items-center py-24 px-6 gap-16 font-sans relative overflow-hidden"
    >
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-500/10 blur-[120px] pointer-events-none rounded-full" />

      {/* Hero header */}
      <header className="text-center max-w-3xl relative z-10 flex flex-col items-center">
        <div className="bg-white/5 border border-white/10 text-white/60 text-[10px] font-bold tracking-[0.3em] px-4 py-1.5 rounded-full uppercase mb-8 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
          Institutional ZK Environment
        </div>
        
        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-[1.1] mb-6">
          Quantum Circuit <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-600">Prover Sandbox</span>
        </h1>

        <p className="text-white/50 text-sm md:text-base leading-relaxed max-w-2xl font-mono">
          Write deeply complex Noir architectures, parse them through the Quantum Security Linter, generate UltraHonk SNARKs, and simulate Barretenberg rollup submissions entirely in-browser.
        </p>
      </header>

      {/* Main sandbox */}
      <div className="w-full max-w-6xl relative z-10">
        <NoirCircuitSandbox />
      </div>

      {/* Architecture explanation */}
      <section className="w-full max-w-6xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10 mt-12">
        {[
          {
            icon: "01",
            title: "Private Execution Environment",
            text: "Every proof is generated locally. The backend never sees private witness inputs, balance amounts, or identity secrets.",
          },
          {
            icon: "02",
            title: "UltraHonk Backend",
            text: "The exact same proving engine used by the Aztec Network's sequencer. Achieves sub-second proving via highly optimized WASM.",
          },
          {
            icon: "03",
            title: "Zero-Knowledge AML",
            text: "Simulate complex Compliance Oracles using Range constraints and Merkle Membership proofs over sanctioned datasets.",
          },
          {
            icon: "04",
            title: "Security Diagnostics",
            text: "The Quantum Linter detects Soundness vulnerabilities, overflow risks, and constraint leaks during AST parsing.",
          },
        ].map(({ icon, title, text }) => (
          <div key={title} className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 hover:bg-white/[0.04] transition-colors group">
            <div className="text-blue-500/50 font-mono text-[10px] font-bold tracking-widest mb-4 flex items-center gap-2">
               <span>[{icon}]</span>
               <div className="h-px bg-white/10 flex-1 group-hover:bg-blue-500/30 transition-colors" />
            </div>
            <h3 className="text-white/90 text-sm font-bold tracking-tight mb-2">
              {title}
            </h3>
            <p className="text-white/40 text-[11px] leading-[1.7] font-mono">
              {text}
            </p>
          </div>
        ))}
      </section>

      <footer className="mt-20 text-white/30 text-[10px] font-mono tracking-[0.2em] text-center w-full uppercase border-t border-white/5 pt-12">
        Whale Network • Humanity Ledger S.L. • Aztec Native Integration
      </footer>
    </main>
  );
}
