import { create } from 'zustand';

export type DynamicIslandState = 'idle' | 'calling' | 'recording' | 'syncing' | 'notification' | 'wallet_connected' | 'tx_processing' | 'tx_success';

export interface DynamicIslandPayload {
  title?: string;
  subtitle?: string;
  icon?: string;
  progress?: number;
  waveform?: number[];
  color?: string;
}

interface DynamicIslandStore {
  activeState: DynamicIslandState;
  payload: DynamicIslandPayload | null;
  expanded: boolean;
  
  // Actions
  setState: (state: DynamicIslandState, payload?: DynamicIslandPayload, autoDismiss?: number) => void;
  setExpanded: (expanded: boolean) => void;
  dismiss: () => void;
}

export const useDynamicIsland = create<DynamicIslandStore>((set, get) => ({
  activeState: 'idle',
  payload: null,
  expanded: false,

  setState: (state, payload = null, autoDismiss) => {
    set({ activeState: state, payload, expanded: true });
    if (autoDismiss) {
      setTimeout(() => {
        if (get().activeState === state) {
          set({ expanded: false });
          setTimeout(() => set({ activeState: 'idle', payload: null }), 500); // Wait for collapse animation
        }
      }, autoDismiss);
    }
  },

  setExpanded: (expanded) => set({ expanded }),

  dismiss: () => {
    set({ expanded: false });
    setTimeout(() => set({ activeState: 'idle', payload: null }), 500);
  },
}));
