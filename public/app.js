/* Rassegna — client */
'use strict';
(() => {
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const PAGE = 10;

// ---------- icone ----------
const I = {
  clock: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  refresh: '<svg viewBox="0 0 24 24"><path d="M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7"/></svg>',
  head: '<svg viewBox="0 0 24 24"><path d="M4 15v-3a8 8 0 0 1 16 0v3"/><rect x="3" y="14" width="4.5" height="7" rx="2"/><rect x="16.5" y="14" width="4.5" height="7" rx="2"/></svg>',
  mark: '<svg viewBox="0 0 24 24"><path d="M6 3.5h12v17l-6-4.2-6 4.2z"/></svg>',
  send: '<svg viewBox="0 0 24 24"><path d="M21 3L10 14M21 3l-7 18-4-7-7-4z"/></svg>',
  spark: '<svg viewBox="0 0 24 24"><path d="M12 3c.6 4.6 3.4 7.4 8 8-4.6.6-7.4 3.4-8 8-.6-4.6-3.4-7.4-8-8 4.6-.6 7.4-3.4 8-8z"/></svg>',
  back: '<svg viewBox="0 0 24 24"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>',
  chev: '<svg viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>',
  right: '<svg viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg>',
  ext: '<svg viewBox="0 0 24 24"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg>',
  play: '<svg viewBox="0 0 24 24"><path d="M7 4.5v15l12.5-7.5z"/></svg>',
  pause: '<svg viewBox="0 0 24 24"><rect x="6" y="4.5" width="4" height="15" rx="1"/><rect x="14" y="4.5" width="4" height="15" rx="1"/></svg>',
  stop: '<svg viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" rx="1.5"/></svg>',
  star: '<svg viewBox="0 0 24 24"><path d="M12 3.5l2.6 5.5 6 .8-4.4 4.1 1.1 5.9L12 17l-5.3 2.8 1.1-5.9-4.4-4.1 6-.8z"/></svg>',
  minus: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5"/><path d="M8 12h8"/></svg>',
  plus: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5"/><path d="M8 12h8M12 8v8"/></svg>',
  search: '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/></svg>',
  chip: '<svg viewBox="0 0 24 24" class="ci smart"><rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor" stroke="none"/><path d="M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3"/></svg>',
  folder: '<svg viewBox="0 0 24 24" class="ci folder"><path d="M3 6.5A1.5 1.5 0 0 1 4.5 5h4.6l2 2h8.4A1.5 1.5 0 0 1 21 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5z" fill="currentColor" stroke="none"/></svg>',
  custom: '<svg viewBox="0 0 24 24" class="ci custom"><path d="M3 6.5A1.5 1.5 0 0 1 4.5 5h4.6l2 2h8.4A1.5 1.5 0 0 1 21 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5z" fill="currentColor" stroke="none"/></svg>',
  up: '<svg viewBox="0 0 24 24"><path d="M6 15l6-6 6 6"/></svg>',
  eye: '<svg viewBox="0 0 24 24"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>',
  trash: '<svg viewBox="0 0 24 24"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/></svg>',
  news: '<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 8h10M7 12h10M7 16h6"/></svg>',
  pin: '<svg viewBox="0 0 24 24"><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>',
  pen: '<svg viewBox="0 0 24 24"><path d="M4 20h4L19 9l-4-4L4 16z"/></svg>',
  heart: '<svg viewBox="0 0 24 24"><path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7a4.3 4.3 0 0 1 7.5 2.8C19.5 15.4 12 20 12 20z"/></svg>',
  cols: '<svg viewBox="0 0 24 24"><rect x="3" y="4" width="5" height="16" rx="1"/><rect x="9.5" y="4" width="5" height="16" rx="1"/><rect x="16" y="4" width="5" height="16" rx="1"/></svg>',
  gear: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z"/></svg>',
};

// ---------- preferenze (localStorage) ----------
const KEY = 'rassegna:v1';
const DEF = { order: null, hidden: [], custom: [], fav: [], muted: [], places: [], authors: [], interests: [], saved: [], histData: {}, history: [], fs: 1, theme: 'auto', lastCol: 'per-te' };
let P;
try { P = { ...DEF, ...JSON.parse(localStorage.getItem(KEY) || '{}') }; } catch { P = { ...DEF }; }
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(P)); } catch { } };
const applyPrefs = () => {
  document.documentElement.style.setProperty('--fs', P.fs);
  if (P.theme === 'auto') document.documentElement.removeAttribute('data-theme'); else document.documentElement.setAttribute('data-theme', P.theme);
};
applyPrefs();

// ---------- dati ----------
const D = { updated: 0, categories: [], stories: [], podcasts: [], byId: new Map(), sources: null };
let loaded = false;
// ---------- accesso riservato (link segreto con la chiave nell'indirizzo, ?k=...) ----------
// La chiave resta nell'indirizzo: così anche il collegamento sulla schermata Home di iPhone/iPad
// (che non condivide la memoria di Safari) si apre già con l'accesso.
const KKEY = 'rassegna:key';
const KEY_RE = /^[A-Za-z0-9_-]{43}$/;
const getKey = () => {
  const q = new URLSearchParams(location.search).get('k'); if (q && KEY_RE.test(q)) return q;
  try { return localStorage.getItem(KKEY) || ''; } catch { return ''; }
};
const privateLink = () => location.origin + location.pathname + '?k=' + getKey();
(() => {
  const m = location.hash.match(/^#k=([A-Za-z0-9_-]{43})/); // vecchi link con #k=
  const k = m ? m[1] : getKey();
  if (!k) return;
  try { localStorage.setItem(KKEY, k); } catch { }
  const q = new URLSearchParams(location.search);
  if (q.get('k') !== k || m) { q.set('k', k); history.replaceState(null, '', location.pathname + '?' + q.toString() + (m ? '#/' : location.hash)); }
})();
class Locked extends Error { }
const b64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));
async function getJSON(url) {
  const j = await (await fetch(url, { cache: 'no-store' })).json();
  if (!j || !j.enc) return j;
  const k = getKey(); if (!k) throw new Locked();
  try {
    const raw = b64(k.replace(/-/g, '+').replace(/_/g, '/') + '=');
    const key = await crypto.subtle.importKey('raw', raw, 'AES-GCM', false, ['decrypt']);
    const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: b64(j.iv) }, key, b64(j.data));
    const txt = await new Response(new Blob([plain]).stream().pipeThrough(new DecompressionStream('gzip'))).text();
    return JSON.parse(txt);
  } catch { throw new Locked(); }
}
function showLocked() {
  $('#topbar').classList.add('hidden'); $('#tabbar').style.display = 'none';
  $('#view').innerHTML = `<div class="empty" style="padding-top:18vh"><div class="ask-hero"><div class="orb" style="background:#111">${I.mark}</div></div>
    <h3>Accesso riservato</h3><p>Questa rassegna è privata. Apri il link completo che hai ricevuto per accedere.</p></div>`;
}

async function load(force) {
  if (force) await fetch('api/refresh', { method: 'POST' }).catch(() => { });
  const j = await getJSON('api/feed.json?t=' + Date.now());
  const changed = j.updated !== D.updated;
  Object.assign(D, j);
  D.byId = new Map(D.stories.map(s => [s.id, s]));
  for (const s of D.stories) s._tok = tokens(s.title + ' ' + s.summary + ' ' + s.articles.slice(0, 6).map(a => a.title).join(' '));
  loaded = true;
  return changed;
}

