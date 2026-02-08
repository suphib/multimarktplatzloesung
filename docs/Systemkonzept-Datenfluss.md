# Systemkonzept: Datenflüsse, Verwaltung & Schnittstellenintegration

## 1. Datenimport — Wie gelangen Daten ins System?

### 1.1 Rahmenverträge (Stammdaten)

Rahmenverträge bilden die vertragliche Grundlage für den Abruf von Artikeln. Sie werden über drei Wege eingepflegt:

| Kanal | Beschreibung |
|-------|-------------|
| **Admin-Oberfläche** | Manuelles Anlegen unter `/admin/rahmenvertraege` mit allen Konditionen (Zahlungsbedingungen, Skonto, Mindestbestellwert, Volumen, Gültigkeit) |
| **REST-API** | `POST /api/v1/admin/rahmenvertraege` — programmatischer Import z.B. aus ERP-Systemen |
| **Seed/Migration** | Initiale Befüllung über `npm run db:seed` mit Upsert-Logik (existierende Datensätze werden aktualisiert) |

Zu jedem Rahmenvertrag können **Dokumente** hochgeladen werden (max. 20 MB pro Datei): Verträge, AGB, Zertifikate, Leistungsbeschreibungen.

### 1.2 Katalog-Artikel (Produktdaten)

Katalog-Artikel sind die konkreten Produkte, die aus Rahmenverträgen abrufbar sind:

| Kanal | Beschreibung |
|-------|-------------|
| **Admin-Oberfläche** | Einzelanlage und Bearbeitung unter `/admin/katalog` mit Suche, Pagination und Filterung |
| **REST-API** | `POST /api/v1/admin/katalog` — Bulk-Import über Skripte oder Drittsysteme |

Jeder Artikel ist über die `rahmenvertragsNummer` an einen Rahmenvertrag gebunden und erbt dessen Konditionen (Zahlungsbedingungen, Skonto, Mindestbestellwert).

### 1.3 Marktplatz-Daten (Externe Quellen)

Das System aggregiert Suchergebnisse aus mehreren Marktplätzen parallel:

| Marktplatz | Anbindung | Status |
|------------|-----------|--------|
| **Rahmenvertrag** (intern) | Direkte Datenbankabfrage | Produktiv |
| **Amazon Business** | Adapter-Schnittstelle | Adapter vorbereitet, Mock-Daten |
| **Mercateo** | Adapter-Schnittstelle | Adapter vorbereitet, Mock-Daten |
| **Conrad Electronic** | Adapter-Schnittstelle | Adapter vorbereitet, Mock-Daten |

Die Architektur nutzt ein **Adapter-Pattern**: Jeder Marktplatz wird über eine einheitliche Schnittstelle angebunden. Für den Produktivbetrieb werden die Mock-Adapter durch echte API-Clients ersetzt — die Datenstruktur und Aggregationslogik bleiben identisch.

---

## 2. Datenverwaltung — Wie werden Daten im System verwaltet?

### 2.1 Admin-Dashboard

Zentrale Übersicht unter `/admin/dashboard`:
- Anzahl Rahmenverträge (gesamt/aktiv)
- Katalog-Artikel
- Shop-Konfigurationen (gesamt/aktiv)
- System-Status (Datenbank, Redis, KI-Service)
- Verbindungsstatus aller Marktplätze

### 2.2 Rahmenvertragsverwaltung

Vollständiges CRUD unter `/admin/rahmenvertraege`:

| Feld | Beschreibung |
|------|-------------|
| Bezeichnung | Name des Rahmenvertrags |
| Vertragsnummer | Eindeutige Kennung (z.B. RV-2024-IT-001) |
| Lieferant | Vertragspartner |
| Gültig bis | Ablaufdatum |
| CPV-Codes | EU-Klassifizierung |
| Max. Volumen | Vertragsvolumen in EUR |
| Abruf-Volumen | Bereits abgerufenes Volumen (automatisch aktualisiert bei Bestellungen) |
| Zahlungsbedingungen | z.B. "30 Tage netto" |
| Skonto | z.B. "2% bei Zahlung innerhalb 14 Tagen" |
| Mindestbestellwert | Minimum pro Bestellung in EUR |
| Status | ENTWURF → AKTIV → GEKÜNDIGT / ABGELAUFEN |
| Dokumente | Anhänge (PDF, DOCX etc.) |

### 2.3 Bestellverwaltung mit Genehmigungsworkflow

Bestellungen durchlaufen einen definierten Workflow:

