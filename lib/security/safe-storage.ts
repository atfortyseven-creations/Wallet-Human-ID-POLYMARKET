export const safeStorage = {
    getItem: (name: string): string | null => {
        if (typeof window === 'undefined') return null;
        try {
            return localStorage.getItem(name);
        } catch (e) {
            console.warn(`[SafeStorage] LocalStorage read blocked for ${name}. Falling back to sessionStorage.`);
            try {
                return sessionStorage.getItem(`_fs_${name}`);
            } catch (fallbackErr) {
                return null;
            }
        }
    },
    setItem: (name: string, value: string): void => {
        if (typeof window === 'undefined') return;
        try {
            localStorage.setItem(name, value);
        } catch (e) {
            console.warn(`[SafeStorage] LocalStorage write blocked for ${name}. Saving to sessionStorage.`);
            try {
                sessionStorage.setItem(`_fs_${name}`, value);
            } catch (fallbackErr) { /* ignore */ }
        }
    },
    removeItem: (name: string): void => {
        if (typeof window === 'undefined') return;
        try {
            localStorage.removeItem(name);
        } catch (e) {
            try {
                sessionStorage.removeItem(`_fs_${name}`);
            } catch (fallbackErr) { /* ignore */ }
        }
    },
};
