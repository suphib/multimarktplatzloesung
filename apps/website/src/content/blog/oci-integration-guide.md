---
titel: "OCI 5.0 Integration: Der komplette Leitfaden"
beschreibung: "Schritt-für-Schritt Anleitung zur Integration von procurement-ai in Ihr ERP-System über OCI 5.0 und cXML. Technische Details und Best Practices."
datum: "2026-02-08"
autor: "Thomas Weber"
lesezeit: "8 min"
tags: ["Technik", "OCI", "Integration", "Leitfaden"]
bild: "/images/screenshots/desktop/admin-oci-config.webp"
---

Die OCI 5.0 (Open Catalog Interface) Integration ist der Schlüssel zur nahtlosen Anbindung von procurement-ai an Ihr ERP-System. Eine Übersicht aller unterstützten Systeme finden Sie auf unserer [Integrationsseite](/integrationen). In diesem Leitfaden erklären wir Schritt für Schritt, wie die Integration funktioniert.

> **Zusammenfassung:** OCI 5.0 ermöglicht die direkte Warenkorb-Übernahme zwischen procurement-ai und Ihrem ERP-System. Die Einrichtung dauert ca. 30 Minuten und erfordert keine Programmierung.

---

## Was ist OCI 5.0?

OCI (Open Catalog Interface) ist ein von SAP entwickelter Standard für die Anbindung externer Kataloge an ERP-Systeme. Version 5.0 bringt gegenüber früheren Versionen wesentliche Verbesserungen:

- **Erweiterte Artikelattribute** — mehr Datenfelder für präzisere Artikelbeschreibungen
- **Verbesserte Warenkorb-Übernahme** — zuverlässigere Übertragung, auch bei komplexen Positionen
- **Konfigurationsartikel** — Unterstützung für parametrisierte Produkte
- **Bessere Fehlerbehandlung** — detaillierte Fehlermeldungen bei Übertragungsproblemen

> OCI 5.0 wird von allen gängigen ERP-Systemen unterstützt, darunter SAP S/4HANA, SAP ECC, Microsoft Dynamics und Oracle Cloud.

---

## Voraussetzungen

Bevor Sie starten, stellen Sie sicher, dass folgende Punkte erfüllt sind:

| Anforderung | Details |
|---|---|
| **ERP-System** | SAP S/4HANA, SAP ECC, SAP Business One, Microsoft Dynamics, Oracle oder kompatibel |
| **procurement-ai Plan** | [Professional oder Enterprise](/preise) |
| **Netzwerk** | HTTPS-Verbindung zwischen ERP und procurement-ai |
| **Zugang** | Administrator-Rechte in Ihrem ERP-System |

---

## Schritt 1: OCI-Konfiguration in procurement-ai

Navigieren Sie im Admin-Dashboard zu **Einstellungen > OCI-Konfiguration** und erstellen Sie eine neue Verbindung.

![OCI-Konfiguration im Admin-Dashboard](/images/screenshots/desktop/admin-oci-config.webp)

Folgende Felder konfigurieren Sie hier:

| Feld | Beispielwert | Beschreibung |
|---|---|---|
| **Verbindungsname** | SAP S/4HANA Produktion | Frei wählbarer Name |
| **Callback-URL** | `https://erp.firma.de/oci/return` | URL Ihres ERP-Systems für die Warenkorb-Rückgabe |
| **Authentifizierung** | OAuth 2.0 | Wahl zwischen Basic Auth und OAuth 2.0 |
| **OCI-Version** | 5.0 | Standard: 5.0 |

> **Tipp:** Verwenden Sie OAuth 2.0 für Produktionsumgebungen. Basic Auth eignet sich nur für Test- und Sandbox-Systeme.

---

## Schritt 2: ERP-seitige Konfiguration

In Ihrem SAP-System erstellen Sie eine externe Kataloganbindung mit folgenden Parametern:

```
Katalog-URL:       https://app.procurement-ai.de/oci/catalog
OCI-Version:       5.0
Übergabeparameter: HOOK_URL, OCI_VERSION=5.0, returntarget=_top
Zeichensatz:       UTF-8
```

> **SAP-Hinweis:** In SAP S/4HANA finden Sie die Konfiguration unter **SPRO > Materialwirtschaft > Einkauf > Kataloganb.**. In SAP Business One navigieren Sie zu **Administration > Setup > Procurement**.

---

## Schritt 3: Feldmapping

procurement-ai mappt die Artikeldaten automatisch auf die OCI-Standardfelder. Hier die wichtigsten Zuordnungen:

