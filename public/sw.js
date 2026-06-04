/**
 * System Service Worker — Axioma 452 v3
 *
 * KEY FIX: CACHE_VERSION is now a build timestamp injected at build time.
 * On every Railway deploy, a new timestamp is embedded, which causes the SW
 * activate event to delete ALL old caches — eliminating ChunkLoadErrors.
 *
 * Strategy:
 *   - JS/CSS chunks (.next/static): Network-first (never serve stale hashed chunks)
 *   - Images/fonts: Cache-first (truly immutable by filename hash)
 *   - HTML pages: Network-first (always get fresh HTML from server)
 *   - API routes: Network-only (never cache dynamic data)
 */

// ─── CRITICAL: This timestamp changes on EVERY build ────────────────────────
// Format: ISO string replaced by build script / CI. Falls back to deployment
// URL parameter so Railway's CDN can distinguish builds.
const BUILD_ID = self.registration.scope + '?v=' + Date.now().toString(36);
const CACHE_VERSION = 'system-v3-' + (typeof __BUILD_TIMESTAMP__ !== 'undefined'
  ? __BUILD_TIMESTAMP__
  : Math.random().toString(36).slice(2));

const STATIC_CACHE = `${CACHE_VERSION}-static`;
const PAGE_CACHE   = `${CACHE_VERSION}-pages`;

// ─── Install: skip waiting immediately so new SW takes over fast ─────────────
self.addEventListener('install', (event) => {
  // Skip waiting — do NOT pre-cache. Pre-caching on install causes stale
  // content to be served immediately. We load-on-demand instead.
  self.skipWaiting();
});

// ─── Activate: DELETE ALL old caches from previous versions ─────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== STATIC_CACHE && key !== PAGE_CACHE)
          .map((key) => {
            console.log('[SW] Deleting stale cache:', key);
            return caches.delete(key);
          })
      )
    ).then(() => {
      console.log('[SW] Activated. Cache version:', CACHE_VERSION);
      return self.clients.claim();
    })
  );
});

// ─── Fetch: routing strategies ───────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and cross-origin
  if (request.method !== 'GET' || url.origin !== location.origin) return;

  // 1. API routes → Network-only (never cache live data)
  if (url.pathname.startsWith('/api/')) {
    // Don't intercept — let browser handle natively
    return;
  }

  // 2. Next.js JS/CSS chunks (_next/static) → Network-first
  // These have content-hashed filenames, so network version is always "fresh".
  // But we must NOT serve stale versions after a new deploy — that's what
  // causes ChunkLoadErrors. Network-first ensures we always try network first.
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(networkFirstWithCache(request, STATIC_CACHE));
    return;
  }

  // 3. Public static assets (images, fonts, icons) → Cache-first
  // These are truly static and safe to cache aggressively.
  const staticExts = ['.png', '.jpg', '.jpeg', '.webp', '.svg', '.ico', '.woff2', '.woff', '.ttf'];
  if (staticExts.some((ext) => url.pathname.endsWith(ext))) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // 4. HTML navigation requests → Network-first (always fresh HTML)
  // This ensures users get the latest build's HTML which references correct chunks.
  if (request.mode === 'navigate') {
    event.respondWith(networkFirstWithFallback(request, PAGE_CACHE));
    return;
  }
});

// ─── Strategy: Network-first with cache fallback ─────────────────────────────
async function networkFirstWithCache(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    return cached ?? offlineFallback();
  }
}

// ─── Strategy: Network-first for HTML with cache fallback ────────────────────
async function networkFirstWithFallback(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    return offlineFallback();
  }
}

// ─── Strategy: Cache-first for truly static assets ───────────────────────────
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return offlineFallback();
  }
}

// ─── Offline fallback ────────────────────────────────────────────────────────
function offlineFallback() {
  return new Response(
    `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">
    <title>Whale Network — Offline</title>
    <style>
      body{margin:0;background:#ffffff;color:#050505;font-family:monospace;
           display:flex;align-items:center;justify-content:center;min-height:100vh;
           flex-direction:column;gap:16px;}
      h1{font-size:14px;letter-spacing:.2em;text-transform:uppercase;opacity:.6;}
      p{font-size:11px;opacity:.4;letter-spacing:.1em;text-transform:uppercase;}
    </style>
    </head><body>
      <h1>Whale Network</h1>
      <p>Offline — Reconnect to resume</p>
    </body></html>`,
    { headers: { 'Content-Type': 'text/html' } }
  );
}

// ─── Message: force cache clear from app ─────────────────────────────────────
// Called from the ChunkLoadError recovery script in app/layout.tsx
self.addEventListener('message', (event) => {
  if (event.data?.type === 'CLEAR_ALL_CACHES') {
    caches.keys().then((keys) => {
      Promise.all(keys.map((key) => caches.delete(key))).then(() => {
        console.log('[SW] All caches cleared by app request');
        event.ports[0]?.postMessage({ done: true });
      });
    });
  }
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// ─── Push notifications ───────────────────────────────────────────────────────
self.addEventListener('push', (event) => {
  if (!event.data) return;
  try {
    const { title, body, icon, data } = event.data.json();
    event.waitUntil(
      self.registration.showNotification(title ?? 'Whale Alert', {
        body:  body  ?? 'New on-chain signal detected.',
        icon:  icon  ?? '/icons/icon-192x192.png',
        badge: '/icons/icon-96x96.png',
        data,
        tag:   'system-alert',
        renotify: true,
        requireInteraction: false,
      })
    );
  } catch {
    console.warn('[SW] Push payload parse error');
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url ?? '/dashboard';
  event.waitUntil(clients.openWindow(url));
});
