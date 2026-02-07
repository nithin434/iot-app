/**
 * PWA Service Worker Registration
 * Auto-registers service worker for offline support
 */

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js', { scope: '/' })
      .then((registration) => {
        console.log('✅ Service Worker registered:', registration.scope);

        // Check for updates every hour
        setInterval(() => {
          registration.update();
        }, 60 * 60 * 1000);
      })
      .catch((error) => {
        console.error('❌ Service Worker registration failed:', error);
      });
  });

  // Handle updates
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    console.log('🔄 App updated. Reload for latest version.');
    window.location.reload();
  });
}

/**
 * Handle offline/online status
 */
window.addEventListener('online', () => {
  console.log('📡 Back online');
  if (window._onlineStatusCallback) {
    window._onlineStatusCallback(true);
  }
});

window.addEventListener('offline', () => {
  console.log('⚠️ You are offline');
  if (window._onlineStatusCallback) {
    window._onlineStatusCallback(false);
  }
});
