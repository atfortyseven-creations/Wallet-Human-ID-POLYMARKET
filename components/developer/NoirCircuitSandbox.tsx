"use client";

import React, { useState, useCallback, useRef } from "react";

// ─── Curated circuit examples from the Aztec/Noir Discord community ───────────
const CIRCUIT_EXAMPLES: { label: string; code: string }[] = [
  {
    label: "Balance Commitment (Pedersen)",
    code: `// Prove you hold >= min_threshold without revealing exact balance
// Uses: Pedersen hash commitment scheme
use std::hash::pedersen_hash;

fn main(
  pub commitment_hash: Field,
  pub min_threshold: u64,
  balance: Field,
  salt: Field,
) {
  let recomputed = pedersen_hash([balance, salt]);
  assert(recomputed == commitment_hash);
  assert(balance as u64 >= min_threshold);
}
`,
  },
  {
    label: "Merkle Membership Proof",
    code: `// Prove membership in a Merkle tree without revealing the leaf
use std::hash::pedersen_hash;
use std::merkle::compute_merkle_root;

fn main(
  pub root: Field,
  leaf: Field,
  index: Field,
  hash_path: [Field; 10],
) {
  let computed_root = compute_merkle_root(leaf, index, hash_path);
  assert(computed_root == root);
}
`,
  },
  {
    label: "SHA-256 Preimage",
    code: `// Prove knowledge of preimage of a SHA-256 hash
use std::hash::sha256;

fn main(
  pub hash: [u8; 32],
  preimage: [u8; 64],
) {
  let computed = sha256(preimage);
  assert(computed == hash);
}
`,
  },
  {
    label: "ECDSA Signature Verifier",
    code: `// Verify a secp256k1 ECDSA signature (Ethereum-compatible)
use std::ecdsa_secp256k1;

fn main(
  pub_key_x: [u8; 32],
  pub_key_y: [u8; 32],
  signature:  [u8; 64],
  message_hash: [u8; 32],
) {
  let valid: bool = ecdsa_secp256k1::verify_signature(
    pub_key_x, pub_key_y, signature, message_hash
  );
  assert(valid == true);
}
`,
  },
  {
    label: "Range Proof (u64 bounds)",
    code: `// Prove a private value lies within [min, max]
fn main(
  pub min: u64,
  pub max: u64,
  secret_value: u64,
) {
  assert(secret_value >= min);
  assert(secret_value <= max);
}
`,
  },
  {
    label: "Multi-Input + Struct",
    code: `// Circuit using a custom struct for grouped inputs
struct Transfer {
  from_balance: Field,
  to_balance:   Field,
  amount:       Field,
}

fn main(
  pub new_from: Field,
  pub new_to:   Field,
  transfer:     Transfer,
) {
  assert(transfer.from_balance >= transfer.amount);
  assert(new_from == transfer.from_balance - transfer.amount);
  assert(new_to   == transfer.to_balance   + transfer.amount);
}
`,
  },
  {
    label: "Keccak-256 Hash Gate",
    code: `// Prove knowledge of Keccak-256 preimage (Ethereum native)
use std::hash::keccak256;

fn main(
  pub expected_hash: [u8; 32],
  preimage: [u8; 32],
) {
  let computed = keccak256(preimage);
  assert(computed == expected_hash);
}
`,
  },
  {
    label: "Blake2s Hash Gate",
    code: `// Prove knowledge of a Blake2s preimage
use std::hash::blake2s;

fn main(
  pub digest: [u8; 32],
  input: [u8; 32],
) {
  let computed = blake2s(input);
  assert(computed == digest);
}
`,
  },
  {
    label: "Boolean Logic Gate",
    code: `// Minimal AND gate circuit — useful for testing the sandbox
fn main(a: bool, b: bool, pub c: bool) {
  assert((a & b) == c);
}
`,
  },
  {
    label: "Array Sum Constraint",
    code: `// Prove that the sum of a private array equals a public value
fn main(pub claimed_sum: Field, values: [Field; 5]) {
  let mut sum = 0;
  for i in 0..5 {
    sum = sum + values[i];
  }
  assert(sum == claimed_sum);
}
`,
  },
];

type StageStatus = "idle" | "running" | "done" | "error";

interface PipelineStage {
  id: string;
  label: string;
  subtitle: string;
  status: StageStatus;
  output?: string;
  durationMs?: number;
}

interface AbiParam {
  name: string;
  type: string;
  visibility: string;
}

interface CompileResult {
  acir: string;
  bytecodeSize: number;
  abi: AbiParam[];
  warnings: string[];
  compileMs: number;
  nargoVersion: string;
}

