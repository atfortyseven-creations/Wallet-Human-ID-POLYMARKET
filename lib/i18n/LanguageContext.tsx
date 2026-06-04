"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { dictionaries, Locale } from './dictionaries';

//  Types 
export type { Locale };

export const LOCALES: { code: Locale; label: string; flag: string }[] = [
  { code: 'en', label: 'English', flag: '' },
];

type LanguageContextType = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: typeof dictionaries['en'] & ((key: string) => string);
  // legacy alias
  toggleLanguage?: () => void;
  language?: Locale;
};

//  Context 
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>('en');

  useEffect(() => {
    setLocale('en');
    localStorage.setItem('human_wallet_locale', 'en');
  }, []);

  const handleSetLocale = (newLocale: Locale) => {
    setLocale(newLocale);
    localStorage.setItem('human_wallet_locale', newLocale);
    // Update document lang attribute for accessibility
    if (typeof document !== 'undefined') {
      document.documentElement.lang = newLocale;
    }
  };

  const dict = dictionaries[locale];
  
  // Backward compatible t function that supports dot notation
  const tFn = (key: string): string => {
    const parts = key.split('.');
    let current: any = dict;
    for (const part of parts) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part];
      } else {
        return key;
      }
    }
    return typeof current === 'string' ? current : key;
  };

  // Combine the dictionary object with the helper function
  const t = Object.assign(tFn, dict);

  const value: LanguageContextType = {
    locale,
    setLocale: handleSetLocale,
    t,
    // Legacy aliases used in older components
    toggleLanguage: () => {
      // Disabled - Forced to English
      handleSetLocale('en');
    },
    language: locale,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

