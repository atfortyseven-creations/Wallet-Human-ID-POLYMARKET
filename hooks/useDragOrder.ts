/**
 * useDragOrder  System Vault Widget Ordering Hook
 *
 * Persists widget order in localStorage so the user's
 * layout resets are preserved across sessions.
 * No external dependencies  pure React + localStorage.
 */

import { useState, useCallback } from 'react';

export function useDragOrder<T extends { id: string }>(
    initialItems: T[],
    storageKey?: string
): [T[], (newOrder: T[]) => void, () => void] {
    const [items, setItemsInternal] = useState<T[]>(initialItems);

    useEffect(() => {
        if (typeof window === 'undefined' || !storageKey) return;
        try {
            const saved = localStorage.getItem(storageKey);
            if (!saved) return;
            const savedIds: string[] = JSON.parse(saved);
            const reordered = savedIds
                .map(id => initialItems.find(item => item.id === id))
                .filter(Boolean) as T[];
            const newItems = initialItems.filter(
                item => !savedIds.includes(item.id)
            );
            setItemsInternal([...reordered, ...newItems]);
        } catch {}
    }, [storageKey, initialItems]);


    const setItems = useCallback((newOrder: T[]) => {
        setItemsInternal(newOrder);
        if (storageKey && typeof window !== 'undefined') {
            try {
                localStorage.setItem(
                    storageKey,
                    JSON.stringify(newOrder.map(i => i.id))
                );
            } catch {}
        }
    }, [storageKey]);

    const reset = useCallback(() => {
        setItemsInternal(initialItems);
        if (storageKey && typeof window !== 'undefined') {
            try {
                localStorage.removeItem(storageKey);
            } catch {}
        }
    }, [initialItems, storageKey]);

    return [items, setItems, reset];
}
