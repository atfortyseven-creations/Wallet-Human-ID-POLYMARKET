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
  payload: DynamicIslandPayload | undefined;
  expanded: boolean;
  
  // Actions
  setState: (state: DynamicIslandState, payload?: DynamicIslandPayload, autoDismiss?: number) => void;
  setExpanded: (expanded: boolean) => void;
  dismiss: () => void;
}

export const useDynamicIsland = create<DynamicIslandStore>((set, get) => ({
  activeState: 'idle',
  payload: undefined,
  expanded: false,

  setState: (state, payload, autoDismiss) => {
    set({ activeState: state, payload, expanded: true });
    if (autoDismiss) {
      setTimeout(() => {
        if (get().activeState === state) {
          set({ expanded: false });
          setTimeout(() => set({ activeState: 'idle', payload: undefined }), 500);
        }
      }, autoDismiss);
    }
  },

  setExpanded: (expanded) => set({ expanded }),

  dismiss: () => {
    set({ expanded: false });
    setTimeout(() => set({ activeState: 'idle', payload: undefined }), 500);
  },
}));
