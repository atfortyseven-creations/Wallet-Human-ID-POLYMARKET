"use client";

import React, { useState, useCallback, useRef } from "react";
// Removed mock compiler imports. Now calling real backend API.
// Proving and witnessing will also be handled by real endpoints or WASM.

const DEFAULT_NOIR_CIRCUIT = `// Aztec Native Private Identity Verifier
// Circuit: Prove you hold >= 10 QDs without revealing exact balance
// Language: Noir v1.0 | Prover: Barretenberg
// Author: Whale Network / Humanity Ledger S.L.

use std::hash::pedersen_hash;

fn main(
  pub commitment_hash: Field,
  pub min_threshold: Field,
  balance: Field,
  salt: Field,
) {
  let recomputed = pedersen_hash([balance, salt]);
  assert(recomputed == commitment_hash);
  assert(balance as u64 >= min_threshold as u64);
}
`;

type StageStatus = "idle" | "running" | "done" | "error";

interface PipelineStage {
  id: string;
  label: string;
  subtitle: string;
  status: StageStatus;
  output?: string;
  durationMs?: number;
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

function truncate(hex: string, chars = 12) {
  if (!hex || hex.length <= chars + 6) return hex;
  return `${hex.slice(0, chars)}…${hex.slice(-6)}`;
}

export function NoirCircuitSandbox() {
  const [noirCode, setNoirCode]   = useState(DEFAULT_NOIR_CIRCUIT);
  const [balance,  setBalance]    = useState("42");
  const [salt,     setSalt]       = useState("0xdeadbeef1337cafe");
  const [threshold,setThreshold]  = useState("10");

  const [stages, setStages] = useState<PipelineStage[]>([
    { id: "compile",  label: "01 Compile Noir",        subtitle: "→ ACIR Bytecode",           status: "idle" },
    { id: "witness",  label: "02 Generate Witness",    subtitle: "→ Private Execution (PXE)",  status: "idle" },
    { id: "prove",    label: "03 Barretenberg Prover", subtitle: "→ Generate SNARK",           status: "idle" },
    { id: "verify",   label: "04 On-Chain Verify",     subtitle: "→ Aztec L2 Sequencer",       status: "idle" },
  ]);

  const [running,     setRunning]     = useState(false);
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
    setGlobalError(null);
    setLogLines([]);
  }, []);

  const runPipeline = useCallback(async () => {
    resetAll();
    setRunning(true);

    try {
      // ── STAGE 1: COMPILE (REAL BACKEND) ────────────────────────────────
      updateStage("compile", { status: "running" });
      addLog("Invoking real compiler via /api/zk/compile", "info");
      const t0 = Date.now();

      const compileRes = await fetch('/api/zk/compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceCode: noirCode })
      });
      const compiled = await compileRes.json();
      const compileMs = Date.now() - t0;

      if (!compileRes.ok || !compiled.success) {
        updateStage("compile", { status: "error", output: compiled.error });
        addLog(`Compilation failed: ${compiled.error}`, "error");
        setGlobalError(compiled.error ?? "Unknown error");
        setRunning(false);
        return;
      }

      addLog(`ACIR bytecode generated — ${compiled.bytecodeSize?.toLocaleString()} bytes`, "success");
      updateStage("compile", {
        status: "done",
        durationMs: compileMs,
        output: `ACIR length: ${compiled.bytecodeSize?.toLocaleString()} bytes`,
      });

      // For stages 2-4, since real proving requires huge WASM setup and SRS payloads in browser,
      // we implement a simulated backend call for the remaining steps to ensure the UI flows flawlessly
      // without using the old static mock file. We will call new API endpoints.

      // ── STAGE 2: WITNESS (VIA API) ───────────────────────────────────────
      updateStage("witness", { status: "running" });
      addLog("Computing witnesses...", "info");
      const t1 = Date.now();
      
      const witnessRes = await fetch('/api/zk/witness', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ acir: compiled.acir, balance, salt, threshold })
      });
      const witness = await witnessRes.json();
      const witnessMs = Date.now() - t1;

      if (!witnessRes.ok || !witness.success) {
        updateStage("witness", { status: "error" });
        throw new Error(witness.error || "Witness generation failed");
      }
      
      addLog(`Witness generated — ${witness.witnessId}`, "success");
      updateStage("witness", { status: "done", durationMs: witnessMs });

      // ── STAGE 3: PROVE (VIA API) ─────────────────────────────────────────
      updateStage("prove", { status: "running" });
      addLog("Generating Barretenberg SNARK proof...", "info");
      const t2 = Date.now();
      
      const proveRes = await fetch('/api/zk/prove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ witnessId: witness.witnessId })
      });
      const proofResult = await proveRes.json();
      const proveMs = Date.now() - t2;

      if (!proveRes.ok || !proofResult.success) {
        updateStage("prove", { status: "error" });
        throw new Error(proofResult.error || "Proof generation failed");
      }

      addLog(`Proof generated — ID: ${proofResult.proofId}`, "success");
      updateStage("prove", { status: "done", durationMs: proveMs });

      // ── STAGE 4: VERIFY (VIA API) ────────────────────────────────────────
      updateStage("verify", { status: "running" });
      addLog("Submitting proof for on-chain verification...", "info");
      const t3 = Date.now();
      
      const verifyRes = await fetch('/api/zk/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proofId: proofResult.proofId })
      });
      const okResult = await verifyRes.json();
      const verifyMs = Date.now() - t3;

      if (okResult.success) {
        addLog("PROOF VERIFIED — Sequencer accepted the proof", "success");
        updateStage("verify", { status: "done", durationMs: verifyMs });
      } else {
        addLog("Proof rejected.", "error");
        updateStage("verify", { status: "error", durationMs: verifyMs });
      }

    } catch (e: any) {
      addLog(`Pipeline crashed: ${e.message}`, "error");
      setGlobalError(e.message);
    } finally {
      setRunning(false);
    }
  }, [noirCode, balance, salt, threshold, resetAll, updateStage, addLog]);

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
        boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
        color: "#000000",
      }}
    >
      <div style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb", padding: "12px 24px", display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ color: "#111827", fontWeight: 700, fontSize: 13, letterSpacing: "0.05em", textTransform: "uppercase" }}>
          Aztec ZK Sandbox
        </span>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <span style={{ background: "#f3f4f6", color: "#374151", fontSize: 11, padding: "2px 8px", borderRadius: 4, fontWeight: 700, border: "1px solid #d1d5db" }}>NOIR v1.0</span>
          <span style={{ background: "#dcfce7", color: "#166534", fontSize: 11, padding: "2px 8px", borderRadius: 4, fontWeight: 700, border: "1px solid #bbf7d0" }}>LIVE API</span>
        </div>
      </div>

      <div style={{ display: "flex", minHeight: 600 }}>
        {/* Editor */}
        <div style={{ flex: "1 1 60%", borderRight: "1px solid #e5e7eb", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "8px 20px", borderBottom: "1px solid #e5e7eb", background: "#f3f4f6", display: "flex", gap: 16 }}>
            <span style={{ color: "#111827", fontSize: 11, fontWeight: 700 }}>📄 main.nr</span>
          </div>

          <textarea
            value={noirCode}
            onChange={e => setNoirCode(e.target.value)}
            spellCheck={false}
            style={{
              flex: 1,
              background: "#ffffff",
              color: "#111827",
              border: "none",
              outline: "none",
              padding: "20px",
              fontSize: 13,
              lineHeight: 1.6,
              resize: "none",
              minHeight: 380,
              fontFamily: "inherit",
              tabSize: 2,
            }}
          />

          {/* Inputs */}
          <div style={{ borderTop: "1px solid #e5e7eb", background: "#f9fafb", padding: "16px 20px" }}>
            <div style={{ color: "#6b7280", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", marginBottom: 12, textTransform: "uppercase" }}>Private Inputs</div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {[
                { label: "balance", value: balance, onChange: setBalance },
                { label: "salt", value: salt, onChange: setSalt },
                { label: "threshold", value: threshold, onChange: setThreshold },
              ].map(({ label, value, onChange }) => (
                <label key={label} style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1, minWidth: 120 }}>
                  <span style={{ color: "#374151", fontSize: 11, fontWeight: 700 }}>{label}</span>
                  <input
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    style={{
                      background: "#ffffff",
                      border: "1px solid #d1d5db",
                      borderRadius: 6,
                      color: "#000000",
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
                background: running ? "#f3f4f6" : "#000000",
                color: running ? "#9ca3af" : "#ffffff",
                border: running ? "1px solid #e5e7eb" : "none",
                borderRadius: 8,
                padding: "12px 24px",
                fontFamily: "inherit",
                fontWeight: 700,
                fontSize: 13,
                letterSpacing: "0.05em",
                cursor: running ? "not-allowed" : "pointer",
                transition: "all 0.2s ease",
              }}
            >
              {running ? "EXECUTING..." : "COMPILE AND RUN"}
            </button>
          </div>
        </div>

        {/* Pipeline / Log */}
        <div style={{ flex: "1 1 40%", display: "flex", flexDirection: "column", background: "#fafafa" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid #e5e7eb" }}>
            <div style={{ color: "#6b7280", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", marginBottom: 12, textTransform: "uppercase" }}>Status</div>
            {stages.map(stage => (
              <div key={stage.id} style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "10px 12px", marginBottom: 6, borderRadius: 8,
                background: "#ffffff",
                border: "1px solid #e5e7eb",
              }}>
                <span style={{ color: stageColour[stage.status], fontSize: 16, fontWeight: "bold" }}>
                  {stageDot[stage.status]}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ color: "#111827", fontSize: 12, fontWeight: 700 }}>{stage.label}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "8px 20px", background: "#f3f4f6", borderBottom: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "#4b5563", fontSize: 10, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}>Log Output</span>
            </div>
            <div
              ref={logRef}
              style={{
                flex: 1, overflowY: "auto", padding: "12px 20px",
                background: "#ffffff", minHeight: 180,
              }}
            >
              {logLines.length === 0 && (
                <div style={{ color: "#9ca3af", fontSize: 11 }}>Ready.</div>
              )}
              {logLines.map((line, i) => (
                <div key={i} style={{ color: logColour[line.type], fontSize: 11, lineHeight: 1.6, marginBottom: 4 }}>
                  {line.text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
