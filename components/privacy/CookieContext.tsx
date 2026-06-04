'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type CookieCategory = 'essential' | 'analytics' | 'marketing';

export interface CookieConsentState {
    essential: boolean;
    analytics: boolean;
    marketing: boolean;
}

interface CookieContextType {
    consent: CookieConsentState;
    updateConsent: (newConsent: CookieConsentState) => void;
    acceptAll: () => void;
    rejectAll: () => void;
    showBanner: boolean;
    setShowBanner: (show: boolean) => void;
    hasMadeChoice: boolean;
}

const defaultConsent: CookieConsentState = {
    essential: true,
    analytics: false,
    marketing: false,
};

const CookieContext = createContext<CookieContextType | undefined>(undefined);

export const useCookieConsent = () => {
    const context = useContext(CookieContext);
    if (!context) {
        throw new Error('useCookieConsent must be used within a CookieProvider');
    }
    return context;
};

export const CookieProvider = ({ children }: { children: React.ReactNode }) => {
    const [consent, setConsent] = useState<CookieConsentState>(defaultConsent);
    const [showBanner, setShowBanner] = useState(false);
    const [hasMadeChoice, setHasMadeChoice] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        // Load from localStorage
        const savedConsent = localStorage.getItem('cookie-consent');
        if (savedConsent) {
            try {
                setConsent(JSON.parse(savedConsent));
                setHasMadeChoice(true);
                setShowBanner(false);
            } catch (e) {
                console.error("Failed to parse cookie consent", e);
                // Delay even on error
                setTimeout(() => setShowBanner(true), 3000);
            }
        } else {
            // [LEGENDARY POLISH] Show banner immediately to comply with strict immediate decision requirement
            setShowBanner(true);
        }
        setIsLoaded(true);
    }, []);

    const saveConsent = (newConsent: CookieConsentState) => {
        setConsent(newConsent);
        setHasMadeChoice(true);
        setShowBanner(false);
        if (typeof window !== 'undefined') {
            localStorage.setItem('cookie-consent', JSON.stringify(newConsent));

            // Sync with Backend (Optional: Fire and forget)
            fetch('/api/user/cookies', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newConsent),
            }).catch(err => console.error("Failed to sync cookies", err));
        }
    };

    const updateConsent = (newConsent: CookieConsentState) => {
        saveConsent(newConsent);
    };

    const acceptAll = () => {
        saveConsent({
            essential: true,
            analytics: true,
            marketing: true,
        });
    };

    const rejectAll = () => {
        saveConsent({
            essential: true,
            analytics: false,
            marketing: false,
        });
    };

    return (
        <CookieContext.Provider value={{
            consent,
            updateConsent,
            acceptAll,
            rejectAll,
            showBanner: isLoaded && showBanner, // Only show banner after loading state
            setShowBanner,
            hasMadeChoice
        }}>
            {children}
        </CookieContext.Provider>
    );
};

