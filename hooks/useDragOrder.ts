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
    const [items, setItemsInternal] = useState<T[]>(() => {
        if (typeof window === 'undefined' || !storageKey) return initialItems;
        try {
            const saved = localStorage.getItem(storageKey);
            if (!saved) return initialItems;
            const savedIds: string[] = JSON.parse(saved);
            const reordered = savedIds
                .map(id => initialItems.find(item => item.id === id))
                .filter(Boolean) as T[];
            // Append any new items not in saved state
            const newItems = initialItems.filter(
                item => !savedIds.includes(item.id)
            );
            return [...reordered, ...newItems];
        } catch {
            return initialItems;
        }
    });

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
