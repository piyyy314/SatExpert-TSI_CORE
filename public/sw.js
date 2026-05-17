
const CACHE_NAME = 'satexpert-cache-v2';
const urlsToCache = [
  '/',
  '/index.html',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        // Use addAll safely, if one fails it will reject, catch it
        return Promise.all(urlsToCache.map(url => {
            return cache.add(url).catch(err => console.error('Failed to cache', url, err));
        }));
      })
  );
});

self.addEventListener('fetch', event => {
  // Avoid caching cross-origin or chrome-extension requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }
  
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Cache successful responses
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
