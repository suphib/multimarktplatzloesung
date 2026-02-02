import { Injectable, Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { Marktplatz, Artikel, SearchResponse, Aggregationen } from '@procurement/shared';
import { SearchRequestDto } from './dto/search-request.dto';

/** Mock-Daten für Marktplatz-Adapter */
const MOCK_ARTIKEL: Artikel[] = [
  {
    id: uuidv4(),
    bezeichnung: 'Dell Latitude 5540 Business Laptop',
    beschreibung: '15.6 Zoll, Intel Core i7-1365U, 16GB RAM, 512GB SSD, Windows 11 Pro',
    preis: 1189.00,
    waehrung: 'EUR',
    marktplatz: Marktplatz.AMAZON_BUSINESS,
    lieferant: 'Dell Technologies',
    lieferzeit: '3-5 Werktage',
    bildUrl: 'https://placehold.co/400x300?text=Dell+Latitude+5540',
    nachhaltigkeitslabel: ['Energy Star', 'EPEAT Gold'],
    verfuegbar: true,
    artikelnummer: 'DELL-LAT5540-I7',
  },
  {
    id: uuidv4(),
    bezeichnung: 'Lenovo ThinkPad T14s Gen 4',
    beschreibung: '14 Zoll, AMD Ryzen 7 PRO 7840U, 16GB RAM, 512GB SSD, Windows 11 Pro',
    preis: 1299.00,
    waehrung: 'EUR',
    marktplatz: Marktplatz.MERCATEO,
    lieferant: 'Lenovo GmbH',
    lieferzeit: '2-4 Werktage',
    bildUrl: 'https://placehold.co/400x300?text=ThinkPad+T14s',
    nachhaltigkeitslabel: ['TCO Certified', 'Energy Star'],
    verfuegbar: true,
    artikelnummer: 'LEN-T14S-G4-R7',
  },
  {
    id: uuidv4(),
    bezeichnung: 'HP EliteBook 845 G10',
    beschreibung: '14 Zoll, AMD Ryzen 5 PRO 7540U, 16GB RAM, 256GB SSD, Windows 11 Pro',
    preis: 979.00,
    waehrung: 'EUR',
    marktplatz: Marktplatz.CONRAD,
    lieferant: 'HP Inc.',
    lieferzeit: '5-7 Werktage',
    bildUrl: 'https://placehold.co/400x300?text=HP+EliteBook+845',
    nachhaltigkeitslabel: ['Energy Star', 'EPEAT Silver'],
    verfuegbar: true,
    artikelnummer: 'HP-EB845-G10',
  },
  {
    id: uuidv4(),
    bezeichnung: 'Dell UltraSharp U2723QE Monitor 27 Zoll',
    beschreibung: '27 Zoll 4K UHD, IPS, USB-C Hub, 90W Power Delivery',
    preis: 489.00,
    waehrung: 'EUR',
    marktplatz: Marktplatz.AMAZON_BUSINESS,
    lieferant: 'Dell Technologies',
    lieferzeit: '1-3 Werktage',
    bildUrl: 'https://placehold.co/400x300?text=Dell+U2723QE',
    nachhaltigkeitslabel: ['Energy Star', 'TCO Certified'],
    verfuegbar: true,
    artikelnummer: 'DELL-U2723QE',
  },
  {
    id: uuidv4(),
    bezeichnung: 'Ergotron LX Monitorarm',
    beschreibung: 'Schwenkbarer Monitorarm für Bildschirme bis 34 Zoll, VESA 100x100',
    preis: 159.00,
    waehrung: 'EUR',
    marktplatz: Marktplatz.MERCATEO,
    lieferant: 'Ergotron BV',
    lieferzeit: '3-5 Werktage',
    bildUrl: 'https://placehold.co/400x300?text=Ergotron+LX',
    nachhaltigkeitslabel: [],
    verfuegbar: true,
    artikelnummer: 'ERG-LX-ARM',
  },
  {
    id: uuidv4(),
    bezeichnung: 'Steelcase Leap V2 Bürostuhl',
    beschreibung: 'Ergonomischer Bürostuhl, LiveBack-Technologie, 4D-Armlehnen, schwarz',
    preis: 899.00,
    waehrung: 'EUR',
    marktplatz: Marktplatz.AMAZON_BUSINESS,
    lieferant: 'Steelcase Inc.',
    lieferzeit: '10-14 Werktage',
    bildUrl: 'https://placehold.co/400x300?text=Steelcase+Leap',
    nachhaltigkeitslabel: ['Blauer Engel'],
    verfuegbar: true,
    artikelnummer: 'SC-LEAP-V2-BK',
  },
  {
    id: uuidv4(),
    bezeichnung: 'HP LaserJet Pro MFP 4102fdw',
    beschreibung: 'Multifunktionsdrucker, A4, Duplex, WLAN, 40 Seiten/Min',
    preis: 349.00,
    waehrung: 'EUR',
    marktplatz: Marktplatz.CONRAD,
    lieferant: 'HP Inc.',
    lieferzeit: '2-4 Werktage',
    bildUrl: 'https://placehold.co/400x300?text=HP+LaserJet+Pro',
    nachhaltigkeitslabel: ['Blauer Engel', 'Energy Star'],
    verfuegbar: true,
    artikelnummer: 'HP-LJ4102FDW',
  },
  {
    id: uuidv4(),
    bezeichnung: 'Logitech MX Master 3S Maus',
    beschreibung: 'Kabellose Maus, 8K DPI, leise Klicks, USB-C, Bluetooth',
    preis: 89.99,
    waehrung: 'EUR',
    marktplatz: Marktplatz.MERCATEO,
    lieferant: 'Logitech Europe S.A.',
    lieferzeit: '1-2 Werktage',
    bildUrl: 'https://placehold.co/400x300?text=MX+Master+3S',
    nachhaltigkeitslabel: [],
    verfuegbar: true,
    artikelnummer: 'LOG-MXM3S',
  },
  {
    id: uuidv4(),
    bezeichnung: 'Höhenverstellbarer Schreibtisch FlexiSpot E7',
    beschreibung: '140x70cm, elektrisch höhenverstellbar, Memory-Funktion, weiß',
    preis: 549.00,
    waehrung: 'EUR',
    marktplatz: Marktplatz.AMAZON_BUSINESS,
    lieferant: 'FlexiSpot GmbH',
    lieferzeit: '5-7 Werktage',
    bildUrl: 'https://placehold.co/400x300?text=FlexiSpot+E7',
    nachhaltigkeitslabel: [],
    verfuegbar: true,
    artikelnummer: 'FS-E7-140-WH',
  },
  {
    id: uuidv4(),
    bezeichnung: 'Kopierpapier Navigator Universal A4 80g',
    beschreibung: '2500 Blatt (5x500), weiß, FSC-zertifiziert',
    preis: 29.90,
    waehrung: 'EUR',
    marktplatz: Marktplatz.MERCATEO,
    lieferant: 'The Navigator Company',
    lieferzeit: '1-2 Werktage',
    bildUrl: 'https://placehold.co/400x300?text=Navigator+Papier',
    nachhaltigkeitslabel: ['FSC', 'EU Ecolabel'],
    verfuegbar: true,
    artikelnummer: 'NAV-UNI-A4-80',
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

    // Preisfilter
    if (dto.preisVon !== undefined) {
      ergebnisse = ergebnisse.filter((a) => a.preis >= dto.preisVon!);
    }
    if (dto.preisBis !== undefined) {
      ergebnisse = ergebnisse.filter((a) => a.preis <= dto.preisBis!);
    }

    // Nachhaltigkeitsfilter
    if (dto.nurNachhaltig) {
      ergebnisse = ergebnisse.filter((a) => a.nachhaltigkeitslabel.length > 0);
    }

    // Wenn keine exakte Treffer, fuzzy-Suche simulieren
    if (ergebnisse.length === 0) {
      const worte = suchbegriff.split(/\s+/);
      ergebnisse = MOCK_ARTIKEL.filter((a) => {
        const text = `${a.bezeichnung} ${a.beschreibung}`.toLowerCase();
        return worte.some((w) => text.includes(w)) && marktplaetze.includes(a.marktplatz);
      });
    }

    // Pagination
    const seite = dto.seite ?? 1;
    const proSeite = dto.proSeite ?? 20;
    const gesamt = ergebnisse.length;
    const paginiert = ergebnisse.slice((seite - 1) * proSeite, seite * proSeite);

    // Aggregationen berechnen
    const aggregationen = this.berechneAggregationen(ergebnisse);

    return {
      ergebnisse: paginiert,
      gesamt,
      seite,
      proSeite,
      aggregationen,
    };
  }

  private berechneAggregationen(ergebnisse: Artikel[]): Aggregationen {
    // Marktplatz-Aggregation
    const marktplatzMap = new Map<Marktplatz, number>();
    ergebnisse.forEach((a) => {
      marktplatzMap.set(a.marktplatz, (marktplatzMap.get(a.marktplatz) ?? 0) + 1);
    });
    const marktplaetze = Array.from(marktplatzMap.entries()).map(([marktplatz, anzahl]) => ({
      marktplatz,
      anzahl,
    }));

    // Preisbereich-Aggregation
    const preisbereiche = [
      { von: 0, bis: 100, anzahl: 0 },
      { von: 100, bis: 500, anzahl: 0 },
      { von: 500, bis: 1000, anzahl: 0 },
      { von: 1000, bis: 5000, anzahl: 0 },
    ];
    ergebnisse.forEach((a) => {
      const bereich = preisbereiche.find((p) => a.preis >= p.von && a.preis < p.bis);
      if (bereich) bereich.anzahl++;
    });

    return {
      marktplaetze,
      preisbereiche: preisbereiche.filter((p) => p.anzahl > 0),
      kategorien: [],
    };
  }
}