// ---------- utilità testo ----------
const STOP = new Set('il lo la i gli le un uno una di del della dei degli delle a al alla ai agli alle da dal dalla dai in nel nella nei con su sul sulla per tra fra e ed o ma se che chi cui non più come dove quando anche dopo prima sono è era stato essere ha hanno fa oggi ieri cosa quali quale qual chi perché come sta stanno successo succede ultime notizie news the of to and in on for is are what who'.split(' '));
const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[’']/g, ' ');
function tokens(s) { const o = new Set(); for (let w of norm(s).split(/[^a-z0-9]+/)) { if (w.length < 3 || STOP.has(w)) continue; o.add(w.length > 6 ? w.slice(0, 6) : w); } return o; }
const has = (s, term) => { const t = norm(term).trim(); if (!t) return false; const hay = ' ' + norm(s.title + ' ' + s.summary + ' ' + s.articles.map(a => a.title).join(' ')) + ' '; return new RegExp(`[^a-z0-9]${t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`).test(hay); };
const fav = d => `https://www.google.com/s2/favicons?domain=${encodeURIComponent(d)}&sz=64`;
const HUES = { ambiente: [150, 175], cronache: [215, 190], cultura: [280, 320], economia: [205, 165], finanza: [160, 200], geopolitica: [225, 260], 'lavoro-e-imprese': [30, 200], mondo: [220, 180], motori: [0, 30], 'politica-italia': [350, 220], salute: [170, 140], scienze: [250, 200], 'societa-e-diritti': [330, 30], spettacolo: [300, 350], sport: [130, 90], tecnologia: [260, 190], 'unione-europea': [230, 50] };
const grad = c => { const [a, b] = HUES[c] || [220, 180]; return `background:linear-gradient(160deg,hsl(${a} 62% 52%),hsl(${b} 55% 60%))`; };
function dayLabel(t) {
  const d = new Date(t), n = new Date(); const day = x => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diff = Math.round((day(n) - day(d)) / 864e5);
  if (diff <= 0) return 'oggi'; if (diff === 1) return 'ieri';
  return d.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' });
}
function ago(t) { const m = Math.max(1, Math.round((Date.now() - t) / 6e4)); if (m < 60) return m + ' min fa'; const h = Math.round(m / 60); if (h < 24) return h + 'h fa'; return Math.round(h / 24) + 'g fa'; }
const catName = id => (D.categories.find(c => c.id === id) || {}).name || id;
function toast(msg, ms = 2200, onClick) {
  const t = $('#toast'); t.textContent = msg; t.hidden = false; t.onclick = onClick || null; t.style.cursor = onClick ? 'pointer' : '';
  clearTimeout(toast._t); toast._t = setTimeout(() => t.hidden = true, ms);
}

// ---------- colonne ----------
function columns() {
  const base = [...D.categories, ...P.custom.map(c => ({ ...c, kind: 'custom' }))];
  const order = P.order || base.map(c => c.id);
  const ids = [...order.filter(id => base.some(c => c.id === id)), ...base.map(c => c.id).filter(id => !order.includes(id))];
  return ids.map(id => base.find(c => c.id === id));
}
const visibleCols = () => columns().filter(c => !P.hidden.includes(c.id));

function visibleStories() {
  if (!P.muted.length) return D.stories;
  const m = new Set(P.muted);
  return D.stories.filter(s => s.sources.some(x => !m.has(x.src)));
}
function storiesFor(col) {
  const now = Date.now(), all = visibleStories();
  const hours = s => (now - s.time) / 36e5;
  if (col === 'top-news') {
    let list = all.filter(s => s.n >= 3 && hours(s) < 36);
    if (list.length < 20) list = all.filter(s => s.n >= 2 && hours(s) < 48);
    return list.sort((a, b) => b.n / (1 + hours(b) / 10) - a.n / (1 + hours(a) / 10));
  }
  if (col === 'per-te') {
    const favs = new Set(P.fav), interests = [...P.interests, ...P.places, ...P.authors.map(a => a)];
    const personal = favs.size || interests.length;
    const score = s => {
      let v = Math.min(s.n, 8) * 1.2 - hours(s) * 0.22;
      if (personal) {
        v += s.sources.filter(x => favs.has(x.src)).length * 2.5;
        for (const t of P.interests) if (has(s, t)) v += 5;
        for (const t of P.places) if (has(s, t)) v += 4;
        for (const a of P.authors) if (s.articles.some(x => x.author && norm(x.author).includes(norm(a)))) v += 4;
      }
      return v;
    };
    return all.filter(s => hours(s) < 48).map(s => [score(s), s]).sort((a, b) => b[0] - a[0]).map(x => x[1]);
  }
  const custom = P.custom.find(c => c.id === col);
  if (custom) {
    return all.filter(s => (!custom.keywords.length || custom.keywords.some(k => has(s, k))) && (!custom.sources.length || s.sources.some(x => custom.sources.includes(x.src))) && (!custom.cats?.length || custom.cats.some(c => s.cats.includes(c))))
      .sort((a, b) => b.time - a.time);
  }
  return all.filter(s => s.cats.includes(col)).sort((a, b) => (b.time + Math.min(b.n, 6) * 15 * 6e4) - (a.time + Math.min(a.n, 6) * 15 * 6e4));
}
function storiesForTopic(kind, val) {
  const all = visibleStories();
  if (kind === 'testata') return all.filter(s => s.sources.some(x => x.src === val)).sort((a, b) => b.time - a.time);
  if (kind === 'autore') return all.filter(s => s.articles.some(a => a.author && norm(a.author).includes(norm(val)))).sort((a, b) => b.time - a.time);
  return all.filter(s => has(s, val)).sort((a, b) => b.time - a.time);
}

// ---------- rendering card ----------
function logos(s, max = 8) {
  const show = s.sources.slice(0, max);
  return `<div class="logos">${show.map(x => `<span class="logo" title="${esc(x.src)}"><img loading="lazy" alt="" src="${fav(x.domain)}" onerror="this.replaceWith(document.createTextNode('${esc(x.src[0])}'))"></span>`).join('')}${s.n > max ? `<span class="logo more">+${s.n - max}</span>` : ''}</div>`;
}
// immagine con catena di alternative: se una fonte blocca l'hotlink si passa alla successiva, poi al gradiente
window.__imgErr = el => {
  const alt = (el.dataset.alt || '').split('\n').filter(Boolean);
  if (alt.length) { el.dataset.alt = alt.slice(1).join('\n'); el.src = alt[0]; return; }
  const d = document.createElement('div'); d.className = 'grad'; d.setAttribute('style', el.dataset.grad); el.replaceWith(d);
};
function media(s) {
  const imgs = s.images?.length ? s.images : (s.image ? [s.image] : []);
  if (!imgs.length) return `<div class="grad" style="${grad(s.cat)}"></div>`;
  return `<img loading="lazy" referrerpolicy="no-referrer" alt="" src="${esc(imgs[0])}" data-alt="${esc(imgs.slice(1).join('\n'))}" data-grad="${grad(s.cat)}" onerror="__imgErr(this)">`;
}
function card(s) {
  const saved = P.saved.includes(s.id);
  return `<article class="card" data-open="${s.id}">
    <div class="card-media">${media(s)}${logos(s)}</div>
    <div class="card-body">
      <div class="time">${I.clock}<span>${dayLabel(s.time)}</span>${s.n > 1 ? `<span class="nsrc">· ${s.n} fonti</span>` : ''}</div>
      <h2 class="title"><span>${esc(s.title)}</span></h2>
      <p class="summary">${esc(s.summary || s.articles[0]?.desc || '')} <span class="more">Leggi di più</span></p>
    </div>
    <div class="actions">
      <button class="act" data-listen="${s.id}" aria-label="Ascolta">${I.head}</button>
      <button class="act ${saved ? 'on' : ''}" data-save="${s.id}" aria-label="Salva">${I.mark}</button>
      <button class="act" data-share="${s.id}" aria-label="Invia">${I.send}</button>
      <span class="grow"></span>
      <button class="ask" data-ask="${s.id}">${I.spark}Chiedi</button>
    </div>
  </article>`;
}
const skel = n => Array.from({ length: n }, () => '<div class="skel"><div class="a"></div><div class="b"></div><div class="c"></div></div>').join('');

function podCard(e) {
  return `<article class="pcard" data-pod="${e.id}">
    <div class="top"><img loading="lazy" referrerpolicy="no-referrer" src="${esc(e.image)}" alt=""><div><div class="show">${esc(e.show)}</div><div class="pub">${esc(e.publisher)} · ${dayLabel(e.time)}</div></div></div>
    <div class="body"><h3>${esc(e.title)}</h3><p>${esc(e.desc)}</p></div>
    <div class="row"><button class="playbig" data-pod="${e.id}">${I.play} Ascolta</button><span class="dur">${esc(fmtDur(e.duration))}</span></div>
  </article>`;
}
function podRow(e) {
  return `<div class="pod" data-pod="${e.id}"><img loading="lazy" referrerpolicy="no-referrer" src="${esc(e.image)}" alt=""><div class="pb"><div class="pt">${esc(e.title)}</div><div class="ps">${esc(e.show)} · ${dayLabel(e.time)}</div><div class="pd">${esc(e.desc)}</div></div><span class="play">${I.play}</span></div>`;
}
function fmtDur(d) {
  if (!d) return ''; let s = /^\d+$/.test(d) ? +d : d.split(':').reduce((a, b) => a * 60 + +b, 0);
  const m = Math.round(s / 60); return m >= 60 ? `${Math.floor(m / 60)} h ${m % 60} min` : `${m} min`;
}

// ---------- router ----------
const mem = {}; // scroll e paginazione per rotta
let current = { key: '', list: [], shown: 0, render: null };
let observer;
function route() {
  const h = location.hash.slice(1) || '/';
  const [p, q] = h.split('?'); const parts = p.split('/').filter(Boolean).map(decodeURIComponent);
  const params = new URLSearchParams(q || '');
  stopSpeak();
  closeDrawer();
  $('#view').classList.remove('wide');
  $('#topbar').classList.toggle('hidden', !(parts.length === 0 || parts[0] === 'c'));
  setTab(parts[0] === 'cronologia' ? 'cronologia' : parts[0] === 'profilo' || parts[0] === 't' ? 'profilo' : parts[0] === 'chiedi' ? 'chiedi' : 'adesso');
  if (!loaded) { $('#view').innerHTML = `<div class="feed">${skel(3)}</div>`; return; }
  if (parts.length === 0) return viewColumn(P.lastCol);
  if (parts[0] === 'c') return viewColumn(parts[1]);
  if (parts[0] === 'n') return viewStory(parts[1]);
  if (parts[0] === 'cronologia') return viewHistory();
  if (parts[0] === 'chiedi') return viewAsk(params.get('s'), params.get('q'));
  if (parts[0] === 't') return viewTopic(parts[1], parts[2]);
  if (parts[0] === 'profilo') return viewProfile(parts[1]);
  viewColumn('per-te');
}
function setTab(t) { $$('#tabbar a').forEach(a => a.classList.toggle('on', a.dataset.tab === t)); }
function saveScroll() { if (current.key) mem[current.key] = { y: window.scrollY, shown: current.shown }; }
window.addEventListener('hashchange', () => { route(); });
window.addEventListener('scroll', () => { if (current.key) mem[current.key] = { y: window.scrollY, shown: current.shown }; }, { passive: true });

function paged(key, list, renderItem, headHTML = '', emptyHTML = '') {
  const v = $('#view');
  v.classList.add('wide');
  if (key.startsWith('c:')) headHTML = `<div class="upd"><span>Aggiornato alle ${new Date(D.updated).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}</span><button data-refresh>Aggiorna ↻</button></div>` + headHTML;
  current = { key, list, shown: 0, renderItem };
  if (!list.length) { v.innerHTML = headHTML + (emptyHTML || '<div class="empty"><h3>Nessuna notizia</h3><p>Non ci sono ancora notizie per questa colonna.</p></div>'); window.scrollTo(0, 0); return; }
  v.innerHTML = `${headHTML}<div class="feed" id="feed"></div><div class="sentinel" id="sentinel"></div><div class="end" id="end" hidden>Sei aggiornato · ${list.length} elementi</div>`;
  const m = mem[key];
  more(m ? Math.max(PAGE, m.shown) : PAGE);
  window.scrollTo(0, m ? m.y : 0);
  observer?.disconnect();
  observer = new IntersectionObserver(es => { if (es[0].isIntersecting) more(PAGE); }, { rootMargin: '900px' });
  observer.observe($('#sentinel'));
}
function more(n) {
  const feed = $('#feed'); if (!feed) return;
  const next = current.list.slice(current.shown, current.shown + n);
  if (!next.length) { $('#end').hidden = false; observer?.disconnect(); return; }
  feed.insertAdjacentHTML('beforeend', next.map(current.renderItem).join(''));
  current.shown += next.length;
  if (current.shown >= current.list.length) { $('#end').hidden = false; observer?.disconnect(); }
}

// ---------- vista: colonna ----------
function renderChips(active) {
  const nav = $('#chips');
  nav.innerHTML = visibleCols().map(c => `<a class="chip ${c.id === active ? 'on' : ''}" href="#/c/${c.id}" data-col="${c.id}">${esc(c.name)}</a>`).join('');
  const on = nav.querySelector('.on'); if (on) nav.scrollLeft = on.offsetLeft - nav.clientWidth / 2 + on.clientWidth / 2;
}
function viewColumn(col) {
  if (!columns().some(c => c.id === col)) col = 'per-te';
  P.lastCol = col; save();
  renderChips(col);
  if (col === 'podcast') return paged('c:podcast', D.podcasts, podCard);
  const c = columns().find(x => x.id === col);
  const head = c.kind === 'custom' ? `<div class="col-head"><div class="kicker">Colonna personalizzata · ${esc([...c.keywords, ...c.sources].join(', ') || 'tutto')}</div><h2>${esc(c.name)}</h2></div>` : '';
  paged('c:' + col, storiesFor(col), card, head);
}
function viewTopic(kind, val) {
  const label = { luogo: 'Luogo', interesse: 'Interesse', autore: 'Autore', testata: 'Testata' }[kind] || 'Argomento';
  const listKey = { luogo: 'places', interesse: 'interests', autore: 'authors', testata: 'fav' }[kind];
  const following = listKey && P[listKey].some(x => norm(x) === norm(val));
  const head = `<div class="page-h"><button class="icon-btn" data-back>${I.back}</button><h1>${label}</h1><span></span></div>
    <div class="col-head" style="display:flex;align-items:end;justify-content:space-between;gap:12px"><div><div class="kicker">${label}</div><h2>${esc(val)}</h2></div>
    ${listKey ? `<button class="pill ${following ? 'on' : ''}" data-follow="${esc(listKey)}" data-val="${esc(val)}">${following ? (kind === 'testata' ? 'Preferita' : 'Seguito') : (kind === 'testata' ? 'Aggiungi alle preferite' : 'Segui')}</button>` : ''}</div>`;
  paged(`t:${kind}:${val}`, storiesForTopic(kind, val), card, head);
}

// ---------- vista: notizia ----------
const ENT_RE = /(?<![.!?:]\s|^)\b([A-ZÀ-Ý][a-zà-ÿ'’]+(?:\s+(?:di|del|della|de|dei|von|van|da|e)?\s*[A-ZÀ-Ý][a-zà-ÿ'’]+)+)/g;
function highlight(text) { return esc(text).replace(ENT_RE, m => `<b data-ent="${m}">${m}</b>`); }
function relatedPods(s) {
  const st = s._tok || tokens(s.title + ' ' + s.summary);
  const scored = D.podcasts.map(e => { const t = tokens(e.title + ' ' + e.desc); let k = 0; for (const w of t) if (st.has(w)) k++; return [k + (s.cats.includes(e.cat) ? 0.5 : 0), e]; });
  return scored.filter(x => x[0] >= 2.5).sort((a, b) => b[0] - a[0] || b[1].time - a[1].time).map(x => x[1]);
}
function viewStory(id) {
  const s = getStory(id);
  if (s && !s._tok) s._tok = tokens(s.title + ' ' + s.summary + ' ' + s.articles.slice(0, 6).map(a => a.title).join(' '));
  if (!s) { $('#view').innerHTML = `<div class="page-h"><button class="icon-btn" data-back>${I.back}</button><h1></h1><span></span></div><div class="empty"><h3>Notizia non più disponibile</h3><p>Le notizie restano in archivio per 72 ore.</p></div>`; return; }
  current = { key: 'n:' + id };
  // cronologia
  P.history = [{ id, t: Date.now() }, ...P.history.filter(h => h.id !== id)].slice(0, 300);
  histStore(s); save();
  const muted = new Set(P.muted);
  const arts = s.articles.filter(a => !muted.has(a.src));
  const bySrc = new Map(); for (const a of arts) if (!bySrc.has(a.src)) bySrc.set(a.src, a);
  const pods = relatedPods(s);
  const saved = P.saved.includes(id);
  $('#view').innerHTML = `<div class="detail">
    <button class="back" data-back aria-label="Indietro">${I.back}</button>
    <div class="hero">${media(s)}</div>
    <div class="d-body">
      <div class="time">${I.clock}<span>${dayLabel(s.time)}</span>&nbsp;${I.refresh}<span>${ago(s.time)}</span></div>
      <h1 class="d-title"><span>${esc(s.title)}</span></h1>
      <div class="d-actions">
        <button class="pill-btn" data-listen="${id}">${I.head}<span>Ascolta</span></button>
        <button class="pill-btn sq ${saved ? 'on' : ''}" data-save="${id}" aria-label="Salva">${I.mark}</button>
        <button class="pill-btn sq" data-share="${id}" aria-label="Invia">${I.send}</button>
        <button class="pill-btn sq" data-fs aria-label="Dimensione testo"><b style="font-family:var(--f-body)">Aa</b></button>
        <span class="d-id">ID ${id.slice(0, 6).toUpperCase()}</span>
      </div>
      <p class="d-sum">${highlight(s.summary || arts[0]?.desc || '')}</p>
      ${[...bySrc.values()].slice(0, 4).map((a, k) => `<div class="acc ${k === 0 && bySrc.size === 1 ? 'open' : ''}"><button data-acc>Cosa scrive ${esc(titleCase(a.src))} ${I.chev}</button><div class="acc-in"><p style="margin:0 0 6px;color:var(--ink);font-weight:600">${esc(a.title)}</p><p style="margin:0 0 8px">${esc(a.desc || '')}</p><a href="${esc(a.link)}" target="_blank" rel="noopener">Leggi l'articolo integrale su ${esc(titleCase(a.src))} →</a></div></div>`).join('')}
      <span class="badge">${s.n} ${s.n === 1 ? 'fonte' : 'fonti'} · ${esc(catName(s.cat))}</span>
      <div class="askbox"><span>Vuoi sapere di più?</span><button class="btn-ai" data-ask="${id}">${I.spark}<span>Chiedi</span></button></div>
      <div class="sec-h"><span>Approfondimenti</span><small>${arts.length} articoli</small></div>
      <div id="arts">${arts.slice(0, 3).map(artRow).join('')}</div>
      ${arts.length > 3 ? `<button class="more-btn" data-more-arts="${id}">Mostra altri ${arts.length - 3} approfondimenti</button>` : '<div style="height:20px"></div>'}
      <div class="sec-h"><span>Podcast</span><small>${pods.length ? pods.length + ' episodi' : 'nessun episodio collegato'}</small></div>
      <div id="pods">${pods.slice(0, 3).map(podRow).join('')}</div>
      ${pods.length > 3 ? `<button class="more-btn" data-more-pods="${id}">Mostra altri ${pods.length - 3} podcast</button>` : ''}
      ${s.cats.length ? `<div class="sec-h" style="margin-top:26px"><span>Colonne</span></div><div class="tags" style="margin:0 8px 30px">${s.cats.map(c => `<a class="tag" href="#/c/${c}">${esc(catName(c))}</a>`).join('')}</div>` : ''}
    </div></div>`;
  window.scrollTo(0, 0);
}
const titleCase = s => s.toLowerCase().replace(/(^|[\s'’.-])(\p{L})/gu, (m, a, b) => a + b.toUpperCase()).replace(/\b(Di|Del|Della|De|Dello|Delle|E|Il|La|Lo|Le|Of|The|And)\b(?!$)/g, (m, w, i) => i === 0 ? m : m.toLowerCase());
const TR_LANG = { en: "dall'inglese", es: 'dallo spagnolo', fr: 'dal francese', de: 'dal tedesco' };
function artRow(a) {
  return `<a class="art" href="${esc(a.link)}" target="_blank" rel="noopener"><span class="logo"><img loading="lazy" alt="" src="${fav(a.domain)}"></span><div style="min-width:0"><div class="t">${esc(a.title)}</div><div class="m">${esc(a.src)} · ${dayLabel(a.time)} ${new Date(a.time).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}${a.author ? ' · ' + esc(a.author.slice(0, 40)) : ''}${a.tr ? ` · <span class="tr">tradotto ${TR_LANG[a.tr] || ''}</span>` : ''}</div></div><span class="ext">${I.ext}</span></a>`;
}
function histStore(s) { // memorizza una copia leggera per cronologia/salvati
  P.histData = P.histData || {};
  P.histData[s.id] = { id: s.id, title: s.title, summary: s.summary, image: s.image, images: s.images, cat: s.cat, cats: s.cats, time: s.time, sources: s.sources, n: s.n, articles: s.articles.slice(0, 12) };
  const keep = new Set([...P.history.map(h => h.id), ...P.saved]);
  for (const k of Object.keys(P.histData)) if (!keep.has(k)) delete P.histData[k];
}
const getStory = id => D.byId.get(id) || (P.histData || {})[id];

// ---------- vista: cronologia ----------
function viewHistory() {
  current = { key: 'cronologia' };
  const items = P.history.map(h => ({ h, s: getStory(h.id) })).filter(x => x.s);
  if (!items.length) { $('#view').innerHTML = `<div class="page-h"><span></span><h1>Cronologia</h1><span></span></div><div class="empty"><h3>Nessuna lettura</h3><p>Le notizie che apri compariranno qui.</p></div>`; return; }
  $('#view').classList.add('wide');
  let html = `<div class="page-h"><span></span><h1>Cronologia</h1><button class="icon-btn" data-clear-history aria-label="Svuota">${I.trash}</button></div><div class="feed">`;
  let lastDay = '';
  for (const { h, s } of items) {
    const d = dayLabel(h.t); if (d !== lastDay) { html += `<div class="hday">Letti ${d}</div>`; lastDay = d; }
    html += card(s);
  }
  $('#view').innerHTML = html + '</div>'; window.scrollTo(0, 0);
}

// ---------- vista: profilo ----------
function viewProfile(sub) {
  current = { key: 'profilo:' + (sub || '') };
  const v = $('#view');
  const head = (t, back = '#/profilo') => `<div class="page-h"><a class="icon-btn" href="${back}">${I.back}</a><h1>${t}</h1><span></span></div>`;
  if (!sub) {
    const n = P.history.length;
    v.innerHTML = `<div class="prof-top"><div class="avatar">R</div><div><div class="n">Il tuo profilo</div><div class="s">${n} notizie lette · ${P.saved.length} salvate</div></div></div>
    <ul class="plist">
      <li><a href="#/profilo/raccolte">${I.cols}Personalizza raccolte<span class="chev">${I.right}</span></a></li>
      <li><a href="#/profilo/testate">${I.news}Personalizza testate<span class="chev">${I.right}</span></a></li>
      <li><a href="#/profilo/luoghi">${I.pin}Personalizza luoghi<span class="chev">${I.right}</span></a></li>
      <li><a href="#/profilo/autori">${I.pen}Personalizza autori<span class="chev">${I.right}</span></a></li>
      <li><a href="#/profilo/interessi">${I.heart}Personalizza interessi<span class="chev">${I.right}</span></a></li>
      <li><a href="#/profilo/salvati">${I.mark}Salvati<span class="chev">${I.right}</span></a></li>
      <li><a href="#/profilo/impostazioni">${I.gear}Impostazioni<span class="chev">${I.right}</span></a></li>
      ${isStandalone() ? '' : `<li><button data-homeguide>${I.plus}Aggiungi alla schermata Home<span class="chev">${I.right}</span></button></li>`}
    </ul>
    <p class="hint" style="margin-top:22px">Ultimo aggiornamento: ${new Date(D.updated).toLocaleString('it-IT')} · ${D.stories.length} notizie da ${new Set(D.stories.flatMap(s => s.sources.map(x => x.src))).size} testate</p>`;
    return;
  }
  if (sub === 'testate') return viewTestate(head('Le tue testate'));
  if (sub === 'salvati') {
    const list = P.saved.map(getStory).filter(Boolean);
    return paged('salvati', list, card, head('Salvati'), `<div class="empty"><h3>Nessun articolo salvato</h3><p>Tocca l'icona del segnalibro su una notizia per ritrovarla qui.</p></div>`);
  }
  if (sub === 'raccolte') return viewRaccolte(head('Le tue raccolte'));
  if (sub === 'impostazioni') return viewSettings(head('Impostazioni'));
  if (['luoghi', 'autori', 'interessi'].includes(sub)) return viewEntities(sub, head({ luoghi: 'I tuoi luoghi', autori: 'I tuoi autori', interessi: 'I tuoi interessi' }[sub]));
}

