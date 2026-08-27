// System layout  No Clerk provider needed (SIWE-native auth)
import { headers } from 'next/headers'
import { IBM_Plex_Sans, IBM_Plex_Mono } from 'next/font/google'
import './globals-compiled.css'
import './globals.css'
import './smooth-scroll.css'
import Providers from "@/components/Providers";
import { ClientLayout } from "@/components/layout/ClientLayout";
import { Toaster } from 'sonner'
import { CookieProvider } from "@/components/privacy/CookieContext";
import { ErrorSuppressor } from "@/components/ui/ErrorSuppressor";
import { ReactNode } from "react";
import { MobileEnforcer } from '@/components/layout/MobileEnforcer';
import { ClientOverlays } from "@/components/layout/ClientOverlays";
import { GlobalErrorBoundary } from "@/components/ui/GlobalErrorBoundary";
import { ScrollProgressBar } from "@/components/ui/ScrollProgressBar";
import { WavesSpotlight } from "@/components/ui/WavesSpotlight";
import { AntiTamperCore } from "@/components/security/AntiTamperCore";
import { AztecProvider } from "@/context/AztecContext";
import { AztecNativeProvider } from "@/context/AztecNativeContext";
import { WalletConnectProvider } from '@/components/walletconnect/WalletConnectProvider';

const plexSans = IBM_Plex_Sans({ 
  subsets: ['latin'], 
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter' // Reusing the inter variable to override all sans usages safely
})

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
  // or an old cached HTML, we force an unregister ONCE per session.
  // MOBILE FIX: Do NOT auto-reload on mobile as it creates infinite refresh loops
  // on iOS Safari where sessionStorage persists across same-domain navigations.
  var NUCLEAR_KEY = 'sw_nuclear_purge_v6';
  var isMobileSW = /android|iphone|ipad|ipod/i.test(navigator.userAgent || '');
  if (!sessionStorage.getItem(NUCLEAR_KEY)) {
    sessionStorage.setItem(NUCLEAR_KEY, '1');
    if ('serviceWorker' in navigator && !isMobileSW) {
      navigator.serviceWorker.getRegistrations().then(function(regs) {
        if (!regs || regs.length === 0) return; // no SW — nothing to do, skip reload
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
        className="bg-white text-black antialiased selection:bg-black/10 transition-colors duration-300"
        suppressHydrationWarning
      >


        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[9999] bg-black text-white px-4 py-2 rounded-lg font-bold text-sm">
          Skip to main content
        </a>
        <ScrollProgressBar />
        <WavesSpotlight />
        <Providers cookies={cookies}>
          <GlobalErrorBoundary>
            <MobileEnforcer>
              <AztecProvider>
                <AztecNativeProvider>
                  <ClientLayout>
                    <CookieProvider>
                      <ErrorSuppressor />
                      <AntiTamperCore />
                      {children}
                      <Toaster richColors position="top-right" />
                      {/* Cookie banner completely eradicated per user request */}
                      <ClientOverlays />
                      <WalletConnectProvider />
                    </CookieProvider>
                  </ClientLayout>
                </AztecNativeProvider>
              </AztecProvider>
            </MobileEnforcer>
          </GlobalErrorBoundary>
        </Providers>
      </body>
    </html>
  )
}
