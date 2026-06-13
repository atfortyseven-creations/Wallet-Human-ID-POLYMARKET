// System layout  No Clerk provider needed (SIWE-native auth)
import { headers } from 'next/headers'
import { Inter, Martel, Roboto_Mono } from 'next/font/google'
import './globals-compiled.css'
import './smooth-scroll.css'
import Providers from "@/components/Providers";
import "@fontsource/space-grotesk/700.css";
import "@fontsource/space-grotesk/400.css";
import "@fontsource/roboto-mono/700.css";
import "@fontsource/roboto-mono/400.css";
import { ClientLayout } from "@/components/layout/ClientLayout";
import { Toaster } from 'sonner'
import { CookieProvider } from "@/components/privacy/CookieContext";
import { CookieConsent } from "@/components/privacy/CookieConsent";
import { GoogleTagManager } from "@/components/privacy/GoogleTagManager";
import { ErrorSuppressor } from "@/components/ui/ErrorSuppressor";
import { ReactNode } from "react";
import { MobileEnforcer } from '@/components/layout/MobileEnforcer';
import { ClientOverlays } from "@/components/layout/ClientOverlays";
import { GlobalErrorBoundary } from "@/components/ui/GlobalErrorBoundary";
import { ScrollProgressBar } from "@/components/ui/ScrollProgressBar";
import { AntiTamperCore } from "@/components/security/AntiTamperCore";
import { AztecProvider } from "@/context/AztecContext";
import { AztecNativeProvider } from "@/context/AztecNativeContext";

import { WalletConnectProvider } from '@/components/walletconnect/WalletConnectProvider';


const inter = Inter({ subsets: ['latin'] })

const martel = Martel({
  subsets: ['latin'],
  weight: ['300', '400', '700', '800', '900'],
  variable: '--font-aztec-serif',
  display: 'swap',
})

const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  variable: '--font-aztec-mono',
  display: 'swap',
})