const PLACES = ['Italia', 'Roma', 'Milano', 'Napoli', 'Torino', 'Palermo', 'Genova', 'Bologna', 'Firenze', 'Bari', 'Catania', 'Venezia', 'Verona', 'Trieste', 'Padova', 'Brescia', 'Bergamo', 'Cagliari', 'Trento', 'Bolzano', 'Perugia', 'Ancona', 'Pescara', 'Lecce', 'Salerno', 'Lombardia', 'Piemonte', 'Veneto', 'Liguria', 'Emilia-Romagna', 'Toscana', 'Lazio', 'Campania', 'Puglia', 'Calabria', 'Sicilia', 'Sardegna', 'Abruzzo', 'Marche', 'Umbria', 'Trentino', 'Friuli', 'Basilicata', 'Molise', "Valle d'Aosta", 'Europa', 'Bruxelles', 'Francia', 'Parigi', 'Germania', 'Berlino', 'Spagna', 'Madrid', 'Regno Unito', 'Londra', 'Stati Uniti', 'Washington', 'New York', 'Russia', 'Mosca', 'Ucraina', 'Kiev', 'Israele', 'Gaza', 'Cisgiordania', 'Libano', 'Iran', 'Siria', 'Turchia', 'Cina', 'Pechino', 'Taiwan', 'Giappone', 'India', 'Pakistan', 'Corea', 'Africa', 'Egitto', 'Libia', 'Tunisia', 'Sudan', 'Brasile', 'Argentina', 'Messico', 'Venezuela', 'Canada', 'Australia', 'Polonia', 'Ungheria', 'Grecia', 'Svizzera', 'Bahrein', 'Arabia Saudita', 'Qatar', 'Groenlandia', 'Danimarca', 'Vaticano'];
function entitySuggestions(kind) {
  const counts = new Map();
  if (kind === 'luoghi') { for (const p of PLACES) { const n = D.stories.filter(s => has(s, p)).length; if (n) counts.set(p, n); } }
  else if (kind === 'autori') { for (const s of D.stories) for (const a of s.articles) { const au = (a.author || '').trim(); if (au && au.length < 40 && !/redazione|staff|agenzia|ansa|adnkronos|agi|editor/i.test(au) && /\s/.test(au)) counts.set(au, (counts.get(au) || 0) + 1); } }
  else { for (const s of D.stories) { const seen = new Set(); for (const m of (s.title + '. ' + s.summary).matchAll(ENT_RE)) { const e = m[1].trim(); if (e.length > 4 && !seen.has(e) && !PLACES.includes(e)) { seen.add(e); counts.set(e, (counts.get(e) || 0) + 1); } } } }
  return [...counts].filter(([, n]) => n >= (kind === 'luoghi' ? 1 : 2)).sort((a, b) => b[1] - a[1]).slice(0, 60);
}
function viewEntities(kind, head) {
  const key = { luoghi: 'places', autori: 'authors', interessi: 'interests' }[kind];
  const tkind = { luoghi: 'luogo', autori: 'autore', interessi: 'interesse' }[kind];
  const sugg = entitySuggestions(kind);
  const draw = (filter = '') => {
    const f = norm(filter);
    const mine = P[key];
    const list = sugg.filter(([e]) => !mine.includes(e) && (!f || norm(e).includes(f)));
    $('#entBody').innerHTML = `
      ${mine.length ? `<div class="group-h">Seguiti <small>${mine.length}</small></div><div class="tags">${mine.map(e => `<span class="tag on"><a href="#/t/${tkind}/${encodeURIComponent(e)}">${esc(e)}</a><span class="x" data-unfollow="${key}" data-val="${esc(e)}">✕</span></span>`).join('')}</div>` : `<p class="hint">Non segui ancora nessun ${kind === 'luoghi' ? 'luogo' : kind === 'autori' ? 'autore' : 'interesse'}. Quello che segui viene messo in evidenza nella colonna Per Te.</p>`}
      ${filter && !list.some(([e]) => norm(e) === f) ? `<div class="group-h">Aggiungi</div><div class="tags"><span class="tag" data-follow="${key}" data-val="${esc(filter)}">+ ${esc(filter)}</span></div>` : ''}
      <div class="group-h">Suggeriti dalle notizie di oggi <small>${list.length}</small></div>
      <div>${list.map(([e, n]) => `<div class="trow"><span class="tname" data-goto="#/t/${tkind}/${encodeURIComponent(e)}">${esc(e)}</span><span class="ln"></span><small style="color:var(--muted);font:11px var(--f-mono)">${n}</small><button data-follow="${key}" data-val="${esc(e)}" aria-label="Segui">${I.plus}</button></div>`).join('')}</div>`;
  };
  $('#view').innerHTML = `${head}<label class="search">${I.search}<input id="entQ" placeholder="Cerca" autocomplete="off"></label><div id="entBody"></div>`;
  draw(); $('#entQ').addEventListener('input', e => draw(e.target.value.trim()));
  viewEntities.redraw = () => draw($('#entQ')?.value.trim() || '');
}
async function viewTestate(head) {
  const v = $('#view');
  v.innerHTML = head + '<div class="feed">' + skel(1) + '</div>';
  if (!D.sources) D.sources = await getJSON('api/sources.json');
  let onlyLive = false, q = '';
  const draw = () => {
    const f = norm(q);
    const pass = x => (!f || norm(x.name).includes(f)) && (!onlyLive || x.ok);
    const row = x => {
      const isFav = P.fav.includes(x.name), isMuted = P.muted.includes(x.name);
      return `<div class="trow"><span class="tname ${x.ok ? '' : 'dim'}" data-goto="#/t/testata/${encodeURIComponent(x.name)}" title="${x.ok ? x.count + ' articoli nelle ultime 72 ore' : 'Nessun feed pubblico collegato'}">${esc(x.name)}</span>${x.ok ? '<span class="live"></span>' : ''}<span class="ln"></span>
        ${isMuted ? `<button data-unmute="${esc(x.name)}" aria-label="Segui di nuovo">${I.plus}</button>` : `<button class="${isFav ? 'on' : ''}" data-fav="${esc(x.name)}" aria-label="Preferita">${I.star}</button><button data-mute="${esc(x.name)}" aria-label="Non seguire">${I.minus}</button>`}</div>`;
    };
    const favs = D.sources.filter(x => P.fav.includes(x.name) && pass(x));
    const followed = D.sources.filter(x => !P.muted.includes(x.name) && pass(x));
    const muted = D.sources.filter(x => P.muted.includes(x.name) && pass(x));
    const live = D.sources.filter(x => x.ok).length;
    $('#tBody').innerHTML = `
      <div class="seg"><button class="pill ${onlyLive ? '' : 'on'}" data-seg="all">Tutte (${D.sources.length})</button><button class="pill ${onlyLive ? 'on' : ''}" data-seg="live">Con feed attivo (${live})</button></div>
      <div class="group-h">Preferite <small>${P.fav.length}</small></div>
      ${favs.length ? favs.map(row).join('') : '<p class="hint">Non hai ancora nessuna testata preferita! Tocca ☆ per dare priorità a una testata nella colonna Per Te.</p>'}
      <div class="group-h">Seguite <small>${followed.length}</small></div>${followed.map(row).join('')}
      ${muted.length ? `<div class="group-h">Non seguite <small>${muted.length}</small></div>${muted.map(row).join('')}` : ''}`;
  };
  v.innerHTML = `${head}<label class="search">${I.search}<input id="tQ" placeholder="Cerca una testata" autocomplete="off"></label><div id="tBody"></div>`;
  draw();
  $('#tQ').addEventListener('input', e => { q = e.target.value.trim(); draw(); });
  $('#tBody').addEventListener('click', e => { const b = e.target.closest('[data-seg]'); if (b) { onlyLive = b.dataset.seg === 'live'; draw(); } });
  viewTestate.redraw = draw;
}
function colRows(editing) {
  const cols = columns();
  return cols.map((c, i) => `<li class="${P.hidden.includes(c.id) ? 'off' : ''}" data-colgo="${c.id}">
    ${c.kind === 'smart' ? I.chip : c.kind === 'custom' ? I.custom : I.folder}<span class="grow">${esc(c.name)}</span>
    ${editing ? `${i > 0 ? `<button class="mini" data-colup="${c.id}" aria-label="Su">${I.up}</button>` : ''}
      <button class="mini" data-colhide="${c.id}" aria-label="Mostra/nascondi">${I.eye}</button>
      ${c.kind === 'custom' ? `<button class="mini" data-coldel="${c.id}" aria-label="Elimina">${I.trash}</button>` : ''}` : ''}
  </li>`).join('');
}
function viewRaccolte(head) {
  $('#view').innerHTML = `${head}<p class="hint">Riordina, nascondi o crea le colonne che compaiono in alto nella schermata Adesso.</p>
    <div style="display:flex;gap:10px;margin-bottom:12px"><button class="pill" data-newcol>+ Nuova colonna</button></div>
    <ul id="colList" class="inpage" style="list-style:none;margin:0;padding:0">${colRows(true)}</ul>`;
}
function viewSettings(head) {
  $('#view').innerHTML = `${head}
    <div class="group-h">Tema</div><div class="seg">${['auto', 'light', 'dark'].map(t => `<button class="pill ${P.theme === t ? 'on' : ''}" data-theme="${t}">${{ auto: 'Automatico', light: 'Chiaro', dark: 'Scuro' }[t]}</button>`).join('')}</div>
    <div class="group-h">Dimensione testo</div><div class="seg">${[[0.92, 'Piccolo'], [1, 'Normale'], [1.1, 'Grande'], [1.2, 'Molto grande']].map(([v, l]) => `<button class="pill ${P.fs === v ? 'on' : ''}" data-setfs="${v}">${l}</button>`).join('')}</div>
    <div class="group-h">Notizie</div><div class="seg"><button class="pill" data-reload>Aggiorna ora</button></div>
    <p class="hint">Le notizie vengono aggiornate automaticamente (circa ogni 15 minuti) dai feed RSS pubblici delle testate. Ultimo aggiornamento: ${new Date(D.updated).toLocaleString('it-IT')}.</p>
    ${getKey() ? `<div class="group-h">Condividi l'accesso</div>
    <p class="hint">La rassegna è privata: la vede solo chi ha questo link. Mandalo solo a chi vuoi tu.</p>
    <div class="seg"><button class="pill" data-copylink>Copia il link privato</button></div>` : ''}
    <div class="group-h">Apri su iPhone o iPad</div>
    <div id="lanBox" class="hint">…</div>
    <p class="hint">Facoltativo: in Safari tocca <b>Condividi</b> → <b>Aggiungi alla schermata Home</b>. Non installa nulla: crea solo un collegamento che apre la pagina a schermo intero.</p>
    <div class="group-h">Dati</div><div class="seg"><button class="pill" data-reset>Ripristina preferenze</button></div>
    <p class="hint">Preferenze, cronologia e articoli salvati restano solo in questo browser.</p>`;
  fetch('api/info').then(r => r.json()).then(i => {
    const box = $('#lanBox'); if (!box) return;
    const here = location.origin;
    const isLan = !/localhost|127\.0\.0\.1/.test(here);
    box.innerHTML = isLan ? `Stai già usando l'indirizzo di rete: <b>${esc(here)}</b>`
      : i.lan.length ? `Con iPhone o iPad collegati alla <b>stessa rete Wi-Fi</b> di questo computer, apri in Safari:<br>${i.lan.map(u => `<b style="font-family:var(--f-mono);color:var(--ink)">${esc(u)}</b>`).join('<br>')}` : 'Questo computer non risulta collegato a una rete.';
  }).catch(() => {
    // versione online: lo stesso indirizzo funziona da qualsiasi dispositivo
    const box = $('#lanBox'); if (!box) return;
    const url = location.origin + location.pathname;
    box.innerHTML = `Apri questo indirizzo in Safari da iPhone, iPad o qualsiasi computer, anche fuori casa:<br><b style="font-family:var(--f-mono);color:var(--ink);word-break:break-all">${esc(url)}</b>`;
  });
}

