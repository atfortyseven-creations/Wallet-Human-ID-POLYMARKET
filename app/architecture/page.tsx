import React from 'react';
import { Metadata } from 'next';
import DocLayout from '@/components/layout/DocLayout';

export const metadata: Metadata = {
  title: 'System Architecture | Humanity Ledger',
  description: 'A formal technical specification of the Humanity Ledger infrastructure, detailing network topology, state transitions, and sequencer-prover dynamics.',
};

export default function ArchitecturePage() {
  return (
    <DocLayout 
      title="System Architecture Protocol" 
      category="Technical" 
      description="A rigorous technical dissection of the Humanity Ledger's L2 network topology, execution environments, and state transition mechanisms." 
      lastUpdated="August 2026"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-slate-300 font-sans leading-relaxed">
        
        <h1 className="text-5xl font-extrabold mb-6 text-white tracking-tight">System Architecture: <br/><span className="text-blue-400">The L2 Privacy Paradigm</span></h1>
        
        <p className="text-xl text-slate-400 mb-16 leading-relaxed max-w-4xl">
          The Humanity Ledger implements a highly advanced zk-Rollup architecture natively integrated with the Aztec Network. To achieve both horizontal scalability and absolute data privacy, the architecture bifurcates execution into two distinct domains: the local Private Execution Environment (PXE) and the public network of Sequencers and Provers.
        </p>

        {/* 1. NETWORK TOPOLOGY */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-8 text-blue-400 border-b border-slate-700 pb-4">1. Network Topology & Components</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-xl shadow-lg">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">1. The PXE (Client-Side)</h3>
              <p className="text-sm text-slate-400">
                The Private Execution Environment is a local service running on the user's device (browser extension or local daemon). It securely holds decryption keys, simulates Noir smart contracts locally, decrypts incoming UTXO notes, and generates the initial zero-knowledge proof for a transaction. <em>Private state never leaves the PXE.</em>
              </p>
            </div>
            
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-xl shadow-lg">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"></path></svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">2. Sequencer Network</h3>
              <p className="text-sm text-slate-400">
                Sequencers receive transaction intents containing the user's client-side proofs and public inputs. The sequencer orders these transactions, executes any <em>public</em> functions defined in the smart contract, and proposes a new L2 block (a rollup). Sequencers must stake assets and can be slashed for malicious behavior.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-8 rounded-xl shadow-lg">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">3. Prover Marketplace</h3>
              <p className="text-sm text-slate-400">
                A decentralized marketplace of specialized hardware nodes (GPUs/ASICs) that compute the massive Honk recursive proofs required to validate a rollup block. Provers compete to generate proofs for the sequencer's proposed block in exchange for transaction fees.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-8 rounded-xl shadow-lg">
              <div className="w-12 h-12 bg-amber-500/20 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">4. Ethereum L1 Contracts</h3>
              <p className="text-sm text-slate-400">
                The ultimate source of truth. The L1 infrastructure consists of the <strong>Verifier Contract</strong> (checks the Honk proof), the <strong>Rollup Processor</strong> (updates the state root), and the <strong>Inbox/Outbox</strong> (handles cross-chain messages and asset bridging).
              </p>
            </div>
          </div>
        </section>

        {/* 2. TRANSACTION LIFECYCLE */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-8 text-blue-400 border-b border-slate-700 pb-4">2. The Transaction Lifecycle</h2>
          
          <div className="space-y-6">
            <div className="flex">
              <div className="flex-shrink-0 mr-6">
                <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center font-bold text-white border-2 border-blue-500">1</div>
              </div>
              <div>
                <h4 className="text-xl font-bold text-white mb-2">Intent & Local Execution</h4>
                <p className="text-slate-400 text-sm">The user initiates an action in the dApp. The PXE fetches necessary encrypted notes from the indexing node, decrypts them locally, and executes the Noir circuit in WebAssembly. This generates an ACIR witness and a local ZK Proof.</p>
              </div>
            </div>
            
            <div className="flex">
              <div className="flex-shrink-0 mr-6">
                <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center font-bold text-white border-2 border-blue-500">2</div>
              </div>
              <div>
                <h4 className="text-xl font-bold text-white mb-2">Broadcast to Mempool</h4>
                <p className="text-slate-400 text-sm">The PXE broadcasts the local proof, public inputs (e.g., the new Note Commitments and Nullifiers), and any public function calls to the Sequencer P2P mempool.</p>
              </div>
            </div>

            <div className="flex">
              <div className="flex-shrink-0 mr-6">
                <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center font-bold text-white border-2 border-blue-500">3</div>
              </div>
              <div>
                <h4 className="text-xl font-bold text-white mb-2">Sequencing & Public Execution</h4>
                <p className="text-slate-400 text-sm">A Sequencer picks up the transaction, orders it, and executes any associated public functions (like fee payments). The sequencer constructs the L2 block and proposes it to the Prover network.</p>
              </div>
            </div>

            <div className="flex">
              <div className="flex-shrink-0 mr-6">
                <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center font-bold text-white border-2 border-blue-500">4</div>
              </div>
              <div>
                <h4 className="text-xl font-bold text-white mb-2">Recursive Proving</h4>
                <p className="text-slate-400 text-sm">Provers compete to generate a Rollup Proof. They take the user's local proof and the sequencer's public execution trace, recursively folding them into a single, succinct proof representing the entire block.</p>
              </div>
            </div>

            <div className="flex">
              <div className="flex-shrink-0 mr-6">
                <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center font-bold text-white border-2 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]">5</div>
              </div>
              <div>
                <h4 className="text-xl font-bold text-emerald-400 mb-2">L1 Settlement</h4>
                <p className="text-slate-400 text-sm">The final proof and the state diffs (note commitments, nullifiers, public state changes) are posted to the Ethereum L1 Rollup contract. The L1 Verifier confirms the math in ~400k gas. The state root is updated, achieving ultimate finality.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 3. SCALABILITY & PARAMETERS */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-8 text-blue-400 border-b border-slate-700 pb-4">3. Scaling to Trillions of Parameters</h2>
          <p className="mb-6">
            The phrase <em>"trillones de parametros"</em> in our documentation refers to the theoretical upper bound of the constraint matrices our prover networks can evaluate via hardware acceleration. 
          </p>
          <div className="bg-[#0d1117] p-8 rounded-xl border border-slate-800 font-mono text-sm text-slate-300">
            <h4 className="text-white font-bold mb-4 font-sans text-lg">System Constraint Limits</h4>
            <ul className="space-y-3">
              <li><span className="text-pink-400">MAX_NOTE_HASHES_PER_BLOCK:</span> <span className="text-emerald-400">1,048,576 (2^20)</span></li>
              <li><span className="text-pink-400">MAX_NULLIFIERS_PER_BLOCK:</span> <span className="text-emerald-400">1,048,576 (2^20)</span></li>
              <li><span className="text-pink-400">MERKLE_TREE_DEPTH:</span> <span className="text-emerald-400">256</span> (Allows 2^256 state leaves, functionally infinite)</li>
              <li><span className="text-pink-400">RECURSION_DEPTH:</span> <span className="text-emerald-400">Dynamic</span> (Trees merge until root is reached)</li>
              <li><span className="text-pink-400">L1_VERIFICATION_COST:</span> <span className="text-emerald-400">~400,000 Gas</span> (Constant regardless of block size)</li>
            </ul>
          </div>
          <p className="mt-6 text-sm text-slate-500">
            By shifting computation off-chain and utilizing recursive composition, the L1 base layer is entirely agnostic to the complexity of the L2 transactions. Whether a transaction involves a simple token transfer or a highly complex private identity verification involving millions of constraints, the L1 verification cost remains constant.
          </p>
        </section>

      </div>
    </DocLayout>
  );
}
