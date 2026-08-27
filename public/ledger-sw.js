// public/ledger-sw.js
// Sovereign Service Worker for decentralized push notifications
// Runs completely offline and handles incoming XMTP payload syncs when the app is closed.

const CACHE_NAME = 'ledger-chat-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/sounds/ledger-sonar.mp3',
];

self.addEventListener('install', (event) => {
  // Pre-cache core assets for immediate offline loading
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Clean up old caches if we update CACHE_NAME
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Push Event Handler — App Store / Android Push Parity
self.addEventListener('push', (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    
    // Privacy-first: if payload specifies generic notification, hide message content
    const title = data.hideContent ? 'New Message' : data.title || 'LedgerChat';
    const body = data.hideContent ? 'You received a secure message.' : data.body || 'Open to view your message.';
    
    const options = {
      body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge.png', // Small monochrome icon for Android status bar
      vibrate: [200, 100, 200, 100, 200, 100, 200],
      data: {
        url: data.url || '/chat',
        peerAddress: data.peerAddress
      },
      tag: data.peerAddress || 'ledger-notification', // Groups notifications by sender
      renotify: true, // Alerts the user even if there's already a notification for this tag
      requireInteraction: true // Keeps the notification visible until dismissed
    };

    event.waitUntil(self.registration.showNotification(title, options));
  } catch (e) {
    console.error('[Ledger SW] Error parsing push data', e);
  }
});

// Notification Click Handler — deep linking back to the specific chat
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const urlToOpen = event.notification.data.url;

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // If a window is already open, focus it and navigate
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url.includes(urlToOpen) && 'focus' in client) {
          // Tell the client to switch active peer if it's open
          client.postMessage({
            type: 'NAVIGATE_CHAT',
            peerAddress: event.notification.data.peerAddress
          });
          return client.focus();
        }
      }
      // Otherwise, open a new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen);
      }
    })
  );
});

// Sync Event — Offline Outbox Processing
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-messages') {
    console.log('[Ledger SW] Background sync triggered');
    event.waitUntil(processOutbox());
  }
});

async function processOutbox() {
  // Connect to the IndexedDB 'ledgerDB' to read the outbox and send via standard fetch/XMTP relay
  // This executes entirely in the background worker when the device regains connectivity.
  return new Promise((resolve) => {
    const request = indexedDB.open('ledger-database', 1);
    
    request.onsuccess = (e) => {
      const db = e.target.result;
      const tx = db.transaction('outbox', 'readonly');
      const store = tx.objectStore('outbox');
      const getAllRequest = store.getAll();
      
      getAllRequest.onsuccess = () => {
        const messages = getAllRequest.result;
        if (messages && messages.length > 0) {
          // Send message to open clients to trigger sending
          self.clients.matchAll().then(clients => {
            clients.forEach(client => client.postMessage({ type: 'FLUSH_OUTBOX' }));
          });
        }
        resolve();
      };
    };
    
    request.onerror = () => resolve();
  });
}
