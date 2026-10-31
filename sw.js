/* Obelum Properties — offline fallback only.
   Deliberately NOT a caching layer. During active design work a
   stale-while-revalidate worker serves old markup and assets for a visit or
   two after each deploy, which has already broken this site twice. Everything
   is network-first; the cache exists solely so an offline visit still renders.
   Bump CACHE to retire old stores. */
const CACHE = 'obelum-v21';

self.addEventListener('install', (e) => {
  // Take over immediately rather than waiting for every old tab to close.
  e.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const { request } = e;
  if (request.method !== 'GET' || new URL(request.url).origin !== location.origin) return;

  // Network first, always. The cache is only a fallback for being offline,
  // so a deploy is picked up on the very next request.
  e.respondWith(
    fetch(request)
      .then((res) => {
        if (res && res.status === 200 && res.type === 'basic') {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(request, copy)).catch(() => {});
        }
        return res;
      })
      .catch(() => caches.match(request).then((hit) =>
        hit || (request.mode === 'navigate' ? caches.match('/') : undefined)
      ))
  );
});
