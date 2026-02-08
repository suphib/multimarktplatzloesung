---
titel: "OCI 5.0 Integration: Der komplette Leitfaden"
beschreibung: "Schritt-für-Schritt Anleitung zur Integration von procurement-ai in Ihr ERP-System über OCI 5.0 und cXML. Technische Details und Best Practices."
datum: "2026-02-08"
autor: "Thomas Weber"
lesezeit: "8 min"
tags: ["Technik", "OCI", "Integration", "Leitfaden"]
---

Die OCI 5.0 (Open Catalog Interface) Integration ist der Schlüssel zur nahtlosen Anbindung von procurement-ai an Ihr ERP-System. In diesem Leitfaden erklären wir Schritt für Schritt, wie die Integration funktioniert.

## Was ist OCI 5.0?

OCI (Open Catalog Interface) ist ein von SAP entwickelter Standard für die Anbindung externer Kataloge an ERP-Systeme. Version 5.0 bietet gegenüber früheren Versionen erweiterte Funktionen:

- Erweiterte Artikelattribute
- Verbesserte Warenkorb-Übernahme
- Unterstützung für Konfigurationsartikel
- Bessere Fehlerbehandlung

## Voraussetzungen

Bevor Sie mit der Integration beginnen, stellen Sie sicher, dass folgende Voraussetzungen erfüllt sind:

1. **ERP-System** mit OCI 5.0 Unterstützung (SAP S/4HANA, SAP ECC, SAP Business One, etc.)
2. **procurement-ai Account** mit Professional oder Enterprise Plan
3. **Netzwerkverbindung** zwischen Ihrem ERP und procurement-ai (HTTPS)
4. **Administrator-Zugang** zu Ihrem ERP-System

## Schritt 1: OCI-Konfiguration in procurement-ai

Navigieren Sie im Admin-Dashboard zu **Einstellungen > OCI-Konfiguration** und erstellen Sie eine neue OCI-Verbindung:

- **Verbindungsname**: z.B. "SAP S/4HANA Produktion"
- **Callback-URL**: Die URL Ihres ERP-Systems, an die der Warenkorb zurückgesendet wird
- **Authentifizierung**: Wählen Sie zwischen Basic Auth und OAuth 2.0

## Schritt 2: ERP-seitige Konfiguration

In Ihrem SAP-System erstellen Sie eine externe Kataloganbindung:

- **Katalog-URL**: `https://app.procurement-ai.de/oci/catalog`
- **Übergabeparameter**: `HOOK_URL`, `OCI_VERSION=5.0`, `returntarget=_top`
- **Zeichensatz**: UTF-8

## Schritt 3: Feldmapping

procurement-ai mappt die Artikeldaten automatisch auf die OCI-Standardfelder:

| OCI-Feld | procurement-ai Feld | Beschreibung |
|----------|---------------------|--------------|
| NEW_ITEM-DESCRIPTION | artikelBezeichnung | Artikelname |
| NEW_ITEM-MATNR | artikelNummer | Materialnummer |
| NEW_ITEM-QUANTITY | menge | Bestellmenge |
| NEW_ITEM-UNIT | einheit | Mengeneinheit |
| NEW_ITEM-PRICE | einzelpreis | Preis pro Einheit |
| NEW_ITEM-CURRENCY | waehrung | Währung (EUR) |
| NEW_ITEM-VENDORMAT | lieferantenArtikelNr | Lieferanten-Artikelnr. |
| NEW_ITEM-VENDOR | lieferant | Lieferantenname |

## Schritt 4: cXML als Alternative

Für Systeme, die cXML bevorzugen, bietet procurement-ai einen vollständigen cXML Punchout:

- **Setup-Request**: Initiiert die Punchout-Session
- **Browse**: Benutzer navigiert und wählt Artikel
- **Order-Message**: Warenkorb wird als cXML OrderMessage zurückgesendet

## Best Practices

1. **Testen Sie zuerst im Sandbox-Modus** — procurement-ai bietet eine vollständige Testumgebung
2. **Verwenden Sie HTTPS** für alle Verbindungen
3. **Implementieren Sie Fehlerbehandlung** für Netzwerkausfälle
4. **Dokumentieren Sie Ihre Konfiguration** für den Support-Fall

## Häufige Probleme und Lösungen

### Warenkorb wird nicht übernommen
- Prüfen Sie die Callback-URL
- Stellen Sie sicher, dass das Feld `returntarget` korrekt gesetzt ist

### Zeichensatz-Probleme
- Stellen Sie UTF-8 als Zeichensatz ein
- Prüfen Sie, ob Umlaute korrekt übertragen werden

### Preise stimmen nicht
- Prüfen Sie das Währungsfeld (NEW_ITEM-CURRENCY)
- Stellen Sie sicher, dass Brutto/Netto korrekt konfiguriert ist

## Fazit

Die OCI 5.0 Integration von procurement-ai ermöglicht eine nahtlose Anbindung an Ihr ERP-System. Bei Fragen zur Integration steht Ihnen unser technischer Support gerne zur Verfügung.

[Kontakt aufnehmen →](/kontakt)
