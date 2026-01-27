"use client";

import { useWatchlist, SavedItem } from '@/lib/watchlist-store';
import { useEffect, useState } from 'react';

export function useFavorites() {
    const { watchlist, addItem, removeItem, isInWatchlist } = useWatchlist();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const toggleFavorite = (item: { id: string; title: string; image: string; type: 'news' | 'trader' }) => {
        if (isInWatchlist(item.id)) {
            removeItem(item.id);
        } else {
            addItem({
                id: item.id,
                title: item.title,
                image: item.image,
                type: item.type,
                source: 'Polymarket', // Default source
                publishedAt: new Date().toISOString(),
                url: `/market/${item.id}` // Default URL assumption
            });
        }
    };

    const isFavorite = (id: string) => {
        if (!mounted) return false;
        return isInWatchlist(id);
    };

    return {
        favorites: mounted ? watchlist : [],
        toggleFavorite,
        isFavorite,
        mounted
    };
}
