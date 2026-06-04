import { create } from 'zustand';
import { Web3WalletTypes } from '@walletconnect/web3wallet';

interface WalletConnectState {
    isInitialized: boolean;
    proposals: Web3WalletTypes.SessionProposal[];
    requests: Web3WalletTypes.SessionRequest[];
    sessions: Record<string, any>;
    setInitialized: (val: boolean) => void;
    addProposal: (proposal: Web3WalletTypes.SessionProposal) => void;
    removeProposal: (id: number) => void;
    addRequest: (request: Web3WalletTypes.SessionRequest) => void;
    removeRequest: (id: number) => void;
    setSessions: (sessions: Record<string, any>) => void;
}

export const useWalletConnectStore = create<WalletConnectState>((set) => ({
    isInitialized: false,
    proposals: [],
    requests: [],
    sessions: {},
    setInitialized: (val) => set({ isInitialized: val }),
    addProposal: (proposal) => set((state) => ({ proposals: [...state.proposals, proposal] })),
    removeProposal: (id) => set((state) => ({ proposals: state.proposals.filter(p => p.id !== id) })),
    addRequest: (request) => set((state) => ({ requests: [...state.requests, request] })),
    removeRequest: (id) => set((state) => ({ requests: state.requests.filter(r => r.id !== id) })),
    setSessions: (sessions) => set({ sessions }),
}));
