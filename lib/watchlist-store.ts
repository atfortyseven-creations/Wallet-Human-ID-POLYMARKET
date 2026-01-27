import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SavedItem {
  id: string;
  title: string;
  url?: string;
  source?: string;
  publishedAt?: string;
  image?: string; // Estandarizamos como 'image'
}

interface WatchlistState {
  watchlist: SavedItem[];
  addItem: (item: SavedItem) => void;
  removeItem: (id: string) => void;
  isInWatchlist: (id: string) => boolean;
}

export const useWatchlist = create<WatchlistState>()(
  persist(
    (set, get) => ({
      watchlist: [],
      addItem: (item) => {
        const current = get().watchlist;
        if (!current.some((i) => i.id === item.id)) {
          set({ watchlist: [...current, item] });
        }
      },
      removeItem: (id) =>
        set((state) => ({
          watchlist: state.watchlist.filter((i) => i.id !== id),
        })),
      isInWatchlist: (id) => get().watchlist.some((item) => item.id === id),
    }),
    {
      name: 'watchlist-storage',
    }
  )
);