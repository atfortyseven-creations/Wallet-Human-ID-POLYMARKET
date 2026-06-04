"use client";
import React, { createContext, useContext } from 'react';
const LanguageContext = createContext<any>({ t: (s: string) => s });
export const useLanguage = () => useContext(LanguageContext);
export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
    return (
        <LanguageContext.Provider value={{ t: (s: string) => s }}>
            {children}
        </LanguageContext.Provider>
    );
};