```
Bestellung anlegen
       │
       ▼
┌──────────────┐     ≤ 1.000 €     ┌──────────┐
│  Validierung │ ──────────────────▶│ BESTELLT │
│  (Preis,     │                    └──────────┘
│   Menge,     │
│   Mindest-   │     > 1.000 €     ┌─────────────────────┐
│   bestellw.) │ ──────────────────▶│ GENEHMIGUNG         │
└──────────────┘                    │ ANGEFORDERT         │
                                    └─────────┬───────────┘
                                              │
                                    ┌─────────┴───────────┐
                                    ▼                     ▼
                              ┌──────────┐         ┌───────────┐
                              │ GENEHMIGT│         │ ABGELEHNT │
                              └──────────┘         │ (mit      │
                                                   │  Grund)   │
                                                   └───────────┘
```

**Automatische Berechnungen bei Rahmenvertrag-Bestellungen:**
- Skonto-Abzug wird aus den RV-Konditionen berechnet
- Mindestbestellwert wird validiert (Bestellung wird abgelehnt wenn nicht erreicht)
- Abruf-Volumen des Rahmenvertrags wird automatisch aktualisiert

### 2.4 Shop-Konfiguration

Verwaltung der Marktplatz-Anbindungen unter `/admin/shop-config`:
- Aktivierung/Deaktivierung einzelner Marktplätze
- API-Schlüssel-Hinterlegung (SHA-256 verschlüsselt gespeichert)
- Basis-URL der externen API
- Manuelle Synchronisierung auslösbar

---

## 3. Schnittstellenkonzept — Anbindung von Drittsystemen

### 3.1 REST-API (Inbound)

Das System bietet eine vollständige REST-API für die Integration mit Warenwirtschaftssystemen, ERP und anderen Fachverfahren:

**Stammdaten-Import:**
```
POST /api/v1/admin/rahmenvertraege     → Rahmenverträge anlegen
POST /api/v1/admin/katalog             → Katalog-Artikel importieren
PATCH /api/v1/admin/rahmenvertraege/:id → Konditionen aktualisieren
```

**Bestellwesen:**
```
POST /api/v1/admin/bestellungen              → Bestellung aufgeben
GET  /api/v1/admin/bestellungen              → Bestellstatus abfragen
PATCH /api/v1/admin/bestellungen/:id/approve → Genehmigung erteilen
PATCH /api/v1/admin/bestellungen/:id/reject  → Bestellung ablehnen
```

**Klassifizierung & Suche:**
```
POST /api/v1/classify   → Artikel klassifizieren (CPV-Code, Vergabekanal)
POST /api/v1/search     → Marktplatzübergreifende Suche
```

**Dokumentation & Monitoring:**
```
GET /api/v1/documentation/:id  → Vergabedokumentation abrufen
GET /api/v1/health             → Systemstatus prüfen
```

Alle Endpunkte sind über **Swagger UI** (`/api/docs`) dokumentiert und testbar.

### 3.2 Marktplatz-Adapter (Outbound)

Die Anbindung externer Marktplätze erfolgt über ein standardisiertes Adapter-Pattern:

```
┌─────────────────────────────────────────────────┐
│                 SearchService                     │
│                                                   │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────┐│
│  │   Amazon     │  │  Mercateo   │  │  Conrad   ││
│  │   Business   │  │  Adapter    │  │  Adapter  ││
│  │   Adapter    │  │             │  │           ││
│  └──────┬──────┘  └──────┬──────┘  └─────┬─────┘│
│         │                │               │       │
└─────────┼────────────────┼───────────────┼───────┘
          │                │               │
          ▼                ▼               ▼
    Amazon Business   Mercateo API   Conrad API
       API
```

**Jeder Adapter implementiert:**
- Suche mit Suchbegriff und Filtern
- Mapping auf einheitliches `Artikel`-Format
- Fehlerbehandlung bei Nicht-Erreichbarkeit

**Für die Anbindung eines neuen Marktplatzes/ERP:**
1. Neuen Adapter implementieren (einheitliches Interface)
2. Shop-Konfiguration in der Admin-Oberfläche anlegen (URL, API-Key)
3. Adapter im SearchService registrieren

### 3.3 Anbindung Warenwirtschaftssystem (ERP)

Die REST-API ermöglicht bidirektionale Integration:

| Richtung | Use Case | Endpunkt |
|----------|----------|----------|
| **ERP → System** | Rahmenverträge synchronisieren | `POST /api/v1/admin/rahmenvertraege` |
| **ERP → System** | Katalogdaten importieren | `POST /api/v1/admin/katalog` |
| **ERP → System** | Bestellung auslösen | `POST /api/v1/admin/bestellungen` |
| **System → ERP** | Bestellstatus abfragen | `GET /api/v1/admin/bestellungen` |
| **System → ERP** | Vergabedokumentation abrufen | `GET /api/v1/documentation/:id` |
| **System → ERP** | Klassifizierungsergebnis abrufen | Enthalten in Dokumentation |

