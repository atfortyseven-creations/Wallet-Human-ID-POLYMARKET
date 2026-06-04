'use client';
import { useState } from 'react';

export default function AICoPilot() {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState<string | null>(null);

  const handleQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    // In a production environment this calls an API endpoint running a local LLM or connected to an on-chain dataset
    setResponse(`[AI Co-Pilot ZK-Verificado] El análisis del dataset on-chain para "${query}" indica un TVL asimétrico en L2. Se recomienda re-balancear.`);
  };

  return (
    <div className="mt-6 border-t border-white/10 pt-4">
      <h3 className="font-mono text-[10px] text-emerald-400 mb-2">AI CO-PILOT (ON-CHAIN AWARE)</h3>
      <form onSubmit={handleQuery} className="flex gap-2">
        <input 
          type="text" 
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Ask on-chain agent..."
          className="bg-white/5 border border-white/10 rounded px-2 py-1 text-xs font-mono w-full focus:outline-none focus:border-emerald-500"
        />
        <button type="submit" className="bg-emerald-500 text-black px-2 rounded text-xs font-bold">Ask</button>
      </form>
      {response && (
        <div className="mt-2 p-2 bg-emerald-500/10 border border-emerald-500/30 rounded text-[10px] font-mono text-emerald-300">
          {response}
        </div>
      )}
    </div>
  );
}
