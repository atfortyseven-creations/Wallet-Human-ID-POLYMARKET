"use client";

import { useWatchlist } from '@/lib/watchlist-store';
import { useEffect, useState } from 'react';

export function useFavorites() {
  const store = useWatchlist();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return {
    favorites: mounted ? store.watchlist : [],
    addItem: store.addItem,
    removeItem: store.removeItem,
    isFavorite: store.isInWatchlist,
    isLoading: !mounted
  };
}