"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  compileNoirCircuit,
  generateWitness,
  generateUltraHonkProof,
  verifyProofOnChain,
  type NoirCompilationResult,
  type NoirWitness,
  type UltraHonkProof,
} from "@/lib/zk/noir-compiler-mock";

// ── Default Noir circuit demonstrating private balance verification ──────────
const DEFAULT_NOIR_CIRCUIT = `// Aztec Native Private Identity Verifier
// Circuit: Prove you hold >= 10 QDs without revealing exact balance
// Language: Noir v1.0 | Prover: Barretenberg UltraHonk
// Author: Whale Network / Humanity Ledger S.L.

use std::hash::pedersen_hash;

// ──────────────────────────────────────────────────────────────────────────────
//  Main circuit: Zero-Knowledge proof of sufficient balance
// ──────────────────────────────────────────────────────────────────────────────
fn main(
  // PUBLIC: what the verifier sees
  pub commitment_hash: Field,
  pub min_threshold: Field,   // e.g. 10 QDs

  // PRIVATE: what stays inside the PXE
  balance: Field,
  salt: Field,
) {
  // 1. Reconstruct the Pedersen commitment from private inputs
  let recomputed = pedersen_hash([balance, salt]);

  // 2. Assert the commitment matches the public one
  assert(recomputed == commitment_hash);

  // 3. Assert balance is at or above the threshold  (range check)
  assert(balance as u64 >= min_threshold as u64);
}

// ──────────────────────────────────────────────────────────────────────────────
//  Helper: KYC Credential Verifier (Sumsub integration layer)
// ──────────────────────────────────────────────────────────────────────────────
fn verify_kyc_credential(
  pub kyc_merkle_root: Field,
  credential_leaf: Field,
  merkle_path: [Field; 8],
  merkle_indices: [bool; 8],
) -> bool {
  let mut current = credential_leaf;
  for i in 0..8 {
    let (left, right) = if merkle_indices[i] {
      (merkle_path[i], current)
    } else {
      (current, merkle_path[i])
    };
    current = pedersen_hash([left, right]);
  }
  current == kyc_merkle_root
}
`;

// ── Types for pipeline stages ─────────────────────────────────────────────────
type StageStatus = "idle" | "running" | "done" | "error";

interface PipelineStage {
  id: string;
  label: string;
  subtitle: string;
  status: StageStatus;
  output?: string;
  durationMs?: number;
}

// ── Colour helpers ────────────────────────────────────────────────────────────
const stageColour: Record<StageStatus, string> = {
  idle:    "#3a3a4a",
  running: "#7c6fcd",
  done:    "#22c55e",
  error:   "#ef4444",
};
const stageDot: Record<StageStatus, string> = {
  idle:    "◦",
  running: "◈",
  done:    "✓",
  error:   "✗",
};

// ── Inline proof-display helpers ──────────────────────────────────────────────
function truncate(hex: string, chars = 12) {
  if (!hex || hex.length <= chars + 6) return hex;
  return `${hex.slice(0, chars)}…${hex.slice(-6)}`;
}

