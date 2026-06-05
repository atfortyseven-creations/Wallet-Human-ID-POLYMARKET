import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface TxRecord {
  id: string;
  type: 'send' | 'receive';
  amount: number;
  address: string;
  date: string;
  txHash: string;
}

interface QDsStore {
  seed: string | null;
  aztecAddress: string | null;
  balance: number;
  history: TxRecord[];
  login: (seed: string, address: string) => void;
  logout: () => void;
  setBalance: (b: number) => void;
  setHistory: (h: TxRecord[]) => void;
  sendQDs: (amount: number, to: string, txHash: string) => void;
  receiveQDs: (amount: number, from: string, txHash: string) => void;
  reset: () => void;
}

export const useQDsStore = create<QDsStore>()(
  persist(
    (set) => ({
      seed: null,
      aztecAddress: null,
      balance: 100, // Initial guaranteed balance
      history: [],
      login: (seed, address) => set({ seed, aztecAddress: address }),
      logout: () => set({ seed: null, aztecAddress: null, history: [], balance: 100 }),
      setBalance: (balance) => set({ balance }),
      setHistory: (history) => set({ history }),
      sendQDs: (amount, to, txHash) => set((state) => ({
        balance: state.balance - amount,
        history: [
          {
            id: Math.random().toString(36).substr(2, 9),
            type: 'send',
            amount,
            address: to,
            date: new Date().toISOString(),
            txHash
          },
          ...state.history
        ]
      })),
      receiveQDs: (amount, from, txHash) => set((state) => ({
        balance: Math.min(state.balance + amount, 100000000),
        history: [
          {
            id: Math.random().toString(36).substr(2, 9),
            type: 'receive',
            amount,
            address: from,
            date: new Date().toISOString(),
            txHash
          },
          ...state.history
        ]
      })),
      reset: () => set({ balance: 100, history: [] })
    }),
    {
      name: 'qds-storage',
      version: 2, // Bump to v2 to wipe local storage and force true sync
    }
  )
);
