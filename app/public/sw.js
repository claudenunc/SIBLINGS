// Self-destructing service worker: clears all caches and unregisters itself.
// This ensures users always get the latest version of the app.

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(cacheNames.map(name => caches.delete(name)))
    ).then(() => self.registration.unregister())
  );
});
