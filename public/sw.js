const CACHE_NAME = 'gp-patrimonial-v3';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.svg',
];

// Install Event: pre-cache shell assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[SW] Pre-caching non-fatal warning:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate Event: clean up legacy caches and claim clients immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.info('[SW] Removing outdated cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// Listen for custom messages (e.g. SKIP_WAITING from UI update prompts)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Fetch Event: Network-First with Cache Fallback for navigation, Stale-While-Revalidate for assets
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Ignore non-GET requests, dev server scripts, and chrome extensions
  const url = request.url;
  if (
    request.method !== 'GET' ||
    !url.startsWith('http') ||
    url.includes('/src/') ||
    url.includes('/@vite/') ||
    url.includes('/@fs/') ||
    url.includes('/@id/') ||
    url.includes('node_modules') ||
    url.includes('hot-update')
  ) {
    return;
  }

  // Handle SPA Navigation requests (Network-first with cached index.html fallback)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          const cachedResponse = await caches.match(request);
          if (cachedResponse) return cachedResponse;
          const fallbackIndex = await caches.match('/');
          if (fallbackIndex) return fallbackIndex;
          return new Response(
            '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Offline - Gestão Patrimonial</title></head><body style="background:#121214;color:#f2f1ed;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;text-align:center;padding:20px;"><div><h2>Você está offline</h2><p>O aplicativo continua salvando seus dados localmente. Reconecte-se à internet para sincronização completa.</p><button onclick="location.reload()" style="background:#8b5cf6;color:#121214;font-weight:bold;padding:10px 20px;border:none;border-radius:10px;cursor:pointer;">Tentar Novamente</button></div></body></html>',
            { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
          );
        })
    );
    return;
  }

  // Handle static assets & scripts (Stale-While-Revalidate)
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Offline fallback
          return cachedResponse;
        });

      return cachedResponse || fetchPromise;
    })
  );
});
