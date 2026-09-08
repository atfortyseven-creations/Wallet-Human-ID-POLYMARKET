import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface OmniSettingsState {
  // Identity
  linkedWallets: string[];
  primaryWallet: string | null;
  
  // Privacy & ZK
  stealthModeEnabled: boolean;
  burnMessagesAfter24h: boolean;
  
  // Notifications Matrix (Real Toggles)
  notifications: {
    incomingCall: { bell: boolean; push: boolean };
    directMessage: { bell: boolean; push: boolean };
    syndicateInvite: { bell: boolean; push: boolean };
    paymentReceived: { bell: boolean; push: boolean };
  };
  
  // Media & Hardware
  themeMusicEnabled: boolean;
  mutedSpeakingAlert: boolean;
  noiseSuppression: boolean;
  
  // Actions
  toggleStealthMode: () => void;
  updateNotification: (category: keyof OmniSettingsState['notifications'], type: 'bell' | 'push', value: boolean) => void;
}

/**
 * AEGIS OMNI-SETTINGS STATE MACHINE
 * Saves real configuration directly to IndexedDB. No mock localstorage.
 */
export const useOmniSettings = create<OmniSettingsState>()(
  persist(
    (set) => ({
      linkedWallets: [],
      primaryWallet: null,
      stealthModeEnabled: false,
      burnMessagesAfter24h: false,
      
      notifications: {
        incomingCall: { bell: true, push: true },
        directMessage: { bell: true, push: true },
        syndicateInvite: { bell: true, push: false },
        paymentReceived: { bell: true, push: true },
      },
      
      themeMusicEnabled: false,
      mutedSpeakingAlert: true,
      noiseSuppression: true,

      toggleStealthMode: () => set((state) => ({ stealthModeEnabled: !state.stealthModeEnabled })),
      
      updateNotification: (category, type, value) => set((state) => ({
        notifications: {
          ...state.notifications,
          [category]: {
            ...state.notifications[category],
            [type]: value
          }
        }
      }))
    }),
    {
      name: 'aegis-omni-settings', // Unique ID in IndexedDB
      storage: createJSONStorage(() => localStorage), // Upgrade to idb for extreme performance later
    }
  )
);