| OCI-Feld | procurement-ai Feld | Beschreibung |
|---|---|---|
| `NEW_ITEM-DESCRIPTION` | artikelBezeichnung | Artikelname |
| `NEW_ITEM-MATNR` | artikelNummer | Materialnummer |
| `NEW_ITEM-QUANTITY` | menge | Bestellmenge |
| `NEW_ITEM-UNIT` | einheit | Mengeneinheit |
| `NEW_ITEM-PRICE` | einzelpreis | Preis pro Einheit |
| `NEW_ITEM-CURRENCY` | waehrung | Währung (EUR) |
| `NEW_ITEM-VENDORMAT` | lieferantenArtikelNr | Lieferanten-Artikelnr. |
| `NEW_ITEM-VENDOR` | lieferant | Lieferantenname |

> **Eigene Felder:** Über das Admin-Dashboard können Sie bei Bedarf zusätzliche Custom-Feldmappings definieren.

---

## Schritt 4: Verbindung testen

procurement-ai bietet eine vollständige **Sandbox-Umgebung** zum Testen:

1. Wechseln Sie im Admin-Dashboard auf **Modus: Sandbox**
2. Klicken Sie auf **Verbindung testen**
3. Prüfen Sie, ob der Test-Warenkorb korrekt in Ihrem ERP ankommt
4. Validieren Sie die Feldwerte (Preise, Mengen, Artikelnummern)

![Verbindungsübersicht im Admin-Dashboard](/images/screenshots/desktop/admin-verbindungen.webp)

---

## Alternative: cXML Punchout

Für Systeme, die cXML bevorzugen (z.B. Coupa, JAGGAER, Ariba), bietet procurement-ai einen vollständigen cXML Punchout:

| Phase | Beschreibung |
|---|---|
| **Setup-Request** | ERP initiiert die Punchout-Session via cXML |
| **Browse** | Benutzer sucht und wählt Artikel in procurement-ai |
| **Order-Message** | Warenkorb wird als cXML OrderMessage an das ERP zurückgesendet |

> **Vorteil cXML:** Der cXML-Standard bietet mehr Flexibilität bei der Datenübergabe und wird von den meisten modernen Procurement-Suiten nativ unterstützt.

---

## Best Practices

### Sicherheit

- **HTTPS** für alle Verbindungen — unverschlüsselte Verbindungen werden abgelehnt
- **OAuth 2.0** statt Basic Auth in Produktionsumgebungen
- **IP-Whitelisting** in Ihrer Firewall für die procurement-ai Server

### Performance

- **Connection-Pooling** aktivieren für schnellere Warenkorb-Übertragung
- **Timeout** auf mindestens 30 Sekunden konfigurieren
- **Caching** der Katalogdaten nutzen für häufig bestellte Artikel

### Betrieb

- **Monitoring** über das Admin-Dashboard — alle OCI-Transaktionen werden protokolliert
- **Regelmäßige Tests** nach ERP-Updates durchführen
- **Konfiguration dokumentieren** für den Support-Fall

---

## Häufige Probleme und Lösungen

### Warenkorb wird nicht übernommen

- Prüfen Sie die **Callback-URL** — sie muss vom ERP erreichbar sein
- Stellen Sie sicher, dass `returntarget=_top` korrekt gesetzt ist
- Prüfen Sie die **Browser-Konsole** auf JavaScript-Fehler

### Zeichensatz-Probleme (Umlaute)

- Stellen Sie **UTF-8** als Zeichensatz ein — sowohl in procurement-ai als auch im ERP
- Prüfen Sie, ob Umlaute (ä, ö, ü) korrekt übertragen werden
- Bei SAP: Transaktion `SMICM` > HTTP-Zeichensatz prüfen

### Preise stimmen nicht

- Prüfen Sie das Feld `NEW_ITEM-CURRENCY` (muss EUR sein)
- Stellen Sie sicher, dass **Brutto/Netto** korrekt konfiguriert ist
- Rahmenvertragspreise haben Vorrang — prüfen Sie die [Rahmenvertragskonfiguration](/features)

---

## Fazit

Die OCI 5.0 Integration von procurement-ai ermöglicht eine nahtlose Anbindung an Ihr ERP-System — ohne Programmierung, in ca. 30 Minuten eingerichtet. Bei Fragen zur Integration steht Ihnen unser technischer Support gerne zur Verfügung.

**Weiterführende Links:**
- [Alle unterstützten Integrationen](/integrationen)
- [OCI-Integration Produktseite](/oci-integration)
- [Preise und Pakete](/preise)
- [Kontakt aufnehmen](/kontakt)
