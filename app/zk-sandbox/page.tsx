import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Noir ZK Sandbox | Humanity Ledger',
  description: 'Interactive IDE and compilation environment for Noir zero-knowledge circuits.',
};

export default function ZkSandboxPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 font-sans flex flex-col h-screen overflow-hidden">
      
      {/* Top Navbar */}
      <nav className="h-14 border-b border-slate-800 bg-slate-900 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-7 h-7 rounded bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-lg text-sm">
            N
          </div>
          <h1 className="text-sm font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            Noir ZK Sandbox <span className="text-slate-600 font-normal ml-2">v0.32.0 (Barretenberg)</span>
          </h1>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center px-3 py-1 bg-slate-800 rounded text-xs font-mono text-slate-400 border border-slate-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
            WASM Prover Loaded
          </div>
          <button className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded transition-all shadow-lg shadow-indigo-900/50">
            Compile & Prove
          </button>
        </div>
      </nav>

      {/* IDE Area */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* File Explorer (Left) */}
        <div className="w-64 border-r border-slate-800 bg-slate-900/50 flex flex-col shrink-0">
          <div className="px-4 py-2 border-b border-slate-800 flex justify-between items-center bg-slate-900">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Explorer</span>
            <span className="text-slate-500 hover:text-white cursor-pointer">+</span>
          </div>
          <div className="py-2 text-sm">
            <div className="px-4 py-1 text-slate-400 font-mono hover:bg-slate-800 cursor-pointer flex items-center">
              <span className="mr-2">📁</span> src
            </div>
            <div className="px-4 py-1 pl-8 text-indigo-300 font-mono bg-indigo-900/20 border-l-2 border-indigo-500 cursor-pointer flex items-center">
              <span className="mr-2 text-slate-500">📄</span> main.nr
            </div>
            <div className="px-4 py-1 pl-8 text-slate-400 font-mono hover:bg-slate-800 cursor-pointer flex items-center">
              <span className="mr-2 text-slate-500">📄</span> Nargo.toml
            </div>
            <div className="px-4 py-1 pl-8 text-slate-400 font-mono hover:bg-slate-800 cursor-pointer flex items-center">
              <span className="mr-2 text-slate-500">📄</span> Prover.toml
            </div>
          </div>
        </div>

        {/* Code Editor (Center) */}
        <div className="flex-1 flex flex-col bg-[#0d1117] border-r border-slate-800 overflow-hidden">
          <div className="flex px-4 py-2 bg-[#161b22] border-b border-slate-800 text-xs font-mono text-slate-400 space-x-4">
            <span className="text-slate-200 border-b border-slate-200 pb-1 -mb-2">main.nr</span>
            <span className="hover:text-slate-200 cursor-pointer">Prover.toml</span>
          </div>
          <div className="flex-1 p-4 overflow-auto font-mono text-sm leading-relaxed">
<pre>
<span className="text-slate-500">// Zero-Knowledge Identity Proof Circuit</span>
<span className="text-slate-500">// Prove ownership of a private key and age > 18 without revealing DoB</span>

<span className="text-pink-400">use</span> dep::std;

<span className="text-pink-400">fn</span> <span className="text-blue-400">main</span>(
  <span className="text-slate-500">// Public Inputs (Visible to verifier)</span>
  identity_commitment: <span className="text-pink-400">pub</span> Field,
  current_year: <span className="text-pink-400">pub</span> u32,
  
  <span className="text-slate-500">// Private Inputs (The Witness - Never leaves browser)</span>
  private_key: Field,
  birth_year: u32,
  randomness: Field
) {'{'}
    
    <span className="text-slate-500">// 1. Compute the public key from the private key (Grumpkin scalar mul)</span>
    <span className="text-pink-400">let</span> public_key = std::scalar_mul::fixed_base(private_key);
    
    <span className="text-slate-500">// 2. Hash the public key, birth year, and randomness using Poseidon2</span>
    <span className="text-pink-400">let</span> computed_commitment = std::hash::poseidon::bn254::hash_3([
        public_key[0], 
        birth_year <span className="text-pink-400">as</span> Field, 
        randomness
    ]);
    
    <span className="text-slate-500">// 3. Constrain: Does the computed hash match the public commitment?</span>
    <span className="text-pink-400">assert</span>(computed_commitment == identity_commitment);
    
    <span className="text-slate-500">// 4. Constrain: Is the user over 18?</span>
    <span className="text-pink-400">let</span> age = current_year - birth_year;
    <span className="text-pink-400">assert</span>(age &gt;= 18);
{'}'}
</pre>
          </div>
        </div>

        {/* Terminal / Output (Right) */}
        <div className="w-96 bg-[#0a0a0f] flex flex-col shrink-0">
          <div className="px-4 py-2 border-b border-slate-800 bg-slate-900 flex justify-between items-center">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Compiler Output</span>
            <div className="flex gap-2">
              <span className="w-2 h-2 rounded-full bg-slate-700"></span>
              <span className="w-2 h-2 rounded-full bg-slate-700"></span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
            </div>
          </div>
          <div className="flex-1 p-4 font-mono text-[11px] text-emerald-500 overflow-auto whitespace-pre-wrap leading-relaxed">
            <div>$ nargo compile</div>
            <div className="text-slate-400">Compiling workspace...</div>
            <div className="text-slate-400">Pass 1: Parsing and resolving imports</div>
            <div className="text-slate-400">Pass 2: Type checking and monomorphization</div>
            <div className="text-slate-400">Pass 3: ACIR generation</div>
            <div className="text-slate-300 mt-2">Constraint system generated successfully.</div>
            <div className="text-indigo-400 mt-2">Backend: Barretenberg (Honk)</div>
            <div className="text-indigo-400">Total ACIR Opcodes: 4,821</div>
            <div className="text-indigo-400">Circuit Size: ~12 KB</div>
            <div className="mt-4">$ bb prove -b ./target/main.json -w ./target/witness.tr</div>
            <div className="text-slate-400">Generating witness...</div>
            <div className="text-slate-400">Constructing proof over BN254...</div>
            <div className="text-white mt-2 font-bold">Proof successfully generated in 1.42s</div>
            <div className="text-slate-500 mt-2 break-all text-[9px]">
              0x0421a...8f9c [2048 bytes]
            </div>
            <div className="text-emerald-400 mt-4 font-bold border border-emerald-500/30 bg-emerald-500/10 p-2 rounded">
              ✅ VERIFICATION PASSED
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
