// ── 요가니크 POS — Service Worker ────────────────────────────
const CACHE = 'yoganik-pos-v1';
const ASSETS = ['./pos.html', './manifest.json', './sw.js'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = e.request.url;

  // Never intercept API or external form calls
  if (url.includes('script.google.com') || url.includes('forms.gle')) return;

  // Cache-first for GET requests; pass through everything else
  if (e.request.method !== 'GET') return;

  e.respondWith(
    caches.match(e.request).then(cached => {
      const network = fetch(e.request).then(res => {
        if (res.ok) {
          caches.open(CACHE).then(c => c.put(e.request, res.clone()));
        }
        return res;
      });
      return cached || network;
    }).catch(() => caches.match('./pos.html'))
  );
});
