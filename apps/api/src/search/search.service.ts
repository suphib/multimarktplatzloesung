import { Injectable, Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { Marktplatz, Artikel, SearchResponse, Aggregationen } from '@procurement/shared';
import { SearchRequestDto } from './dto/search-request.dto';

const MOCK_ARTIKEL: Artikel[] = [
  // ═══════════════════════════════════════════════════════════════
  // LAPTOPS (5)
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'art-001',
    bezeichnung: 'Dell Latitude 5540 Business Laptop',
    beschreibung: '15.6 Zoll, Intel Core i7-1365U, 16GB RAM, 512GB SSD, Windows 11 Pro, Thunderbolt 4, 3 Jahre ProSupport',
    preis: 1189.00,
    waehrung: 'EUR',
    marktplatz: Marktplatz.AMAZON_BUSINESS,
    lieferant: 'Dell Technologies',
    lieferzeit: '3-5 Werktage',
    bildUrl: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400&h=300&fit=crop',
    nachhaltigkeitslabel: ['Energy Star', 'EPEAT Gold'],
    verfuegbar: true,
    artikelnummer: 'DELL-LAT5540-I7',
  },
  {
    id: 'art-002',
    bezeichnung: 'Lenovo ThinkPad T14s Gen 4',
    beschreibung: '14 Zoll, AMD Ryzen 7 PRO 7840U, 16GB RAM, 512GB SSD, Windows 11 Pro, 1.22kg leicht',
    preis: 1299.00,
    waehrung: 'EUR',
    marktplatz: Marktplatz.MERCATEO,
    lieferant: 'Lenovo GmbH',
    lieferzeit: '2-4 Werktage',
    bildUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=300&fit=crop',
    nachhaltigkeitslabel: ['TCO Certified', 'Energy Star'],
    verfuegbar: true,
    artikelnummer: 'LEN-T14S-G4-R7',
  },
  {
    id: 'art-003',
    bezeichnung: 'HP EliteBook 845 G10',
    beschreibung: '14 Zoll, AMD Ryzen 5 PRO 7540U, 16GB RAM, 256GB SSD, Windows 11 Pro, Bang & Olufsen Audio',
    preis: 979.00,
    waehrung: 'EUR',
    marktplatz: Marktplatz.CONRAD,
    lieferant: 'HP Inc.',
    lieferzeit: '5-7 Werktage',
    bildUrl: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=400&h=300&fit=crop',
    nachhaltigkeitslabel: ['Energy Star', 'EPEAT Silver'],
    verfuegbar: true,
    artikelnummer: 'HP-EB845-G10',
  },
  {
    id: 'art-004',
    bezeichnung: 'Apple MacBook Pro 14 Zoll M3 Pro',
    beschreibung: '14.2 Zoll Liquid Retina XDR, M3 Pro Chip, 18GB RAM, 512GB SSD, macOS Sonoma',
    preis: 1999.00,
    waehrung: 'EUR',
    marktplatz: Marktplatz.AMAZON_BUSINESS,
    lieferant: 'Apple Distribution',
    lieferzeit: '1-3 Werktage',
    bildUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=300&fit=crop',
    nachhaltigkeitslabel: ['Energy Star'],
    verfuegbar: true,
    artikelnummer: 'APPLE-MBP14-M3P',
  },
  {
    id: 'art-005',
    bezeichnung: 'Microsoft Surface Laptop 5',
    beschreibung: '13.5 Zoll PixelSense, Intel Core i5-1245U, 8GB RAM, 256GB SSD, Windows 11 Pro',
    preis: 1049.00,
    waehrung: 'EUR',
    marktplatz: Marktplatz.MERCATEO,
    lieferant: 'Microsoft Deutschland',
    lieferzeit: '3-5 Werktage',
    bildUrl: 'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=400&h=300&fit=crop',
    nachhaltigkeitslabel: ['Energy Star', 'EPEAT Gold'],
    verfuegbar: true,
    artikelnummer: 'MS-SL5-I5',
  },

  // ═══════════════════════════════════════════════════════════════
  // MONITORE (3)
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'art-010',
    bezeichnung: 'Dell UltraSharp U2723QE 27 Zoll 4K Monitor',
    beschreibung: '27 Zoll 4K UHD IPS, USB-C Hub mit 90W Power Delivery, 100% sRGB, HDR 400',
    preis: 489.00,
    waehrung: 'EUR',
    marktplatz: Marktplatz.AMAZON_BUSINESS,
    lieferant: 'Dell Technologies',
    lieferzeit: '1-3 Werktage',
    bildUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400&h=300&fit=crop',
    nachhaltigkeitslabel: ['Energy Star', 'TCO Certified'],
    verfuegbar: true,
    artikelnummer: 'DELL-U2723QE',
  },
  {
    id: 'art-011',
    bezeichnung: 'LG 27UK850-W 27 Zoll 4K Monitor',
    beschreibung: '27 Zoll 4K UHD IPS, HDR10, USB-C mit 60W, FreeSync, höhenverstellbar',
    preis: 379.00,
    waehrung: 'EUR',
    marktplatz: Marktplatz.CONRAD,
    lieferant: 'LG Electronics',
    lieferzeit: '2-4 Werktage',
    bildUrl: 'https://images.unsplash.com/photo-1585792180666-f7347c490ee2?w=400&h=300&fit=crop',
    nachhaltigkeitslabel: ['Energy Star'],
    verfuegbar: true,
    artikelnummer: 'LG-27UK850',
  },
  {
    id: 'art-012',
    bezeichnung: 'Samsung Odyssey G5 34 Zoll Curved',
    beschreibung: '34 Zoll WQHD Curved VA, 165Hz, 1ms, HDR10, AMD FreeSync Premium',
    preis: 349.00,
    waehrung: 'EUR',
    marktplatz: Marktplatz.AMAZON_BUSINESS,
    lieferant: 'Samsung Electronics',
    lieferzeit: '2-3 Werktage',
    bildUrl: 'https://images.unsplash.com/photo-1616763355548-1b606f439f86?w=400&h=300&fit=crop',
    nachhaltigkeitslabel: [],
    verfuegbar: true,
    artikelnummer: 'SAM-G5-34',
  },

  // ═══════════════════════════════════════════════════════════════
  // BÜROSTÜHLE (3)
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'art-020',
    bezeichnung: 'Steelcase Leap V2 Bürostuhl',
    beschreibung: 'Ergonomischer Bürostuhl, LiveBack-Technologie, 4D-Armlehnen, Lordosenstütze, schwarz',
    preis: 899.00,
    waehrung: 'EUR',
    marktplatz: Marktplatz.AMAZON_BUSINESS,
    lieferant: 'Steelcase Inc.',
    lieferzeit: '10-14 Werktage',
    bildUrl: 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=400&h=300&fit=crop',
    nachhaltigkeitslabel: ['Blauer Engel'],
    verfuegbar: true,
    artikelnummer: 'SC-LEAP-V2-BK',
  },
  {
    id: 'art-021',
    bezeichnung: 'Herman Miller Aeron Remastered',
    beschreibung: 'Ergonomischer Bürostuhl, 8Z Pellicle Membran, PostureFit SL, Größe B',
    preis: 1399.00,
    waehrung: 'EUR',
    marktplatz: Marktplatz.MERCATEO,
    lieferant: 'Herman Miller',
    lieferzeit: '14-21 Werktage',
    bildUrl: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=400&h=300&fit=crop',
    nachhaltigkeitslabel: ['Blauer Engel', 'GREENGUARD'],
    verfuegbar: true,
    artikelnummer: 'HM-AERON-B',
  },
  {
    id: 'art-022',
    bezeichnung: 'Interstuhl EVERY EV211 Bürostuhl',
    beschreibung: 'Drehstuhl mit Synchronmechanik, Netzrücken, höhenverstellbare Armlehnen',
    preis: 549.00,
    waehrung: 'EUR',
    marktplatz: Marktplatz.CONRAD,
    lieferant: 'Interstuhl GmbH',
    lieferzeit: '5-7 Werktage',
    bildUrl: 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=400&h=300&fit=crop',
    nachhaltigkeitslabel: ['Blauer Engel'],
    verfuegbar: true,
    artikelnummer: 'IS-EV211',
  },

  // ═══════════════════════════════════════════════════════════════
  // SCHREIBTISCHE (2)
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'art-030',
    bezeichnung: 'FlexiSpot E7 Höhenverstellbarer Schreibtisch',
    beschreibung: '160x80cm, elektrisch höhenverstellbar 58-123cm, Memory-Funktion, Kollisionsschutz, weiß',
    preis: 549.00,
    waehrung: 'EUR',
    marktplatz: Marktplatz.AMAZON_BUSINESS,
    lieferant: 'FlexiSpot GmbH',
    lieferzeit: '5-7 Werktage',
    bildUrl: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=400&h=300&fit=crop',
    nachhaltigkeitslabel: [],
    verfuegbar: true,
    artikelnummer: 'FS-E7-160-WH',
  },
  {
    id: 'art-031',
    bezeichnung: 'IKEA BEKANT Schreibtisch 160x80',
    beschreibung: 'Sitz-/Stehschreibtisch elektrisch, weiß, 10 Jahre Garantie',
    preis: 499.00,
    waehrung: 'EUR',
    marktplatz: Marktplatz.MERCATEO,
    lieferant: 'IKEA Deutschland',
    lieferzeit: '7-10 Werktage',
    bildUrl: 'https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?w=400&h=300&fit=crop',
    nachhaltigkeitslabel: ['FSC'],
    verfuegbar: true,
    artikelnummer: 'IKEA-BEKANT-160',
  },

  // ═══════════════════════════════════════════════════════════════
  // DRUCKER (2)
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'art-040',
    bezeichnung: 'HP LaserJet Pro MFP 4102fdw',
    beschreibung: 'Multifunktionsdrucker A4, Duplex, WLAN, 40 Seiten/Min, Fax, ADF',
    preis: 349.00,
    waehrung: 'EUR',
    marktplatz: Marktplatz.CONRAD,
    lieferant: 'HP Inc.',
    lieferzeit: '2-4 Werktage',
    bildUrl: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=400&h=300&fit=crop',
    nachhaltigkeitslabel: ['Blauer Engel', 'Energy Star'],
    verfuegbar: true,
    artikelnummer: 'HP-LJ4102FDW',
  },
  {
    id: 'art-041',
    bezeichnung: 'Brother MFC-L3770CDW Farblaser',
    beschreibung: 'Farblaser-Multifunktionsdrucker, Duplex, WLAN, NFC, 24 Seiten/Min',
    preis: 419.00,
    waehrung: 'EUR',
    marktplatz: Marktplatz.AMAZON_BUSINESS,
    lieferant: 'Brother International',
    lieferzeit: '1-3 Werktage',
    bildUrl: 'https://images.unsplash.com/photo-1563396983906-b3795482a59a?w=400&h=300&fit=crop',
    nachhaltigkeitslabel: ['Blauer Engel'],
    verfuegbar: true,
    artikelnummer: 'BRO-MFCL3770',
  },

  // ═══════════════════════════════════════════════════════════════
  // PERIPHERIE (6)
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'art-050',
    bezeichnung: 'Logitech MX Master 3S Maus',
    beschreibung: 'Kabellose Maus, 8K DPI, leise Klicks, USB-C, Bluetooth, Multi-Device',
    preis: 89.99,
    waehrung: 'EUR',
    marktplatz: Marktplatz.MERCATEO,
    lieferant: 'Logitech Europe S.A.',
    lieferzeit: '1-2 Werktage',
    bildUrl: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=300&fit=crop',
    nachhaltigkeitslabel: [],
    verfuegbar: true,
    artikelnummer: 'LOG-MXM3S',
  },
  {
    id: 'art-051',
    bezeichnung: 'Logitech MX Keys S Tastatur',
    beschreibung: 'Kabellose beleuchtete Tastatur, Smart Actions, USB-C, Bluetooth, Multi-Device',
    preis: 109.00,
    waehrung: 'EUR',
    marktplatz: Marktplatz.AMAZON_BUSINESS,
    lieferant: 'Logitech Europe S.A.',
    lieferzeit: '1-2 Werktage',
    bildUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&h=300&fit=crop',
    nachhaltigkeitslabel: [],
    verfuegbar: true,
    artikelnummer: 'LOG-MXKEYS-S',
  },
  {
    id: 'art-052',
    bezeichnung: 'Jabra Evolve2 75 Headset',
    beschreibung: 'Kabelloses ANC Headset, UC-zertifiziert, 36h Akku, Busylight',
    preis: 279.00,
    waehrung: 'EUR',
    marktplatz: Marktplatz.CONRAD,
    lieferant: 'GN Audio (Jabra)',
    lieferzeit: '2-4 Werktage',
    bildUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop',
    nachhaltigkeitslabel: [],
    verfuegbar: true,
    artikelnummer: 'JAB-EV275-UC',
  },
  {
    id: 'art-053',
    bezeichnung: 'Ergotron LX Monitorarm',
    beschreibung: 'Schwenkbarer Monitorarm für Bildschirme bis 34 Zoll, VESA 100x100, poliertes Aluminium',
    preis: 159.00,
    waehrung: 'EUR',
    marktplatz: Marktplatz.MERCATEO,
    lieferant: 'Ergotron BV',
    lieferzeit: '3-5 Werktage',
    bildUrl: 'https://images.unsplash.com/photo-1547119957-637f8679db1e?w=400&h=300&fit=crop',
    nachhaltigkeitslabel: [],
    verfuegbar: true,
    artikelnummer: 'ERG-LX-ARM',
  },
  {
    id: 'art-054',
    bezeichnung: 'Logitech Rally Bar Videokonferenz',
    beschreibung: 'All-in-One Videobar, 4K Kamera, AI Framing, Beamforming-Mikrofone, USB-C',
    preis: 2899.00,
    waehrung: 'EUR',
    marktplatz: Marktplatz.AMAZON_BUSINESS,
    lieferant: 'Logitech Europe S.A.',
    lieferzeit: '5-7 Werktage',
    bildUrl: 'https://images.unsplash.com/photo-1587825140708-dfaf18c4a170?w=400&h=300&fit=crop',
    nachhaltigkeitslabel: [],
    verfuegbar: true,
    artikelnummer: 'LOG-RALLY-BAR',
  },
  {
    id: 'art-055',
    bezeichnung: 'Logitech Brio 4K Pro Webcam',
    beschreibung: '4K Ultra HD, HDR, Windows Hello, 5x Zoom, Dual-Mikrofon, USB-C',
    preis: 179.00,
    waehrung: 'EUR',
    marktplatz: Marktplatz.AMAZON_BUSINESS,
    lieferant: 'Logitech Europe S.A.',
    lieferzeit: '1-2 Werktage',
    bildUrl: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&h=300&fit=crop',
    nachhaltigkeitslabel: [],
    verfuegbar: true,
    artikelnummer: 'LOG-BRIO4K',
  },

  // ═══════════════════════════════════════════════════════════════
  // BÜROBEDARF (3)
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'art-060',
    bezeichnung: 'Kopierpapier Navigator Universal A4 80g',
    beschreibung: '2500 Blatt (5×500), weiß, FSC-zertifiziert, ColorLok-Technologie',
    preis: 29.90,
    waehrung: 'EUR',
    marktplatz: Marktplatz.MERCATEO,
    lieferant: 'The Navigator Company',
    lieferzeit: '1-2 Werktage',
    bildUrl: 'https://images.unsplash.com/photo-1568205612837-017257d2310a?w=400&h=300&fit=crop',
    nachhaltigkeitslabel: ['FSC', 'EU Ecolabel'],
    verfuegbar: true,
    artikelnummer: 'NAV-UNI-A4-80',
  },
  {
    id: 'art-061',
    bezeichnung: 'Leitz Ordner 1010 breit A4 10er Pack',
    beschreibung: '80mm Rückenbreite, Wolkenmarmor, Hebelmechanik, Griffloch',
    preis: 24.90,
    waehrung: 'EUR',
    marktplatz: Marktplatz.AMAZON_BUSINESS,
    lieferant: 'Esselte Leitz GmbH',
    lieferzeit: '1-2 Werktage',
    bildUrl: 'https://images.unsplash.com/photo-1586281380117-5a60ae2050cc?w=400&h=300&fit=crop',
    nachhaltigkeitslabel: ['Blauer Engel'],
    verfuegbar: true,
    artikelnummer: 'LEITZ-1010-10',
  },
  {
    id: 'art-062',
    bezeichnung: 'Post-it Super Sticky Notes Sortiment',
    beschreibung: '12 Blöcke, 76×76mm, verschiedene Neonfarben, 90 Blatt pro Block',
    preis: 18.50,
    waehrung: 'EUR',
    marktplatz: Marktplatz.CONRAD,
    lieferant: '3M Deutschland',
    lieferzeit: '1-2 Werktage',
    bildUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=400&h=300&fit=crop',
    nachhaltigkeitslabel: [],
    verfuegbar: true,
    artikelnummer: '3M-POSTIT-SS12',
  },

  // ═══════════════════════════════════════════════════════════════
  // DESKTOP PCs (2)
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'art-070',
    bezeichnung: 'Dell OptiPlex 7010 Micro Desktop',
    beschreibung: 'Intel Core i5-13500T, 16GB RAM, 512GB SSD, WiFi 6E, Windows 11 Pro, ultrakompakt',
    preis: 789.00,
    waehrung: 'EUR',
    marktplatz: Marktplatz.AMAZON_BUSINESS,
    lieferant: 'Dell Technologies',
    lieferzeit: '3-5 Werktage',
    bildUrl: 'https://images.unsplash.com/photo-1593062096033-9a26b09da705?w=400&h=300&fit=crop',
    nachhaltigkeitslabel: ['Energy Star', 'EPEAT Gold'],
    verfuegbar: true,
    artikelnummer: 'DELL-OPT7010-M',
  },
  {
    id: 'art-071',
    bezeichnung: 'Lenovo ThinkCentre M75q Gen 2 Tiny',
    beschreibung: 'AMD Ryzen 5 PRO 5650GE, 16GB RAM, 256GB SSD, WiFi 6, Windows 11 Pro',
    preis: 649.00,
    waehrung: 'EUR',
    marktplatz: Marktplatz.MERCATEO,
    lieferant: 'Lenovo GmbH',
    lieferzeit: '5-7 Werktage',
    bildUrl: 'https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=400&h=300&fit=crop',
    nachhaltigkeitslabel: ['Energy Star', 'TCO Certified'],
    verfuegbar: true,
    artikelnummer: 'LEN-M75Q-G2',
  },

  // ═══════════════════════════════════════════════════════════════
  // LABORBEDARF (6) — DLR-relevant
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'art-100',
    bezeichnung: 'Salzsäure 37% p.a. 2,5L Glasflasche',
    beschreibung: 'HCl, ACS Reagenzienqualität, für analytische Zwecke, Gefahrstoffklasse 8, UN 1789',
    preis: 28.50,
    waehrung: 'EUR',
    marktplatz: Marktplatz.MERCATEO,
    lieferant: 'Carl Roth GmbH + Co. KG',
    lieferzeit: '2-3 Werktage',
    bildUrl: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=400&h=300&fit=crop',
    nachhaltigkeitslabel: [],
    verfuegbar: true,
    artikelnummer: 'ROTH-HCL37-25',
  },
  {
    id: 'art-101',
    bezeichnung: 'Eppendorf Research Plus Pipette 100-1000µL',
    beschreibung: 'Einkanal-Pipette, variabel, autoklavierbar, mit Kalibrierschein, ergonomischer Griff',
    preis: 289.00,
    waehrung: 'EUR',
    marktplatz: Marktplatz.AMAZON_BUSINESS,
    lieferant: 'Eppendorf SE',
    lieferzeit: '3-5 Werktage',
    bildUrl: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=400&h=300&fit=crop',
    nachhaltigkeitslabel: [],
    verfuegbar: true,
    artikelnummer: 'EPP-RP-1000',
  },
  {
    id: 'art-102',
    bezeichnung: 'Uvex pheos Schutzbrille farblos',
    beschreibung: 'Beschlagfrei, kratzfest, UV400 Schutz, EN 166, Laboranwendung, ergonomische Bügel',
    preis: 8.95,
    waehrung: 'EUR',
    marktplatz: Marktplatz.CONRAD,
    lieferant: 'uvex safety group',
    lieferzeit: '1-2 Werktage',
    bildUrl: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=400&h=300&fit=crop',
    nachhaltigkeitslabel: [],
    verfuegbar: true,
    artikelnummer: 'UVEX-PHEOS-CLR',
  },
  {
    id: 'art-103',
    bezeichnung: 'Sartorius Analysenwaage Quintix 224-1S',
    beschreibung: 'Wägebereich 220g, Ablesbarkeit 0,1mg, isoCAL Integrierte Justierung, GLP-konform',
    preis: 3849.00,
    waehrung: 'EUR',
    marktplatz: Marktplatz.MERCATEO,
    lieferant: 'Sartorius AG',
    lieferzeit: '7-10 Werktage',
    bildUrl: 'https://images.unsplash.com/photo-1581093458791-9f3c3250a8b0?w=400&h=300&fit=crop',
    nachhaltigkeitslabel: [],
    verfuegbar: true,
    artikelnummer: 'SART-Q224-1S',
  },
  {
    id: 'art-104',
    bezeichnung: 'Nitrilhandschuhe puderfrei Gr. M, 200 Stück',
    beschreibung: 'Einweghandschuhe blau, EN 374, Lebensmittelkontakt, latexfrei, 0,1mm Stärke',
    preis: 14.90,
    waehrung: 'EUR',
    marktplatz: Marktplatz.AMAZON_BUSINESS,
    lieferant: 'Sempermed GmbH',
    lieferzeit: '1-2 Werktage',
    bildUrl: 'https://images.unsplash.com/photo-1584483766114-2cea6facdf57?w=400&h=300&fit=crop',
    nachhaltigkeitslabel: [],
    verfuegbar: true,
    artikelnummer: 'SEMP-NITRIL-M200',
  },
  {
    id: 'art-105',
    bezeichnung: 'Isopropanol 99,9% 2,5L Laborqualität',
    beschreibung: 'IPA, Reinheitsgrad p.a., Reinraumanwendung, Flammpunkt 12°C, UN 1219',
    preis: 19.80,
    waehrung: 'EUR',
    marktplatz: Marktplatz.CONRAD,
    lieferant: 'VWR International GmbH',
    lieferzeit: '2-3 Werktage',
    bildUrl: 'https://images.unsplash.com/photo-1616711906333-23cf7b666ca5?w=400&h=300&fit=crop',
    nachhaltigkeitslabel: [],
    verfuegbar: true,
    artikelnummer: 'VWR-IPA999-25',
  },

  // ═══════════════════════════════════════════════════════════════
  // MESSTECHNIK & SPEZIAL-IT (4) — DLR-relevant
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'art-110',
    bezeichnung: 'Keysight 34465A Digitalmultimeter 6½ Stellen',
    beschreibung: 'Tisch-Multimeter, 0,0035% DC Genauigkeit, USB/LAN/GPIB, TrueVolt-Technologie',
    preis: 1189.00,
    waehrung: 'EUR',
    marktplatz: Marktplatz.CONRAD,
    lieferant: 'Keysight Technologies',
    lieferzeit: '5-7 Werktage',
    bildUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400&h=300&fit=crop',
    nachhaltigkeitslabel: [],
    verfuegbar: true,
    artikelnummer: 'KS-34465A',
  },
  {
    id: 'art-111',
    bezeichnung: 'NVIDIA A100 80GB PCIe GPU',
    beschreibung: 'Tensor-Core GPU für KI-Training & HPC, 80GB HBM2e, PCIe Gen4, NVLink',
    preis: 12499.00,
    waehrung: 'EUR',
    marktplatz: Marktplatz.AMAZON_BUSINESS,
    lieferant: 'NVIDIA Deutschland',
    lieferzeit: '14-21 Werktage',
    bildUrl: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=400&h=300&fit=crop',
    nachhaltigkeitslabel: ['Energy Star'],
    verfuegbar: true,
    artikelnummer: 'NV-A100-80G',
  },
  {
    id: 'art-112',
    bezeichnung: 'Raspberry Pi 5 8GB Starter Kit',
    beschreibung: 'BCM2712, 8GB LPDDR4X, USB-C Netzteil, Gehäuse, Kühlkörper, 32GB microSD',
    preis: 119.00,
    waehrung: 'EUR',
    marktplatz: Marktplatz.MERCATEO,
    lieferant: 'Raspberry Pi Ltd.',
    lieferzeit: '2-4 Werktage',
    bildUrl: 'https://images.unsplash.com/photo-1629292176988-4cc0d23213f0?w=400&h=300&fit=crop',
    nachhaltigkeitslabel: [],
    verfuegbar: true,
    artikelnummer: 'RPI5-8G-KIT',
  },
  {
    id: 'art-113',
    bezeichnung: 'Synology DiskStation DS1621+ NAS',
    beschreibung: '6-Bay NAS, AMD Ryzen V1500B, 4GB ECC RAM, 2× M.2 Cache, 4× 1GbE, erweiterbar auf 10GbE',
    preis: 899.00,
    waehrung: 'EUR',
    marktplatz: Marktplatz.CONRAD,
    lieferant: 'Synology GmbH',
    lieferzeit: '3-5 Werktage',
    bildUrl: 'https://images.unsplash.com/photo-1597852074816-d933c7d2b988?w=400&h=300&fit=crop',
    nachhaltigkeitslabel: ['Energy Star'],
    verfuegbar: true,
    artikelnummer: 'SYN-DS1621P',
  },
];

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);

  async search(dto: SearchRequestDto): Promise<SearchResponse> {
    const suchbegriff = dto.suchbegriff.toLowerCase();
    const marktplaetze = dto.marktplaetze ?? [Marktplatz.AMAZON_BUSINESS, Marktplatz.MERCATEO, Marktplatz.CONRAD];

    let ergebnisse = MOCK_ARTIKEL.filter((a) => {
      const textMatch =
        a.bezeichnung.toLowerCase().includes(suchbegriff) ||
        a.beschreibung.toLowerCase().includes(suchbegriff);
      const marktplatzMatch = marktplaetze.includes(a.marktplatz);
      return textMatch && marktplatzMatch;
    });

    if (dto.preisVon !== undefined) {
      ergebnisse = ergebnisse.filter((a) => a.preis >= dto.preisVon!);
    }
    if (dto.preisBis !== undefined) {
      ergebnisse = ergebnisse.filter((a) => a.preis <= dto.preisBis!);
    }
    if (dto.nurNachhaltig) {
      ergebnisse = ergebnisse.filter((a) => a.nachhaltigkeitslabel.length > 0);
    }

    // Fuzzy: wenn keine exakten Treffer
    if (ergebnisse.length === 0) {
      const worte = suchbegriff.split(/\s+/);
      ergebnisse = MOCK_ARTIKEL.filter((a) => {
        const text = (a.bezeichnung + ' ' + a.beschreibung).toLowerCase();
        return worte.some((w) => text.includes(w)) && marktplaetze.includes(a.marktplatz);
      });
    }

    const seite = dto.seite ?? 1;
    const proSeite = dto.proSeite ?? 20;
    const gesamt = ergebnisse.length;
    const paginiert = ergebnisse.slice((seite - 1) * proSeite, seite * proSeite);

    return {
      ergebnisse: paginiert,
      gesamt,
      seite,
      proSeite,
      aggregationen: this.berechneAggregationen(ergebnisse),
    };
  }

  private berechneAggregationen(ergebnisse: Artikel[]): Aggregationen {
    const marktplatzMap = new Map<Marktplatz, number>();
    ergebnisse.forEach((a) => {
      marktplatzMap.set(a.marktplatz, (marktplatzMap.get(a.marktplatz) ?? 0) + 1);
    });

    const preisbereiche = [
      { von: 0, bis: 50, anzahl: 0 },
      { von: 50, bis: 200, anzahl: 0 },
      { von: 200, bis: 500, anzahl: 0 },
      { von: 500, bis: 1000, anzahl: 0 },
      { von: 1000, bis: 2000, anzahl: 0 },
      { von: 2000, bis: 15000, anzahl: 0 },
    ];
    ergebnisse.forEach((a) => {
      const b = preisbereiche.find((p) => a.preis >= p.von && a.preis < p.bis);
      if (b) b.anzahl++;
    });

    const katMap = new Map<string, number>();
    ergebnisse.forEach((a) => {
      let kat = 'Sonstiges';
      const lower = a.bezeichnung.toLowerCase();
      if (lower.includes('laptop') || lower.includes('notebook') || lower.includes('macbook') || lower.includes('surface')) kat = 'Laptops';
      else if (lower.includes('monitor') || lower.includes('bildschirm')) kat = 'Monitore';
      else if (lower.includes('stuhl') || lower.includes('aeron')) kat = 'Bürostühle';
      else if (lower.includes('schreibtisch') || lower.includes('bekant')) kat = 'Schreibtische';
      else if (lower.includes('drucker') || lower.includes('laser') || lower.includes('mfc')) kat = 'Drucker';
      else if (lower.includes('desktop') || lower.includes('optiplex') || lower.includes('thinkcentre')) kat = 'Desktop PCs';
      else if (lower.includes('maus') || lower.includes('tastatur') || lower.includes('headset') || lower.includes('webcam') || lower.includes('dock') || lower.includes('arm') || lower.includes('rally')) kat = 'Peripherie';
      else if (lower.includes('papier') || lower.includes('ordner') || lower.includes('post-it')) kat = 'Bürobedarf';
      else if (lower.includes('säure') || lower.includes('pipette') || lower.includes('schutzbrille') || lower.includes('waage') || lower.includes('handschuh') || lower.includes('isopropanol')) kat = 'Laborbedarf';
      else if (lower.includes('multimeter') || lower.includes('gpu') || lower.includes('raspberry') || lower.includes('nas') || lower.includes('nvidia')) kat = 'Messtechnik & Spezial-IT';
      katMap.set(kat, (katMap.get(kat) ?? 0) + 1);
    });

    return {
      marktplaetze: Array.from(marktplatzMap.entries()).map(([marktplatz, anzahl]) => ({ marktplatz, anzahl })),
      preisbereiche: preisbereiche.filter((p) => p.anzahl > 0),
      kategorien: Array.from(katMap.entries()).map(([bezeichnung, anzahl]) => ({ bezeichnung, anzahl })),
    };
  }
}