export const metadata = {
  title: {
    default: 'Whale Network | Studio Provenance & Aztec Identity',
    template: '%s | Whale Network'
  },
  description: 'Whale Network is the premier privacy layer on the Aztec Network. Claim your decentralized identity, access Studio Provenance, and communicate securely via Whale Chat using zero-knowledge proofs.',
  keywords: [
    'whale network', 'aztec identity', 'studio provenance', 'whale chat', 'decentralized identity',
    'zero-knowledge proofs', 'privacy', 'noir language', 'verifiable credentials'
  ],
  authors: [{ name: 'Whale Network' }],
  creator: 'Whale Network',
  publisher: 'Whale Network',
  metadataBase: new URL('https://humanidfi.com'),
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  appleWebApp: {
    capable: true,
    title: 'Whale Network',
    statusBarStyle: 'default',
  },
  openGraph: {
    title: 'Whale Network | Studio Provenance & Aztec Identity',
    description: 'Claim your decentralized identity, access Studio Provenance, and communicate securely via Whale Chat using zero-knowledge proofs.',
    url: 'https://humanidfi.com',
    siteName: 'Whale Network',
    images: [
      {
        url: '/humanid_protocol_logo_1778714491433.png',
        width: 1200,
        height: 1200,
        alt: 'Whale Network Logo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Whale Network | Studio Provenance & Aztec Identity',
    description: 'Claim your decentralized identity, access Studio Provenance, and communicate securely via Whale Chat using zero-knowledge proofs.',
    images: ['/humanid_protocol_logo_1778714491433.png'],
    site: '@whalenetwork',
    creator: '@whalenetwork',
  },
}

export const viewport = {
  themeColor: '#FFFFFF',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  interactiveWidget: 'overlays-content',
}

export default async function RootLayout({
  children,
  }: {
  children: React.ReactNode
}) {
  const headersList = await headers();
  const cookies = headersList.get('cookie');
  const nonce = headersList.get('x-nonce') || '';

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "url": "https://humanidfi.com/",
        "name": "Whale Network",
        "description": "Privacy-preserving identity verification solution integrating zero-knowledge proofs.",
        "potentialAction": {
          "@type": "SearchAction",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": "https://humanidfi.com/?q={search_term_string}"
          },
          "query-input": "required name=search_term_string"
        },
        "publisher": {
          "@id": "https://humanidfi.com/#organization"
        }
      },
      {
        "@type": "Organization",
        "@id": "https://humanidfi.com/#organization",
        "name": "Whale Network",
        "alternateName": ["Whale Ecosystem", "Whale Network Protocol"],
        "url": "https://humanidfi.com",
        "logo": "https://humanidfi.com/humanid_protocol_logo_1778714491433.png",
        "sameAs": [
          "https://github.com/humanityledger/Humanity-Ledger"
        ]
      },
      {
        "@type": "WebApplication",
        "name": "Whale Network Platform",
        "applicationCategory": "SecurityApplication",
        "operatingSystem": "Web",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
        },
        "creator": {
          "@id": "https://humanidfi.com/#organization"
        },
        "description": "Privacy-preserving identity verification and portfolio management.",
        "featureList": [
          "Identity Verification",
          "Zero-Knowledge Proofs",
          "Compliance Tools",
          "Privacy-Preserving Infrastructure"
        ]
      },
      {
        "@type": "ItemList",
        "itemListElement": [
          {
            "@type": "SiteNavigationElement",
            "position": 1,
            "name": "Docs",
            "description": "Whale Network SDK enables privacy-preserving identity verification.",
            "url": "https://humanidfi.com/developers/api-docs"
          },
          {
            "@type": "SiteNavigationElement",
            "position": 2,
            "name": "Portfolio App",
            "description": "Track cross-chain capital flows and asset balances locally. No server ever sees your complete portfolio.",
            "url": "https://humanidfi.com/portfolio"
          },
          {
            "@type": "SiteNavigationElement",
            "position": 3,
            "name": "Whale Network Registry Explorer",
            "description": "Explore countries with supported documents, view coverage and node density.",
            "url": "https://humanidfi.com/registry"
          }
        ]
      }
    ]
  };

  return (
    <html lang="en" className="light" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        {/* Proper viewport already handled by Next.js `viewport` export above */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        {/* Prevent iOS Safari from auto-detecting phone numbers as links */}
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        {/*  localStorage  sessionStorage polyfill for incognito (iOS/Android) 
            Runs BEFORE any script so WalletConnect pairing data can be stored.
            In iOS Safari Private, localStorage quota is 0  this patches it
            with sessionStorage so WC v2 sessions survive within the tab. */}
        <script nonce={nonce} dangerouslySetInnerHTML={{ __html: `(function(){
  try{
    window.localStorage.setItem('__humanid_probe__','1');
    window.localStorage.removeItem('__humanid_probe__');
  }catch(e){
    try{
      var _ss=window.sessionStorage;
      Object.defineProperty(window,'localStorage',{
        configurable:true,enumerable:true,
        get:function(){return _ss;}
      });
    }catch(e2){}
  }
})();` }} />
        {/*  Global ChunkLoadError Recovery 
            Catches router-level dynamic import failures (stale deployment)
            that bubble past React Error Boundaries. */}
        <script nonce={nonce} dangerouslySetInnerHTML={{ __html: `(function(){
  // ── ChunkLoadError Recovery v2 ──────────────────────────────────────────
  // After a Railway deploy, old JS chunk URLs (with old content hashes) return
  // 404. This causes React hydration failures and broken layouts. The fix:
  // 1. Detect the error  2. Clear ALL SW caches  3. Hard-reload from server
  var RELOAD_KEY = 'chunk_reload_v2';
  var RELOAD_TS_KEY = 'chunk_reload_ts';

  function isChunkError(msg) {
    return msg && (
      msg.includes('ChunkLoadError') ||
      msg.includes('dynamically imported module') ||
      msg.includes('Failed to fetch dynamically') ||
      msg.includes('Loading chunk') ||
      msg.includes('Loading CSS chunk')
    );
  }

  function clearCachesAndReload() {
    var now = Date.now();
    var lastReload = parseInt(sessionStorage.getItem(RELOAD_TS_KEY) || '0', 10);
    // Prevent reload loops: only allow one auto-reload per 10 seconds
    if (now - lastReload < 10000) { return; }
    sessionStorage.setItem(RELOAD_TS_KEY, now.toString());
    // Tell the Service Worker to clear all its caches before we reload
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      var mc = new MessageChannel();
      mc.port1.onmessage = function() { window.location.reload(true); };
      navigator.serviceWorker.controller.postMessage({ type: 'CLEAR_ALL_CACHES' }, [mc.port2]);
      // Fallback: reload after 800ms even if SW doesn't respond
      setTimeout(function() { window.location.reload(true); }, 800);
    } else {
      // No SW — also manually delete caches via CacheStorage API
      if (window.caches) {
        window.caches.keys().then(function(keys) {
          return Promise.all(keys.map(function(k) { return window.caches.delete(k); }));
        }).then(function() { window.location.reload(true); }).catch(function() { window.location.reload(true); });
      } else {
        window.location.reload(true);
      }
    }
  }

  window.addEventListener('unhandledrejection', function(event) {
    var msg = event.reason ? (event.reason.message || event.reason.name || String(event.reason) || '') : '';
    if (isChunkError(msg)) {
      event.preventDefault();
      clearCachesAndReload();
    }
  });

  window.addEventListener('error', function(event) {
    var msg = (event.message || '') + (event.filename || '');
    if (isChunkError(msg)) {
      clearCachesAndReload();
    }
  }, true);

  // ── Nuclear Service Worker Purge ─────────────────────────────────────────
  // If the user is stuck with a broken SW returning HTML for CSS (un-styled page)
  // or an old cached HTML, we force an unregister and reload ONCE per session.
  var NUCLEAR_KEY = 'sw_nuclear_purge_v5';
  if (!sessionStorage.getItem(NUCLEAR_KEY)) {
    sessionStorage.setItem(NUCLEAR_KEY, '1');
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(function(regs) {
        var unregs = regs.map(function(r) { return r.unregister(); });
        Promise.all(unregs).then(function() {
          if (window.caches) {
            window.caches.keys().then(function(keys) {
              Promise.all(keys.map(function(k) { return window.caches.delete(k); }))
                .then(function() { window.location.reload(true); })
                .catch(function() { window.location.reload(true); });
            });
          } else {
            window.location.reload(true);
          }
        });
      });
    }
  }

})();` }} />
        <script
          nonce={nonce}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className="bg-white text-[#050505] antialiased selection:bg-black/10 selection:text-black transition-colors duration-300"
        suppressHydrationWarning
      >


        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[9999] bg-black text-white px-4 py-2 rounded-lg font-bold text-sm">
          Skip to absolute content
        </a>
        <ScrollProgressBar />
        <Providers cookies={cookies}>
          <GlobalErrorBoundary>
            <MobileEnforcer>
              <ClientLayout>
                <AztecProvider>
                  <AztecNativeProvider>
                    <CookieProvider>
                      <ErrorSuppressor />
                      <GoogleTagManager gtmId="GTM-52B9SCRM" />
                      <AntiTamperCore />
                      {children}
                      <Toaster richColors position="top-right" />
                      <CookieConsent />
                      <ClientOverlays />
                      <WalletConnectProvider />
                    </CookieProvider>
                  </AztecNativeProvider>
                </AztecProvider>
              </ClientLayout>
            </MobileEnforcer>
          </GlobalErrorBoundary>
        </Providers>
      </body>
    </html>
  )
}