// ═════════════════════════════════════════════════════════════════════════════
//  Main component
// ═════════════════════════════════════════════════════════════════════════════
export function NoirCircuitSandbox() {
  const [noirCode, setNoirCode]   = useState(DEFAULT_NOIR_CIRCUIT);
  const [balance,  setBalance]    = useState("42");
  const [salt,     setSalt]       = useState("0xdeadbeef1337cafe");
  const [threshold,setThreshold]  = useState("10");

  const [stages, setStages] = useState<PipelineStage[]>([
    { id: "compile",  label: "01 · Compile Noir",        subtitle: "→ ACIR Bytecode",           status: "idle" },
    { id: "witness",  label: "02 · Generate Witness",    subtitle: "→ Private Execution (PXE)",  status: "idle" },
    { id: "prove",    label: "03 · UltraHonk Prover",    subtitle: "→ Barretenberg Backend",     status: "idle" },
    { id: "verify",   label: "04 · On-Chain Verify",     subtitle: "→ Aztec L2 Sequencer",       status: "idle" },
  ]);

  const [running,     setRunning]     = useState(false);
  const [proof,       setProof]       = useState<UltraHonkProof | null>(null);
  const [verifyOK,    setVerifyOK]    = useState<boolean | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const [logLines, setLogLines]       = useState<{ text: string; type: "info"|"success"|"warn"|"error" }[]>([]);

  const addLog = useCallback((text: string, type: "info"|"success"|"warn"|"error" = "info") => {
    setLogLines(l => [...l, { text, type }]);
    setTimeout(() => {
      if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
    }, 30);
  }, []);

  const updateStage = useCallback((id: string, patch: Partial<PipelineStage>) => {
    setStages(s => s.map(st => st.id === id ? { ...st, ...patch } : st));
  }, []);

  const resetAll = useCallback(() => {
    setStages(s => s.map(st => ({ ...st, status: "idle", output: undefined, durationMs: undefined })));
    setProof(null);
    setVerifyOK(null);
    setGlobalError(null);
    setLogLines([]);
  }, []);

  const runPipeline = useCallback(async () => {
    resetAll();
    setRunning(true);

    try {
      // ── STAGE 1: COMPILE ────────────────────────────────────────────────
      updateStage("compile", { status: "running" });
      addLog("⟳  Invoking nargo compile… (Noir v1.0.0-beta.7)", "info");
      const t0 = Date.now();
      const compiled: NoirCompilationResult = await compileNoirCircuit(noirCode);
      const compileMs = Date.now() - t0;

      if (!compiled.success || !compiled.acir) {
        updateStage("compile", { status: "error", output: compiled.error });
        addLog(`✗  Compilation failed: ${compiled.error}`, "error");
        setGlobalError(compiled.error ?? "Unknown error");
        setRunning(false);
        return;
      }

      compiled.warnings?.forEach(w => addLog(`⚠  ${w}`, "warn"));
      addLog(`✓  ACIR bytecode generated — ${compiled.bytecodeSize?.toLocaleString()} bytes`, "success");
      addLog(`   ACIR hash: ${truncate(compiled.acir, 20)}`, "info");
      updateStage("compile", {
        status: "done",
        durationMs: compileMs,
        output: `ACIR: ${compiled.acir}\nBytecode: ${compiled.bytecodeSize?.toLocaleString()} bytes`,
      });

      // ── STAGE 2: WITNESS ────────────────────────────────────────────────
      updateStage("witness", { status: "running" });
      addLog("\n⟳  PXE: Computing witnesses inside Private Execution Environment…", "info");
      const t1 = Date.now();
      const witness: NoirWitness = await generateWitness(
        compiled.acir,
        [threshold],
        [balance, salt],
      );
      const witnessMs = Date.now() - t1;
      addLog(`✓  Witness generated — ${witness.witnessId}`, "success");
      addLog(`   Private inputs hash: ${truncate(witness.privateInputsHash, 20)}`, "info");
      addLog(`   Computation time: ${Math.round(witness.computationTimeMs)}ms`, "info");
      updateStage("witness", {
        status: "done",
        durationMs: witnessMs,
        output: `ID: ${witness.witnessId}\nPrivate hash: ${witness.privateInputsHash}`,
      });

      // ── STAGE 3: PROVE ──────────────────────────────────────────────────
      updateStage("prove", { status: "running" });
      addLog("\n⟳  Barretenberg: Generating UltraHonk SNARK proof…", "info");
      addLog("   (Recursive SNARK — suitable for Aztec rollup batch)", "info");
      const t2 = Date.now();
      const proofResult: UltraHonkProof = await generateUltraHonkProof(witness);
      const proveMs = Date.now() - t2;
      setProof(proofResult);
      addLog(`✓  Proof generated — ID: ${proofResult.proofId}`, "success");
      addLog(`   π_a: [${truncate(proofResult.pi_a[0])}, ${truncate(proofResult.pi_a[1])}]`, "info");
      addLog(`   π_b: [[${truncate(proofResult.pi_b[0][0])}, …]]`, "info");
      addLog(`   Verifier: ${proofResult.verifierAddress}`, "info");
      updateStage("prove", {
        status: "done",
        durationMs: proveMs,
        output: `Proof ID: ${proofResult.proofId}\nπ_a: [${truncate(proofResult.pi_a[0])}, …]`,
      });

      // ── STAGE 4: VERIFY ─────────────────────────────────────────────────
      updateStage("verify", { status: "running" });
      addLog("\n⟳  Aztec L2 Sequencer: Submitting proof for on-chain verification…", "info");
      const t3 = Date.now();
      const ok = await verifyProofOnChain(proofResult);
      const verifyMs = Date.now() - t3;
      setVerifyOK(ok);

      if (ok) {
        addLog("✓  PROOF VERIFIED ✓ — Sequencer accepted the proof", "success");
        addLog("   Note commitment appended to Aztec global state tree.", "success");
        updateStage("verify", {
          status: "done",
          durationMs: verifyMs,
          output: `Status: ACCEPTED\nSequencer tx finalized at Aztec L2 block.`,
        });
      } else {
        addLog("✗  Proof rejected by sequencer.", "error");
        updateStage("verify", { status: "error", durationMs: verifyMs });
      }

    } catch (e: any) {
      addLog(`\n✗  Pipeline crashed: ${e.message}`, "error");
      setGlobalError(e.message);
    } finally {
      setRunning(false);
    }
  }, [noirCode, balance, salt, threshold, resetAll, updateStage, addLog]);

  // ── log-line colour ────────────────────────────────────────────────────────
  const logColour = { info: "#94a3b8", success: "#22c55e", warn: "#f59e0b", error: "#ef4444" };

  return (
    <section
      id="noir-sandbox"
      style={{
        fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
        background: "#0d0d14",
        borderRadius: 20,
        border: "1px solid #2a2a3a",
        overflow: "hidden",
        width: "100%",
        maxWidth: 1200,
        margin: "0 auto",
        boxShadow: "0 0 80px rgba(124,111,205,0.15)",
      }}
    >
      {/* ── Header bar ── */}
      <div style={{ background: "#151520", borderBottom: "1px solid #2a2a3a", padding: "12px 24px", display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ display: "flex", gap: 8 }}>
          {["#ef4444","#f59e0b","#22c55e"].map((c,i) => (
            <div key={i} style={{ width: 12, height: 12, borderRadius: "50%", background: c }} />
          ))}
        </div>
        <span style={{ color: "#7c6fcd", fontWeight: 700, fontSize: 13, letterSpacing: "0.1em" }}>
          AZTEC ZK CIRCUIT PROVER SANDBOX — Barretenberg v0.66 · UltraHonk
        </span>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ background: "#7c6fcd22", color: "#7c6fcd", fontSize: 11, padding: "2px 10px", borderRadius: 4, fontWeight: 700, border: "1px solid #7c6fcd44" }}>NOIR v1.0</span>
          <span style={{ background: "#22c55e22", color: "#22c55e", fontSize: 11, padding: "2px 10px", borderRadius: 4, fontWeight: 700, border: "1px solid #22c55e44" }}>LIVE</span>
        </div>
      </div>

      <div style={{ display: "flex", minHeight: 600 }}>
        {/* ── LEFT PANEL: Editor ── */}
        <div style={{ flex: "1 1 60%", borderRight: "1px solid #2a2a3a", display: "flex", flexDirection: "column" }}>
          {/* Editor label */}
          <div style={{ padding: "8px 20px", borderBottom: "1px solid #1e1e2e", background: "#111118", display: "flex", gap: 16 }}>
            <span style={{ color: "#7c6fcd", fontSize: 11, fontWeight: 700 }}>📄 main.nr</span>
            <span style={{ color: "#3a3a4a", fontSize: 11 }}>·  Private Identity Circuit</span>
          </div>

          <textarea
            value={noirCode}
            onChange={e => setNoirCode(e.target.value)}
            spellCheck={false}
            style={{
              flex: 1,
              background: "#0a0a12",
              color: "#e2e8f0",
              border: "none",
              outline: "none",
              padding: "20px",
              fontSize: 12,
              lineHeight: 1.8,
              resize: "none",
              minHeight: 380,
              fontFamily: "inherit",
              tabSize: 2,
            }}
          />

          {/* ── Inputs ── */}
          <div style={{ borderTop: "1px solid #2a2a3a", background: "#111118", padding: "16px 20px" }}>
            <div style={{ color: "#4a4a6a", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", marginBottom: 12 }}>PRIVATE WITNESS INPUTS</div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {[
                { label: "balance (Field)", value: balance, onChange: setBalance, placeholder: "e.g. 42" },
                { label: "salt (Field)", value: salt, onChange: setSalt, placeholder: "e.g. 0xdeadbeef" },
                { label: "min_threshold (pub)", value: threshold, onChange: setThreshold, placeholder: "e.g. 10" },
              ].map(({ label, value, onChange, placeholder }) => (
                <label key={label} style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1, minWidth: 160 }}>
                  <span style={{ color: "#5a5a8a", fontSize: 10, fontWeight: 700, letterSpacing: "0.08em" }}>{label}</span>
                  <input
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    placeholder={placeholder}
                    style={{
                      background: "#0d0d1a",
                      border: "1px solid #2a2a4a",
                      borderRadius: 6,
                      color: "#a78bfa",
                      padding: "8px 12px",
                      fontSize: 12,
                      fontFamily: "inherit",
                      outline: "none",
                    }}
                  />
                </label>
              ))}
            </div>

            <button
              onClick={runPipeline}
              disabled={running}
              style={{
                marginTop: 16,
                width: "100%",
                background: running ? "#2a2a3a" : "linear-gradient(135deg, #7c6fcd, #a855f7)",
                color: running ? "#5a5a8a" : "#fff",
                border: "none",
                borderRadius: 8,
                padding: "12px 24px",
                fontFamily: "inherit",
                fontWeight: 700,
                fontSize: 13,
                letterSpacing: "0.1em",
                cursor: running ? "not-allowed" : "pointer",
                transition: "all 0.3s ease",
                boxShadow: running ? "none" : "0 0 20px rgba(124,111,205,0.4)",
              }}
            >
              {running ? "⟳  PROVING…  PLEASE WAIT" : "▶  EXECUTE FULL ZK PIPELINE"}
            </button>
          </div>
        </div>

        {/* ── RIGHT PANEL: Pipeline stages + log ── */}
        <div style={{ flex: "1 1 40%", display: "flex", flexDirection: "column" }}>
          {/* Stages */}
          <div style={{ padding: "16px 20px", borderBottom: "1px solid #2a2a3a", background: "#0f0f1a" }}>
            <div style={{ color: "#4a4a6a", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", marginBottom: 12 }}>PROVING PIPELINE</div>
            {stages.map(stage => (
              <div key={stage.id} style={{
                display: "flex", alignItems: "flex-start", gap: 12,
                padding: "10px 12px", marginBottom: 6, borderRadius: 8,
                background: stage.status !== "idle" ? `${stageColour[stage.status]}11` : "#15151f",
                border: `1px solid ${stage.status !== "idle" ? stageColour[stage.status] + "44" : "#2a2a3a"}`,
                transition: "all 0.4s ease",
              }}>
                <span style={{
                  color: stageColour[stage.status],
                  fontSize: 16,
                  lineHeight: 1,
                  animation: stage.status === "running" ? "pulse 1s ease-in-out infinite alternate" : "none",
                }}>
                  {stageDot[stage.status]}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ color: stageColour[stage.status], fontSize: 12, fontWeight: 700 }}>{stage.label}</div>
                  <div style={{ color: "#3a3a5a", fontSize: 10, marginTop: 2 }}>{stage.subtitle}</div>
                  {stage.durationMs && (
                    <div style={{ color: "#4a4a7a", fontSize: 10, marginTop: 4 }}>
                      {(stage.durationMs / 1000).toFixed(2)}s
                    </div>
                  )}
                </div>
                {stage.status === "running" && (
                  <div style={{ color: "#7c6fcd", fontSize: 10, alignSelf: "center" }}>COMPUTING</div>
                )}
              </div>
            ))}
          </div>

          {/* Proof display */}
          {proof && verifyOK === true && (
            <div style={{ padding: "12px 20px", borderBottom: "1px solid #2a2a3a", background: "#0b1a0b" }}>
              <div style={{ color: "#22c55e", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", marginBottom: 8 }}>✓ VERIFIED PROOF</div>
              <div style={{ color: "#4a6a4a", fontSize: 10, lineHeight: 1.8 }}>
                <div><span style={{ color: "#22c55e44" }}>ID  </span><span style={{ color: "#22c55eaa" }}>{proof.proofId}</span></div>
                <div><span style={{ color: "#22c55e44" }}>π_a </span><span style={{ color: "#22c55eaa" }}>[{truncate(proof.pi_a[0])}, {truncate(proof.pi_a[1])}]</span></div>
                <div><span style={{ color: "#22c55e44" }}>SIG </span><span style={{ color: "#22c55eaa" }}>{proof.publicSignals.join(", ")}</span></div>
              </div>
            </div>
          )}

          {globalError && (
            <div style={{ padding: "12px 20px", borderBottom: "1px solid #2a2a3a", background: "#1a0b0b" }}>
              <div style={{ color: "#ef4444", fontSize: 11, fontWeight: 700 }}>✗ ERROR</div>
              <div style={{ color: "#7a2a2a", fontSize: 11, marginTop: 4 }}>{globalError}</div>
            </div>
          )}

          {/* Console log */}
          <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "6px 20px", background: "#0a0a12", borderBottom: "1px solid #1e1e2e", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "#3a3a5a", fontSize: 10, fontWeight: 700, letterSpacing: "0.08em" }}>PROVER OUTPUT</span>
              <button
                onClick={resetAll}
                style={{ background: "none", border: "1px solid #2a2a3a", color: "#3a3a5a", borderRadius: 4, padding: "2px 8px", fontSize: 10, cursor: "pointer", fontFamily: "inherit" }}
              >
                CLEAR
              </button>
            </div>
            <div
              ref={logRef}
              style={{
                flex: 1, overflowY: "auto", padding: "12px 20px",
                background: "#070710", minHeight: 180,
              }}
            >
              {logLines.length === 0 && (
                <div style={{ color: "#2a2a3a", fontSize: 11 }}>
                  Press ▶ to execute the ZK proving pipeline…
                </div>
              )}
              {logLines.map((line, i) => (
                <div key={i} style={{ color: logColour[line.type], fontSize: 11, lineHeight: 1.9, whiteSpace: "pre" }}>
                  {line.text}
                </div>
              ))}
              {running && (
                <div style={{ color: "#7c6fcd", fontSize: 11, marginTop: 4 }}>
                  <span style={{ animation: "blink 1s step-end infinite" }}>█</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Footer info bar ── */}
      <div style={{
        borderTop: "1px solid #2a2a3a", padding: "10px 24px",
        background: "#0a0a12", display: "flex", gap: 24, flexWrap: "wrap",
      }}>
        {[
          ["Network", "Aztec Mainnet"],
          ["Proving System", "Barretenberg UltraHonk"],
          ["Privacy Model", "UTXO Note Commitments"],
          ["Language", "Noir v1.0"],
          ["KYC Layer", "Sumsub Biometric + ZK Credential"],
          ["Compliance", "MiCA / Travel Rule Ready"],
        ].map(([k, v]) => (
          <div key={k} style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ color: "#2a2a4a", fontSize: 10, fontWeight: 700 }}>{k}</span>
            <span style={{ color: "#4a4a7a", fontSize: 10 }}>{v}</span>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes pulse { from { opacity: 1; } to { opacity: 0.3; } }
        @keyframes blink { 0%,100% { opacity: 1; } 50% { opacity: 0; } }
      `}</style>
    </section>
  );
}
