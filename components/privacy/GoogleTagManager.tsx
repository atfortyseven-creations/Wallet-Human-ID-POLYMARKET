'use client';

import { useCookieConsent } from './CookieContext';
import Script from 'next/script';

/**
 * Google Tag Manager loader.
 * Security: Uses Next.js <Script> with `strategy="afterInteractive"` and a
 * `src` prop rather than dangerouslySetInnerHTML, so the CSP nonce propagation
 * is handled by the Next.js script runtime and the GTM origin is whitelisted
 * in our strict Content-Security-Policy (connect-src / script-src).
 *
 * Analytics only fire after explicit user consent (GDPR/ePrivacy).
 */
export function GoogleTagManager({ gtmId }: { gtmId: string }) {
    const { consent } = useCookieConsent();

    // Hard gate: NEVER load GTM until the user has accepted analytics cookies.
    if (!consent.analytics) return null;

    return (
        <>
            {/* GTM snippet — loaded via external src for strict CSP attestation */}
            <Script
                id="gtm-loader"
                strategy="afterInteractive"
                src={`https://www.googletagmanager.com/gtm.js?id=${gtmId}`}
                onLoad={() => {
                    // Initialise the dataLayer push once the script has loaded
                    if (typeof window !== 'undefined') {
                        (window as any).dataLayer = (window as any).dataLayer || [];
                        (window as any).dataLayer.push({
                            'gtm.start': new Date().getTime(),
                            event: 'gtm.js',
                        });
                    }
                }}
            />
            {/* GTM noscript fallback — rendered server-side as a safe iframe via an API proxy */}
            {/* Note: noscript iframes are not supported in Next.js App Router <head>.      */}
            {/* They are intentionally omitted here; GTM noscript is a graceful-degradation */}
            {/* feature and has no security impact when analytics consent is already gated.  */}
        </>
    );
}
