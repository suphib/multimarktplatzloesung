# SEO Rollout Checklist (März 2026)

## 1) Deployment (technisch)

- Website deployen mit den Änderungen aus:
  - `apps/website/nginx.conf`
  - `apps/website/src/layouts/BaseLayout.astro`
  - `apps/website/public/robots.txt`
  - Trailing-Slash-Linkfixes in `apps/website/src/**`

## 2) Sofort-Checks (nach Deploy)

### Canonical & Redirects

Prüfen (jeweils in Browser + per `curl -I`):

- `https://procurement-ai.de/kontakt` → **301** auf `https://procurement-ai.de/kontakt/`
- `https://procurement-ai.de/glossar` → **301** auf `https://procurement-ai.de/glossar/`
- `https://procurement-ai.de/cpv-klassifizierung` → **301** auf `https://procurement-ai.de/cpv-klassifizierung/`
- `https://www.procurement-ai.de/` → **301** auf `https://procurement-ai.de/`

### Robots / Indexing

- `https://procurement-ai.de/robots.txt` enthält:
  - `Allow: /`
  - Sitemap-Eintrag
  - **kein** Disallow für `/impressum/`, `/datenschutz/`, `/agb/`
- Rechtsseiten bleiben über `noindex` auf Seitenebene ausgeschlossen.

## 3) Google Search Console (gleich am Deploy-Tag)

### URL-Prüfung + Indexierung beantragen

- `https://procurement-ai.de/`
- `https://procurement-ai.de/features/`
- `https://procurement-ai.de/integrationen/`
- `https://procurement-ai.de/kontakt/`
- `https://procurement-ai.de/glossar/`
- `https://procurement-ai.de/cpv-klassifizierung/`

### Indexierungs-Report

- In der Meldung **„Alternative Seite mit richtigem kanonischen Tag“**:
  - „**Fehlerbehebung überprüfen**“ starten.

### Sitemap

- Sitemap neu einreichen: `https://procurement-ai.de/sitemap-index.xml`

## 4) KPI-Tracking (14–28 Tage)

Primärziel: **mehr Klicks bei konstant/steigendem Impression-Level**.

### GSC Performance (Filter: Web, Land DE)

Seiten:
- `/`
- `/features/`
- `/integrationen/`
- `/kontakt/`
- `/cpv-klassifizierung/`

Metriken wöchentlich tracken:
- Klicks
- Impressionen
- CTR
- Ø Position

### Zielwerte (realistisch, kurzfristig)

- CTR +0.3 bis +1.0 Prozentpunkte auf Seiten mit vielen Impressionen
- Rückgang der „Alternative Seite mit richtigem kanonischen Tag“-Beispiele
- Stabile/steigende Impressionen auf Fokusseiten

## 5) Iteration nach 2 Wochen

Wenn CTR weiter niedrig bei hohen Impressionen:

1. `title` präziser auf Query-Intent zuschneiden (pro URL)
2. `description` mit klarerem Nutzen/CTA schärfen
3. interne Links auf Fokusseiten erhöhen (von Startseite, Features, Integrationen)

## 6) Optionaler nächster Sprint

- Query-basierte Snippet-Optimierung für Top-10 Suchanfragen aus GSC
- FAQ-Abschnitte (mit Schema) auf `/features/` und `/integrationen/` prüfen/erweitern
- SERP-Snippet-Review gegen Wettbewerber im DE-Markt
