const CACHE_VERSION = 'HentaiUnited-v1';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;
const IMAGE_CACHE = `${CACHE_VERSION}-images`;
const API_CACHE = `${CACHE_VERSION}-api`;

// Assets to cache immediately on install
const STATIC_ASSETS = [
  '/',
  '/offline',
  '/android-chrome-192x192.png',
  '/android-chrome-512x512.png',
  '/favicon-32x32.png',
  '/favicon-16x16.png',
  '/apple-touch-icon.png',
];

// Maximum cache sizes
const MAX_CACHE_SIZE = {
  images: 100,
  dynamic: 50,
  api: 30,
};

// Cache size limiter
const limitCacheSize = async (cacheName, maxItems) => {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length > maxItems) {
    await cache.delete(keys[0]);
    await limitCacheSize(cacheName, maxItems);
  }
};

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
      .catch(err => console.error('[SW] Installation failed:', err))
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(name => name.startsWith('HentaiUnited-') && name !== STATIC_CACHE && name !== DYNAMIC_CACHE && name !== IMAGE_CACHE && name !== API_CACHE)
            .map(name => {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => self.clients.claim())
      .catch(err => console.error('[SW] Activation failed:', err))
  );
});

// Fetch event - network strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip Chrome extensions and external domains
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;
  if (!url.origin.toLowerCase().includes('hentaiunited.ro') && !url.origin.includes('localhost')) {
    // Allow external resources but don't cache
    return;
  }

  // API requests - Network First with cache fallback
  if (url.pathname.startsWith('/api/')) {
    // Don't cache mutations, analytics, or user-specific data
    if (url.pathname.includes('/views') || 
        url.pathname.includes('/likes') || 
        url.pathname.includes('/watchlist') ||
        url.pathname.includes('/profile')) {
      return; // Network only
    }

    event.respondWith(
      fetch(request)
        .then(response => {
          // Cache successful responses for episodes/anime data
          if (response.ok && (url.pathname.includes('/episodes') || url.pathname.includes('/hentai'))) {
            const responseClone = response.clone();
            caches.open(API_CACHE).then(cache => {
              cache.put(request, responseClone);
              limitCacheSize(API_CACHE, MAX_CACHE_SIZE.api);
            });
          }
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Images - Cache First
  if (request.destination === 'image' || /\.(jpg|jpeg|png|gif|webp|svg|avif)$/i.test(url.pathname)) {
    event.respondWith(
      caches.match(request)
        .then(cached => {
          if (cached) return cached;
          
          return fetch(request).then(response => {
            if (response.ok) {
              const responseClone = response.clone();
              caches.open(IMAGE_CACHE).then(cache => {
                cache.put(request, responseClone);
                limitCacheSize(IMAGE_CACHE, MAX_CACHE_SIZE.images);
              });
            }
            return response;
          });
        })
        .catch(() => caches.match('/android-chrome-192x192.png'))
    );
    return;
  }

  // Static assets (JS, CSS, fonts) - Cache First
  if (request.destination === 'script' || 
      request.destination === 'style' || 
      request.destination === 'font' ||
      url.pathname.startsWith('/_next/static/')) {
    event.respondWith(
      caches.match(request)
        .then(cached => cached || fetch(request).then(response => {
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(STATIC_CACHE).then(cache => cache.put(request, responseClone));
          }
          return response;
        }))
    );
    return;
  }

  // HTML pages - Network First with cache fallback
  if (request.destination === 'document' || request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(DYNAMIC_CACHE).then(cache => {
              cache.put(request, responseClone);
              limitCacheSize(DYNAMIC_CACHE, MAX_CACHE_SIZE.dynamic);
            });
          }
          return response;
        })
        .catch(() => 
          caches.match(request)
            .then(cached => cached || caches.match('/offline'))
        )
    );
    return;
  }
});

// Background sync for failed requests
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);
  
  if (event.tag === 'sync-watchlist') {
    event.waitUntil(
      // Sync watchlist changes when back online
      fetch('/api/sync-watchlist', { method: 'POST' })
        .then(response => console.log('[SW] Watchlist synced'))
        .catch(err => console.error('[SW] Sync failed:', err))
    );
  }
  
  if (event.tag === 'sync-progress') {
    event.waitUntil(
      // Sync viewing progress when back online
      fetch('/api/sync-progress', { method: 'POST' })
        .then(response => console.log('[SW] Progress synced'))
        .catch(err => console.error('[SW] Sync failed:', err))
    );
  }
});

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  
  if (!event.data) return;

  try {
    const data = event.data.json();
    const options = {
      body: data.body || 'Episod nou disponibil!',
      icon: data.icon || '/android-chrome-192x192.png',
      badge: '/favicon-32x32.png',
      image: data.image, // Anime cover image
      vibrate: [200, 100, 200],
      tag: data.tag || 'HentaiUnited-notification',
      requireInteraction: data.requireInteraction || false,
      data: {
        url: data.url || '/',
        dateOfArrival: Date.now(),
        primaryKey: data.primaryKey,
        animeId: data.animeId,
        episodeId: data.episodeId,
      },
      actions: [
        {
          action: 'watch',
          title: 'Vizionează',
          icon: '/android-chrome-192x192.png'
        },
        {
          action: 'later',
          title: 'Mai târziu',
          icon: '/favicon-32x32.png'
        }
      ]
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'HentaiUnited', options)
    );
  } catch (err) {
    console.error('[SW] Push notification error:', err);
  }
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action);
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';

  if (event.action === 'watch') {
    // Open the specific episode or anime page
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then(clientList => {
          // Check if there's already a window open
          for (const client of clientList) {
            if (client.url === urlToOpen && 'focus' in client) {
              return client.focus();
            }
          }
          // Open new window
          if (clients.openWindow) {
            return clients.openWindow(urlToOpen);
          }
        })
    );
  } else if (event.action === 'later') {
    // Add to watchlist via background sync
    event.waitUntil(
      self.registration.sync.register('add-to-watchlist')
        .catch(err => console.error('[SW] Sync registration failed:', err))
    );
  } else {
    // Default action - open the URL
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then(clientList => {
          for (const client of clientList) {
            if ('focus' in client) {
              return client.focus();
            }
          }
          if (clients.openWindow) {
            return clients.openWindow(urlToOpen);
          }
        })
    );
  }
});

// Handle messages from the client
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);

  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      })
    );
  }

  if (event.data.type === 'GET_CACHE_SIZE') {
    event.waitUntil(
      caches.keys()
        .then(cacheNames => {
          return Promise.all(
            cacheNames.map(async cacheName => {
              const cache = await caches.open(cacheName);
              const keys = await cache.keys();
              return { name: cacheName, size: keys.length };
            })
          );
        })
        .then(cacheSizes => {
          event.ports[0].postMessage({ cacheSizes });
        })
    );
  }
});

console.log('[SW] Service worker loaded');