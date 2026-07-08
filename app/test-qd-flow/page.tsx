"use client";
import React, { useState } from 'react';

export default function TestFlowPage() {
    const [results, setResults] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const runTests = async () => {
        setLoading(true);
        setError('');
        setResults(null);
        try {
            // using a dummy address for testing
            const res = await fetch('/api/aztec/test-flow?address=0x9999999999999999999999999999999999999999');
            const data = await res.json();
            setResults(data);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white p-10 font-mono">
            <h1 className="text-2xl font-bold mb-4">Aztec QD Spend Flow Test Suite</h1>
            <button 
                onClick={runTests} 
                disabled={loading}
                className="bg-zinc-800 hover:bg-zinc-700 text-white px-6 py-2 border border-zinc-700"
            >
                {loading ? 'Running 7-Step Verification...' : 'Execute E2E QD Flow Test'}
            </button>

            {error && <div className="text-red-500 mt-4">Error: {error}</div>}

            {results && (
                <div className="mt-8 border border-zinc-800 p-6 bg-zinc-900/50">
                    <h2 className="text-xl mb-4 flex items-center gap-3">
                        Test Report 
                        {results.allPassed ? 
                            <span className="text-green-500 text-sm border border-green-500 px-2 py-0.5">PASSED</span> : 
                            <span className="text-red-500 text-sm border border-red-500 px-2 py-0.5">FAILED</span>
                        }
                    </h2>
                    <p className="mb-6 opacity-70">{results.summary}</p>
                    
                    <div className="space-y-4">
                        {results.tests?.map((t: any, i: number) => (
                            <div key={i} className={`p-4 border ${t.passed ? 'border-green-900/50 bg-green-900/10' : 'border-red-900/50 bg-red-900/10'}`}>
                                <div className="flex justify-between font-bold mb-2">
                                    <span className={t.passed ? 'text-green-400' : 'text-red-400'}>{i+1}. {t.name}</span>
                                    <span>{t.passed ? '✅' : '❌'}</span>
                                </div>
                                <pre className="text-xs opacity-60 bg-black/50 p-2 overflow-x-auto">
                                    {JSON.stringify(t.details, null, 2)}
                                </pre>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
