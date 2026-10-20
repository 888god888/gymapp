// Bump VERSION whenever any shell asset changes. Only caches owned by this app are removed.
const VERSION = 'v9';
const PREFIX = `gym-guide-${encodeURIComponent(self.registration.scope)}-`;
const SHELL_CACHE = PREFIX + VERSION;
const MEDIA_CACHE = PREFIX + 'media-v1';
const SHELL = ['./', 'index.html', 'styles.css?v=9', 'data.js?v=9', 'videos.js?v=9', 'app.js?v=9', 'manifest.json', 'icon-180.png', 'icon-192.png', 'icon-512.png'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(SHELL_CACHE).then(cache => cache.addAll(SHELL.map(path => new Request(path, { cache: 'reload' })))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => (key.startsWith(PREFIX) && key !== SHELL_CACHE && key !== MEDIA_CACHE) || key === 'gym-v8').map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  const scope = new URL(self.registration.scope);
  if (url.origin === scope.origin && url.pathname.startsWith(scope.pathname)) {
    // Shell files are one versioned, precached unit: never mix new data/scripts with old HTML.
    if (event.request.mode === 'navigate') {
      event.respondWith(caches.open(SHELL_CACHE).then(cache => cache.match('index.html')).then(cached => cached || fetch(event.request)));
    } else {
      event.respondWith(caches.open(SHELL_CACHE).then(cache => cache.match(event.request)).then(cached => cached || fetch(event.request)));
    }
    return;
  }
  // Only pinned public-domain exercise photos are cached. No third-party video requests are intercepted.
  if (url.hostname === 'raw.githubusercontent.com' && url.pathname.startsWith('/yuhonas/free-exercise-db/f00c92c7dcf1216a928a52c3706c7ce8e2f71ed5/exercises/') && /\/\d\.jpg$/.test(url.pathname)) {
    event.respondWith((async () => {
      const cache = await caches.open(MEDIA_CACHE);
      const cached = await cache.match(event.request);
      if (cached) return cached;
      try {
        const response = await fetch(event.request);
        if (response.ok && response.type !== 'opaque') {
          await cache.put(event.request, response.clone());
          const keys = await cache.keys();
          await Promise.all(keys.slice(0, Math.max(0, keys.length - 160)).map(key => cache.delete(key)));
        }
        return response;
      } catch { return Response.error(); }
    })());
  }
});
