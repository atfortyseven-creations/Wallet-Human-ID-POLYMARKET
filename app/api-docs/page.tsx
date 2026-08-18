import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'API Documentation | Aztec L2 SDK',
  description: 'Massively exhaustive documentation for Aztec Network L2 SDK and Noir integration.',
};

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-300 font-sans selection:bg-indigo-500/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Header Section */}
        <header className="mb-16 border-b border-slate-700 pb-10">
          <h1 className="text-5xl font-extrabold text-white tracking-tight mb-4">
            Aztec L2 SDK API Documentation
          </h1>
          <p className="text-xl text-slate-400 max-w-3xl leading-relaxed">
            Welcome to the definitive reference for the Aztec L2 SDK. This comprehensive guide covers architectural foundations, cryptographic primitives, smart contract integration in Noir, and the complete API surface required to build deeply secure, privacy-first zero-knowledge applications on the Aztec Network.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Sidebar Navigation */}
          <aside className="lg:col-span-3 hidden lg:block sticky top-8 self-start">
            <nav className="space-y-8">
              <div>
                <h3 className="font-semibold text-white uppercase tracking-wider text-sm mb-3">Core Architecture</h3>
                <ul className="space-y-2 border-l border-slate-700 ml-2 pl-4">
                  <li><a href="#state-model" className="text-indigo-400 hover:text-indigo-300 transition-colors">The UTXO State Model</a></li>
                  <li><a href="#pxe" className="text-slate-400 hover:text-slate-300 transition-colors">Private Execution Environment (PXE)</a></li>
                  <li><a href="#account-abstraction" className="text-slate-400 hover:text-slate-300 transition-colors">Native Account Abstraction</a></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-white uppercase tracking-wider text-sm mb-3">SDK Reference</h3>
                <ul className="space-y-2 border-l border-slate-700 ml-2 pl-4">
                  <li><a href="#initialization" className="text-slate-400 hover:text-slate-300 transition-colors">Initialization & Setup</a></li>
                  <li><a href="#contract-deployment" className="text-slate-400 hover:text-slate-300 transition-colors">Contract Deployment</a></li>
                  <li><a href="#transaction-lifecycle" className="text-slate-400 hover:text-slate-300 transition-colors">Transaction Lifecycle</a></li>
                  <li><a href="#state-reads" className="text-slate-400 hover:text-slate-300 transition-colors">Reading Encrypted State</a></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-white uppercase tracking-wider text-sm mb-3">Noir Smart Contracts</h3>
                <ul className="space-y-2 border-l border-slate-700 ml-2 pl-4">
                  <li><a href="#noir-macros" className="text-slate-400 hover:text-slate-300 transition-colors">State Macros & Primitives</a></li>
                  <li><a href="#public-private-calls" className="text-slate-400 hover:text-slate-300 transition-colors">Cross-Domain Execution</a></li>
                  <li><a href="#l1-l2-messaging" className="text-slate-400 hover:text-slate-300 transition-colors">L1 ↔ L2 Messaging</a></li>
                </ul>
              </div>
            </nav>
          </aside>

          {/* Main Content Area */}
          <main className="lg:col-span-9 space-y-20">
            
            {/* Section: Architectural Foundations */}
            <section id="state-model" className="scroll-mt-16">
              <h2 className="text-3xl font-bold text-white mb-6">1. Architectural Foundations: The Privacy-Preserving UTXO Model</h2>
              <div className="prose prose-invert prose-slate max-w-none">
                <p className="text-lg leading-relaxed text-slate-300">
                  Unlike Ethereum's transparent account-based model, Aztec utilizes a dual-state architecture combining public state (similar to Ethereum) and a highly advanced UTXO (Unspent Transaction Output) model for private state. The private state relies on encrypted commitments stored in the <strong>Private State Tree</strong> and nullifiers stored in the <strong>Nullifier Tree</strong> to prevent double-spending without revealing the underlying assets.
                </p>
                <div className="my-8 p-6 bg-slate-800 rounded-xl border border-slate-700">
                  <h4 className="text-white font-semibold mb-4">Architecture Diagram: Transaction Flow</h4>
                  <pre className="text-sm font-mono text-emerald-400 overflow-x-auto">
{`Client Application ────────┐
                           │ 1. Encode Call
                           ▼
┌──────────────────────────────────────────────┐
│        Private Execution Environment         │
│ ┌────────────────┐        ┌────────────────┐ │
│ │   ACIR Sim     │ ──────>│   Prover       │ │
│ └────────────────┘        └────────────────┘ │
│         │                          │         │
│         ▼                          ▼         │
│ ┌────────────────┐        ┌────────────────┐ │
│ │ State Oracle   │        │ Proof Output   │ │
│ └────────────────┘        └────────────────┘ │
└─────────┬──────────────────────────┬─────────┘
          │ 2. Fetch State           │ 3. Submit TX
          ▼                          ▼
┌──────────────────┐        ┌──────────────────┐
│   Aztec Node     │        │ Sequencer /      │
│   (RPC/Data)     │        │ Mempool          │
└──────────────────┘        └──────────────────┘`}
                  </pre>
                </div>
                <p>
                  The core insight of Aztec is that <em>private execution must happen client-side</em>. The PXE simulates the transaction, proves the state transitions locally using client-side proving, and submits only the zero-knowledge proof and encrypted state updates to the network.
                </p>
              </div>
            </section>

            {/* Section: SDK Initialization */}
            <section id="initialization" className="scroll-mt-16">
              <h2 className="text-3xl font-bold text-white mb-6">2. SDK Reference: Initialization & Setup</h2>
              <p className="text-lg text-slate-300 mb-6">
                Interacting with the Aztec Network begins by initializing the <code>PXE</code> client. This client manages the user's private keys securely, caches encrypted state, and handles the generation of client-side proofs.
              </p>
              <div className="bg-[#0d1117] rounded-xl overflow-hidden border border-slate-700">
                <div className="flex items-center px-4 py-2 bg-[#161b22] border-b border-slate-700">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <span className="ml-4 text-xs font-mono text-slate-400">setup.ts</span>
                </div>
                <div className="p-4 overflow-x-auto">
                  <pre className="text-sm font-mono text-slate-300 leading-snug">
