// Service worker: l'app resta consultabile anche offline con le ultime notizie scaricate.
// Percorsi relativi alla cartella dell'app (funziona anche su GitHub Pages in sottocartella).
const SHELL = 'rassegna-shell-v3';
const DATA = 'rassegna-data-v1';
const BASE = new URL('./', self.location).pathname;
const FILES = ['', 'index.html', 'styles.css', 'app.js', 'manifest.webmanifest', 'icon.svg', 'icon-192.png', 'apple-touch-icon.png'].map(f => BASE + f);

self.addEventListener('install', e => { e.waitUntil(caches.open(SHELL).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== SHELL && k !== DATA).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;
  const p = u.pathname.slice(BASE.length);
  if (p === 'api/feed.json' || p === 'api/sources.json') {
    // rete prima, copia salvata se offline
    e.respondWith(fetch(e.request).then(r => { const c = r.clone(); caches.open(DATA).then(x => x.put(p, c)); return r; })
      .catch(() => caches.match(p)));
    return;
  }
  if (p.startsWith('api/')) return;
  e.respondWith(fetch(e.request).then(r => { const c = r.clone(); caches.open(SHELL).then(x => x.put(e.request, c)); return r; })
    .catch(() => caches.match(e.request).then(r => r || caches.match(BASE + 'index.html'))));
});
