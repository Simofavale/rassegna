// Ricerca automatica del feed RSS/Atom di un sito (usata dalla build e da discover.js)
'use strict';
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36';

// testate locali: città, province, "today", "live", ecc.
const LOCAL_RE = /TODAY|LIVE$|NEWS24|24ORE$|NOTIZIE$|^IL CENTRO|^LA PROVINCIA|^CORRIERE D(I|ELL|ELLE)|^GAZZETTA D|^GIORNALE D|^ECO D|^IL GIORNALE D|^LA NUOVA|^LA TRIBUNA|^LA VOCE|^IL TIRRENO|^ALTO ADIGE|^IL MATTINO DI|^MESSAGGERO VENETO|^IL PICCOLO|^L'ARENA|^BRESCIAOGGI|^IL CITTADINO|^IL BIELLESE|^LA SESIA|^LUNA NUOVA|^IL SAVIGLIANESE|^LA FEDELT|^IL MONFERRATO|^IL RISVEGLIO|^ECO RISVEGLIO|^LA SENTINELLA|^PRIMA|^RIVIERA|^SETTIMANALE|^VITA CASALESE|^TP24|^IVG|^QUICOMO|^VARESENEWS|^LEGNANONEWS|^ILPESCARA|^ILPIACENZA|^PIACENZASERA|^VERONASERA|^LECCEPRIMA|^TRIESTEPRIMA|^PADOVAOGGI|^BUONASERA24|^TUSCIAWEB|^CRONACHE |^CITTÀ DELLA|^CIVONLINE|^IL DOLOMITI|^IL CAPOLUOGO|^IL CROTONESE|^INTERNAPOLI|^LAMEZIA|^MOLISE|^OLBIA24|^SARDINIAPOST|^CASTEDDU|^L'UNIONE SARDA|^LA NUOVA SARDEGNA|^GIORNALE LA VOCE|^NORDMILANO24|^SESTO|^VIGEVANO24|^ROVIGO24|^LATINA24|^MARSICALIVE|^ORTICALAB|^OTTO PAGINE|^PUPIA|^RAGUSANEWS|^STATO QUOTIDIANO|^SULPANARO|^TARANTOSERA|^VESUVIOLIVE|^VITTORIA|^FIUMICINO|^CASTELLI|^CENTRO PAGINA|^EUSEBIANO|^IL CORRIERE$|^IL GIORNALE DEL MOLISE|^LA SICILIA|^GIORNALE DI SICILIA|^QDS|^IL GAZZETTINO|^IL GIORNO|^LA NAZIONE|^IL RESTO DEL CARLINO|^TARGATOCN|^LA VOCE DI ALBA|^IDEAWEBTV|^CUNEO24|^ANSA PIEMONTE/;

const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
function guessSites(name) {
  const base = norm(name).replace(/&/g, 'e').replace(/['’.]/g, '').trim();
  const joined = base.replace(/[^a-z0-9]+/g, '');
  const dashed = base.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const noArt = joined.replace(/^(il|la|lo|l|el|the|le|les|de|di)(?=[a-z])/, '');
  const tlds = /^(el|la|los|las|diario|diari|noticias|faro|heraldo|huelva|granada|malaga|menorca|segre|regio7|deia|levante|mediterraneo|nos|publico|ultima|vozpopuli|okdiario|canarias|superdeporte|estadio|sport$|mundo|marca|as$|abc$|20minutos|ara$|europa press|efe$|informacion|las provincias|la rioja|la razon|la vanguardia|la gaceta|la tribuna de|la opinion|la nueva cronica|la voz|lanza|la manyana)/.test(base) ? ['es', 'com', 'cat'] : ['it', 'com', 'net', 'info', 'eu', 'org'];
  const names = [...new Set([joined, noArt, dashed])].filter(Boolean);
  const out = [];
  for (const n of names) for (const t of tlds) out.push(`https://www.${n}.${t}/`);
  return out.slice(0, 9);
}

async function get(url, ms) {
  const r = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'text/html,application/xhtml+xml,application/rss+xml,application/xml;q=0.9,*/*;q=0.8' }, redirect: 'follow', signal: AbortSignal.timeout(ms) });
  if (!r.ok) throw new Error('HTTP ' + r.status);
  const ct = r.headers.get('content-type') || '';
  const text = (await r.text()).slice(0, 400000);
  return { text, ct, url: r.url };
}
const isFeed = t => /<(rss|feed|rdf:RDF)\b/i.test(t.slice(0, 2000)) && /<(item|entry)\b/i.test(t);
const decode = s => s.replace(/&amp;/g, '&').replace(/&#0?38;/g, '&');
function detectLang(html, domain) { if (/\.it$/.test(domain)) return 'it'; const m = html.match(/<html[^>]+lang=["']?([a-z]{2})/i); return m ? m[1].toLowerCase() : 'it'; }

// Ritorna { site, feed, domain, title, lang } oppure null
async function discoverFeed(input, ms = 10000) {
  let url = input.trim();
  if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
  const page = await get(url, ms);
  const domain = new URL(page.url).hostname.replace(/^www\./, '');
  if (isFeed(page.text)) return { site: new URL(page.url).origin, feed: page.url, domain, lang: /\.(es|cat)$/.test(domain) ? 'es' : 'it' };
  const lang = detectLang(page.text, domain);
  const cands = [];
  const re = /<link\b[^>]*>/gi; let m;
  while ((m = re.exec(page.text))) {
    const tag = m[0];
    if (!/rel=["']?alternate/i.test(tag) || !/type=["']?application\/(rss|atom)\+xml/i.test(tag)) continue;
    const h = tag.match(/href=["']([^"']+)["']/i); if (!h) continue;
    const href = new URL(decode(h[1]), page.url).href;
    if (/comments|commenti/i.test(href)) continue;
    cands.push(href);
  }
  const origin = new URL(page.url).origin;
  for (const p of ['/feed/', '/rss', '/rss.xml', '/feed', '/rss/', '/feed.xml', '/index.xml', '/atom.xml', '/?feed=rss2']) cands.push(origin + p);
  for (const c of [...new Set(cands)].slice(0, 10)) {
    try { const f = await get(c, ms); if (isFeed(f.text)) return { site: origin, feed: f.url, domain, lang }; } catch { }
  }
  return null;
}

module.exports = { discoverFeed, guessSites, LOCAL_RE };
