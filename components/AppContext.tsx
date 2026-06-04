"use client";

import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';

import { translations } from '@/lib/translations';

import { safeToFixed, safeToLocaleString } from '@/lib/utils/number-format';

// 2. Simulated exchange rates (Base: USD)
interface ExchangeRate {
    rate: number;
    symbol: string;
}

const exchangeRates: Record<string, ExchangeRate> = {
    USD: { rate: 1, symbol: '$' },
    EUR: { rate: 0.92, symbol: '' },
    GBP: { rate: 0.79, symbol: '£' },
    JPY: { rate: 148, symbol: '¥' }
};

interface AppContextType {
    theme: string;
    setTheme: (theme: string) => void;
    lang: string;
    setLang: (lang: string) => void;
    currency: string;
    setCurrency: (currency: string) => void;
    formatMoney: (amountInUSD: number) => string;
    t: (key: string) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
    // Estados iniciales
    const [theme, setTheme] = useState('light'); // System First  always light
    const [lang, setLang] = useState('en');     // Idioma por defecto
    const [currency, setCurrency] = useState('USD');

    //  Enterprise LIGHT MODE ENFORCER 
    // This platform is light-mode-only. Connected OR disconnected, the html
    // element must ALWAYS carry the 'light' class and NEVER carry 'dark'.
    // We run this on every theme change AND once on mount via an empty deps
    // array secondary effect so the html element is corrected even before
    // next-themes / AppKit have a chance to re-inject their own class.
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const root = window.document.documentElement;
        // Hard-purge any dark class regardless of what other providers wrote
        root.classList.remove('dark');
        root.classList.add('light');
        // Belt-and-suspenders: also set the color-scheme attribute
        root.style.colorScheme = 'light';
    }, [theme]);

    // Mount-time enforcement (runs once, before any provider effect)
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const root = window.document.documentElement;
        root.classList.remove('dark');
        root.classList.add('light');
        root.style.colorScheme = 'light';
        // Purge any persisted 'dark' value that next-themes wrote to localStorage
        try {
            const stored = localStorage.getItem('theme');
            if (stored === 'dark') localStorage.setItem('theme', 'light');
        } catch { /* incognito */ }
    }, []);

    // Función para formatear dinero automáticamente
    const formatMoney = (amountInUSD: number) => {
        const { rate, symbol } = exchangeRates[currency] || exchangeRates['USD'];
        const value = amountInUSD * rate;
        return `${symbol}${safeToLocaleString(value, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    // Función para obtener texto traducido
    const t = (key: string) => {
        // @ts-ignore - Dynamic key access
        const dict = translations[lang] || translations['en'];
        // @ts-ignore - Dynamic key access
        return dict[key] || key;
    };

    return (
        <AppContext.Provider value={{ theme, setTheme, lang, setLang, currency, setCurrency, formatMoney, t }}>
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error("useApp must be used within an AppProvider");
    }
    return context;
};
