import React from 'react';

export const ProposeMarket = () => {
    return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center text-white">
            <h2 className="text-2xl font-bold mb-4">Propose a New Market</h2>
            <p className="text-zinc-400 mb-8">
                Market proposals require System level verification.
            </p>
            <button className="px-6 py-3 bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 rounded-xl font-bold hover:bg-cyan-500/30 transition-colors">
                Connect World ID
            </button>
        </div>
    );
};