<span className="text-pink-400">import</span> { '{' } createPXEClient, waitForPXE, PXE { '}' } <span className="text-pink-400">from</span> <span className="text-green-300">'@aztec/aztec.js'</span>;
<span className="text-pink-400">import</span> { '{' } getInitialTestAccountsWallets { '}' } <span className="text-pink-400">from</span> <span className="text-green-300">'@aztec/accounts/testing'</span>;

<span className="text-pink-400">export async function</span> <span className="text-blue-400">initializeAztec</span>(rpcUrl: <span className="text-teal-300">string</span>) { '{' }
  <span className="text-slate-500">
  // 1. Connect to the PXE
  // The PXE orchestrates private data, simulation, and proving.
  </span>
  <span className="text-pink-400">const</span> pxe: PXE = <span className="text-blue-400">createPXEClient</span>(rpcUrl);

  <span className="text-slate-500">// 2. Block until the PXE is fully synced with the node</span>
  <span className="text-pink-400">await</span> <span className="text-blue-400">waitForPXE</span>(pxe);

  <span className="text-slate-500">// 3. Retrieve local wallets (for development)</span>
  <span className="text-pink-400">const</span> wallets = <span className="text-pink-400">await</span> <span className="text-blue-400">getInitialTestAccountsWallets</span>(pxe);
  
  <span className="text-pink-400">console</span>.<span className="text-blue-400">log</span>(<span className="text-green-300">{"`"}Initialized with ${"{wallets.length}"} accounts.{"` "}</span>);
  
  <span className="text-pink-400">return</span> { '{' } pxe, wallets { '}' };
{ '}' }
                  </pre>
                </div>
              </div>
            </section>

            {/* Section: Contract Deployment */}
            <section id="contract-deployment" className="scroll-mt-16">
              <h2 className="text-3xl font-bold text-white mb-6">3. Contract Deployment</h2>
              <p className="text-lg text-slate-300 mb-6">
                Aztec contracts, written in Noir, are compiled into JSON artifacts containing the verification keys, ABI, and bytecode for both private and public functions. The SDK provides a typed interface for deploying these contracts.
              </p>
              <div className="bg-[#0d1117] rounded-xl overflow-hidden border border-slate-700">
                <div className="flex items-center px-4 py-2 bg-[#161b22] border-b border-slate-700">
                  <span className="text-xs font-mono text-slate-400">deploy.ts</span>
                </div>
                <div className="p-4 overflow-x-auto">
                  <pre className="text-sm font-mono text-slate-300 leading-snug">
<span className="text-pink-400">import</span> { '{' } Contract, Wallet { '}' } <span className="text-pink-400">from</span> <span className="text-green-300">'@aztec/aztec.js'</span>;
<span className="text-pink-400">import</span> TokenContractArtifact <span className="text-pink-400">from</span> <span className="text-green-300">'../artifacts/Token.json'</span>;

