import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// --- ESTA ES LA CLAVE: LA PALABRA "export" ---
export interface SavedItem {
    id: string;
    title: string;
    url?: string;
    source?: string;
    publishedAt?: string;
    image?: string; // Adding image support as seen in useFavorites
    type?: 'news' | 'trader'; // Adding type support as seen in useFavorites
}
// ---------------------------------------------

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

export const useWatchlistStore = useWatchlist; // Alias for backward compatibility if needed, though useWatchlist is the main export now
