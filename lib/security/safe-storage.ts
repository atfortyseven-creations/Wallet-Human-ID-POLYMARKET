export const safeStorage = {
    getItem: (name: string): string | null => {
        if (typeof window === 'undefined') return null;
        try {
            return localStorage.getItem(name);
        } catch (e) {
            console.warn(`[SafeStorage] LocalStorage read blocked for ${name}. Falling back to memory.`);
            return (window as any)[`_fs_${name}`] || null;
        }
    },
    setItem: (name: string, value: string): void => {
        if (typeof window === 'undefined') return;
        try {
            localStorage.setItem(name, value);
        } catch (e) {
            console.warn(`[SafeStorage] LocalStorage write blocked for ${name}. Saving to memory.`);
            (window as any)[`_fs_${name}`] = value;
        }
    },
    removeItem: (name: string): void => {
        if (typeof window === 'undefined') return;
        try {
            localStorage.removeItem(name);
        } catch (e) {
            delete (window as any)[`_fs_${name}`];
        }
    },
};