**Geplante Erweiterungen für tiefere ERP-Integration:**
- Webhook-Benachrichtigungen bei Statusänderungen (Bestellung genehmigt/abgelehnt)
- OCI/cXML Punch-Out-Schnittstelle für SAP-Anbindung
- EDIFACT/XRechnung-Export für elektronische Rechnungsstellung

---

## 4. Datenexport — Wie gelangen Daten aus dem System?

### 4.1 Vergabedokumentation (Revisionssicher)

Jeder Beschaffungsvorgang erzeugt eine revisionssichere Dokumentation:

| Bestandteil | Beschreibung |
|-------------|-------------|
| Klassifizierungsergebnis | CPV-Code, Vergabekanal, Konfidenz |
| Compliance-Prüfung | Schwellenwertkategorie, Prüfpunkte, Status |
| Suchergebnisse | Alle angezeigten Angebote zum Zeitpunkt der Entscheidung |
| Ausgewählter Artikel | Lieferant, Preis, Marktplatz |
| Begründung | Freitext-Begründung der Vergabeentscheidung |
| Integritätshash | SHA-256-Hash zur Manipulationserkennung |
| Zeitstempel & Benutzer | Wer hat wann entschieden |

Abruf: `GET /api/v1/documentation/:id` → JSON mit allen Feldern

### 4.2 Preisvergleich-Export

Aus der Vergleichsansicht (`/compare`) können Preisvergleiche exportiert werden:

**PDF-Export:**
- Artikelübersicht mit Preisen, Lieferanten und Lieferzeiten
- Technische Spezifikationen im Vergleich
- Ersparnisberechnung (günstigstes vs. teuerstes Angebot)
- Vergaberechtskonformer Fußtext

**Excel/CSV-Export:**
- Semikolon-getrennt (kompatibel mit deutschem Excel)
- UTF-8 mit BOM für korrekte Umlaute
- Artikeldaten, Preise, Spezifikationen und Zusammenfassung
- Dateiname: `{Titel}_{Datum}.csv`

### 4.3 REST-API (Alle Daten als JSON)

Sämtliche Verwaltungsdaten sind über die REST-API abrufbar:

```
GET /api/v1/admin/rahmenvertraege     → Alle Rahmenverträge mit Konditionen
GET /api/v1/admin/bestellungen        → Alle Bestellungen mit Status
GET /api/v1/admin/katalog             → Alle Katalog-Artikel (paginiert)
GET /api/v1/admin/shop-configs        → Alle Marktplatz-Konfigurationen
GET /api/v1/admin/dashboard/stats     → Aggregierte Kennzahlen
```

Jeder Endpunkt liefert strukturiertes JSON, das von Drittsystemen maschinell verarbeitet werden kann.

---

## 5. Sicherheitskonzept (Daten)

| Maßnahme | Umsetzung |
|----------|-----------|
| API-Schlüssel | SHA-256-gehasht in der Datenbank, niemals im Klartext |
| Dokumenten-Integrität | SHA-256-Hash pro Vergabedokumentation |
| Eingabevalidierung | class-validator auf allen Endpunkten (DTOs) |
| Dateigröße | Upload-Limit 20 MB pro Dokument |
| Datenbankzugriff | TypeORM mit parametrisierten Queries (SQL-Injection-Schutz) |

---

## 6. KI-gestützte Klassifizierung

Das System nutzt Azure OpenAI (GPT-4) für die automatische Artikel-Klassifizierung:

```
Eingabe: Artikelbezeichnung + Beschreibung + geschätzter Preis
    │
    ▼
┌──────────────────────────────────────┐
│        Azure OpenAI (GPT-4)          │
│  Fallback: Regelbasierte Zuordnung   │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│  CPV-Code + Vergabekanal + Konfidenz │
│  + Compliance-Prüfung                │
│  + Rahmenvertrag-Matching            │
│  + Alternative Kanäle                │
└──────────────────────────────────────┘
```

**Vergabekanäle nach Schwellenwerten (§ UVgO):**

| Schwellenwert | Kanal | Anforderung |
|---------------|-------|-------------|
| ≤ 1.000 € | Direktauftrag | Vereinfachte Prüfung |
| 1.000 – 25.000 € | Freie Vergabe | Mind. 3 Vergleichsangebote |
| 25.000 – 143.000 € | Unterschwellenvergabe | Öffentliche Bekanntmachung |
| > 143.000 € | Oberschwellenvergabe | EU-weite Ausschreibung |

**Fallback-Mechanismus:** Bei Nicht-Erreichbarkeit des KI-Dienstes greift automatisch eine regelbasierte Keyword-Klassifizierung (Konfidenz: NIEDRIG).
