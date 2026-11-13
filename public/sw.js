// Service worker: l'app resta consultabile anche offline con le ultime notizie scaricate.
// Regola semplice: si va sempre in rete; la copia salvata serve solo quando la rete manca.
// (Niente opzioni extra sulle richieste: su Safari possono far fallire le richieste di pagina
// e far restare in uso una versione vecchia.)
const CACHE = 'rassegna-v8';
const BASE = new URL('./', self.location).pathname;

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const u = new URL(req.url);
  if (u.origin !== location.origin) return;
  const p = u.pathname.slice(BASE.length);
  // solo pagina, codice e dati; immagini e icone passano direttamente
  const isPage = req.mode === 'navigate';
  const isData = p === 'api/feed.json' || p === 'api/sources.json';
  const isCode = /\.(js|css)$/.test(p);
  if (!isPage && !isData && !isCode) return;
  const key = isPage ? BASE : (isData ? BASE + p : req.url);
  // la pagina principale va sempre ricontrollata (GitHub Pages la fa tenere in cache 10 minuti):
  // si crea una richiesta nuova dall'indirizzo, senza riusare quella di navigazione
  const net = isPage || isData ? fetch(new Request(u.href, { cache: 'no-cache', credentials: 'same-origin' })) : fetch(req);
  e.respondWith(
    net.then(r => {
      if (r.ok) { const c = r.clone(); caches.open(CACHE).then(x => x.put(key, c)); }
      return r;
    }).catch(() => caches.match(key).then(r => r || Response.error()))
  );
});