// ---------- vista: chiedi ----------
const ASK_LOG = [];
function viewAsk(storyId, q) {
  current = { key: 'chiedi' };
  const s = storyId && getStory(storyId);
  const sugg = s ? ['Cosa scrivono le diverse testate?', 'Quali sono gli ultimi aggiornamenti?', 'Ci sono notizie collegate?', 'Ci sono podcast su questo tema?']
    : ['Cosa è successo oggi?', ...storiesFor('top-news').slice(0, 3).map(x => x.title.split(/[,:–—]/)[0].slice(0, 48))];
  $('#view').innerHTML = `${s ? `<div class="page-h"><button class="icon-btn" data-back>${I.back}</button><h1>Chiedi</h1><span></span></div>` : ''}
    <div class="ask-hero"><div class="orb">${I.spark}</div><h1>${s ? 'Approfondisci la notizia' : 'Chiedi alle notizie'}</h1>
    <p>${s ? esc(s.title) : 'Fai una domanda: cerco tra tutte le notizie e gli articoli delle ultime 72 ore e cito sempre le fonti.'}</p></div>
    <form class="ask-form" id="askForm"><input id="askQ" placeholder="${s ? 'Chiedi qualcosa su questa notizia…' : 'Chiedi qualcosa sulle notizie…'}" autocomplete="off"><button>Invia</button></form>
    <div class="sugg">${sugg.map(x => `<button data-q="${esc(x)}">${esc(x)}</button>`).join('')}</div>
    <div id="answers"></div>`;
  $('#askForm').addEventListener('submit', e => { e.preventDefault(); const v = $('#askQ').value.trim(); if (v) { answer(v, s); $('#askQ').value = ''; } });
  $('.sugg').addEventListener('click', e => { const b = e.target.closest('[data-q]'); if (b) answer(b.dataset.q, s); });
  if (q) answer(q, s);
}
function answer(q, ctx) {
  const box = document.createElement('div'); box.className = 'qa';
  const cites = []; const cite = a => { let i = cites.findIndex(c => c.link === a.link); if (i < 0) { cites.push(a); i = cites.length - 1; } return `<span class="cite">${i + 1}</span>`; };
  const nq = norm(q); let html = '';
  const storyItem = s => `<li><b data-open="${s.id}">${esc(s.title)}</b><br>${esc(firstSentences(s.summary || s.articles[0]?.desc || '', 2))} ${s.articles.slice(0, 3).map(cite).join('')}</li>`;
  if (ctx && /testate|scrivono|fonti|giornali/.test(nq)) {
    const by = new Map(); for (const a of ctx.articles) if (!by.has(a.src)) by.set(a.src, a);
    html = `<p>La notizia è coperta da <b>${by.size}</b> ${by.size === 1 ? 'testata' : 'testate'}. Ecco come la racconta ciascuna:</p><ol>${[...by.values()].slice(0, 10).map(a => `<li><b>${esc(titleCase(a.src))}</b> — ${esc(a.title)}${a.desc ? '. ' + esc(firstSentences(a.desc, 1)) : ''} ${cite(a)}</li>`).join('')}</ol>`;
  } else if (ctx && /aggiornament|ultim|novit/.test(nq)) {
    const arts = ctx.articles.slice().sort((a, b) => b.time - a.time).slice(0, 6);
    html = `<p>Gli articoli più recenti su questa notizia, dal più nuovo:</p><ol>${arts.map(a => `<li><b>${esc(a.title)}</b><br><span style="font:12px var(--f-mono);color:var(--muted)">${esc(a.src)} · ${ago(a.time)}</span> ${cite(a)}</li>`).join('')}</ol>`;
  } else if (ctx && /podcast|ascolt/.test(nq)) {
    const pods = relatedPods(ctx).slice(0, 5);
    html = pods.length ? `<p>Episodi podcast che parlano di temi collegati:</p>${pods.map(podRow).join('')}` : '<p>Non ho trovato episodi podcast collegati a questa notizia.</p>';
  } else {
    let qt = tokens(q);
    if (ctx && (/collegat|simili|correlat/.test(nq) || qt.size === 0)) qt = ctx._tok || tokens(ctx.title + ' ' + ctx.summary);
    if (ctx && !/collegat|simili|correlat/.test(nq)) for (const w of tokens(ctx.title)) qt.add(w);
    let pool = visibleStories();
    if (/oggi|successo|principali|importanti/.test(nq) && !ctx) pool = storiesFor('top-news');
    const scored = pool.map(s => { const st = s._tok || tokens(s.title + ' ' + s.summary); let k = 0; for (const w of qt) if (st.has(w)) k += tokens(s.title).has(w) ? 2 : 1; return [k + Math.min(s.n, 6) * 0.15, s]; })
      .filter(([k, s]) => (qt.size ? k >= Math.min(2, qt.size) : true) && (!ctx || s.id !== ctx.id || !/collegat|simili|correlat/.test(nq)))
      .sort((a, b) => b[0] - a[0]).slice(0, 5).map(x => x[1]);
    if (/oggi|successo/.test(nq) && !ctx && !scored.length) scored.push(...storiesFor('top-news').slice(0, 5));
    if (!scored.length) html = '<p>Non ho trovato notizie delle ultime 72 ore che rispondano a questa domanda. Prova con parole chiave diverse (persone, luoghi, aziende).</p>';
    else {
      const nArts = scored.reduce((a, s) => a + s.articles.length, 0), nSrc = new Set(scored.flatMap(s => s.sources.map(x => x.src))).size;
      html = `<p>Ho trovato <b>${scored.length}</b> ${scored.length === 1 ? 'notizia pertinente' : 'notizie pertinenti'}, basate su ${nArts} articoli di ${nSrc} testate:</p><ol>${scored.map(storyItem).join('')}</ol>`;
    }
  }
  if (cites.length) html += `<div class="cites">${cites.map((a, i) => `<a href="${esc(a.link)}" target="_blank" rel="noopener">${i + 1} · ${esc(a.src)}</a>`).join('')}</div>`;
  box.innerHTML = `<div class="q">${esc(q)}</div><div class="a">${html}</div>`;
  $('#answers').prepend(box);
  box.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
const firstSentences = (t, n) => { const parts = t.match(/[^.!?]+[.!?]+(\s|$)/g) || [t]; return parts.slice(0, n).join('').trim(); };

// ---------- ascolta (sintesi vocale) ----------
let speaking = null;
function speak(id, btn) {
  const s = getStory(id); if (!s || !('speechSynthesis' in window)) return toast('Sintesi vocale non disponibile');
  if (speaking === id) { stopSpeak(); return; }
  stopSpeak();
  const u = new SpeechSynthesisUtterance(`${s.title}. ${s.summary}`);
  u.lang = 'it-IT'; const v = speechSynthesis.getVoices().find(v => v.lang?.startsWith('it')); if (v) u.voice = v;
  u.rate = 1.03; u.onend = u.onerror = () => { if (speaking === id) stopSpeak(); };
  speaking = id; speechSynthesis.speak(u);
  $$(`[data-listen="${id}"]`).forEach(b => { b.classList.add('on'); const sp = b.querySelector('span'); if (sp) sp.textContent = 'Stop'; });
  toast('In ascolto · tocca di nuovo per fermare');
}
function stopSpeak() {
  if ('speechSynthesis' in window) speechSynthesis.cancel();
  if (speaking) $$(`[data-listen="${speaking}"]`).forEach(b => { b.classList.remove('on'); const sp = b.querySelector('span'); if (sp) sp.textContent = 'Ascolta'; });
  speaking = null;
}

// ---------- player podcast ----------
const audio = $('#audio');
function playPod(id) {
  const e = D.podcasts.find(x => x.id === id); if (!e) return;
  stopSpeak();
  if (audio.dataset.id === id) { audio.paused ? audio.play() : audio.pause(); return; }
  audio.src = e.audio; audio.dataset.id = id; audio.play().catch(() => toast('Impossibile riprodurre l\'episodio'));
  $('#plImg').src = e.image; $('#plTitle').textContent = e.title; $('#plShow').textContent = e.show; $('#player').hidden = false;
}
const syncPl = () => { $('#plToggle').innerHTML = audio.paused ? I.play : I.pause; };
audio.addEventListener('play', syncPl); audio.addEventListener('pause', syncPl);
audio.addEventListener('timeupdate', () => { $('#plProg').style.width = (audio.duration ? audio.currentTime / audio.duration * 100 : 0) + '%'; });
$('#plToggle').onclick = () => audio.paused ? audio.play() : audio.pause();
$('#plClose').onclick = () => { audio.pause(); audio.removeAttribute('src'); audio.dataset.id = ''; $('#player').hidden = true; };
$('#plBar').onclick = e => { if (audio.duration) { const r = e.currentTarget.getBoundingClientRect(); audio.currentTime = (e.clientX - r.left) / r.width * audio.duration; } };

// ---------- drawer ----------
let editing = false;
function openDrawer() { editing = false; $('#editCols').classList.remove('on'); $('#colList').innerHTML = colRows(false); $('#drawer').classList.add('open'); $('#scrim').classList.add('on'); }
function closeDrawer() { $('#drawer').classList.remove('open'); $('#scrim').classList.remove('on'); }
$('#menuBtn').onclick = openDrawer; $('#scrim').onclick = closeDrawer;
$('#editCols').onclick = () => { editing = !editing; $('#editCols').classList.toggle('on', editing); $('#editCols').textContent = editing ? 'Fine' : 'Modifica'; $('#colList').innerHTML = colRows(editing); };
$('#addCol').onclick = () => newColumn();
function refreshCols() { $$('#colList').forEach(ul => ul.innerHTML = colRows(ul.classList.contains('inpage') || editing)); if (!$('#topbar').classList.contains('hidden')) renderChips(P.lastCol); }

function newColumn() {
  const cats = D.categories.filter(c => c.kind === 'folder');
  const m = $('#modal'); m.hidden = false;
  m.innerHTML = `<form class="sheet" id="ncForm"><h3>Nuova colonna</h3><p>Crea una colonna che raccoglie le notizie per parole chiave, testate o categorie.</p>
    <label>Nome</label><input type="text" id="ncName" placeholder="Es. Intelligenza artificiale" required>
    <label>Parole chiave (separate da virgola)</label><input type="text" id="ncKw" placeholder="openai, anthropic, chatgpt">
    <label>Testate (opzionale, separate da virgola)</label><input type="text" id="ncSrc" placeholder="IL POST, WIRED" list="srcList"><datalist id="srcList">${[...new Set(D.stories.flatMap(s => s.sources.map(x => x.src)))].sort().map(x => `<option value="${esc(x)}">`).join('')}</datalist>
    <label>Limita alle categorie (opzionale)</label><div class="opts">${cats.map(c => `<span class="tag" data-nccat="${c.id}">${esc(c.name)}</span>`).join('')}</div>
    <div class="row"><button type="button" data-close>Annulla</button><button class="primary">Crea</button></div></form>`;
  const sel = new Set();
  m.querySelector('.opts').onclick = e => { const t = e.target.closest('[data-nccat]'); if (!t) return; const id = t.dataset.nccat; sel.has(id) ? sel.delete(id) : sel.add(id); t.classList.toggle('on'); };
  $('#ncName').focus();
  $('#ncForm').onsubmit = e => {
    e.preventDefault();
    const split = v => v.split(',').map(x => x.trim()).filter(Boolean);
    const c = { id: 'u-' + Date.now().toString(36), name: $('#ncName').value.trim(), keywords: split($('#ncKw').value), sources: split($('#ncSrc').value).map(x => x.toUpperCase()), cats: [...sel] };
    if (!c.keywords.length && !c.keywords.length && !c.sources.length && !c.cats.length) c.keywords = [c.name];
    P.custom.push(c); save(); m.hidden = true; closeDrawer(); location.hash = '#/c/' + c.id; refreshCols();
  };
}

// ---------- azioni globali ----------
function share(id) {
  const s = getStory(id); if (!s) return;
  const url = s.articles[0]?.link || location.href; const text = s.title;
  if (navigator.share) navigator.share({ title: s.title, text, url }).catch(() => { });
  else navigator.clipboard?.writeText(`${text}\n${url}`).then(() => toast('Link copiato negli appunti'));
}
function toggleSave(id) {
  const i = P.saved.indexOf(id);
  if (i >= 0) { P.saved.splice(i, 1); toast('Rimosso dai salvati'); } else { P.saved.unshift(id); const s = getStory(id); if (s) histStore(s); toast('Salvato'); }
  save(); $$(`[data-save="${id}"]`).forEach(b => b.classList.toggle('on', P.saved.includes(id)));
}
function toggleList(key, val, on) {
  const arr = P[key]; const i = arr.findIndex(x => norm(x) === norm(val));
  if (on === undefined) on = i < 0;
  if (on && i < 0) arr.push(val); if (!on && i >= 0) arr.splice(i, 1);
  if (key === 'fav' && on) P.muted = P.muted.filter(x => x !== val);
  if (key === 'muted' && on) P.fav = P.fav.filter(x => x !== val);
  save();
  for (const k of Object.keys(mem)) if (k.startsWith('c:')) delete mem[k];
}
document.addEventListener('click', e => {
  const t = e.target.closest('[data-refresh],[data-copylink],[data-homeguide],[data-listen],[data-save],[data-share],[data-ask],[data-open],[data-pod],[data-back],[data-acc],[data-fs],[data-more-arts],[data-more-pods],[data-ent],[data-fav],[data-mute],[data-unmute],[data-follow],[data-unfollow],[data-goto],[data-colgo],[data-colup],[data-colhide],[data-coldel],[data-newcol],[data-theme],[data-setfs],[data-reload],[data-reset],[data-clear-history],[data-close]');
  if (!t) return;
  const d = t.dataset;
  if (d.listen) { e.stopPropagation(); return speak(d.listen, t); }
  if (d.save) { e.stopPropagation(); return toggleSave(d.save); }
  if (d.share) { e.stopPropagation(); return share(d.share); }
  if (d.ask) { e.stopPropagation(); saveScroll(); location.hash = '#/chiedi?s=' + d.ask; return; }
  if (d.ent) { location.hash = '#/t/interesse/' + encodeURIComponent(d.ent); return; }
  if (d.pod) { e.stopPropagation(); return playPod(d.pod); }
  if (d.open) { saveScroll(); location.hash = '#/n/' + d.open; return; }
  if ('back' in d) { history.length > 1 ? history.back() : (location.hash = '#/'); return; }
  if ('acc' in d) { t.parentElement.classList.toggle('open'); return; }
  if ('fs' in d) { const steps = [0.92, 1, 1.1, 1.2]; P.fs = steps[(steps.indexOf(P.fs) + 1) % steps.length] || 1; save(); applyPrefs(); toast('Dimensione testo: ' + Math.round(P.fs * 100) + '%'); return; }
  if (d.moreArts) { const s = getStory(d.moreArts); const m = new Set(P.muted); $('#arts').innerHTML = s.articles.filter(a => !m.has(a.src)).map(artRow).join(''); t.remove(); return; }
  if (d.morePods) { const s = getStory(d.morePods); $('#pods').innerHTML = relatedPods(s).map(podRow).join(''); t.remove(); return; }
  if (d.fav) { toggleList('fav', d.fav); return viewTestate.redraw?.(); }
  if (d.mute) { toggleList('muted', d.mute, true); toast(`${d.mute}: non segui più questa testata`); return viewTestate.redraw?.(); }
  if (d.unmute) { toggleList('muted', d.unmute, false); return viewTestate.redraw?.(); }
  if (d.follow) {
    const on = !P[d.follow].some(x => norm(x) === norm(d.val)); toggleList(d.follow, d.val, on);
    if (t.classList.contains('pill')) { t.classList.toggle('on', on); t.textContent = on ? (d.follow === 'fav' ? 'Preferita' : 'Seguito') : (d.follow === 'fav' ? 'Aggiungi alle preferite' : 'Segui'); }
    else viewEntities.redraw?.();
    return;
  }
  if (d.unfollow) { e.preventDefault(); toggleList(d.unfollow, d.val, false); return viewEntities.redraw?.(); }
  if (d.goto) { location.hash = d.goto; return; }
  if (d.colup) { e.stopPropagation(); const ids = columns().map(c => c.id); const i = ids.indexOf(d.colup); if (i > 0) { [ids[i - 1], ids[i]] = [ids[i], ids[i - 1]]; P.order = ids; save(); refreshCols(); } return; }
  if (d.colhide) { e.stopPropagation(); const i = P.hidden.indexOf(d.colhide); i >= 0 ? P.hidden.splice(i, 1) : P.hidden.push(d.colhide); if (P.hidden.length >= columns().length) P.hidden.pop(); save(); refreshCols(); return; }
  if (d.coldel) { e.stopPropagation(); P.custom = P.custom.filter(c => c.id !== d.coldel); if (P.lastCol === d.coldel) P.lastCol = 'per-te'; save(); refreshCols(); return; }
  if (d.colgo) { if (editing && t.closest('#drawer')) return; closeDrawer(); location.hash = '#/c/' + d.colgo; return; }
  if ('newcol' in d) return newColumn();
  if (d.theme) { P.theme = d.theme; save(); applyPrefs(); return viewSettings($('.page-h').outerHTML); }
  if (d.setfs) { P.fs = +d.setfs; save(); applyPrefs(); return viewSettings($('.page-h').outerHTML); }
  if ('reload' in d || 'refresh' in d) { refreshNow(); return; }
  if ('reset' in d) { if (confirm('Ripristinare tutte le preferenze, la cronologia e i salvati?')) { P = { ...DEF }; save(); applyPrefs(); location.hash = '#/'; refreshCols(); } return; }
  if ('clearHistory' in d) { P.history = []; save(); return viewHistory(); }
  if ('close' in d) { $('#modal').hidden = true; return; }
  if ('homeguide' in d) return homeGuide();
  if ('copylink' in d) { const link = privateLink(); (navigator.clipboard ? navigator.clipboard.writeText(link) : Promise.reject()).then(() => toast('Link privato copiato'), () => prompt('Copia il link privato:', link)); return; }
});
$('#modal').addEventListener('click', e => { if (e.target.id === 'modal') e.currentTarget.hidden = true; });
document.addEventListener('keydown', e => { if (e.key === 'Escape') { $('#modal').hidden = true; closeDrawer(); } });

// ---------- guida "Aggiungi alla schermata Home" ----------
const isStandalone = () => navigator.standalone === true || matchMedia('(display-mode: standalone)').matches;
function homeGuide() {
  const ua = navigator.userAgent;
  const ios = /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  const safari = ios && !/CriOS|FxiOS|EdgiOS|OPiOS|GSA\//.test(ua);
  const share = '<svg viewBox="0 0 24 24" style="width:18px;height:18px;vertical-align:-3px"><path d="M12 3v12M8 7l4-4 4 4M6 11H5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1h-1"/></svg>';
  const m = $('#modal'); m.hidden = false;
  m.innerHTML = `<div class="sheet"><h3>Aggiungi alla schermata Home</h3>
    <p>Non installa nulla: crea un'icona che apre Rassegna a schermo intero, già con il tuo accesso.</p>
    ${ios && !safari ? `<p style="color:var(--ink)"><b>Stai usando un browser diverso da Safari.</b> Il modo più sicuro è aprire questo link in <b>Safari</b> e seguire i passaggi qui sotto. In alternativa, in Chrome: tocca ${share} in alto a destra → <b>Aggiungi alla schermata Home</b>.</p>
      <div class="seg"><button class="pill" data-copylink>Copia il link per Safari</button></div>` : ''}
    <ol style="padding-left:20px;margin:6px 0 0;line-height:1.55">
      <li>In Safari tocca <b>${share} Condividi</b>.<br><span class="hint">Su iPhone è in basso; se non lo vedi, tocca prima <b>•••</b> in basso a destra. Su iPad è in alto a destra.</span></li>
      <li>Scorri l'elenco verso il basso e tocca <b>Aggiungi alla schermata Home</b>.<br><span class="hint">Se non c'è: in fondo all'elenco tocca <b>Modifica azioni</b> e aggiungila.</span></li>
      <li>Lascia attivo <b>Apri come app web</b>, se compare, e tocca <b>Aggiungi</b>.</li>
    </ol>
    <div class="row"><button class="primary" data-close>Ho capito</button></div></div>`;
}

// ---------- aggiornamento notizie ----------
let refreshing = false, lastLoad = 0;
async function refreshNow() {
  if (refreshing) return;
  refreshing = true;
  $('#refreshBtn').classList.add('spin'); $('#ptr').classList.add('spin');
  $$('[data-refresh],[data-reload]').forEach(b => b.textContent = 'Aggiornamento…');
  toast('Aggiorno le notizie da tutte le testate…', 60000);
  try {
    const before = new Set(D.stories.map(s => s.id));
    await load(true); lastLoad = Date.now();
    const nuove = D.stories.filter(s => !before.has(s.id)).length;
    for (const k in mem) delete mem[k];
    window.scrollTo(0, 0); route();
    toast(nuove ? `${nuove} nuove notizie` : 'Sei già aggiornato');
  } catch { toast('Aggiornamento non riuscito: controlla la connessione'); }
  refreshing = false;
  $('#refreshBtn').classList.remove('spin'); $('#ptr').classList.remove('spin'); hidePtr();
}
$('#refreshBtn').onclick = refreshNow;

// trascina verso il basso per aggiornare (iPhone / iPad)
let ptrY = null, ptrD = 0;
const ptr = $('#ptr');
function hidePtr() { ptr.style.transition = 'transform .25s, opacity .25s'; ptr.style.transform = 'translate(-50%, -80px)'; ptr.style.opacity = 0; ptr.classList.remove('ready'); }
window.addEventListener('touchstart', e => {
  if (refreshing || window.scrollY > 0 || $('#topbar').classList.contains('hidden') || $('#drawer').classList.contains('open') || e.target.closest('#chips')) { ptrY = null; return; }
  ptrY = e.touches[0].clientY; ptrD = 0; ptr.style.transition = 'none';
}, { passive: true });
window.addEventListener('touchmove', e => {
  if (ptrY == null) return;
  ptrD = Math.max(0, e.touches[0].clientY - ptrY);
  if (window.scrollY > 0) { ptrD = 0; }
  const k = Math.min(ptrD, 140);
  ptr.style.opacity = Math.min(1, k / 60);
  ptr.style.transform = `translate(-50%, ${-80 + k * 0.75}px)`;
  ptr.querySelector('svg').style.transform = `rotate(${k * 2.5}deg)`;
  const ready = ptrD > 90; ptr.classList.toggle('ready', ready);
  ptr.querySelector('span').textContent = ready ? 'Rilascia per aggiornare' : 'Trascina per aggiornare';
}, { passive: true });
window.addEventListener('touchend', () => {
  if (ptrY == null) return; ptrY = null;
  if (ptrD > 90) { ptr.querySelector('span').textContent = 'Aggiornamento…'; refreshNow(); } else hidePtr();
});

// quando riapri la pagina (es. torni su Safari) controlla se ci sono notizie nuove
async function checkNew() {
  try {
    const changed = await load(); lastLoad = Date.now();
    if (changed && current.key?.startsWith('c:')) {
      for (const k in mem) delete mem[k];
      toast('Nuove notizie disponibili · tocca per vederle', 8000, () => { $('#toast').hidden = true; window.scrollTo(0, 0); route(); });
    }
  } catch { }
}
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && Date.now() - lastLoad > 3 * 60e3) checkNew(); });

// ---------- avvio ----------
route();
load().then(() => { lastLoad = Date.now(); route(); }).catch(err => { if (err instanceof Locked) return showLocked(); $('#view').innerHTML = `<div class="empty"><h3>Impossibile caricare le notizie</h3><p>${esc(err.message)}</p></div>`; });
setInterval(checkNew, 5 * 60 * 1000);
if ('serviceWorker' in navigator && window.isSecureContext) navigator.serviceWorker.register('sw.js').catch(() => { });
})();