<span className="text-pink-400">export async function</span> <span className="text-blue-400">deployTokenContract</span>(
  wallet: Wallet, 
  initialSupply: <span className="text-teal-300">bigint</span>,
  owner: <span className="text-teal-300">AztecAddress</span>
) { '{' }
  <span className="text-slate-500">// Contract.deploy returns a DeployMethod that handles the transaction lifecycle</span>
  <span className="text-pink-400">const</span> deployTx = <span className="text-blue-400">Contract</span>.<span className="text-blue-400">deploy</span>(
    wallet,
    TokenContractArtifact,
    [initialSupply, owner] <span className="text-slate-500">// Constructor arguments</span>
  ).<span className="text-blue-400">send</span>();

  <span className="text-slate-500">// Wait for the transaction to be mined and indexed</span>
  <span className="text-pink-400">const</span> receipt = <span className="text-pink-400">await</span> deployTx.<span className="text-blue-400">wait</span>();
  <span className="text-pink-400">const</span> contractAddress = receipt.contractAddress;

  <span className="text-pink-400">console</span>.<span className="text-blue-400">log</span>(<span className="text-green-300">{"`"}Token deployed at: ${"{contractAddress.toString()}"}{"`"}</span>);
  
  <span className="text-slate-500">// Return a typed Contract instance for future interactions</span>
  <span className="text-pink-400">return</span> <span className="text-blue-400">Contract</span>.<span className="text-blue-400">at</span>(contractAddress, TokenContractArtifact, wallet);
{ '}' }
                  </pre>
                </div>
              </div>
            </section>

            {/* Section: Advanced Noir Snippets */}
            <section id="noir-macros" className="scroll-mt-16">
              <h2 className="text-3xl font-bold text-white mb-6">4. Noir Smart Contracts: Cryptographic Primitives</h2>
              <div className="prose prose-invert prose-slate max-w-none mb-6">
                <p className="text-lg text-slate-300">
                  Writing circuits in Noir allows developers to express complex privacy logic. Aztec extends Noir with specialized macros for state management. Below is an exhaustive example of a <code>Token</code> contract that implements a shielded transfer mechanism.
                </p>
                <p className="text-slate-400">
                  Note the use of <code>PrivateSet</code> for managing UTXOs, and the explicit <code>#[aztec(private)]</code> macros that ensure the execution happens client-side and only proof verification happens on-chain.
                </p>
              </div>

              <div className="bg-[#0d1117] rounded-xl overflow-hidden border border-slate-700">
                <div className="flex items-center px-4 py-2 bg-[#161b22] border-b border-slate-700">
                  <span className="text-xs font-mono text-slate-400">main.nr (Noir)</span>
                </div>
                <div className="p-4 overflow-x-auto">
                  <pre className="text-sm font-mono text-slate-300 leading-snug">
<span className="text-blue-400">contract</span> Token { '{' }
    <span className="text-pink-400">use</span> dep::aztec::prelude::&#123;
        AztecAddress,
        PrivateSet,
        PrivateContext,
        Map,
        NoteHeader
    &#125;;
    <span className="text-pink-400">use</span> dep::value_note::&#123;
        balance_utils,
        value_note::ValueNote
    &#125;;

    <span className="text-slate-500">// Storage layout definition</span>
    #[aztec(storage)]
    <span className="text-blue-400">struct</span> Storage { '{' }
        <span className="text-slate-500">// Map of user addresses to their encrypted UTXO notes</span>
        balances: Map&lt;AztecAddress, PrivateSet&lt;ValueNote&gt;&gt;,
    { '}' }

    <span className="text-slate-500">// Constructor is always a private function</span>
    #[aztec(private)]
    <span className="text-blue-400">fn</span> constructor(initial_supply: u120, owner: AztecAddress) { '{' }
        <span className="text-slate-500">// Create a new encrypted note for the owner</span>
        <span className="text-pink-400">let</span> mut note = ValueNote::new(initial_supply, owner);
        <span className="text-slate-500">// Insert the note into the owner's private set</span>
        storage.balances.at(owner).insert(&mut note, true);
    { '}' }

    #[aztec(private)]
    <span className="text-blue-400">fn</span> transfer(amount: u120, recipient: AztecAddress) { '{' }
        <span className="text-pink-400">let</span> sender = context.msg_sender();
        
        <span className="text-slate-500">// 1. Retrieve notes from sender's balance that sum to at least 'amount'</span>
        <span className="text-slate-500">// This reads from the PXE's local database of decrypted notes</span>
        <span className="text-pink-400">let</span> options = balance_utils::get_notes_options(amount);
        <span className="text-pink-400">let</span> notes = storage.balances.at(sender).get_notes(options);
        
        <span className="text-slate-500">// 2. Calculate total value retrieved and destroy the consumed notes (nullify)</span>
        <span className="text-pink-400">let</span> mut sum = 0;
        <span className="text-pink-400">for</span> i <span className="text-pink-400">in</span> 0..notes.len() { '{' }
            <span className="text-pink-400">if</span> notes[i].is_some() { '{' }
                <span className="text-pink-400">let</span> note = notes[i].unwrap_unchecked();
                sum += note.value;
                <span className="text-slate-500">// Emits a nullifier to the network</span>
                storage.balances.at(sender).remove(note);
            { '}' }
        { '}' }
        
        <span className="text-slate-500">// 3. Enforce valid logic inside the circuit</span>
        <span className="text-pink-400">assert</span>(sum &gt;= amount, <span className="text-green-300">"Insufficient balance"</span>);
        
        <span className="text-slate-500">// 4. Create new notes for recipient and change for sender</span>
        <span className="text-pink-400">let</span> mut recipient_note = ValueNote::new(amount, recipient);
        storage.balances.at(recipient).insert(&mut recipient_note, true);
        
        <span className="text-pink-400">if</span> sum &gt; amount { '{' }
            <span className="text-pink-400">let</span> mut change_note = ValueNote::new(sum - amount, sender);
            storage.balances.at(sender).insert(&mut change_note, true);
        { '}' }
    { '}' }
{ '}' }
                  </pre>
                </div>
              </div>
            </section>

          </main>
        </div>
      </div>
    </div>
  );
}
