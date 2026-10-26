const CACHE_NAME = 'meteo-grenoble-v8.87';
const ASSETS = [
  './',
  './index.html',
  './tabs.html',
  './style.css',
  './tabs.css',
  './app.js',
  './tabs.js',
  './icon-meteociel.png',
  './icon-yrno.png',
  './icon-meteofrance.png',
  './icon-romma.png',
  './icon-meteoblue.png',
  './icon-bera.png',
  './icon-webcam.png',
  './manifest.json',
  './favicon.png',
  './favicon.ico',
  './favicon-16x16.png',
  './favicon-32x32.png',
  './favicon-48x48.png',
  './favicon-192x192.png',
  './favicon.svg'
];

self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((k) => {
          if (k !== CACHE_NAME) return caches.delete(k);
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET' || !e.request.url.startsWith('http')) return;
  const reqUrl = new URL(e.request.url);

  // Requêtes externes (API Météo, Géocodage, Tuiles Radar) : Réseau en direct
  if (reqUrl.origin !== self.location.origin) {
    return;
  }

  // Network-First pour les assets locaux de l'application (App Shell)
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        if (res.status === 200) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});

