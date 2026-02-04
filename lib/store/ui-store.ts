import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UIState {
  isStealthMode: boolean
  toggleStealthMode: () => void
  setStealthMode: (value: boolean) => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      isStealthMode: false,
      toggleStealthMode: () => set((state) => ({ isStealthMode: !state.isStealthMode })),
      setStealthMode: (value) => set({ isStealthMode: value }),
    }),
    {
      name: 'human-ui-storage',
    }
  )
)
