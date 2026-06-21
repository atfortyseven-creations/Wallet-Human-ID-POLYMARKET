"use client";

import React, { useState, useCallback, useRef } from "react";
import { Loader2, ShieldAlert, Zap, Terminal, Code2, ShieldCheck, Braces } from "lucide-react";

// ─── Quantum Institutional Circuits ───────────
const CIRCUIT_EXAMPLES: { label: string; code: string; difficulty: string }[] = [
  {
    label: "Dark Pool Order Matching",
    difficulty: "ABYSMAL",
    code: `// ZK Orderbook Matcher: Proves two orders cross without revealing price or amount.
// Uses Pedersen commitments for Price and Amount, proving Volume >= MinVolume.
use std::hash::pedersen_hash;

struct Order {
  price_commitment: Field,
  amount_commitment: Field,
  salt: Field,
}

fn main(
  maker: Order,
  taker: Order,
  pub matched_volume_commitment: Field,
  maker_price: u64,
  taker_price: u64,
  matched_amount: u64
) {
  // 1. Verify Maker and Taker commitments
  let maker_p_hash = pedersen_hash([maker_price as Field, maker.salt]);
  assert(maker_p_hash == maker.price_commitment);
  
  let taker_p_hash = pedersen_hash([taker_price as Field, taker.salt]);
  assert(taker_p_hash == taker.price_commitment);

  // 2. Execution Constraint: Taker buys at >= Maker sell price
  assert(taker_price >= maker_price);

  // 3. Match Constraint (Hidden Volume)
  let vol_hash = pedersen_hash([matched_amount as Field, maker.salt, taker.salt]);
  assert(vol_hash == matched_volume_commitment);
}
`,
  },
  {
    label: "AML / Travel Rule Compliance",
    difficulty: "EXTREME",
    code: `// Proves an identity is verified (Merkle) and not in a sanctioned region (Range)
use std::hash::pedersen_hash;
use std::merkle::compute_merkle_root;

fn main(
  pub kyc_merkle_root: Field,
  identity_hash: Field,
  jurisdiction_code: u64,
  hash_path: [Field; 20],
  index: Field,
) {
  // 1. Prove KYC verification
  let computed_root = compute_merkle_root(identity_hash, index, hash_path);
  assert(computed_root == kyc_merkle_root);

  // 2. Sanctioned Region Constraints (e.g. OFAC blocks > 800)
  // [SECURITY] Ensure range checks to prevent underflow exploits
  assert(jurisdiction_code < 800);
  assert(jurisdiction_code != 403); // Specific blacklisted code
}
`,
  },
  {
    label: "Omnichain MPT State Proof",
    difficulty: "ABYSMAL",
    code: `// Validates Ethereum L1 Merkle Patricia Trie inside L2 Noir.
use std::hash::keccak256;

fn main(
  pub l1_state_root: [u8; 32],
  pub contract_address: [u8; 20],
  storage_slot: [u8; 32],
  storage_value: [u8; 32],
  mpt_proof_nodes: [[u8; 532]; 4] // Bounded depth for L1 Trie
) {
  // In a real omnichain circuit, we verify the RLP encoded nodes
  // against the keccak hashes tracing up to the l1_state_root.
  let leaf_hash = keccak256(storage_value);
  
  // Simulated Constraint
  assert(leaf_hash != [0; 32]);
}
`,
  },
  {
    label: "Recursive SNARK Verification",
    difficulty: "QUANTUM",
    code: `// Plonk-in-Plonk: Aggregates a child proof within this circuit
use std::verify_proof;

fn main(
  pub verification_key: [Field; 114],
  pub public_inputs: [Field; 4],
  proof: [Field; 93]
) {
  // Verifies an UltraHonk / Plonk proof from another execution
  let is_valid = verify_proof(
    verification_key,
    proof,
    public_inputs,
    0 // key_hash
  );
  assert(is_valid == true);
}
`,
  }
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

export function NoirCircuitSandbox() {
  const [noirCode, setNoirCode] = useState(CIRCUIT_EXAMPLES[0].code);
  const [selectedExample, setSelectedExample] = useState(0);

  const [stages, setStages] = useState<PipelineStage[]>([
    { id: "ast",     label: "01 Lexical AST Parsing",  subtitle: "→ Security Profile & Linter", status: "idle" },
    { id: "compile", label: "02 ACIR Optimization",    subtitle: "→ Bytecode Compilation", status: "idle" },
    { id: "witness", label: "03 Witness Generation",   subtitle: "→ Base Field Execution", status: "idle" },
    { id: "prove",   label: "04 UltraHonk Prover",     subtitle: "→ SNARK Synthesis", status: "idle" },
  ]);

  const [running, setRunning] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);
  const [logLines, setLogLines] = useState<{ text: string; type: "info"|"success"|"warn"|"error"|"system" }[]>([]);

  const addLog = useCallback((text: string, type: "info"|"success"|"warn"|"error"|"system" = "info") => {
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
    setLogLines([]);
  }, []);

  const simulateQuantumCompilation = useCallback(async () => {
    resetAll();
    setRunning(true);

    try {
      // ── STAGE 1: AST PARSING & SECURITY LINTER ───────────────────────────
      updateStage("ast", { status: "running" });
      addLog("> INITIATING QUANTUM LINTER...", "system");
      await new Promise(r => setTimeout(r, 600));
      
      const lines = noirCode.split('\\n');
      let isVulnerable = false;

      // Simulated security diagnostics based on code content
      if (noirCode.includes('Recursive SNARK Verification')) {
        addLog("[AST] Detected Plonk-in-Plonk recursion tree.", "info");
        await new Promise(r => setTimeout(r, 400));
        addLog("[SECURITY_WARN] WARNING: Aggregation key hash is unconstrained (0).", "warn");
        addLog("  ↳ Fix: Enforce key_hash commitment to prevent rogue VK substitution.", "warn");
        isVulnerable = true;
      } else if (noirCode.includes('jurisdiction_code < 800')) {
         addLog("[AST] Detected u64 boundary constraints.", "info");
         addLog("[SECURITY_WARN] Vulnerability: Soundness break in range constraint.", "error");
         addLog("  ↳ Context: Base Field overflow possible if jurisdiction_code exceeds max Field size before u64 coercion.", "error");
         addLog("  ↳ Fix: Apply bit-size constraints: assert(jurisdiction_code as u32 < 800);", "error");
         isVulnerable = true;
      } else if (noirCode.includes('pedersen_hash')) {
         addLog("[AST] Verified Pedersen commitments.", "success");
         addLog("[LINTER] Optimal entropy detected in salts.", "success");
      }

      if (isVulnerable) {
        addLog("[AST] Compilation halted due to critical security violations.", "error");
        updateStage("ast", { status: "error", output: "Security violation detected" });
        return;
      }

      updateStage("ast", { status: "done", durationMs: 843, output: "AST Validated" });

      // ── STAGE 2: ACIR COMPILATION ────────────────────────────────────────
      updateStage("compile", { status: "running" });
      addLog("> GENERATING ABSTRACT CIRCUIT INTERMEDIATE REPRESENTATION...", "system");
      await new Promise(r => setTimeout(r, 1200));

      const gateCount = Math.floor(Math.random() * 50000) + 20000;
      addLog(\`[ACIR] Generated \${gateCount.toLocaleString()} logic gates.\`, "info");
      addLog(\`[ACIR] Applied O(N log N) polynomial reduction.\`, "info");
      updateStage("compile", { status: "done", durationMs: 1240, output: \`ACIR Bytecode: \${gateCount} gates\` });

      // ── STAGE 3: WITNESS GENERATION ──────────────────────────────────────
      updateStage("witness", { status: "running" });
      addLog("> EXECUTING BASE FIELD OPERATIONS...", "system");
      await new Promise(r => setTimeout(r, 800));

      addLog(\`[PXE] Generated witness map with \${Math.floor(gateCount * 0.8).toLocaleString()} non-zero entries.\`, "success");
      updateStage("witness", { status: "done", durationMs: 820, output: "Witness Map Generated" });

      // ── STAGE 4: PROVING ─────────────────────────────────────────────────
      updateStage("prove", { status: "running" });
      addLog("> SYNTHESIZING ULTRAHONK SNARK...", "system");
      await new Promise(r => setTimeout(r, 2000));

      addLog("[PROVER] FFT Evaluations complete.", "info");
      addLog("[PROVER] Multi-scalar multiplication (MSM) bounded.", "info");
      const proofSize = Math.floor(Math.random() * 200) + 2000;
      addLog(\`[PROVER] Proof synthesized. Size: \${proofSize} bytes.\`, "success");
      
      updateStage("prove", { status: "done", durationMs: 2150, output: \`UltraHonk SNARK: \${proofSize}B\` });

      addLog("==================================", "system");
      addLog("» QUANTUM COMPILATION SUCCESSFUL «", "success");
      addLog("==================================", "system");

    } catch (e: any) {
      addLog(\`Fatal error: \${e.message}\`, "error");
    } finally {
      setRunning(false);
    }
  }, [noirCode, resetAll, updateStage, addLog]);

  const logColour = { info: "#9ca3af", success: "#10b981", warn: "#f59e0b", error: "#ef4444", system: "#3b82f6" };

  return (
    <section className="font-mono bg-[#050505] rounded-2xl border border-white/10 overflow-hidden w-full shadow-2xl text-white">
      {/* Header */}
      <div className="bg-[#0a0a0a] border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Terminal size={18} className="text-blue-500" />
          <span className="font-bold text-sm tracking-widest uppercase">Noir Quantum Compiler</span>
        </div>
        <div className="flex gap-2">
          <span className="bg-blue-500/10 text-blue-400 text-[10px] px-2 py-1 rounded border border-blue-500/20 font-bold">V 0.36.0-NIGHTLY</span>
          <span className="bg-green-500/10 text-green-400 text-[10px] px-2 py-1 rounded border border-green-500/20 font-bold">WASM JIT</span>
        </div>
      </div>

      {/* Example Selector */}
      <div className="bg-[#0f0f0f] border-b border-white/10 px-4 py-3 flex gap-2 overflow-x-auto items-center no-scrollbar">
        <span className="text-white/40 text-[10px] font-bold tracking-[0.2em] uppercase mr-2">Architectures:</span>
        {CIRCUIT_EXAMPLES.map((ex, i) => (
          <button
            key={i}
            onClick={() => { setSelectedExample(i); setNoirCode(ex.code); resetAll(); }}
            className={\`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded transition-all whitespace-nowrap \${selectedExample === i ? 'bg-white text-black' : 'bg-white/5 text-white/60 hover:bg-white/10'}\`}
          >
            {ex.label} <span className="opacity-50 ml-1">[{ex.difficulty}]</span>
          </button>
        ))}
      </div>

      <div className="flex flex-col md:flex-row min-h-[600px]">
        {/* Editor */}
        <div className="flex-1 border-b md:border-b-0 md:border-r border-white/10 flex flex-col min-w-[320px]">
          <div className="px-4 py-2 bg-[#0a0a0a] border-b border-white/10 flex justify-between items-center">
            <div className="flex items-center gap-2 text-white/50 text-[11px]">
              <Code2 size={14} /> main.nr
            </div>
            <span className="text-white/30 text-[10px]">{noirCode.split('\\n').length} lines</span>
          </div>
          <textarea
            value={noirCode}
            onChange={e => { setNoirCode(e.target.value); resetAll(); }}
            spellCheck={false}
            className="flex-1 bg-transparent text-white/90 p-6 text-[13px] leading-relaxed resize-none outline-none font-mono focus:bg-white/[0.02] transition-colors"
          />
          <button
            onClick={simulateQuantumCompilation}
            disabled={running}
            className={\`w-full py-5 font-bold text-[12px] uppercase tracking-[0.2em] transition-all \${running ? 'bg-white/5 text-white/30 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-500'}\`}
          >
            {running ? "COMPILING KERNEL..." : "RUN SECURITY COMPILER"}
          </button>
        </div>

        {/* Output Panel */}
        <div className="flex-[0.8] flex flex-col bg-[#050505]">
          <div className="p-6 border-b border-white/10">
            <h3 className="text-white/40 text-[10px] font-bold tracking-[0.2em] uppercase mb-4">Pipeline Status</h3>
            {stages.map(stage => (
              <div key={stage.id} className={\`flex items-center gap-3 p-3 mb-2 rounded-lg border \${stage.status === 'error' ? 'border-red-500/30 bg-red-500/5' : stage.status === 'done' ? 'border-green-500/30 bg-green-500/5' : 'border-white/5 bg-white/[0.02]'}\`}>
                <div className="min-w-[20px] flex justify-center">
                  {stage.status === 'running' ? <Loader2 size={14} className="animate-spin text-blue-500" /> :
                   stage.status === 'error' ? <ShieldAlert size={14} className="text-red-500" /> :
                   stage.status === 'done' ? <ShieldCheck size={14} className="text-green-500" /> :
                   <div className="w-1.5 h-1.5 rounded-full bg-white/20" />}
                </div>
                <div className="flex-1">
                  <div className="text-[11px] font-bold text-white/90">{stage.label}</div>
                  <div className="text-[10px] text-white/40 mt-0.5">{stage.output ?? stage.subtitle}</div>
                </div>
                {stage.durationMs && <span className="text-[10px] text-white/30">{stage.durationMs}ms</span>}
              </div>
            ))}
          </div>

          <div className="flex-1 flex flex-col">
            <div className="px-6 py-2 bg-[#0a0a0a] border-b border-white/10 flex items-center gap-2">
               <Zap size={12} className="text-yellow-500" />
               <span className="text-white/40 text-[10px] font-bold tracking-[0.2em] uppercase">Diagnostic Output</span>
            </div>
            <div ref={logRef} className="flex-1 p-6 overflow-y-auto max-h-[300px]">
               {logLines.length === 0 && <div className="text-white/20 text-[11px]">Awaiting kernel execution...</div>}
               {logLines.map((line, i) => (
                 <div key={i} className="text-[11px] leading-[1.7] mb-1 font-mono break-words" style={{ color: logColour[line.type] }}>
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
