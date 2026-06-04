import { create } from 'zustand';

// Defines the critical invariants that must NEVER be broken
const SAFETY_INVARIANTS = {
    MAX_SLIPPAGE: 0.05, // 5%
    MAX_PORTFOLIO_DROP_PCT: 0.20, // 20% in a single session/action
};

interface AegisState {
    isFrozen: boolean;
    freezeReason: string | null;
    initialPortfolioValue: number;
    currentPortfolioValue: number;
    
    // Actions
    updatePortfolioValue: (val: number) => void;
    resetAegis: () => void;
}

/**
 * Aegis Runtime Defense
 * Monitors global state changes. If an invariant is violated (e.g. flash loan attack draining funds),
 * it FREEZES the UI to prevent further user errors.
 */
export const useAegisDefense = create<AegisState>((set, get) => ({
    isFrozen: false,
    freezeReason: null,
    initialPortfolioValue: 0, // Should be set on load
    currentPortfolioValue: 0,

    updatePortfolioValue: (newVal: number) => {
        const state = get();
        
        // Initialize if 0
        if (state.initialPortfolioValue === 0) {
            set({ initialPortfolioValue: newVal, currentPortfolioValue: newVal });
            return;
        }

        // Check Invariant: DROP > 20%
        const drop = (state.initialPortfolioValue - newVal) / state.initialPortfolioValue;
        
        if (drop > SAFETY_INVARIANTS.MAX_PORTFOLIO_DROP_PCT) {
            console.error("️ AEGIS TRIGGERED: Massive value drop detected!");
            set({ 
                isFrozen: true, 
                freezeReason: `PROTOCOL PAUSED: Portfolio dropped ${Math.round(drop * 100)}% suddenly. Investigation required.` 
            });
        } else {
            set({ currentPortfolioValue: newVal });
        }
    },

    resetAegis: () => set({ isFrozen: false, freezeReason: null })
}));

