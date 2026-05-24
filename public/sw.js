// Self-unregistering kill-switch service worker.
//
// The previous Maan website (pre-Nuxt-redesign) registered a Service Worker
// at `/sw.js`. Returning visitors still ping this URL on every load. We no
// longer use a Service Worker, so this script:
//   1. Claims any clients it controls,
//   2. Deletes any caches that may still exist from the old SW,
//   3. Unregisters itself.
//
// After one visit, the browser stops requesting /sw.js entirely. Safe to
// leave this file in place permanently.

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    try {
      const keys = await caches.keys()
      await Promise.all(keys.map(k => caches.delete(k)))
    } catch (_e) {
      // No caches API or denied — fall through to unregister anyway.
    }
    try {
      await self.registration.unregister()
    } catch (_e) {
      // If unregister fails, the next visit will retry; nothing else to do.
    }
    try {
      const clients = await self.clients.matchAll({ type: 'window' })
      clients.forEach(client => client.navigate(client.url))
    } catch (_e) {
      // Older browsers may not support client.navigate; the unregister still
      // takes effect on the next page load.
    }
  })())
})

// Don't intercept anything — pass every fetch straight to the network.
