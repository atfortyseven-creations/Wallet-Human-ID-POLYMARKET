import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ZK Sandbox | Aztec Noir Development',
  description: 'Interactive sandbox for compiling, proving, and deploying Noir zero-knowledge circuits.',
};

export default function ZkSandboxPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans">
      
      {/* Top Navbar */}
      <nav className="h-16 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between px-6 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center space-x-4">
          <div className="w-8 h-8 rounded-md bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">
            N
          </div>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            Noir ZK Sandbox
          </h1>
        </div>
        <div className="flex items-center space-x-4">
          <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium border border-emerald-500/20 flex items-center">
            <span className="w-2 h-2 rounded-full bg-emerald-400 mr-2 animate-pulse"></span>
            PXE Connected
          </span>
          <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-sm font-medium rounded-lg transition-all border border-slate-700 hover:border-slate-600">
            Settings
          </button>
        </div>
      </nav>

      {/* Main Workspace */}
      <div className="flex h-[calc(100vh-4rem)]">
        
        {/* Left Panel: File Explorer */}
        <div className="w-64 border-r border-slate-800 bg-slate-900/30 flex flex-col hidden md:flex">
          <div className="p-4 border-b border-slate-800">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Explorer</h2>
          </div>
          <div className="flex-1 overflow-y-auto py-2">
            <div className="px-4 py-2 text-sm text-slate-300 hover:bg-slate-800/50 cursor-pointer flex items-center group">
              <svg className="w-4 h-4 mr-2 text-slate-500 group-hover:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path></svg>
              src
            </div>
            <div className="px-4 py-2 text-sm text-indigo-300 bg-indigo-500/10 border-l-2 border-indigo-500 cursor-pointer flex items-center pl-8">
              <svg className="w-4 h-4 mr-2 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
              main.nr
            </div>
            <div className="px-4 py-2 text-sm text-slate-400 hover:bg-slate-800/50 cursor-pointer flex items-center pl-8">
              <svg className="w-4 h-4 mr-2 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
              Prover.toml
            </div>
          </div>
        </div>

        {/* Center Panel: Editor */}
        <div className="flex-1 flex flex-col bg-[#0d1117]">
          <div className="flex bg-[#161b22] border-b border-slate-800 overflow-x-auto">
            <div className="px-4 py-2 border-b-2 border-indigo-500 text-indigo-400 text-sm font-mono flex items-center bg-[#0d1117]">
              main.nr
              <button className="ml-2 hover:text-white">&times;</button>
            </div>
          </div>
          
          <div className="flex-1 overflow-auto p-4 relative font-mono text-sm leading-relaxed">
            {/* Simulated Editor Content */}
            <pre className="text-slate-300">
<span className="text-slate-500">{'// This is a minimal Noir circuit demonstrating privacy preservation.'}</span>
<span className="text-slate-500">{'// Users prove they know a pre-image to a hash without revealing it.'}</span>

<span className="text-pink-400">use</span> dep::std;

<span className="text-blue-400">fn</span> <span className="text-yellow-200">main</span>(
    <span className="text-slate-500">{'// Secret input (witness), not revealed on-chain'}</span>
    secret: Field, 
    <span className="text-slate-500">{'// Public input, accessible to the verifier'}</span>
    public_hash: <span className="text-pink-400">pub</span> Field
) { '{' }
    <span className="text-slate-500">{'// Hash the secret using Poseidon (SNARK-friendly hash)'}</span>
    <span className="text-pink-400">let</span> computed_hash = std::hash::poseidon::bn254::hash_1([secret]);
    
    <span className="text-slate-500">{'// Constrain the computed hash to equal the public hash'}</span>
    <span className="text-pink-400">assert</span>(computed_hash == public_hash, <span className="text-green-300">"Invalid secret preimage"</span>);
{ '}' }

<span className="text-slate-500">{'// Test cases can be run locally within the sandbox'}</span>
<span className="text-blue-400">#[test]</span>
<span className="text-blue-400">fn</span> <span className="text-yellow-200">test_valid_preimage</span>() { '{' }
    <span className="text-pink-400">let</span> secret = 42;
    <span className="text-pink-400">let</span> hash = std::hash::poseidon::bn254::hash_1([secret]);
    main(secret, hash);
{ '}' }
            </pre>
          </div>
        </div>

        {/* Right Panel: Actions & Output */}
        <div className="w-80 border-l border-slate-800 bg-slate-900/30 flex flex-col hidden lg:flex">
          
          {/* Actions */}
          <div className="p-4 border-b border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Operations</h3>
            <button className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold shadow-lg shadow-indigo-500/20 transition-all flex justify-center items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              Compile Circuit
            </button>
            <button className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-sm font-semibold transition-all">
              Generate Proof
            </button>
            <button className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-sm font-semibold transition-all">
              Deploy to Localhost
            </button>
          </div>

          {/* Terminal / Output */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="p-3 border-b border-slate-800 bg-slate-900 flex justify-between items-center">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Terminal Output</h3>
              <button className="text-slate-500 hover:text-slate-300 text-xs">Clear</button>
            </div>
            <div className="flex-1 p-4 bg-black/40 overflow-y-auto font-mono text-xs text-slate-300 space-y-2">
              <div className="text-slate-500">{"$ nargo check"}</div>
              <div className="text-emerald-400">{"Constraint system successfully built!"}</div>
              <div className="text-slate-500 mt-4">{"$ nargo test"}</div>
              <div>{"Running 1 test..."}</div>
              <div className="text-emerald-400">{"test test_valid_preimage ... ok"}</div>
              <div className="mt-4 text-slate-500">{"Ready."}</div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
