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
  sendQDs: (amount: number, to: string, txHash: string, dbId?: string, isSync?: boolean) => void;
  receiveQDs: (amount: number, from: string, txHash: string, dbId?: string) => void;
  reset: () => void;
}

export const useQDsStore = create<QDsStore>()(
  persist(
    (set) => ({
      seed: null,
      aztecAddress: null,
      balance: 0, // Initial guaranteed balance
      history: [],
      login: (seed, address) => set({ seed, aztecAddress: address }),
      logout: () => set({ seed: null, aztecAddress: null, history: [], balance: 0 }),
      setBalance: (balance) => set({ balance }),
      setHistory: (history) => set({ history }),
      sendQDs: (amount, to, txHash, dbId, isSync) => set((state) => ({
        // Only deduct balance optimistically if this is a direct user action.
        // If isSync is true, the balance is already managed by the master setBalance() from DB.
        balance: isSync ? state.balance : state.balance - amount,
        history: [
          {
            id: dbId || Math.random().toString(36).substr(2, 9),
            type: 'send',
            amount,
            address: to,
            date: new Date().toISOString(),
            txHash
          },
          ...state.history
        ]
      })),
      receiveQDs: (amount, from, txHash, dbId) => set((state) => ({
        // DO NOT mutate balance here. The useSyncFromDB hook strictly enforces the 
        // true balance directly from the DB via `setBalance`. Mutating it here would 
        // cause a transient UI glitch (double counting the receive).
        history: [
          {
            id: dbId || Math.random().toString(36).substr(2, 9),
            type: 'receive',
            amount,
            address: from,
            date: new Date().toISOString(),
            txHash
          },
          ...state.history
        ]
      })),
      reset: () => set({ balance: 0, history: [] })
    }),
    {
      name: 'qds-storage',
      version: 3, // Bump to v3 to wipe local storage and force true sync with dbIds
    }
  )
);
