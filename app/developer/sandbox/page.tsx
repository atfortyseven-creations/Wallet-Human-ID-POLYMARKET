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
      id="main-content"
      style={{
        minHeight: "100vh",
        background: "#ffffff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "60px 24px",
        gap: 48,
        color: "#000000",
      }}
    >
      {/* Hero header */}
      <header style={{ textAlign: "center", maxWidth: 760 }}>


        <h1
          style={{
            fontFamily: "'Inter', 'Outfit', sans-serif",
            fontSize: "clamp(32px, 5vw, 56px)",
            fontWeight: 900,
            color: "#000000",
            lineHeight: 1.1,
            letterSpacing: "-0.03em",
            margin: "0 0 20px",
          }}
        >
          ZK Circuit Prover Sandbox
        </h1>

        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 17,
            color: "#4b5563",
            lineHeight: 1.7,
            margin: 0,
          }}
        >
          Write Noir circuits, provide private witnesses, generate Barretenberg proofs, 
          and simulate submission to the Aztec L2 sequencer — entirely inside your browser.
        </p>


      </header>

      {/* Main sandbox */}
      <div style={{ width: "100%", maxWidth: 1200 }}>
        <NoirCircuitSandbox />
      </div>

      {/* Architecture explanation */}
      <section
        style={{
          width: "100%",
          maxWidth: 1200,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 20,
        }}
      >
        {[
          {
            icon: "1",
            title: "Private Execution Environment",
            text: "Every proof is generated locally. The backend never sees private witness inputs, balance amounts, or identity secrets.",
          },
          {
            icon: "2",
            title: "Barretenberg Backend",
            text: "The same proving backend used by Aztec Network's rollup. Achieves sub-second proving for small circuits.",
          },
          {
            icon: "3",
            title: "Viewing Key Escrow",
            text: "Verified users receive a cryptographic viewing key. Held in compliance escrow, disclosable only under formal request.",
          },
          {
            icon: "4",
            title: "Travel Rule Ready",
            text: "The credential circuit embeds compliance metadata as private inputs. The proof asserts compliance without leaking personal data.",
          },
        ].map(({ icon, title, text }) => (
          <div
            key={title}
            style={{
              background: "#ffffff",
              border: "1px solid #e5e7eb",
              borderRadius: 16,
              padding: "24px",
              transition: "border-color 0.3s",
            }}
          >
            <div style={{ 
              fontSize: 14, 
              fontWeight: 900, 
              color: "#6b7280", 
              marginBottom: 12,
              background: "#f3f4f6",
              width: 32,
              height: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "50%",
            }}>
              {icon}
            </div>
            <h3
              style={{
                fontFamily: "'Inter', sans-serif",
                color: "#111827",
                fontSize: 14,
                fontWeight: 700,
                margin: "0 0 8px",
              }}
            >
              {title}
            </h3>
            <p style={{ fontFamily: "'Inter', sans-serif", color: "#4b5563", fontSize: 13, lineHeight: 1.7, margin: 0 }}>
              {text}
            </p>
          </div>
        ))}
      </section>

      <footer
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          color: "#9ca3af",
          fontSize: 11,
          textAlign: "center",
          letterSpacing: "0.08em",
        }}
      >
        Whale Network · Humanity Ledger S.L. · Aztec Native Integration
      </footer>
    </main>
  );
}
