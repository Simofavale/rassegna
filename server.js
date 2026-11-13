// Rassegna — aggregatore di notizie in stile "colonne" (zero dipendenze, Node >= 18)
// Avvio:  node server.js            → http://localhost:5173
//         node server.js --probe    → verifica tutti i feed e stampa l'esito
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const crypto = require('crypto');

const PORT = Number(process.env.PORT) || 5173;
const ROOT = __dirname;
const FEEDS = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/feeds.json'), 'utf8'));
const readJSON = (f, d) => { try { return JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8')); } catch { return d; } };
const { discoverFeed } = require('./lib-discover');
// Feed trovati automaticamente per le testate dell'elenco: spenti di default, si accendono dall'app
const FEEDS_FOUND = readJSON('data/feeds-scoperti.json', []).map(f => ({ ...f, def: false }));
// Testate aggiunte dall'utente tramite link (file cifrato scritto dall'app, decifrato con RASSEGNA_KEY)
function decryptJSON(obj) {
  if (!obj || !obj.enc) return obj;
  const key = process.env.RASSEGNA_KEY ? Buffer.from(process.env.RASSEGNA_KEY, 'base64url') : null;
  if (!key) return null;
  const iv = Buffer.from(obj.iv, 'base64'), raw = Buffer.from(obj.data, 'base64');
  const d = crypto.createDecipheriv('aes-256-gcm', key, iv); d.setAuthTag(raw.subarray(raw.length - 16));
  return JSON.parse(Buffer.concat([d.update(raw.subarray(0, raw.length - 16)), d.final()]).toString('utf8'));
}
const discovered = new Map();
async function loadFeeds() {
  let user = [];
  try { user = decryptJSON(readJSON('data/feeds-utente.json', [])) || []; } catch (e) { console.warn('feed utente non leggibili:', e.message); }
  const userFeeds = (await pool(user, 6, async u => {
    let feed = u.feed;
    if (!feed) {
      if (!discovered.has(u.site)) discovered.set(u.site, await discoverFeed(u.site).catch(() => null));
      const d = discovered.get(u.site); if (!d) { console.warn('  feed non trovato per', u.site); return null; }
      feed = d.feed; u.domain = u.domain || d.domain;
    }
    const domain = u.domain || new URL(/^https?:/.test(u.site || feed) ? (u.site || feed) : 'https://' + u.site).hostname.replace(/^www\./, '');
    return { src: (u.name || domain).toUpperCase(), domain, url: feed, cat: null, local: !!u.local, user: true, site: u.site, def: true };
  })).filter(f => f && f.url);
  const byUrl = new Map();
  for (const f of [...FEEDS, ...FEEDS_FOUND, ...userFeeds]) if (!byUrl.has(f.url)) byUrl.set(f.url, f);
  // una testata dell'elenco aggiunta a mano diventa attiva
  const userSrc = new Set(userFeeds.map(f => f.src));
  return [...byUrl.values()].map(f => userSrc.has(f.src) ? { ...f, def: true } : f);
}
const PODCASTS = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/podcasts.json'), 'utf8'));
const TESTATE = fs.readFileSync(path.join(ROOT, 'data/testate.txt'), 'utf8')
  .split('|').map(s => s.trim()).filter(Boolean);
const REFRESH_MS = 10 * 60 * 1000;
const WINDOW_MS = 72 * 3600 * 1000;
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36';

const CATEGORIES = [
  ['per-te', 'Per Te', 'smart'], ['top-news', 'Top News', 'smart'], ['podcast', 'Podcast', 'smart'], ['locali', 'Locali', 'local'],
  ['ambiente', 'Ambiente'], ['cronache', 'Cronache'], ['cultura', 'Cultura'], ['economia', 'Economia'],
  ['finanza', 'Finanza'], ['geopolitica', 'Geopolitica'], ['lavoro-e-imprese', 'Lavoro e Imprese'],
  ['mondo', 'Mondo'], ['motori', 'Motori'], ['politica-italia', 'Politica Italia'], ['salute', 'Salute'],
  ['scienze', 'Scienze'], ['societa-e-diritti', 'Società e Diritti'], ['spettacolo', 'Spettacolo'],
  ['sport', 'Sport'], ['tecnologia', 'Tecnologia'], ['unione-europea', 'Unione Europea'],
].map(([id, name, kind]) => ({ id, name, kind: kind || 'folder' }));

// ---------- classificazione ----------
const URL_HINTS = [
  [/\/(politica|palazzo|elezioni)\b/, 'politica-italia'], [/\/(esteri|mondo|world|international|internacional)\b/, 'mondo'],
  [/\/(economia|business|economy)\b/, 'economia'], [/\/(finanza|mercati|borsa|markets|crypto)\b/, 'finanza'],
  [/\/(sport|calcio|football|tennis|motogp|formula-?1)\b/, 'sport'], [/\/(cronaca|cronache|italia|local)\b/, 'cronache'],
  [/\/(spettacol\w*|cinema|tv|televisione|musica|people|gossip)\b/, 'spettacolo'], [/\/(cultura|libri|arte|culture)\b/, 'cultura'],
  [/\/(tecnologia|tech|technology|digitale|innovazione)\b/, 'tecnologia'], [/\/(salute|benessere|health|medicina)\b/, 'salute'],
  [/\/(scienz\w*|science|spazio)\b/, 'scienze'], [/\/(ambiente|green|clima|climate|environment)\b/, 'ambiente'],
  [/\/(motori|auto|moto|automotive)\b/, 'motori'], [/\/(europa|ue|eu)\b/, 'unione-europea'], [/\/(lavoro|imprese|aziende)\b/, 'lavoro-e-imprese'],
];
const KW = {
  'politica-italia': ['meloni', 'schlein', 'conte', 'salvini', 'tajani', 'governo', 'parlamento', 'senato', 'camera dei deputati', 'fratelli d\'italia', 'pd ', 'lega', 'forza italia', 'm5s', 'mattarella', 'quirinale', 'palazzo chigi', 'ministro', 'manovra', 'legge di bilancio', 'premierato', 'sondaggio', 'elezioni regionali', 'opposizione'],
  'mondo': ['trump', 'putin', 'zelensky', 'ucraina', 'russia', 'israele', 'gaza', 'hamas', 'iran', 'cina', 'xi jinping', 'casa bianca', 'washington', 'mosca', 'pechino', 'onu', 'nato', 'medio oriente', 'libano', 'siria', 'india', 'africa', 'stati uniti', 'usa'],
  'geopolitica': ['geopolitic', 'negoziati', 'diplomazia', 'sanzioni', 'difesa europea', 'riarmo', 'nato', 'strategia', 'dazi'],
  'unione-europea': ['ue ', 'unione europea', 'commissione europea', 'von der leyen', 'bruxelles', 'parlamento europeo', 'consiglio europeo', 'eurozona', 'bce', 'european commission', 'eu '],
  'economia': ['pil', 'inflazione', 'istat', 'economia', 'pensioni', 'tasse', 'fisco', 'irpef', 'bollette', 'prezzi', 'export', 'industria', 'confindustria'],
  'finanza': ['borsa', 'piazza affari', 'ftse', 'spread', 'btp', 'banca', 'banche', 'bitcoin', 'crypto', 'azioni', 'titoli', 'wall street', 'nasdaq', 'mediobanca', 'unicredit', 'intesa sanpaolo', 'generali', 'opa', 'tassi'],
  'lavoro-e-imprese': ['lavoro', 'lavoratori', 'sindacat', 'sciopero', 'cgil', 'cisl', 'uil', 'occupazione', 'disoccupazione', 'startup', 'impresa', 'imprese', 'assunzioni', 'licenziamenti', 'smart working', 'round'],
  'cronache': ['carabinieri', 'polizia', 'arrestato', 'arresto', 'omicidio', 'incidente', 'morto', 'morta', 'uccis', 'indagin', 'procura', 'tribunale', 'processo', 'femminicidio', 'maltempo', 'alluvione', 'incendio', 'terremoto', 'rapina'],
  'sport': ['serie a', 'champions', 'calcio', 'juventus', 'inter', 'milan', 'napoli', 'roma', 'lazio', 'sinner', 'tennis', 'formula 1', 'f1', 'motogp', 'ferrari', 'nazionale', 'olimpiadi', 'gol', 'allenatore', 'mondiali', 'atp', 'giro d\'italia', 'nba', 'basket', 'volley'],
  'spettacolo': ['sanremo', 'film', 'serie tv', 'netflix', 'attore', 'attrice', 'cantante', 'concerto', 'album', 'festival', 'x factor', 'grande fratello', 'cinema', 'oscar', 'box office'],
  'cultura': ['libro', 'romanzo', 'mostra', 'museo', 'scrittore', 'scrittrice', 'arte', 'teatro', 'poesia', 'filosofia', 'premio strega', 'biennale'],
  'tecnologia': ['intelligenza artificiale', ' ia ', ' ai ', 'openai', 'chatgpt', 'apple', 'google', 'microsoft', 'meta', 'nvidia', 'smartphone', 'iphone', 'software', 'cyber', 'hacker', 'app ', 'chip', 'tesla', 'amazon', 'x ', 'musk', 'anthropic', 'data center'],
  'scienze': ['scienziati', 'ricerca', 'studio pubblicato', 'nasa', 'esa', 'spazio', 'astronom', 'fisica', 'biolog', 'dna', 'fossil', 'pianeta', 'telescopio'],
  'salute': ['salute', 'sanità', 'ospedale', 'medici', 'malattia', 'tumore', 'cancro', 'vaccino', 'virus', 'influenza', 'farmaco', 'aifa', 'oms', 'pazienti', 'diabete', 'alzheimer'],
  'ambiente': ['clima', 'climatic', 'cop30', 'cop ', 'emissioni', 'rinnovabili', 'ambiente', 'inquinamento', 'siccità', 'biodiversità', 'ghiacciai', 'energia solare', 'eolico', 'riscaldamento globale'],
  'motori': ['auto ', 'automobil', 'stellantis', 'suv', 'auto elettriche', 'motore', 'moto ', 'ducati', 'byd', 'volkswagen', 'immatricolazioni'],
  'societa-e-diritti': ['diritti', 'migranti', 'immigrazione', 'scuola', 'università', 'studenti', 'disabilità', 'lgbt', 'gender', 'violenza sulle donne', 'carcere', 'povertà', 'welfare', 'giovani', 'famiglie'],
};
function classify(text, link, rssCats) {
  const t = ' ' + (text + ' ' + rssCats.join(' ')).toLowerCase() + ' ';
  let best = null, bestScore = 0;
  for (const [cat, words] of Object.entries(KW)) {
    let s = 0; for (const w of words) if (t.includes(w)) s += w.length > 6 ? 2 : 1;
    if (s > bestScore) { best = cat; bestScore = s; }
  }
  const p = (link || '').toLowerCase().replace(/^https?:\/\/[^/]+/, '');
  for (const [re, cat] of URL_HINTS) if (re.test(p)) return cat;
  return bestScore >= 2 ? best : (best || 'cronache');
}
function secondaryCats(text) {
  const t = ' ' + text.toLowerCase() + ' ', out = [];
  for (const [cat, words] of Object.entries(KW)) {
    let s = 0; for (const w of words) if (t.includes(w)) s += w.length > 6 ? 2 : 1;
    if (s >= 3) out.push(cat);
  }
  return out;
}

// ---------- parsing XML ----------
const ENT = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', egrave: 'è', eacute: 'é', agrave: 'à', ograve: 'ò', ugrave: 'ù', igrave: 'ì', rsquo: '’', lsquo: '‘', ldquo: '“', rdquo: '”', hellip: '…', ndash: '–', mdash: '—', laquo: '«', raquo: '»', euro: '€', Egrave: 'È', ccedil: 'ç', ntilde: 'ñ', oacute: 'ó', aacute: 'á', iacute: 'í', uacute: 'ú', uuml: 'ü', ouml: 'ö', auml: 'ä', szlig: 'ß' };
const decodeEnt = s => s.replace(/&(#x?[0-9a-f]+|\w+);/gi, (m, e) => {
  if (e[0] === '#') { const n = e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10); return isNaN(n) ? m : String.fromCodePoint(n); }
  return ENT[e] ?? m;
});
const unCdata = s => s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1');
const stripTags = s => decodeEnt(decodeEnt(unCdata(s)).replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, '').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
function tag(block, names) {
  for (const n of names) {
    const re = new RegExp(`<${n}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${n}>`, 'i');
    const m = block.match(re); if (m && m[1].trim()) return m[1];
  }
  return '';
}
function tags(block, n) { const out = []; const re = new RegExp(`<${n}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${n}>`, 'gi'); let m; while ((m = re.exec(block))) out.push(stripTags(m[1])); return out; }
function attr(block, tagName, attrName, filter) {
  const re = new RegExp(`<${tagName}\\b[^>]*>`, 'gi'); let m;
  while ((m = re.exec(block))) {
    if (filter && !filter(m[0])) continue;
    const a = m[0].match(new RegExp(`${attrName}\\s*=\\s*["']([^"']+)["']`, 'i')); if (a) return decodeEnt(a[1]);
  }
  return '';
}
function findImage(block) {
  let img = attr(block, 'media:content', 'url', t => !/medium=["'](video|audio)/i.test(t) && !/type=["'](video|audio)/i.test(t))
    || attr(block, 'media:thumbnail', 'url')
    || attr(block, 'enclosure', 'url', t => /image|\.jpe?g|\.png|\.webp/i.test(t))
    || attr(block, 'img', 'src', null);
  if (!img) { const raw = decodeEnt(unCdata(block)); const m = raw.match(/<img[^>]+src=["']([^"']+)["']/i); if (m) img = m[1]; }
  if (img && /^\/\//.test(img)) img = 'https:' + img;
  if (img && (!/^https?:/.test(img) || /pixel|feedburner|1x1|gravatar|blank\.gif/i.test(img))) img = '';
  return img;
}
function parseFeed(xml) {
  const items = [];
  const re = /<(item|entry)\b[\s\S]*?<\/\1>/gi; let m;
  while ((m = re.exec(xml))) {
    const b = m[0];
    const title = stripTags(tag(b, ['title']));
    let link = stripTags(tag(b, ['link'])) || attr(b, 'link', 'href', t => !/rel=["'](?!alternate)/i.test(t)) || stripTags(tag(b, ['guid']));
    const descRaw = tag(b, ['description', 'summary', 'content:encoded', 'content', 'media:description']);
    const desc = stripTags(descRaw);
    const date = stripTags(tag(b, ['pubDate', 'published', 'dc:date', 'updated', 'a10:updated']));
    const t = Date.parse(date) || Date.parse(date.replace(/ ([+-]\d{4})$/, '$1')) || 0;
    const author = stripTags(tag(b, ['dc:creator', 'author', 'name']));
    const audio = attr(b, 'enclosure', 'url', t => /audio|\.mp3|\.m4a/i.test(t));
    const duration = stripTags(tag(b, ['itunes:duration']));
    const itImage = attr(b, 'itunes:image', 'href');
    if (title && link) items.push({ title, link: link.trim(), desc, time: t, author, cats: tags(b, 'category'), image: findImage(b), audio, duration, itImage });
  }
  return items;
}
function feedMeta(xml) {
  const head = xml.split(/<(item|entry)\b/i)[0];
  return { title: stripTags(tag(head, ['title'])), image: attr(head, 'itunes:image', 'href') || stripTags(tag(tag(head, ['image']), ['url'])) };
}

// ---------- fetch ----------
async function getText(url, ms = 12000) {
  const r = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/rss+xml, application/xml, text/xml, */*' }, redirect: 'follow', signal: AbortSignal.timeout(ms) });
  if (!r.ok) throw new Error('HTTP ' + r.status);
  const buf = Buffer.from(await r.arrayBuffer());
  const head = buf.subarray(0, 300).toString('latin1');
  const ct = r.headers.get('content-type') || '';
  const enc = (head.match(/encoding=["']([\w-]+)["']/i) || ct.match(/charset=([\w-]+)/i) || [, 'utf-8'])[1].toLowerCase();
  try { return new TextDecoder(enc).decode(buf); } catch { return buf.toString('utf8'); }
}
async function pool(list, n, fn) {
  const out = new Array(list.length); let i = 0;
  await Promise.all(Array.from({ length: n }, async () => { while (i < list.length) { const k = i++; try { out[k] = await fn(list[k], k); } catch (e) { out[k] = { error: e }; } } }));
  return out;
}

// ---------- clustering ----------
const STOP = new Set(('il lo la i gli le un uno una di del dello della dei degli delle a al allo alla ai agli alle da dal dallo dalla dai dagli dalle in nel nello nella nei negli nelle con su sul sullo sulla sui sugli sulle per tra fra e ed o ma se che chi cui non più piu come dove quando anche ancora già gia dopo prima sono è era sarà stato stata essere ha hanno ho fa fare oggi ieri domani nuovo nuova nuovi nuove tutto tutti tutte questo questa questi queste quello quella suo sua suoi sue loro nostro mio cosa così ecco ora mai sempre molto poco ultime ultim notizie news video foto diretta live the a an of to in on for and or with by at from as is are was were be been has have had it its this that these those not no new says say said after over into about up out more than will would can could his her their our your who what why how when where which de la el los las y en por para con del una un que se lo es le les des et du au aux sur dans pour par pas plus der die das und mit von zu im den ein eine ist auf für').split(/\s+/));
const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[’']/g, ' ');
function tokens(s) {
  const out = new Set();
  for (let w of norm(s).split(/[^a-z0-9]+/)) {
    if (w.length < 3 || STOP.has(w) || /^\d+$/.test(w) && w.length < 4) continue;
    out.add(w.length > 6 ? w.slice(0, 6) : w);
  }
  return out;
}
// Raggruppa articoli sulla stessa notizia: confronto a coppie (niente "catene"),
// parole pesate per rarità (IDF) così termini generici come "ricavi" contano poco.
function cluster(items) {
  items.sort((a, b) => b.time - a.time);
  const df = new Map();
  for (const it of items) {
    it.tTok = tokens(it.title);
    it.tok = tokens(it.title + ' ' + it.desc.slice(0, 220));
    for (const w of it.tok) df.set(w, (df.get(w) || 0) + 1);
  }
  const N = items.length;
  const idf = w => Math.log(N / (1 + (df.get(w) || 0)));
  const weight = set => { let s = 0; for (const w of set) s += idf(w); return s; };
  for (const it of items) it.w = weight(it.tok);
  const sim = (a, b) => {
    let sharedTitle = 0, rareTitle = 0; for (const w of a.tTok) if (b.tTok.has(w)) { sharedTitle++; if (idf(w) > 3.2) rareTitle++; }
    if (sharedTitle < 2 || rareTitle < 1) return 0;
    let sw = 0; for (const w of a.tok) if (b.tok.has(w)) sw += idf(w);
    return sw / Math.min(a.w, b.w);
  };
  const clusters = []; const index = new Map();
  for (const it of items) {
    const cand = new Set();
    for (const w of it.tTok) if (idf(w) > 2) for (const ci of index.get(w) || []) cand.add(ci);
    let best = -1, bestS = 0;
    for (const ci of cand) {
      const c = clusters[ci];
      if (Math.abs(c.time - it.time) > 36 * 3600e3) continue;
      // confronto con i membri "ancora" (i primi entrati): la notizia non può derivare
      let s = 0; for (const m of c.items.slice(0, 6)) s = Math.max(s, sim(it, m));
      if (s > bestS) { bestS = s; best = ci; }
    }
    if (best >= 0 && bestS >= 0.36) {
      const c = clusters[best]; c.items.push(it);
      if (c.items.length <= 6) for (const w of it.tTok) (index.get(w) || index.set(w, []).get(w)).push(best);
    } else {
      const ci = clusters.length;
      clusters.push({ items: [it], time: it.time });
      for (const w of it.tTok) (index.get(w) || index.set(w, []).get(w)).push(ci);
    }
  }
  // 2° passaggio: unisce gruppi (anche in lingue diverse) che condividono nomi propri rari
  const sig = c => {
    const cnt = new Map();
    for (const it of c.items) for (const w of it.tTok) if (idf(w) > 3.4) cnt.set(w, (cnt.get(w) || 0) + 1);
    return new Set([...cnt].filter(([, n]) => n >= Math.max(2, Math.ceil(c.items.length * 0.34))).map(([w]) => w));
  };
  const multi = clusters.filter(c => c.items.length >= 2);
  for (const c of multi) c.sig = sig(c);
  for (let i = 0; i < multi.length; i++) {
    const a = multi[i]; if (a.dead || a.sig.size < 2) continue;
    for (let j = i + 1; j < multi.length; j++) {
      const b = multi[j]; if (b.dead || b.sig.size < 2 || Math.abs(a.time - b.time) > 24 * 3600e3) continue;
      let shared = 0; for (const w of a.sig) if (b.sig.has(w)) shared++;
      if (shared >= 2 && shared / Math.min(a.sig.size, b.sig.size) >= 0.5) { a.items.push(...b.items); b.dead = true; a.sig = sig(a); }
    }
  }
  return clusters.filter(c => !c.dead);
}
// titolo più rappresentativo: quello che condivide più parole con gli altri articoli
function centralItem(pool, all) {
  if (pool.length === 1) return pool[0];
  let best = pool[0], bs = -1;
  for (const a of pool) {
    let s = 0; for (const b of all) if (a !== b) for (const w of a.tTok) if (b.tok.has(w)) s++;
    s = s / Math.sqrt(a.tTok.size + 1) + (a.title.length > 40 && a.title.length < 140 ? 0.5 : 0)
      - (/altre notizie|newsletter|in breve|live|diretta|\| video|podcast|rassegna/i.test(a.title) ? 3 : 0)
      + (cleanDesc(a.desc, a.title).length > 80 ? 0.6 : 0);
    if (s > bs) { bs = s; best = a; }
  }
  return best;
}
function trim(s, n) { if (s.length <= n) return s; const cut = s.slice(0, n); const p = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('! '), cut.lastIndexOf('? ')); return (p > n * 0.5 ? cut.slice(0, p + 1) : cut.replace(/\s+\S*$/, '') + '…'); }
function cleanDesc(d, title) {
  d = d.replace(/(L'articolo|The post) .{0,200}(proviene da|è apparso|appeared first on).*$/i, '').replace(/\s*(Continua a leggere|Leggi tutto|Read more|\[…\]|\[\.\.\.\])\s*.*$/i, '').trim();
  if (norm(d).startsWith(norm(title).slice(0, 40))) d = d.slice(title.length).replace(/^[\s:.\-–—]+/, '');
  return d;
}
function buildStories(items) {
  const clusters = cluster(items);
  return clusters.map(c => {
    const its = c.items.sort((a, b) => a.time - b.time);
    const srcs = [...new Map(its.map(i => [i.src, { src: i.src, domain: i.domain }])).values()];
    const it = its.filter(i => !i.srcLang);           // articoli originali italiani
    const pool = it.length ? it : its;
    // titolo: quello italiano più "informativo"
    const head = centralItem(pool, its);
    const headDesc = cleanDesc(head.desc, head.title);
    const descs = pool.map(i => cleanDesc(i.desc, i.title)).filter(d => d.length > 60).sort((a, b) => b.length - a.length);
    const summary = trim(headDesc.length > 80 ? headDesc : (descs[0] || headDesc || ''), 520);
    const votes = {}; for (const i of its) { votes[i.cat] = (votes[i.cat] || 0) + (i.feedCat ? 2 : 1); }
    const cat = Object.entries(votes).sort((a, b) => b[1] - a[1])[0][0];
    const cats = [...new Set([cat, ...Object.keys(votes).filter(k => votes[k] >= 2), ...secondaryCats(its.map(i => i.title).join(' ')), ...(its.some(i => i.local) ? ['locali'] : [])])];
    const images = [...new Set([...its.filter(i => i.lang === 'it'), ...its].map(i => i.image).filter(Boolean))].slice(0, 4);
    const image = images[0] || '';
    const latest = Math.max(...its.map(i => i.time));
    const id = crypto.createHash('sha1').update(its[0].link).digest('hex').slice(0, 24);
    return {
      id, title: head.title, summary, image, images, cat, cats, time: latest, first: its[0].time,
      sources: srcs, n: srcs.length,
      articles: its.slice().sort((a, b) => b.time - a.time).map(i => ({ src: i.src, domain: i.domain, title: i.title, desc: trim(cleanDesc(i.desc, i.title), 300), link: i.link, time: i.time, tr: i.srcLang || null, author: i.author })),
    };
  });
}

// ---------- traduzione in italiano ----------
// Ogni articolo che non è in italiano viene tradotto (titolo + sommario). Gli articoli che non
// si riescono a tradurre vengono esclusi: nell'app compaiono solo testi in italiano.
const TR_FILE = path.join(ROOT, 'data/translations.json');
let trCache = new Map();
try { trCache = new Map(Object.entries(JSON.parse(fs.readFileSync(TR_FILE, 'utf8')))); } catch { }
const LANG_STOP = {
  it: 'il lo la gli le di del della dello dei delle degli che per con non una uno sono nel nella nelle negli alla alle agli dai dalla dagli anche più dopo tra come questo questa essere ha hanno era ma se sul sulla sugli ancora già è perché ed ci si sarà stato stata quando loro dove oggi ieri contro',
  en: 'the and of to is for with on that as are by was from after this have has will its it at an be over into about who says new their than been would what how why',
  es: 'el los las la del de y en que por con una un para según tras sus su fue entre como más pero este esta han ser desde sobre hasta también al lo se ya tras hoy ayer',
  fr: 'le les des du est une pour dans sur qui avec après pas plus ses aux été cette sont au elle ils et en un de',
  de: 'der die das und ist mit von den für nach auf ein eine nicht sich dem des im zu bei wird sind auch',
};
// contano solo le parole tipiche di una sola lingua (es. "la", "del", "con" valgono per it ed es → ignorate)
const LANG_SETS = (() => {
  const lists = Object.fromEntries(Object.entries(LANG_STOP).map(([k, v]) => [k, v.split(' ')]));
  const freq = new Map(); for (const l of Object.values(lists)) for (const w of new Set(l)) freq.set(w, (freq.get(w) || 0) + 1);
  return Object.fromEntries(Object.entries(lists).map(([k, l]) => [k, new Set(l.filter(w => freq.get(w) === 1))]));
})();
function detectLang(text, fallback) {
  const words = text.toLowerCase().split(/[^a-zàèéìíòóùúäöüßñç']+/).filter(Boolean);
  const score = {}; for (const k in LANG_SETS) score[k] = 0;
  for (const w of words) for (const k in LANG_SETS) if (LANG_SETS[k].has(w)) score[k]++;
  // parole italiane tipiche con apostrofo/accento
  if (/\b(l'|un'|dell'|all'|nell'|dall'|sull')/i.test(text)) score.it += 2;
  const foreign = Object.entries(score).filter(([k]) => k !== 'it').sort((a, b) => b[1] - a[1])[0];
  // la lingua del feed fa da indizio: serve una prova netta per cambiarla
  if (fallback === 'it') return foreign[1] >= score.it + 2 ? foreign[0] : 'it';
  if (score.it >= foreign[1] + 2 && score.it >= 3) return 'it';
  return score[fallback] >= foreign[1] ? fallback : foreign[0];
}
const trKey = s => crypto.createHash('sha1').update(s).digest('base64').slice(0, 16);
async function gtx(text, sl = 'auto') {
  const r = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sl}&tl=it&dt=t`, {
    method: 'POST', headers: { 'User-Agent': UA, 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
    body: new URLSearchParams({ q: text }), signal: AbortSignal.timeout(15000),
  });
  if (r.status === 429) throw Object.assign(new Error('limite traduzioni'), { rate: true });
  if (!r.ok) throw new Error('traduzione HTTP ' + r.status);
  const j = await r.json();
  return (j[0] || []).map(x => x[0] || '').join('');
}
async function translateAll(groups) {
  // groups: Map lingua → testi (senza a capo). Ogni blocco contiene una sola lingua di partenza.
  const out = new Map(); const todo = []; const batches = [];
  for (const [sl, texts] of groups) {
    let cur = [], len = 0;
    for (const t of new Set(texts)) {
      const c = trCache.get(trKey(t)); if (c) { out.set(t, c); continue; }
      todo.push(t);
      if (cur.length && (len + t.length > 3500 || cur.length >= 30)) { batches.push([sl, cur]); cur = []; len = 0; }
      cur.push(t); len += t.length + 1;
    }
    if (cur.length) batches.push([sl, cur]);
  }
  let stop = false;
  await pool(batches, 2, async ([sl, b]) => {
    if (stop) return;
    await new Promise(r => setTimeout(r, 150));
    try {
      const res = (await gtx(b.join('\n'), sl)).split('\n');
      if (res.length === b.length) { b.forEach((t, i) => { const v = res[i].trim(); if (v) { out.set(t, v); trCache.set(trKey(t), v); } }); return; }
      for (const t of b) { if (stop) return; const v = (await gtx(t, sl)).trim(); if (v) { out.set(t, v); trCache.set(trKey(t), v); } }
    } catch (e) { if (e.rate) stop = true; }
  });
  return { out, pending: todo.filter(t => !out.has(t)).length, fresh: todo.length };
}
async function italianize(items) {
  const need = [];
  for (const i of items) {
    i.desc = cleanDesc(i.desc, i.title);
    const lang = detectLang(i.title + ' ' + i.desc.slice(0, 300), i.lang);
    if (lang !== 'it') { i.srcLang = lang; i.dShort = trim(i.desc.replace(/\s+/g, ' '), 320); need.push(i); }
  }
  const groups = new Map();
  for (const i of need) { const g = groups.get(i.srcLang) || groups.set(i.srcLang, []).get(i.srcLang); g.push(i.title.replace(/\s+/g, ' ')); if (i.dShort) g.push(i.dShort); }
  const { out, pending, fresh } = await translateAll(groups);
  const keep = [];
  const needSet = new Set(need);
  for (const i of items) {
    if (!needSet.has(i)) { i.lang = 'it'; keep.push(i); continue; }
    const t = out.get(i.title.replace(/\s+/g, ' ')); if (!t) continue; // non tradotto → escluso
    i.orig = i.title; i.title = t; i.desc = i.dShort ? (out.get(i.dShort) || '') : ''; i.lang = 'it';
    if (!i.feedCat) i.cat = classify(i.title + ' ' + i.desc, i.link, i.cats);
    keep.push(i);
  }
  // salva la cache tenendo solo le traduzioni ancora utili
  const used = new Set(need.flatMap(i => [trKey(i.orig || i.title), i.dShort ? trKey(i.dShort) : null]).filter(Boolean));
  for (const k of trCache.keys()) if (!used.has(k)) trCache.delete(k);
  try { fs.writeFileSync(TR_FILE, JSON.stringify(Object.fromEntries(trCache))); } catch { }
  console.log(`  traduzioni: ${need.length} articoli stranieri · ${fresh} testi nuovi · ${pending} in attesa`);
  state.trPending = pending;
  return keep;
}

// ---------- og:image per le notizie senza immagine ----------
const ogCache = new Map();
async function ogImage(url) {
  if (ogCache.has(url)) return ogCache.get(url);
  let img = '';
  try {
    const r = await fetch(url, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(6000) });
    const html = (await r.text()).slice(0, 200000);
    const m = html.match(/<meta[^>]+(?:property|name)=["'](?:og:image|twitter:image)(?::src)?["'][^>]*content=["']([^"']+)["']/i) || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]*(?:property|name)=["']og:image["']/i);
    if (m) img = decodeEnt(m[1]);
  } catch { }
  ogCache.set(url, img); return img;
}

// ---------- podcast ----------
async function resolvePodcast(p) {
  if (p.feed) return p;
  const j = JSON.parse(await getText(`https://itunes.apple.com/search?media=podcast&country=it&limit=5&term=${encodeURIComponent(p.search)}`));
  const hit = (j.results || []).find(r => !p.author || norm(r.artistName || '').includes(norm(p.author))) || (j.results || [])[0];
  if (!hit) throw new Error('non trovato');
  return { ...p, feed: hit.feedUrl, artwork: hit.artworkUrl600 || hit.artworkUrl100, show: p.name || hit.collectionName };
}
const podcastFeedCache = new Map();
async function loadPodcasts() {
  const res = await pool(PODCASTS, 6, async p => {
    const rp = podcastFeedCache.get(p.search) || await resolvePodcast(p); podcastFeedCache.set(p.search, rp);
    const xml = await getText(rp.feed, 15000); const meta = feedMeta(xml);
    return parseFeed(xml).filter(i => i.audio).slice(0, 6).map(i => ({
      id: crypto.createHash('sha1').update(i.audio).digest('hex').slice(0, 16),
      show: rp.name || meta.title, publisher: rp.publisher || '', cat: rp.cat || 'mondo',
      title: i.title, desc: trim(i.desc, 400), audio: i.audio, link: i.link, time: i.time,
      duration: i.duration, image: i.itImage || rp.artwork || meta.image,
    }));
  });
  const eps = []; res.forEach((r, k) => { if (Array.isArray(r)) eps.push(...r); else console.warn('  podcast KO', PODCASTS[k].search, r && r.error && r.error.message); });
  return eps.sort((a, b) => b.time - a.time);
}

// ---------- stato ----------
const state = { updated: 0, stories: [], podcasts: [], feedStatus: [], gz: null, loading: null };
async function refresh() {
  const t0 = Date.now();
  const now = Date.now();
  const FEEDS_ALL = await loadFeeds();
  const results = await pool(FEEDS_ALL, 16, async f => {
    const xml = await getText(f.url);
    const items = parseFeed(xml).slice(0, f.def === false ? 8 : 200);
    return items.map(i => {
      const time = i.time && i.time <= now + 3600e3 ? i.time : now - 6 * 3600e3;
      return { ...i, time, src: f.src, domain: f.domain, lang: f.lang || 'it', local: !!f.local, feedCat: f.cat, cat: f.cat || classify(i.title + ' ' + i.desc, i.link, i.cats) };
    }).filter(i => now - i.time < WINDOW_MS);
  });
  const seen = new Set(); const items = [];
  state.feedStatus = FEEDS_ALL.map((f, k) => {
    const r = results[k]; if (!Array.isArray(r)) return { ...f, ok: false, error: String(r && r.error && r.error.message || r) };
    let added = 0;
    for (const i of r) { const key = i.link.replace(/[?#].*$/, ''); if (seen.has(key)) continue; seen.add(key); items.push(i); added++; }
    return { ...f, ok: r.length > 0, count: added };
  });
  const itItems = await italianize(items);
  let stories = buildStories(itItems);
  stories.sort((a, b) => b.time - a.time);
  // completa immagini mancanti (solo notizie più rilevanti)
  const need = stories.filter(s => !s.image).sort((a, b) => b.n - a.n || b.time - a.time).slice(0, 220);
  await pool(need, 12, async s => { for (const a of s.articles.slice(0, 2)) { const im = await ogImage(a.link); if (im) { s.image = im; s.images = [im]; break; } } });
  let podcasts = state.podcasts;
  try { podcasts = await loadPodcasts(); } catch (e) { console.warn('podcast', e.message); }
  Object.assign(state, { updated: Date.now(), stories, podcasts });
  const payload = JSON.stringify({ updated: state.updated, categories: CATEGORIES, stories, podcasts });
  state.json = payload;
  state.gz = zlib.gzipSync(payload);
  const ok = state.feedStatus.filter(f => f.ok).length;
  console.log(`[${new Date().toLocaleTimeString('it-IT')}] ${items.length} articoli · ${stories.length} notizie · ${podcasts.length} episodi · feed ok ${ok}/${state.feedStatus.length} · ${((Date.now() - t0) / 1000).toFixed(1)}s`);
}
let retryTimer = null;
function ensure() {
  if (!state.loading) state.loading = refresh().catch(e => console.error(e)).finally(() => {
    state.loading = null;
    // traduzioni rimaste indietro (limite del servizio): riprova tra 2 minuti
    if (state.trPending > 0 && !retryTimer) retryTimer = setTimeout(() => { retryTimer = null; ensure(); }, 120e3);
  });
  return state.loading;
}

function sourcesList() {
  const active = new Map();
  for (const f of state.feedStatus) {
    const a = active.get(f.src) || { feeds: 0, ok: 0, count: 0, domain: f.domain, def: false, local: false, user: false, site: f.site || '' };
    a.feeds++; if (f.ok) a.ok++; a.count += f.count || 0; if (f.def !== false) a.def = true; if (f.local) a.local = true; if (f.user) a.user = true; if (f.area) a.area = f.area;
    active.set(f.src, a);
  }
  const names = [...new Set([...TESTATE, ...active.keys()])].sort((a, b) => a.localeCompare(b, 'it'));
  return names.map(name => ({ name, ...(active.get(name) || { feeds: 0, ok: 0, count: 0, def: false, local: false, user: false }) }));
}

// ---------- HTTP ----------
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.json': 'application/json', '.png': 'image/png', '.ico': 'image/x-icon', '.webmanifest': 'application/manifest+json; charset=utf-8' };
function sendJSON(res, obj) { const gz = zlib.gzipSync(JSON.stringify(obj)); res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Content-Encoding': 'gzip', 'Cache-Control': 'no-store' }); res.end(gz); }
const server = http.createServer(async (req, res) => {
  const u = new URL(req.url, 'http://x');
  try {
    if (u.pathname === '/api/feed' || u.pathname === '/api/feed.json') {
      if (!state.gz) await ensure();
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Content-Encoding': 'gzip', 'Cache-Control': 'no-store' });
      return res.end(state.gz);
    }
    if (u.pathname === '/api/sources' || u.pathname === '/api/sources.json') return sendJSON(res, sourcesList());
    if (u.pathname === '/api/info') {
      const lan = Object.values(require('os').networkInterfaces()).flat().filter(n => n && n.family === 'IPv4' && !n.internal).map(n => `http://${n.address}:${PORT}`);
      return sendJSON(res, { updated: state.updated, refreshing: !!state.loading, lan });
    }
    if (u.pathname === '/api/status') return sendJSON(res, { updated: state.updated, feeds: state.feedStatus.map(({ src, url, ok, count, error }) => ({ src, url, ok, count, error })) });
    if (u.pathname === '/api/refresh' && req.method === 'POST') { await ensure(); return sendJSON(res, { updated: state.updated }); }
    let p = path.normalize(decodeURIComponent(u.pathname)).replace(/^(\.\.[/\\])+/, '');
    if (p === '/' || !path.extname(p)) p = '/index.html';
    const file = path.join(ROOT, 'public', p);
    if (!file.startsWith(path.join(ROOT, 'public'))) { res.writeHead(403); return res.end(); }
    fs.readFile(file, (err, data) => {
      if (err) { res.writeHead(404); return res.end('Not found'); }
      res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-cache' }); res.end(data);
    });
  } catch (e) { console.error(e); res.writeHead(500); res.end(String(e.message)); }
});

if (process.argv.includes('--newkey')) {
  // genera una chiave e il link segreto: node server.js --newkey
  console.log(crypto.randomBytes(32).toString('base64url'));
} else if (process.argv.includes('--build')) {
  // Genera il sito statico (per GitHub Pages): node server.js --build _site
  const out = path.resolve(process.argv[process.argv.indexOf('--build') + 1] || '_site');
  (async () => {
    await refresh();
    for (let k = 0; k < 1 && state.trPending > 0; k++) { console.log("  attendo 30s e riprovo le traduzioni…"); await new Promise(r => setTimeout(r, 30e3)); await refresh(); }
    if (!state.stories.length) { console.error('Nessuna notizia scaricata: build annullata'); process.exit(1); }
    fs.rmSync(out, { recursive: true, force: true });
    fs.cpSync(path.join(ROOT, 'public'), out, { recursive: true });
    fs.mkdirSync(path.join(out, 'api'), { recursive: true });
    // Accesso riservato: con RASSEGNA_KEY (32 byte in base64url) i dati vengono compressi e cifrati
    // (AES-256-GCM). Solo chi ha il link con la chiave (dopo #k=) può leggerli.
    const keyB64 = process.env.RASSEGNA_KEY;
    const enc = txt => {
      if (!keyB64) return txt;
      const key = Buffer.from(keyB64, 'base64url'); if (key.length !== 32) throw new Error('RASSEGNA_KEY deve essere di 32 byte');
      const iv = crypto.randomBytes(12); const c = crypto.createCipheriv('aes-256-gcm', key, iv);
      const data = Buffer.concat([c.update(zlib.gzipSync(txt)), c.final(), c.getAuthTag()]);
      return JSON.stringify({ enc: 1, iv: iv.toString('base64'), data: data.toString('base64') });
    };
    fs.writeFileSync(path.join(out, 'api/feed.json'), enc(state.json));
    fs.writeFileSync(path.join(out, 'api/sources.json'), enc(JSON.stringify(sourcesList())));
    fs.writeFileSync(path.join(out, '.nojekyll'), '');
    // file minuscolo che l'app controlla per sapere quando è pronto un aggiornamento
    fs.writeFileSync(path.join(out, 'api/version.json'), JSON.stringify({ updated: state.updated }));
    fs.writeFileSync(path.join(out, 'robots.txt'), 'User-agent: *\nDisallow: /\n');
    console.log(keyB64 ? '  dati cifrati: accesso solo con link segreto' : '  ATTENZIONE: RASSEGNA_KEY non impostata, dati in chiaro');
    console.log(`Sito generato in ${out}: ${state.stories.length} notizie`);
  })().catch(e => { console.error(e); process.exit(1); });
} else if (process.argv.includes('--probe')) {
  (async () => {
    const r = await pool(FEEDS, 16, async f => { const x = await getText(f.url); return parseFeed(x); });
    FEEDS.forEach((f, k) => { const v = r[k]; const ok = Array.isArray(v); const imgs = ok ? v.filter(i => i.image).length : 0; console.log(`${ok && v.length ? 'OK ' : 'KO '} ${String(ok ? v.length : 0).padStart(3)} img:${String(imgs).padStart(3)}  ${f.src.padEnd(26)} ${f.url}  ${ok ? '' : (v && v.error && v.error.message)}`); });
    if (process.argv.includes('--podcasts')) { const eps = await loadPodcasts(); console.log('episodi podcast:', eps.length, [...new Set(eps.map(e => e.show))].join(', ')); }
  })();
} else {
  server.listen(PORT, '0.0.0.0', () => {
    const lan = Object.values(require('os').networkInterfaces()).flat().filter(n => n && n.family === 'IPv4' && !n.internal).map(n => n.address);
    console.log(`Rassegna → http://localhost:${PORT}`);
    for (const ip of lan) console.log(`  da iPhone/iPad (stessa rete Wi-Fi): http://${ip}:${PORT}`);
  });
  ensure(); setInterval(ensure, REFRESH_MS);
}
