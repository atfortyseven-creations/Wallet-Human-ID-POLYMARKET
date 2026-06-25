import type { Metadata } from "next";
import { NoirCircuitSandbox } from "@/components/developer/NoirCircuitSandbox";

export const metadata: Metadata = {
  title: "ZK Aztec Sandbox | Whale Network",
  description:
    "Interactive Noir environment to compile Aztec ZK circuits, generate Barretenberg proofs " +
    "and verify them on the Aztec L2 sequencer.",
  keywords: ["Noir", "Aztec Network", "Zero-Knowledge", "ZK Proofs", "Barretenberg", "UltraHonk", "Whale Network"],
  openGraph: {
    title: "ZK Aztec Sandbox | Whale Network",
    description: "Compile, generate witnesses, prove and verify Noir circuits in real-time.",
    url: "https://humanidfi.com/developer/sandbox",
    siteName: "Whale Network",
  },
};

export default function SandboxPage() {
  return (
    <main
      className="min-h-screen bg-white text-black selection:bg-black/10 flex flex-col items-center py-24 px-6 gap-16 font-sans relative overflow-x-hidden"
    >
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-slate-100 blur-[120px] pointer-events-none rounded-full" />

      {/* Hero header */}
      <header className="text-center max-w-3xl relative z-10 flex flex-col items-center">
        <div className="bg-slate-50 border border-slate-200 text-slate-500 text-[10px] font-bold tracking-[0.3em] px-4 py-1.5 rounded-full uppercase mb-8 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-pulse" />
          ZK Aztec Sandbox
        </div>
        
        <h1 className="text-4xl md:text-6xl font-black text-black tracking-tighter leading-[1.1] mb-6 flex flex-col items-center gap-6">
          ZK SandBox
          <div className="flex flex-col items-center gap-3 text-lg md:text-xl text-slate-500 font-medium tracking-wide uppercase mt-4">
            <span>powered by</span>
            <img src="/aztec-logo-black.png" alt="Aztec Network" className="h-32 md:h-48 lg:h-56 object-contain" />
          </div>
        </h1>

        <p className="text-slate-500 text-sm md:text-base leading-relaxed max-w-2xl font-mono">
          Write deeply complex Noir architectures, parse them through the ZK Linter, generate UltraHonk SNARKs, and simulate Barretenberg rollup submissions entirely in-browser.
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
            title: "Private Execution",
            text: "Every proof is generated locally. The server never sees private values, balances, or identity secrets.",
          },
          {
            icon: "02",
            title: "UltraHonk Backend",
            text: "The same proving engine used by the Aztec Network sequencer. Sub-second performance via optimized WASM.",
          },
          {
            icon: "03",
            title: "ZK Compliance",
            text: "Simulate Compliance Oracles with range constraints and Merkle membership proofs over sanctioned lists.",
          },
          {
            icon: "04",
            title: "Circuit Diagnostics",
            text: "The ZK linter detects soundness vulnerabilities, overflow risks, and constraint leaks during AST analysis.",
          },
        ].map(({ icon, title, text }) => (
          <div key={title} className="bg-white border border-slate-200 rounded-2xl p-6 hover:border-slate-300 transition-colors group shadow-sm">
            <div className="text-slate-400 font-mono text-[10px] font-bold tracking-widest mb-4 flex items-center gap-2">
               <span>[{icon}]</span>
               <div className="h-px bg-slate-100 flex-1 group-hover:bg-slate-300 transition-colors" />
            </div>
            <h3 className="text-black text-sm font-bold tracking-tight mb-2">
              {title}
            </h3>
            <p className="text-slate-500 text-[11px] leading-[1.7] font-mono">
              {text}
            </p>
          </div>
        ))}
      </section>

      <footer className="mt-20 text-slate-400 text-[10px] font-mono tracking-[0.2em] text-center w-full uppercase border-t border-slate-100 pt-12">
        Whale Network • Humanity Ledger S.L. • Aztec Native Integration
      </footer>
    </main>
  );
}
