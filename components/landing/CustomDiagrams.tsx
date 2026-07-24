import React from 'react';
import { motion } from 'framer-motion';

export function ArchitectureDiagram() {
  return (
    <div className="w-full bg-white/40 backdrop-blur-2xl border border-slate-200 rounded-[32px] p-8 md:p-12 shadow-xl my-16">
      <div className="text-center mb-10">
        <h4 className="text-xl font-bold text-slate-800">Aztec Network Architecture</h4>
        <p className="text-slate-500 text-sm mt-2">Combining L1 Security with L2 Programmable Privacy</p>
      </div>
      
      <div className="flex flex-col md:flex-row gap-6 items-stretch justify-center">
        {/* L1 Box */}
        <div className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl p-6 relative">
          <div className="absolute top-0 right-0 p-3 opacity-20">L1</div>
          <h5 className="font-bold text-slate-800 text-lg mb-4 text-center">Ethereum L1 (Fully Public)</h5>
          <div className="flex flex-col gap-4">
            <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-4 text-center">
              <span className="block text-sm text-slate-500 font-semibold mb-1">Public State</span>
              <span className="text-xs text-slate-400">Ledger</span>
            </div>
            <div className="text-center text-slate-300">↕</div>
            <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-4 text-center">
              <span className="block text-sm text-slate-500 font-semibold mb-1">Smart Contracts</span>
              <span className="text-xs text-slate-400">EVM Execution</span>
            </div>
          </div>
        </div>

        <div className="hidden md:flex flex-col justify-center items-center px-4">
          <div className="h-0.5 w-12 bg-indigo-200 relative">
            <div className="absolute -top-1.5 -left-1 w-3 h-3 border-t-2 border-l-2 border-indigo-200 transform -rotate-45"></div>
            <div className="absolute -top-1.5 -right-1 w-3 h-3 border-t-2 border-r-2 border-indigo-200 transform rotate-45"></div>
          </div>
          <span className="text-[10px] uppercase text-indigo-400 font-bold mt-2 whitespace-nowrap">Rollup Proofs</span>
        </div>

        {/* L2 Box */}
        <div className="flex-[1.5] bg-indigo-50/50 border border-indigo-100 rounded-2xl p-6 relative">
          <div className="absolute top-0 right-0 p-3 opacity-20 text-indigo-800">L2</div>
          <h5 className="font-bold text-indigo-900 text-lg mb-6 text-center">Aztec Network L2 (Programmable Privacy)</h5>
          
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Private Env */}
            <div className="flex-1 bg-white border border-indigo-100 shadow-sm rounded-xl p-4">
              <h6 className="text-sm font-bold text-indigo-800 mb-4 text-center">Private Execution</h6>
              <div className="flex flex-col gap-3">
                <div className="bg-indigo-50 rounded-lg p-3 text-center">
                  <span className="block text-xs font-semibold text-indigo-700">User Device (Noir)</span>
                </div>
                <div className="text-center text-indigo-200 text-xs">↕</div>
                <div className="bg-slate-900 rounded-lg p-3 text-center">
                  <span className="block text-xs font-semibold text-white">Encrypted State</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-center items-center px-2">
              <span className="text-xl text-indigo-300">→</span>
              <span className="text-[10px] uppercase text-indigo-400 font-bold mt-1 text-center">ZK Proofs</span>
            </div>

            {/* Public Env */}
            <div className="flex-1 bg-white border border-indigo-100 shadow-sm rounded-xl p-4">
              <h6 className="text-sm font-bold text-slate-700 mb-4 text-center">Public Execution</h6>
              <div className="flex flex-col gap-3">
                <div className="bg-slate-50 rounded-lg p-3 text-center border border-slate-200">
                  <span className="block text-xs font-semibold text-slate-600">Aztec Sequencer</span>
                </div>
                <div className="text-center text-slate-300 text-xs">↕</div>
                <div className="bg-slate-100 rounded-lg p-3 text-center border border-slate-200">
                  <span className="block text-xs font-semibold text-slate-700">Public State</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ZkRollupComparisonDiagram() {
  return (
    <div className="w-full bg-white/40 backdrop-blur-2xl border border-slate-200 rounded-[32px] p-8 md:p-12 shadow-xl my-16">
      <div className="text-center mb-10">
        <h4 className="text-xl font-bold text-slate-800">Myth vs Reality</h4>
        <p className="text-slate-500 text-sm mt-2">Standard ZK Rollups vs True Privacy Rollups</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Standard */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
          <h5 className="font-bold text-slate-700 mb-6 text-center border-b border-slate-200 pb-4">Standard ZK Rollups (e.g. zkSync, Starknet)</h5>
          
          <div className="flex flex-col items-center gap-4">
            <div className="bg-white border border-slate-200 rounded-xl px-6 py-3 w-full text-center">
              <span className="text-sm font-semibold text-slate-600">Public Inputs</span>
            </div>
            <div className="h-8 border-l-2 border-slate-300"></div>
            <div className="bg-slate-800 rounded-xl px-6 py-4 w-full text-center">
              <span className="text-sm font-bold text-white">ZK Prover</span>
            </div>
            
            <div className="flex w-full justify-around mt-2">
              <div className="flex flex-col items-center">
                <div className="h-8 border-l-2 border-slate-300 mb-2"></div>
                <span className="text-xs text-slate-500 text-center">Succinct Proof<br/>(Scalability)</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="h-8 border-l-2 border-slate-300 mb-2"></div>
                <span className="text-xs text-slate-500 text-center">Computation Integrity<br/>(Correctness)</span>
              </div>
            </div>

            <div className="w-full mt-6 bg-red-50 border border-red-100 rounded-xl p-4 text-center">
              <span className="text-xs font-bold text-red-600 uppercase tracking-wide">Data is Public (No Privacy)</span>
            </div>
          </div>
        </div>

        {/* Aztec */}
        <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-6 shadow-[0_0_40px_rgba(99,102,241,0.1)] relative">
          <div className="absolute -top-3 -right-3">
             <span className="bg-indigo-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">True Privacy</span>
          </div>
          <h5 className="font-bold text-indigo-900 mb-6 text-center border-b border-indigo-100 pb-4">Aztec Privacy Rollup</h5>
          
          <div className="flex flex-col items-center gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl px-6 py-3 w-full text-center">
              <span className="text-sm font-semibold text-indigo-300">Private Inputs (User Secrets)</span>
            </div>
            <div className="h-8 border-l-2 border-indigo-200"></div>
            <div className="bg-indigo-600 rounded-xl px-6 py-4 w-full text-center shadow-lg shadow-indigo-600/30">
              <span className="text-sm font-bold text-white">Client-Side ZK Prover</span>
            </div>
            
            <div className="flex w-full justify-around mt-2">
              <div className="flex flex-col items-center">
                <div className="h-8 border-l-2 border-indigo-200 mb-2"></div>
                <span className="text-xs text-indigo-700 text-center font-medium">Succinct Proof</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="h-8 border-l-2 border-indigo-200 mb-2"></div>
                <span className="text-xs text-indigo-700 text-center font-medium">Data Hiding<br/>(Confidentiality)</span>
              </div>
            </div>

            <div className="w-full mt-6 bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-center">
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wide">Data is Encrypted (Full Privacy)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function UtxoArchitectureDiagram() {
  return (
    <div className="w-full bg-white/40 backdrop-blur-2xl border border-slate-200 rounded-[32px] p-8 md:p-12 shadow-xl my-16">
      <div className="text-center mb-10">
        <h4 className="text-xl font-bold text-slate-800">UTXO Architecture</h4>
        <p className="text-slate-500 text-sm mt-2">Private State Trees and the Nullifier Set</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 justify-center">
        {/* State Tree */}
        <div className="flex-1 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h5 className="font-bold text-slate-700 mb-6 text-center text-sm uppercase tracking-wide">Private State Tree<br/><span className="text-[10px] text-slate-400">Append-Only</span></h5>
          
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-indigo-100 border-2 border-indigo-300 flex items-center justify-center mb-6">
              <span className="text-xs font-bold text-indigo-700 text-center">State<br/>Root</span>
            </div>
            
            <div className="flex w-full justify-between px-4 relative">
              {/* Lines */}
              <div className="absolute top-[-24px] left-1/2 w-[1px] h-6 bg-indigo-200"></div>
              <div className="absolute top-[-24px] left-1/4 right-1/4 h-[1px] bg-indigo-200"></div>
              <div className="absolute top-[-24px] left-1/4 w-[1px] h-6 bg-indigo-200"></div>
              <div className="absolute top-[-24px] right-1/4 w-[1px] h-6 bg-indigo-200"></div>

              <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3 text-center flex-1 mx-2 relative group">
                <span className="block text-sm font-bold text-indigo-900">Note A</span>
                <span className="text-[10px] text-emerald-600 font-bold uppercase">Live</span>
                {/* Arrow connecting Note A to Nullifier */}
                <div className="hidden md:block absolute top-1/2 right-[-24px] w-6 h-[1px] border-b-2 border-dashed border-slate-300 z-10"></div>
              </div>
              <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3 text-center flex-1 mx-2">
                <span className="block text-sm font-bold text-indigo-900">Note B</span>
                <span className="text-[10px] text-emerald-600 font-bold uppercase">Live</span>
              </div>
            </div>
          </div>
        </div>

        <div className="hidden md:flex flex-col justify-center items-center">
          <span className="text-[10px] text-slate-400 font-bold uppercase text-center w-24">Derives via<br/>Secret Key</span>
          <span className="text-slate-300 text-xl">→</span>
        </div>

        {/* Nullifier Tree */}
        <div className="flex-1 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h5 className="font-bold text-slate-700 mb-6 text-center text-sm uppercase tracking-wide">Nullifier Set<br/><span className="text-[10px] text-slate-400">Deletion Tracking</span></h5>
          
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 border-2 border-slate-300 flex items-center justify-center mb-6">
              <span className="text-xs font-bold text-slate-700 text-center">Nullifier<br/>Root</span>
            </div>
            
            <div className="flex w-full justify-between px-4 relative">
              {/* Lines */}
              <div className="absolute top-[-24px] left-1/2 w-[1px] h-6 bg-slate-200"></div>
              <div className="absolute top-[-24px] left-1/4 right-1/4 h-[1px] bg-slate-200"></div>
              <div className="absolute top-[-24px] left-1/4 w-[1px] h-6 bg-slate-200"></div>
              <div className="absolute top-[-24px] right-1/4 w-[1px] h-6 bg-slate-200"></div>

              <div className="bg-slate-800 border border-slate-900 rounded-lg p-3 text-center flex-1 mx-2">
                <span className="block text-xs font-bold text-white mb-1">Nullifier (A)</span>
                <span className="text-[9px] text-slate-400 uppercase leading-tight block">Prevents Double Spend</span>
              </div>
              <div className="bg-slate-50 border border-slate-200 border-dashed rounded-lg p-3 text-center flex-1 mx-2 flex items-center justify-center">
                <span className="text-[10px] text-slate-400 uppercase font-medium">Empty Leaf</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-8 bg-indigo-50/50 rounded-xl p-4 border border-indigo-100">
        <p className="text-sm text-indigo-800 text-center">
          <span className="font-bold text-indigo-900">Note:</span> To "delete" Note A, the user generates its Nullifier and appends it to the Nullifier Set.
        </p>
      </div>
    </div>
  );
}

export function TransactionLifecycleDiagram() {
  return (
    <div className="w-full bg-white/40 backdrop-blur-2xl border border-slate-200 rounded-[32px] p-8 md:p-12 shadow-xl my-16 overflow-hidden">
      <div className="text-center mb-10">
        <h4 className="text-xl font-bold text-slate-800">Transaction Lifecycle</h4>
        <p className="text-slate-500 text-sm mt-2">From Client-Side Proving to L1 Finality</p>
      </div>

      <div className="relative border-l-2 border-indigo-100 ml-4 md:ml-10 space-y-8 pb-4">
        
        <div className="relative pl-8">
          <div className="absolute -left-3.5 top-1 w-7 h-7 bg-indigo-600 rounded-full border-4 border-white flex items-center justify-center text-[10px] font-bold text-white">1</div>
          <h5 className="font-bold text-slate-800 text-sm mb-1">Request Private Transaction</h5>
          <p className="text-xs text-slate-500">User Device → Private Execution Environment (PXE)</p>
        </div>

        <div className="relative pl-8">
          <div className="absolute -left-3.5 top-1 w-7 h-7 bg-indigo-500 rounded-full border-4 border-white flex items-center justify-center text-[10px] font-bold text-white">2</div>
          <h5 className="font-bold text-slate-800 text-sm mb-1">Fetch & Decrypt UTXOs</h5>
          <p className="text-xs text-slate-500">PXE queries encrypted state and decrypts locally.</p>
        </div>

        <div className="relative pl-8">
          <div className="absolute -left-3.5 top-1 w-7 h-7 bg-purple-500 rounded-full border-4 border-white flex items-center justify-center text-[10px] font-bold text-white">3</div>
          <h5 className="font-bold text-slate-800 text-sm mb-1">Generate ZK-SNARK Proof</h5>
          <p className="text-xs text-slate-500">Private Kernel Circuit (Noir) executes smart contract logic & generates proof.</p>
          <div className="mt-3 bg-slate-900 rounded-lg p-3 inline-block">
            <span className="text-[10px] font-mono text-emerald-400">Raw private data NEVER leaves the device.</span>
          </div>
        </div>

        <div className="relative pl-8">
          <div className="absolute -left-3.5 top-1 w-7 h-7 bg-pink-500 rounded-full border-4 border-white flex items-center justify-center text-[10px] font-bold text-white">4</div>
          <h5 className="font-bold text-slate-800 text-sm mb-1">Submit Proof to Sequencer</h5>
          <p className="text-xs text-slate-500">Client submits Proof + Public Inputs + Nullifiers to Aztec Sequencer.</p>
        </div>

        <div className="relative pl-8">
          <div className="absolute -left-3.5 top-1 w-7 h-7 bg-slate-400 rounded-full border-4 border-white flex items-center justify-center text-[10px] font-bold text-white">5</div>
          <h5 className="font-bold text-slate-800 text-sm mb-1">Sequencer Verification</h5>
          <p className="text-xs text-slate-500">Sequencer verifies proofs & checks nullifiers to prevent double spend.</p>
        </div>

        <div className="relative pl-8">
          <div className="absolute -left-3.5 top-1 w-7 h-7 bg-slate-600 rounded-full border-4 border-white flex items-center justify-center text-[10px] font-bold text-white">6</div>
          <h5 className="font-bold text-slate-800 text-sm mb-1">L1 Finality</h5>
          <p className="text-xs text-slate-500">Rollup Block is merged. Proof & State Root Updates posted to Ethereum L1.</p>
        </div>

      </div>
    </div>
  );
}

export function PrivacyComponentsDiagram() {
  return (
    <div className="w-full bg-white/40 backdrop-blur-2xl border border-slate-200 rounded-[32px] p-8 md:p-12 shadow-xl my-16">
      <div className="text-center mb-10">
        <h4 className="text-xl font-bold text-slate-800">Programmable Privacy</h4>
        <p className="text-slate-500 text-sm mt-2">The Two Architectural Pillars</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 hover:shadow-lg transition-shadow">
          <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold mb-4">1</div>
          <h5 className="font-bold text-indigo-900 mb-4">Data Privacy</h5>
          <ul className="space-y-3">
            <li className="flex items-start gap-2">
              <span className="text-indigo-400 mt-0.5">✓</span>
              <span className="text-sm text-slate-600">User Owns Encrypted State</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-400 mt-0.5">✓</span>
              <span className="text-sm text-slate-600">External World Cannot Read</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-400 mt-0.5">✓</span>
              <span className="text-sm text-slate-600">Prevents Front-Running</span>
            </li>
          </ul>
        </div>

        <div className="bg-purple-50 border border-purple-100 rounded-2xl p-6 hover:shadow-lg transition-shadow">
          <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-bold mb-4">2</div>
          <h5 className="font-bold text-purple-900 mb-4">Confidentiality</h5>
          <ul className="space-y-3">
            <li className="flex items-start gap-2">
              <span className="text-purple-400 mt-0.5">✓</span>
              <span className="text-sm text-slate-600">Smart Contracts Process Encrypted Data</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-400 mt-0.5">✓</span>
              <span className="text-sm text-slate-600">Private Function Execution</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-400 mt-0.5">✓</span>
              <span className="text-sm text-slate-600">Unattainable by unauthorized apps</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
