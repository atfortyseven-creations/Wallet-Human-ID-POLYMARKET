"use client";

import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';

// 1. Diccionario de Traducciones (Español, Inglés, Alemán, Francés)
const translations: Record<string, Record<string, string>> = {
    es: { title: "Billetera", claimable: "Reclamable", royalties: "Regalías", settings: "Configuración" },
    en: { title: "Wallet", claimable: "Claimable", royalties: "Royalties", settings: "Settings" },
    de: { title: "Brieftasche", claimable: "Forderbar", royalties: "Lizenzgebühren", settings: "Einstellungen" },
    fr: { title: "Portefeuille", claimable: "Réclamable", royalties: "Redevances", settings: "Paramètres" }
};

// 2. Tasas de cambio simuladas (Base: USD)
interface ExchangeRate {
    rate: number;
    symbol: string;
}

const exchangeRates: Record<string, ExchangeRate> = {
    USD: { rate: 1, symbol: '$' },
    EUR: { rate: 0.92, symbol: '€' },
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
    const [theme, setTheme] = useState('dark'); // 'dark' o 'light'
    const [lang, setLang] = useState('en');     // Idioma por defecto
    const [currency, setCurrency] = useState('USD');

    // Lógica del TEMA (Dark/Light)
    useEffect(() => {
        // Access window only on client
        if (typeof window === 'undefined') return;

        const root = window.document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
            root.classList.remove('light');
        } else {
            root.classList.remove('dark');
            root.classList.add('light');
        }
    }, [theme]);

    // Función para formatear dinero automáticamente
    const formatMoney = (amountInUSD: number) => {
        const { rate, symbol } = exchangeRates[currency] || exchangeRates['USD'];
        const value = amountInUSD * rate;
        return `${symbol}${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    // Función para obtener texto traducido
    const t = (key: string) => {
        const dict = translations[lang] || translations['en'];
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
