// Ready Training Platform - Service Worker

// ---- Cache version ----
// Bump this constant ONLY to purge old caches (e.g. 'ready-training-v2' -> 'ready-training-v3').
// Fresh core files do NOT depend on bumping this — the network-first fetch strategy below
// always serves the latest files when online. This version only controls cache cleanup:
// on activate, every cache whose name doesn't match CACHE_NAME is deleted, so bumping it
// once clears every returning user's stale cache on their next visit.
const CACHE_NAME = 'ready-training-v2';

const OFFLINE_URL = '/offline.html';

// Assets to seed the cache with on install. These are only ever used as an OFFLINE
// fallback — while online they are always re-fetched fresh from the network.
const PRECACHE_ASSETS = [
  '/',
  '/platform.html',
  '/manifest.json',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Archivo:wght@400;500;600;700;800&display=swap'
];

// ---- Install ----
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('[SW] Some precache assets failed:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// ---- Activate ----
// Delete every cache that isn't the current version, then take control immediately.
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// ---- Fetch: Network-first, cache only as an offline fallback ----
// While online, every request goes to the network first, so core app files
// (platform.html, index.html, app.js, styles.css and all navigations) are always
// served FRESH. A clone of each successful response is stored so it can be served
// if the network is later unavailable.
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests and chrome-extension requests
  if (event.request.method !== 'GET' || event.request.url.startsWith('chrome-extension')) {
    return;
  }

  // Skip Memberstack API calls — always go straight to network
  if (event.request.url.includes('memberstack') || event.request.url.includes('memberspace')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Cache successful responses so they're available offline later.
        if (networkResponse && networkResponse.status === 200) {
          const cloned = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, cloned));
        }
        return networkResponse;
      })
      .catch(() => {
        // Network truly unavailable — fall back to cache.
        return caches.match(event.request).then((cached) => {
          if (cached) return cached;
          // For navigation requests, fall back to a cached page.
          if (event.request.mode === 'navigate') {
            return caches.match('/platform.html')
              .then((page) => page || caches.match('/'))
              .then((page) => page || caches.match(OFFLINE_URL))
              .then((page) => page || new Response('Offline', { status: 503, statusText: 'Offline' }));
          }
          return new Response('Offline', { status: 503, statusText: 'Offline' });
        });
      })
  );
});
