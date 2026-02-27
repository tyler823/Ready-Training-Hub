// Ready Training Platform - Service Worker
// Version: 1.0.0

const CACHE_NAME = 'ready-training-v1';
const OFFLINE_URL = '/offline.html';

// Assets to cache on install
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

// ---- Fetch: Network-first with cache fallback ----
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests and chrome-extension requests
  if (event.request.method !== 'GET' || event.request.url.startsWith('chrome-extension')) {
    return;
  }

  // Skip Memberstack API calls — always go to network
  if (event.request.url.includes('memberstack') || event.request.url.includes('memberspace')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Cache successful responses for HTML, CSS, JS, images
        if (networkResponse && networkResponse.status === 200) {
          const url = event.request.url;
          if (
            url.includes('.html') ||
            url.includes('.css') ||
            url.includes('.js') ||
            url.includes('.png') ||
            url.includes('.jpg') ||
            url.includes('.svg') ||
            url.includes('.woff') ||
            url === 'https://readytraining.app/' ||
            url === 'https://readytraining.app'
          ) {
            const cloned = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, cloned));
          }
        }
        return networkResponse;
      })
      .catch(() => {
        // Network failed — try cache
        return caches.match(event.request).then((cached) => {
          if (cached) return cached;
          // For navigate requests, return the homepage from cache
          if (event.request.mode === 'navigate') {
            return caches.match('/');
          }
          return new Response('Offline', { status: 503, statusText: 'Offline' });
        });
      })
  );
});
