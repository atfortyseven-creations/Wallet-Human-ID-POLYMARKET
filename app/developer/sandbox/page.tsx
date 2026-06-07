import type { Metadata } from "next";
import { NoirCircuitSandbox } from "@/components/developer/NoirCircuitSandbox";

export const metadata: Metadata = {
  title: "ZK Circuit Prover Sandbox | Whale Network",
  description:
    "Interactive Noir circuit IDE. Compile Aztec ZK circuits, generate Barretenberg UltraHonk proofs, " +
    "and verify them on the Aztec L2 sequencer — all in your browser.",
  keywords: ["Noir", "Aztec Network", "Zero-Knowledge", "ZK Proofs", "Barretenberg", "UltraHonk", "Whale Network"],
  openGraph: {
    title: "ZK Circuit Prover Sandbox | Whale Network",
    description: "Compile, witness, prove, and verify Noir circuits in real-time. Powered by Barretenberg UltraHonk.",
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
        background: "linear-gradient(180deg, #070712 0%, #0d0d1a 60%, #050510 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "60px 24px",
        gap: 48,
      }}
    >
      {/* Hero header */}
      <header style={{ textAlign: "center", maxWidth: 760 }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: "#7c6fcd18",
            border: "1px solid #7c6fcd44",
            borderRadius: 20,
            padding: "4px 16px",
            marginBottom: 24,
          }}
        >
          <span style={{ color: "#7c6fcd", fontSize: 11, fontWeight: 700, letterSpacing: "0.12em" }}>
            AZTEC NATIVE · NOIR v1.0 · BARRETENBERG ULTRAPLONK
          </span>
        </div>

        <h1
          style={{
            fontFamily: "'Inter', 'Outfit', sans-serif",
            fontSize: "clamp(32px, 5vw, 56px)",
            fontWeight: 900,
            color: "#f1f5f9",
            lineHeight: 1.1,
            letterSpacing: "-0.03em",
            margin: "0 0 20px",
          }}
        >
          ZK Circuit&nbsp;
          <span
            style={{
              background: "linear-gradient(135deg, #7c6fcd, #a855f7, #c084fc)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Prover Sandbox
          </span>
        </h1>

        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 17,
            color: "#64748b",
            lineHeight: 1.7,
            margin: 0,
          }}
        >
          Write Noir circuits, inject private witnesses, generate{" "}
          <span style={{ color: "#7c6fcd" }}>Barretenberg UltraHonk proofs</span>, and submit them to
          the Aztec L2 sequencer — entirely client-side, inside your Private Execution Environment.
        </p>

        {/* Feature pills */}
        <div
          style={{
            display: "flex",
            gap: 10,
            justifyContent: "center",
            flexWrap: "wrap",
            marginTop: 28,
          }}
        >
          {[
            "✦ Pedersen Commitments",
            "✦ Merkle Range Proofs",
            "✦ KYC ZK Credentials",
            "✦ Viewing Key Escrow",
            "✦ MiCA-Compliant",
          ].map((pill) => (
            <span
              key={pill}
              style={{
                background: "#1a1a2e",
                border: "1px solid #2a2a4a",
                color: "#7c6fcd",
                fontSize: 11,
                fontWeight: 700,
                padding: "5px 14px",
                borderRadius: 20,
                fontFamily: "'JetBrains Mono', monospace",
                letterSpacing: "0.06em",
              }}
            >
              {pill}
            </span>
          ))}
        </div>
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
            icon: "🔐",
            title: "Private Execution Environment",
            text: "Every proof is generated locally on the user's machine. Whale Network's backend never sees private witness inputs, balance amounts, or identity secrets.",
          },
          {
            icon: "⚙",
            title: "Barretenberg UltraHonk",
            text: "The same proving backend used by Aztec Network's rollup. UltraHonk achieves sub-second proving for small circuits with a universal reference string.",
          },
          {
            icon: "🔑",
            title: "Viewing Key Escrow",
            text: "KYC'd users receive a cryptographic viewing key. Humanity Ledger S.L. holds this key in compliance escrow — disclosable only under a SEPBLAC or CNMV order.",
          },
          {
            icon: "📋",
            title: "MiCA & Travel Rule Ready",
            text: "The KYC credential circuit embeds EU Travel Rule metadata as private inputs. The proof asserts compliance without leaking personal data to the sequencer.",
          },
        ].map(({ icon, title, text }) => (
          <div
            key={title}
            style={{
              background: "#0d0d1a",
              border: "1px solid #1e1e2e",
              borderRadius: 16,
              padding: "24px",
              transition: "border-color 0.3s",
            }}
          >
            <div style={{ fontSize: 28, marginBottom: 12 }}>{icon}</div>
            <h3
              style={{
                fontFamily: "'Inter', sans-serif",
                color: "#e2e8f0",
                fontSize: 14,
                fontWeight: 700,
                margin: "0 0 8px",
              }}
            >
              {title}
            </h3>
            <p style={{ fontFamily: "'Inter', sans-serif", color: "#475569", fontSize: 13, lineHeight: 1.7, margin: 0 }}>
              {text}
            </p>
          </div>
        ))}
      </section>

      <footer
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          color: "#2a2a4a",
          fontSize: 11,
          textAlign: "center",
          letterSpacing: "0.08em",
        }}
      >
        Whale Network · Humanity Ledger S.L. · Aztec Native Integration · humanidfi.com/developer/sandbox
      </footer>
    </main>
  );
}
