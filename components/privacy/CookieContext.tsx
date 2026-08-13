'use client';

/**
 * [PHASE 5 — HARDENED ZERO-CONSENT CONTEXT]
 *
 * Humanity Ledger collects NO analytics and NO marketing cookies.
 * The "analytics" and "marketing" consent states are permanently locked to FALSE
 * at the source. This context is preserved for structural compatibility with
 * components that may reference it, but it CANNOT be used to enable trackers.
 *
 * DESIGN: Consent is hardcoded to essential-only. The `acceptAll` function
 * does NOT activate analytics — it merely acknowledges the user has seen
 * the privacy notice. This is a hard architectural constraint, not a soft default.
 *
 * "Privacy is not a feature. It is an unalienable cryptographic right."
 */

import React, { createContext, useContext, useEffect, useState } from 'react';

export type CookieCategory = 'essential' | 'analytics' | 'marketing';

export interface CookieConsentState {
    essential: boolean;
    // [HARDENED] analytics is permanently false — no telemetry infrastructure is loaded
    analytics: false;
    // [HARDENED] marketing is permanently false — no ad networks are loaded
    marketing: false;
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

// [HARDENED] Default and ONLY consent state — analytics and marketing are immutably false
const ZERO_CONSENT: CookieConsentState = {
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
    // [HARDENED] Consent is ALWAYS zero. We never read from localStorage for
    // analytics/marketing flags because no external scripts should ever be activated.
    const [showBanner, setShowBanner] = useState(false);
    const [hasMadeChoice, setHasMadeChoice] = useState(true); // Default true: no banner needed

    useEffect(() => {
        // [HARDENED] Banner is permanently suppressed.
        // There is nothing to consent to — the platform collects zero data.
        // The banner served no cryptographic purpose once tracking was excised.
        const alreadyAcknowledged = localStorage.getItem('privacy-acknowledged');
        if (!alreadyAcknowledged) {
            // Show a one-time privacy notice (not a consent request)
            // that states our zero-data policy. No "Accept All" button.
            setShowBanner(true);
            setHasMadeChoice(false);
        }
    }, []);

    // [HARDENED] acceptAll and rejectAll both resolve to ZERO_CONSENT.
    // Calling acceptAll does NOT enable analytics. It simply acknowledges the notice.
    const acknowledgePrivacy = () => {
        setShowBanner(false);
        setHasMadeChoice(true);
        try { localStorage.setItem('privacy-acknowledged', '1'); } catch {}
    };

    return (
        <CookieContext.Provider value={{
            consent: ZERO_CONSENT,
            updateConsent: () => { /* No-op: consent is immutably zero */ },
            acceptAll: acknowledgePrivacy,
            rejectAll: acknowledgePrivacy,
            showBanner,
            setShowBanner,
            hasMadeChoice,
        }}>
            {children}
        </CookieContext.Provider>
    );
};
