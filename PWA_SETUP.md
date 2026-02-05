#!/bin/bash
# install-pwa.sh - Install and configure PWA service workers

echo "Installing PWA dependencies..."

npm install workbox-webpack-plugin workbox-window --save-dev
npm install idb --save

echo "Creating PWA service worker configuration..."

# Create public/index.html with PWA meta tags
cat > public/index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="IoT Marketplace - Buy quality components for your projects">
    <meta name="theme-color" content="#2563EB">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="apple-mobile-web-app-title" content="IoT Store">
    
    <!-- PWA Manifest -->
    <link rel="manifest" href="/manifest.json">
    
    <!-- Apple Icon -->
    <link rel="apple-touch-icon" href="/assets/icon-192.png">
    
    <!-- Favicon -->
    <link rel="icon" type="image/png" href="/assets/favicon.png">
    
    <!-- Preconnect to API -->
    <link rel="preconnect" href="https://api.iotmarketplace.com">
    <link rel="dns-prefetch" href="https://api.iotmarketplace.com">
    
    <title>IoT Marketplace</title>
</head>
<body>
    <div id="root"></div>
    
    <script>
        // Register service worker
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/service-worker.js')
                    .then(registration => {
                        console.log('Service Worker registered:', registration);
                    })
                    .catch(error => {
                        console.log('Service Worker registration failed:', error);
                    });
            });
        }
    </script>
</body>
</html>
EOF

# Create public/service-worker.js
cat > public/service-worker.js << 'EOF'
const CACHE_NAME = 'iot-marketplace-v1';
const API_CACHE_NAME = 'iot-api-v1';

// Files to cache on install
const urlsToCache = [
    '/',
    '/index.html',
    '/manifest.json',
    '/assets/icon-192.png',
    '/assets/icon-512.png'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                return cache.addAll(urlsToCache);
            })
            .then(() => self.skipWaiting())
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch event - network first for API, cache first for assets
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // API requests - network first, fallback to cache
    if (url.pathname.includes('/api/')) {
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    // Cache successful responses
                    if (response.ok) {
                        const responseClone = response.clone();
                        caches.open(API_CACHE_NAME).then((cache) => {
                            cache.put(event.request, responseClone);
                        });
                    }
                    return response;
                })
                .catch(() => {
                    // Return cached API response if network fails
                    return caches.match(event.request)
                        .then((response) => {
                            return response || new Response(
                                JSON.stringify({ error: 'Offline' }),
                                { status: 503, statusText: 'Service Unavailable' }
                            );
                        });
                })
        );
    } else {
        // Static assets - cache first, fallback to network
        event.respondWith(
            caches.match(event.request)
                .then((response) => {
                    return response || fetch(event.request)
                        .then((response) => {
                            // Cache new responses
                            if (response.ok) {
                                const responseClone = response.clone();
                                caches.open(CACHE_NAME).then((cache) => {
                                    cache.put(event.request, responseClone);
                                });
                            }
                            return response;
                        });
                })
                .catch(() => {
                    return new Response('Resource not available offline', {
                        status: 503,
                        statusText: 'Service Unavailable'
                    });
                })
        );
    }
});

// Handle messages from client
self.addEventListener('message', (event) => {
    if (event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
EOF

# Create src/utils/pwa.ts for PWA utility functions
cat > src/utils/pwa.ts << 'EOF'
/**
 * PWA Utilities
 * Handle service worker registration and updates
 */

export const registerServiceWorker = async () => {
    if ('serviceWorker' in navigator) {
        try {
            const registration = await navigator.serviceWorker.register('/service-worker.js');
            
            // Check for updates periodically
            setInterval(() => {
                registration.update();
            }, 60000); // Check every minute
            
            // Listen for updates
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                if (newWorker) {
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'activated') {
                            // New service worker activated
                            // Notify user to refresh
                            console.log('New app version available');
                        }
                    });
                }
            });
            
            return registration;
        } catch (error) {
            console.error('Service Worker registration failed:', error);
        }
    }
};

export const unregisterServiceWorker = async () => {
    if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (let registration of registrations) {
            await registration.unregister();
        }
    }
};

export const isOnline = () => {
    return navigator.onLine;
};

export const requestNotificationPermission = async () => {
    if ('Notification' in window) {
        if (Notification.permission === 'granted') {
            return true;
        } else if (Notification.permission !== 'denied') {
            const permission = await Notification.requestPermission();
            return permission === 'granted';
        }
    }
    return false;
};

export const sendNotification = (title: string, options?: NotificationOptions) => {
    if ('serviceWorker' in navigator && 'Notification' in window) {
        navigator.serviceWorker.ready.then((registration) => {
            registration.showNotification(title, options);
        });
    }
};
EOF

echo "PWA setup complete!"
echo ""
echo "Next steps:"
echo "1. Add public/index.html to your web build output"
echo "2. Add public/service-worker.js to your web build output"
echo "3. Update your entry point to register the service worker"
echo "4. Test PWA features:"
echo "   - Open DevTools > Application > Service Workers"
echo "   - Try offline mode to test caching"
echo "   - Install app to home screen (Chrome/Edge)"
echo ""
EOF

chmod +x install-pwa.sh

echo "Installation script created!"
echo "Run: bash install-pwa.sh"
