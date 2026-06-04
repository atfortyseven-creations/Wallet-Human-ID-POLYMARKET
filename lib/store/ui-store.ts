import { create } from 'zustand';
import { persist } from 'zustand/middleware';

//  Persisted subset: only UI preferences survive reloads 
// CRITICAL: isLinked and isConnectModalOpen are intentionally NOT persisted.
// isLinked is derived fresh on every mount from the live system_handshake cookie
// to prevent stale auth state after disconnection.
interface PersistedUIState {
  isStealthMode: boolean;
  activePanel: 'history' | 'notifications' | 'settings' | 'privacy' | null;
}

interface UIState extends PersistedUIState {
  isConnectModalOpen: boolean;
  isLinked: boolean;
  isZkVerified: boolean;
  toggleStealthMode: () => void;
  setStealthMode: (value: boolean) => void;
  openConnectModal: () => void;
  closeConnectModal: () => void;
  setLinked: (value: boolean) => void;
  setZkVerified: (value: boolean) => void;
  setActivePanel: (panel: 'history' | 'notifications' | 'settings' | 'privacy' | null) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      //  Persisted preferences 
      isStealthMode: false,
      activePanel: null,

      //  Runtime-only state (never persisted) 
      // Resets on every page load; correct value is re-derived from cookie in LinkedGate.
      isConnectModalOpen: false,
      isLinked: false,
      isZkVerified: false,

      //  Actions 
      toggleStealthMode: () => set((state) => ({ isStealthMode: !state.isStealthMode })),
      setStealthMode: (value: boolean) => set({ isStealthMode: value }),
      openConnectModal: () => set({ isConnectModalOpen: true }),
      closeConnectModal: () => set({ isConnectModalOpen: false }),
      setLinked: (value: boolean) => set({ isLinked: value }),
      setZkVerified: (value: boolean) => set({ isZkVerified: value }),
      setActivePanel: (panel) => set({ activePanel: panel }),
    }),
    {
      name: 'whale-ui-storage',
      // Explicitly whitelist only the keys that should persist.
      // isLinked and isConnectModalOpen are excluded.
      partialize: (state): PersistedUIState => ({
        isStealthMode: state.isStealthMode,
        activePanel: state.activePanel,
      }),
    }
  )
);
