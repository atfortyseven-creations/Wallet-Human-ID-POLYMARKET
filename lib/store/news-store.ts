import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { safeStorage } from '@/lib/security/safe-storage';

export interface NewsArticle {
  id: string;
  title: string;
  description: string;
  date: string;
  url: string;
  source: string;
  imageUrl?: string;
}

// Archive: { "2026-04-01": NewsArticle[], "2026-04-02": [...] }
type NewsArchive = Record<string, NewsArticle[]>;

interface NewsState {
  isNewsSubscribed: boolean;
  setNewsSubscribed: (value: boolean) => void;
  lastBackupDate: string | null;
  setLastBackupDate: (date: string) => void;
  // Persistent archive by date
  archive: NewsArchive;
  upsertDayArticles: (date: string, articles: NewsArticle[]) => void;
  getArchiveDates: () => string[];
}

export const useNewsStore = create<NewsState>()(
  persist(
    (set, get) => ({
      isNewsSubscribed: false,
      setNewsSubscribed: (value) => set({ isNewsSubscribed: value }),
      lastBackupDate: null,
      setLastBackupDate: (date) => set({ lastBackupDate: date }),

      archive: {},

      // Smart upsert: merge new articles into the day's bucket without duplicates
      upsertDayArticles: (date, articles) => {
        const current = get().archive;
        const existing = current[date] ?? [];
        const existingIds = new Set(existing.map((a) => a.id));
        const fresh = articles.filter((a) => !existingIds.has(a.id));
        if (fresh.length === 0) return; // nothing new
        set({
          archive: {
            ...current,
            [date]: [...existing, ...fresh].sort(
              (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
            ),
          },
        });
      },

      getArchiveDates: () =>
        Object.keys(get().archive).sort((a, b) => (a > b ? -1 : 1)),
    }),
    {
      name: 'whale-news-archive-v2', // nueva clave para no colisionar con la anterior
      storage: createJSONStorage(() => safeStorage), // localStorage (safe) para persistencia permanente por mes
    }
  )
);
