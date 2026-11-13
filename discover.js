// Cerca i feed RSS delle testate dell'elenco che non ne hanno ancora uno.
// Uso: node discover.js  → scrive data/feeds-scoperti.json (feed spenti di default, l'utente li attiva)
'use strict';
const fs = require('fs');
const path = require('path');
const { discoverFeed, guessSites, LOCAL_RE } = require('./lib-discover');

const ROOT = __dirname;
const TESTATE = fs.readFileSync(path.join(ROOT, 'data/testate.txt'), 'utf8').split('|').map(s => s.trim()).filter(Boolean);
const FEEDS = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/feeds.json'), 'utf8'));
const have = new Set(FEEDS.map(f => f.src));
const todo = TESTATE.filter(n => !have.has(n));

async function pool(list, n, fn) {
  const out = new Array(list.length); let i = 0;
  await Promise.all(Array.from({ length: n }, async () => { while (i < list.length) { const k = i++; try { out[k] = await fn(list[k], k); } catch (e) { out[k] = null; } } }));
  return out;
}

(async () => {
  console.log(`Testate senza feed: ${todo.length}`);
  let done = 0;
  const res = await pool(todo, 12, async name => {
    let found = null;
    for (const site of guessSites(name)) {
      found = await discoverFeed(site, 8000).catch(() => null);
      if (found) break;
    }
    done++; if (done % 25 === 0) console.log(`  ${done}/${todo.length}`);
    return found ? { src: name, ...found } : null;
  });
  const out = res.filter(Boolean).map(f => ({ src: f.src, domain: f.domain, url: f.feed, cat: null, lang: f.lang, local: LOCAL_RE.test(f.src) || undefined, def: false }));
  fs.writeFileSync(path.join(ROOT, 'data/feeds-scoperti.json'), '[\n' + out.map(x => '  ' + JSON.stringify(x)).join(',\n') + '\n]\n');
  console.log(`Trovati ${out.length} feed su ${todo.length} testate → data/feeds-scoperti.json`);
  console.log('Non trovati:', todo.filter((n, k) => !res[k]).join(', '));
})();
