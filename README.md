# Rassegna

Aggregatore di notizie che riproduce struttura e impaginazione di Column (web.column.news):
colonne a chip, notizie raggruppate da più testate, approfondimenti, podcast, Chiedi, cronologia e profilo.

## Avvio

```
node server.js
```

Poi apri http://localhost:5173. Serve Node 18 o superiore, senza dipendenze da installare.

`node server.js --probe --podcasts` verifica tutti i feed RSS e i podcast.

## Su iPhone e iPad

È una web app: non serve installare nulla. Con il Mac acceso e il server avviato, iPhone e iPad
collegati alla stessa rete Wi-Fi aprono in Safari l'indirizzo che il server stampa all'avvio
(es. `http://192.168.1.47:5173`), indicato anche in Profilo → Impostazioni.
Facoltativo: Condividi → "Aggiungi alla schermata Home" crea un collegamento a schermo intero.

## Aggiornare le notizie

- pulsante ↻ in alto a destra, oppure "Aggiorna" sopra il feed
- trascina il feed verso il basso (su iPhone/iPad)
- automatico: il server aggiorna ogni 10 minuti; la pagina controlla le novità quando la riapri

## Lingua

Tutte le notizie sono in italiano: gli articoli delle testate straniere vengono tradotti
automaticamente (titolo e sommario) e segnati come "tradotto dall'inglese" negli approfondimenti.
Un articolo che non si riesce a tradurre non viene mostrato; il server riprova da solo.
Le traduzioni restano in cache in `data/translations.json`.

## Struttura

- `server.js`: scarica i feed ogni 10 minuti, li classifica nelle 17 categorie, raggruppa gli articoli sulla stessa notizia e serve le API (`/api/feed`, `/api/sources`, `/api/status`, `/api/refresh`).
- `data/testate.txt`: le 487 testate di Column.
- `data/feeds.json`: i feed RSS pubblici collegati (173 feed, 131 testate). Aggiungi qui nuove fonti.
- `data/podcasts.json`: i podcast; l'URL del feed viene ricavato dalla ricerca di Apple Podcasts.
- `public/`: l'app (HTML, CSS, JS senza framework). Le preferenze restano nel `localStorage` del browser.
