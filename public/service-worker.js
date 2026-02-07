/**
 * Service Worker for IoT Marketplace PWA
 * Provides offline support and caching strategy
 * GooglePlay compliant for TWA
 */

const CACHE_VERSION = 'iot-marketplace-v1';
const CACHE_NAMES = {
  STATIC: `${CACHE_VERSION}-static`,
  API: `${CACHE_VERSION}-api`,
  IMAGES: `${CACHE_VERSION}-images`,
};

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
];

// Install: Cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAMES.STATIC).then((cache) => {
      console.log('Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate: Clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => !Object.values(CACHE_NAMES).includes(name))
          .map((name) => {
            console.log('Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    })
  );
  self.clients.claim();
});

// Fetch: Network first, fallback to cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const { url, method } = request;

  // Skip non-GET requests and cross-origin
  if (method !== 'GET' || !url.includes(self.location.origin)) {
    return;
  }

  // API requests: network first, cache fallback
  if (url.includes('/api/')) {
    event.respondWith(networkFirstStrategy(request, CACHE_NAMES.API));
    return;
  }

  // Images: cache first, network fallback
  if (/\.(png|jpg|jpeg|gif|webp|svg)$/i.test(url)) {
    event.respondWith(cacheFirstStrategy(request, CACHE_NAMES.IMAGES));
    return;
  }

  // Static assets: cache first
  event.respondWith(cacheFirstStrategy(request, CACHE_NAMES.STATIC));
});

/**
 * Network first strategy: Try network, fall back to cache
 */
async function networkFirstStrategy(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.log('Network request failed, trying cache:', error);
    return caches.match(request);
  }
}

/**
 * Cache first strategy: Try cache, fall back to network
 */
async function cacheFirstStrategy(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.log('Cache and network failed:', error);
    return caches.match('/');
  }
}
