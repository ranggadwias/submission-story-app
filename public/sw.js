const isDev = self.location.hostname === 'localhost';
const BASE_PATH = isDev ? '' : '/submission-story-app';

const CACHE_NAME = 'story-app-v1';

const ASSETS_TO_CACHE = [
  `${BASE_PATH}/`,
  `${BASE_PATH}/index.html`,
  `${BASE_PATH}/style.css`,
  `${BASE_PATH}/bundle.js`,
  `${BASE_PATH}/manifest.json`,
  'https://fonts.googleapis.com/css2?family=Poppins&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://unpkg.com/leaflet@1.9.3/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.3/dist/leaflet.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).catch(err => {
      console.error('Failed to cache during install:', err);
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      if (!response && event.request.method !== 'GET') {
        return fetch(event.request);
      }
      return response || fetch(event.request);
    }).catch(err => {
      console.error('Fetch error:', err);
    })
  );
});

self.addEventListener('push', event => {
  if (!event.data) return;

  const data = event.data.json();
  const title = data.title || 'Notifikasi';
  const options = {
    body: data.body || 'Anda menerima notifikasi baru',
    icon: data.icon || '/icon.png',
    data: data.url || '/'
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const url = event.notification.data;
  event.waitUntil(
    clients.openWindow(url)
  );
});