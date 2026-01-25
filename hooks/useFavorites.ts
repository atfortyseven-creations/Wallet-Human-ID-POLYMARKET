"use client";

import { useWatchlist, SavedItem } from '@/lib/watchlist-store';
import { useEffect, useState } from 'react';

export function useFavorites() {
    const { items, toggleItem, isSaved } = useWatchlist();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const toggleFavorite = (item: { id: string; title: string; image: string; type: 'news' | 'trader' }) => {
        toggleItem({
            id: item.id,
            title: item.title,
            type: item.type,
            meta: item.image // Mapping image to meta as per store definition
        });
    };

    const isFavorite = (id: string) => {
        if (!mounted) return false;
        return isSaved(id);
    };

    return {
        favorites: mounted ? items : [],
        toggleFavorite,
        isFavorite,
        mounted
    };
}