const stageColour: Record<StageStatus, string> = {
  idle:    "#9ca3af",
  running: "#3b82f6",
  done:    "#10b981",
  error:   "#ef4444",
};

const stageDot: Record<StageStatus, string> = {
  idle:    "○",
  running: "●",
  done:    "✓",
  error:   "✗",
};

export function NoirCircuitSandbox() {
  const [noirCode, setNoirCode] = useState(CIRCUIT_EXAMPLES[0].code);
  const [selectedExample, setSelectedExample] = useState(0);

  const [stages, setStages] = useState<PipelineStage[]>([
    { id: "compile", label: "01 Compile Noir",        subtitle: "→ ACIR Bytecode via Nargo CLI", status: "idle" },
    { id: "witness", label: "02 Generate Witness",    subtitle: "→ Private Execution (PXE)",     status: "idle" },
    { id: "prove",   label: "03 Barretenberg Prover", subtitle: "→ Generate UltraHonk SNARK",   status: "idle" },
    { id: "verify",  label: "04 On-Chain Verify",     subtitle: "→ Aztec L2 Sequencer",         status: "idle" },
  ]);

  const [running,       setRunning]      = useState(false);
  const [globalError,   setGlobalError]  = useState<string | null>(null);
  const [compileResult, setCompileResult] = useState<CompileResult | null>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const [logLines, setLogLines] = useState<{ text: string; type: "info"|"success"|"warn"|"error" }[]>([]);

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
    setGlobalError(null);
    setLogLines([]);
    setCompileResult(null);
  }, []);

  const runPipeline = useCallback(async () => {
    resetAll();
    setRunning(true);

    try {
      // ── STAGE 1: COMPILE via real Nargo CLI ──────────────────────────────
      updateStage("compile", { status: "running" });
      addLog("Sending circuit to Nargo compiler backend…", "info");
      addLog("Downloading/checking Nargo binary if needed…", "info");
      const t0 = Date.now();

      const compileRes = await fetch('/api/zk/compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceCode: noirCode }),
      });
      const compiled = await compileRes.json();
      const compileMs = Date.now() - t0;

      if (!compileRes.ok || !compiled.success) {
        updateStage("compile", { status: "error", output: compiled.error });
        setGlobalError(compiled.error ?? "Unknown compilation error");
        setRunning(false);
        return;
      }

      setCompileResult(compiled);

      addLog(`✓ ACIR bytecode generated — ${compiled.bytecodeSize?.toLocaleString()} bytes`, "success");
      addLog(`✓ Nargo v${compiled.nargoVersion} compiled in ${compiled.compileMs} ms`, "success");
      if (compiled.abi?.length > 0) {
        addLog(`  Circuit parameters (${compiled.abi.length}):`, "info");
        for (const p of compiled.abi) {
          const vis = p.visibility === 'public' ? 'pub ' : '';
          addLog(`    ${vis}${p.name}: ${p.type}`, "info");
        }
      }
      if (compiled.warnings?.length > 0) {
        for (const w of compiled.warnings) addLog(`⚠ ${w}`, "warn");
      }
      updateStage("compile", {
        status: "done",
        durationMs: compileMs,
        output: `ACIR: ${compiled.bytecodeSize?.toLocaleString()} bytes`,
      });

      // ── STAGE 2: WITNESS ─────────────────────────────────────────────────
      updateStage("witness", { status: "running" });
      addLog("Computing witness map…", "info");
      const t1 = Date.now();

      const witnessRes = await fetch('/api/zk/witness', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ acir: compiled.acir }),
      });
      const witness = await witnessRes.json();
      const witnessMs = Date.now() - t1;

      if (!witnessRes.ok || !witness.success) {
        updateStage("witness", { status: "error" });
        throw new Error(witness.error || "Witness generation failed");
      }

      addLog(`✓ Witness generated — ID: ${witness.witnessId}`, "success");
      updateStage("witness", { status: "done", durationMs: witnessMs });

      // ── STAGE 3: PROVE ───────────────────────────────────────────────────
      updateStage("prove", { status: "running" });
      addLog("Generating Barretenberg UltraHonk SNARK proof…", "info");
      const t2 = Date.now();

      const proveRes = await fetch('/api/zk/prove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ witnessId: witness.witnessId }),
      });
      const proofResult = await proveRes.json();
      const proveMs = Date.now() - t2;

      if (!proveRes.ok || !proofResult.success) {
        updateStage("prove", { status: "error" });
        throw new Error(proofResult.error || "Proof generation failed");
      }

      addLog(`✓ Proof generated — ID: ${proofResult.proofId}`, "success");
      updateStage("prove", { status: "done", durationMs: proveMs });

      // ── STAGE 4: VERIFY ──────────────────────────────────────────────────
      updateStage("verify", { status: "running" });
      addLog("Submitting to Aztec L2 sequencer for verification…", "info");
      const t3 = Date.now();

      const verifyRes = await fetch('/api/zk/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proofId: proofResult.proofId }),
      });
      const okResult = await verifyRes.json();
      const verifyMs = Date.now() - t3;

      if (okResult.success) {
        addLog("✓ PROOF VERIFIED — Sequencer accepted the proof", "success");
        updateStage("verify", { status: "done", durationMs: verifyMs });
      } else {
        addLog("✗ Proof rejected.", "error");
        updateStage("verify", { status: "error", durationMs: verifyMs });
      }

    } catch (e: any) {
      addLog(`Pipeline error: ${e.message}`, "error");
      setGlobalError(e.message);
    } finally {
      setRunning(false);
    }
  }, [noirCode, resetAll, updateStage, addLog]);

  const logColour = { info: "#6b7280", success: "#10b981", warn: "#f59e0b", error: "#ef4444" };

  return (
    <section
      id="noir-sandbox"
      style={{
        fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
        background: "#ffffff",
        borderRadius: 16,
        border: "1px solid #e5e7eb",
        overflow: "hidden",
        width: "100%",
        boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
        color: "#000000",
      }}
    >
      {/* Header bar */}
      <div style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb", padding: "12px 24px", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <span style={{ color: "#111827", fontWeight: 700, fontSize: 13, letterSpacing: "0.05em", textTransform: "uppercase" }}>
          Aztec ZK Sandbox
        </span>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8, flexWrap: "wrap" }}>
          <span style={{ background: "#f3f4f6", color: "#374151", fontSize: 11, padding: "2px 8px", borderRadius: 4, fontWeight: 700, border: "1px solid #d1d5db" }}>NARGO v{compileResult?.nargoVersion ?? "0.36"}</span>
          <span style={{ background: "#dcfce7", color: "#166534", fontSize: 11, padding: "2px 8px", borderRadius: 4, fontWeight: 700, border: "1px solid #bbf7d0" }}>LIVE COMPILER</span>
          <span style={{ background: "#dbeafe", color: "#1e40af", fontSize: 11, padding: "2px 8px", borderRadius: 4, fontWeight: 700, border: "1px solid #93c5fd" }}>BARRETENBERG</span>
        </div>
      </div>

      {/* Example selector */}
      <div style={{ background: "#f3f4f6", borderBottom: "1px solid #e5e7eb", padding: "10px 20px", display: "flex", gap: 6, overflowX: "auto", alignItems: "center" }}>
        <span style={{ color: "#6b7280", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", whiteSpace: "nowrap", marginRight: 8 }}>
          Examples:
        </span>
        {CIRCUIT_EXAMPLES.map((ex, i) => (
          <button
            key={i}
            onClick={() => { setSelectedExample(i); setNoirCode(ex.code); resetAll(); }}
            style={{
              background: selectedExample === i ? "#000000" : "#ffffff",
              color:      selectedExample === i ? "#ffffff"  : "#374151",
              border: "1px solid #d1d5db",
              borderRadius: 6,
              padding: "4px 10px",
              fontSize: 10,
              fontWeight: 700,
              fontFamily: "inherit",
              cursor: "pointer",
              whiteSpace: "nowrap",
              transition: "all 0.15s ease",
            }}
          >
            {ex.label}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", minHeight: 560, flexWrap: "wrap" }}>
        {/* ── Editor panel ── */}
        <div style={{ flex: "1 1 55%", borderRight: "1px solid #e5e7eb", display: "flex", flexDirection: "column", minWidth: 300 }}>
          <div style={{ padding: "8px 20px", borderBottom: "1px solid #e5e7eb", background: "#f3f4f6", display: "flex", gap: 16, alignItems: "center" }}>
            <span style={{ color: "#111827", fontSize: 11, fontWeight: 700 }}>📄 main.nr</span>
            <span style={{ marginLeft: "auto", color: "#9ca3af", fontSize: 10 }}>{noirCode.split('\n').length} lines</span>
          </div>

          <textarea
            value={noirCode}
            onChange={e => { setNoirCode(e.target.value); resetAll(); }}
            spellCheck={false}
            style={{
              flex: 1,
              background: "#ffffff",
              color: "#111827",
              border: "none",
              outline: "none",
              padding: "20px",
              fontSize: 13,
              lineHeight: 1.7,
              resize: "none",
              minHeight: 360,
              fontFamily: "inherit",
              tabSize: 2,
            }}
          />

          {/* Compile button */}
          <div style={{ borderTop: "1px solid #e5e7eb", background: "#f9fafb", padding: "16px 20px" }}>
            <button
              id="compile-run-btn"
              onClick={runPipeline}
              disabled={running}
              style={{
                width: "100%",
                background: running ? "#f3f4f6" : "#000000",
                color: running ? "#9ca3af" : "#ffffff",
                border: running ? "1px solid #e5e7eb" : "none",
                borderRadius: 8,
                padding: "14px 24px",
                fontFamily: "inherit",
                fontWeight: 700,
                fontSize: 13,
                letterSpacing: "0.06em",
                cursor: running ? "not-allowed" : "pointer",
                transition: "all 0.2s ease",
              }}
            >
              {running ? "⏳ COMPILING…" : "▶  COMPILE AND RUN"}
            </button>
          </div>
        </div>

        {/* ── Output panel ── */}
        <div style={{ flex: "1 1 45%", display: "flex", flexDirection: "column", background: "#fafafa", minWidth: 260 }}>

          {/* Pipeline stages */}
          <div style={{ padding: "16px 20px", borderBottom: "1px solid #e5e7eb" }}>
            <div style={{ color: "#6b7280", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", marginBottom: 10, textTransform: "uppercase" }}>Pipeline Status</div>
            {stages.map(stage => (
              <div key={stage.id} style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "9px 12px", marginBottom: 5, borderRadius: 7,
                background: "#ffffff",
                border: `1px solid ${stage.status === 'error' ? '#fecaca' : stage.status === 'done' ? '#d1fae5' : '#e5e7eb'}`,
              }}>
                <span style={{ color: stageColour[stage.status], fontSize: 15, fontWeight: "bold", minWidth: 16 }}>
                  {stage.status === 'running' ? (
                    <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>◌</span>
                  ) : stageDot[stage.status]}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ color: "#111827", fontSize: 11, fontWeight: 700 }}>{stage.label}</div>
                  <div style={{ color: "#9ca3af", fontSize: 10, marginTop: 1 }}>{stage.output ?? stage.subtitle}</div>
                </div>
                {stage.durationMs !== undefined && (
                  <span style={{ color: "#9ca3af", fontSize: 10 }}>{stage.durationMs}ms</span>
                )}
              </div>
            ))}
          </div>

          {/* ABI panel (shown after successful compile) */}
          {compileResult && compileResult.abi.length > 0 && (
            <div style={{ padding: "12px 20px", borderBottom: "1px solid #e5e7eb", background: "#f0fdf4" }}>
              <div style={{ color: "#166534", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>
                Circuit ABI — {compileResult.abi.length} parameter{compileResult.abi.length !== 1 ? 's' : ''}
              </div>
              {compileResult.abi.map((p, i) => (
                <div key={i} style={{ display: "flex", gap: 8, marginBottom: 4, fontSize: 11 }}>
                  <span style={{ background: p.visibility === 'public' ? '#dbeafe' : '#f3f4f6', color: p.visibility === 'public' ? '#1e40af' : '#6b7280', padding: "1px 6px", borderRadius: 4, fontWeight: 700, fontSize: 9, letterSpacing: "0.05em", alignSelf: "center" }}>
                    {p.visibility === 'public' ? 'PUB' : 'PRIV'}
                  </span>
                  <span style={{ color: "#111827", fontWeight: 700 }}>{p.name}</span>
                  <span style={{ color: "#6b7280" }}>{p.type.replace(/"/g, '').replace(/\{kind:\s*([^,}]+)[^}]*\}/g, '$1')}</span>
                </div>
              ))}
            </div>
          )}

          {/* Error panel */}
          {globalError && (
            <div style={{ padding: "12px 20px", borderBottom: "1px solid #fecaca", background: "#fff5f5" }}>
              <div style={{ color: "#dc2626", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>
                Compilation Error
              </div>
              <pre style={{ color: "#7f1d1d", fontSize: 11, lineHeight: 1.6, margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                {globalError}
              </pre>
            </div>
          )}

          {/* Log output */}
          <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "8px 20px", background: "#f3f4f6", borderBottom: "1px solid #e5e7eb" }}>
              <span style={{ color: "#4b5563", fontSize: 10, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}>Log Output</span>
            </div>
            <div ref={logRef} style={{ flex: 1, overflowY: "auto", padding: "12px 20px", background: "#ffffff", minHeight: 120 }}>
              {logLines.length === 0 && (
                <div style={{ color: "#9ca3af", fontSize: 11 }}>Select an example or write your circuit, then click COMPILE AND RUN.</div>
              )}
              {logLines.map((line, i) => (
                <div key={i} style={{ color: logColour[line.type], fontSize: 11, lineHeight: 1.6, marginBottom: 3, fontFamily: "inherit" }}>
                  {line.text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </section>
  );
}
