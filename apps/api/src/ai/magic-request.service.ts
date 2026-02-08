import { Injectable, Logger } from '@nestjs/common';
import { MagicRequestAiService } from './magic-request-ai.service';
import type { MagicRequestItem, MagicRequestResponse } from '@procurement/shared';

@Injectable()
export class MagicRequestService {
  private readonly logger = new Logger(MagicRequestService.name);

  constructor(private readonly aiService: MagicRequestAiService) {}

  async parse(freitext: string): Promise<MagicRequestResponse> {
    const start = Date.now();
    let positionen: MagicRequestItem[];
    let zusammenfassung: string;
    let methode: 'ki' | 'regelbasiert';

    try {
      const result = await this.aiService.parse(freitext);
      positionen = result.positionen;
      zusammenfassung = result.zusammenfassung;
      methode = 'ki';
    } catch (error) {
      this.logger.warn('KI-Analyse fehlgeschlagen, nutze regelbasiertes Parsing', error);
      const result = this.regelbasiertesParsen(freitext);
      positionen = result.positionen;
      zusammenfassung = result.zusammenfassung;
      methode = 'regelbasiert';
    }

    return {
      positionen,
      zusammenfassung,
      verarbeitungszeit: Date.now() - start,
      methode,
    };
  }

  regelbasiertesParsen(freitext: string): { positionen: MagicRequestItem[]; zusammenfassung: string } {
    const positionen: MagicRequestItem[] = [];

    // Split text into segments
    const segmente = freitext
      .split(/[\n;]/)
      .flatMap((s) => s.split(/\s*(?:,\s+und\s+|\s+und\s+|,\s+)\s*/i))
      .flatMap((s) => s.split(/^\s*[-–•]\s*/m))
      .map((s) => s.trim())
      .filter((s) => s.length > 2);

    for (const segment of segmente) {
      const item = this.parseSegment(segment);
      if (item) {
        positionen.push(item);
      }
    }

    const zusammenfassung = positionen.length > 0
      ? `${positionen.length} Position${positionen.length !== 1 ? 'en' : ''} erkannt (regelbasiert)`
      : 'Keine Bestellpositionen erkannt';

    return { positionen, zusammenfassung };
  }

  private normalizeText(text: string): string {
    // Insert space between digits and letters: "5laptos" → "5 laptos"
    return text.replace(/(\d)([a-zäöüß])/gi, '$1 $2').replace(/([a-zäöüß])(\d)/gi, '$1 $2');
  }

  private parseSegment(segment: string): MagicRequestItem | null {
    const normalized = this.normalizeText(segment);
    const lower = normalized.toLowerCase();

    // Extract quantity
    const mengeMatch = normalized.match(/(\d+)\s*/);
    const wortMengeMatch = lower.match(/\b(ein|eine|zwei|drei|vier|fünf|sechs|sieben|acht|neun|zehn|je\s+\d+)\b/);
    let menge = 1;
    if (mengeMatch) {
      menge = parseInt(mengeMatch[1], 10);
    } else if (wortMengeMatch) {
      const wortZahl: Record<string, number> = {
        ein: 1, eine: 1, zwei: 2, drei: 3, vier: 4, fünf: 5,
        sechs: 6, sieben: 7, acht: 8, neun: 9, zehn: 10,
      };
      const wort = wortMengeMatch[1];
      if (wort.startsWith('je ')) {
        menge = parseInt(wort.replace('je ', ''), 10);
      } else {
        menge = wortZahl[wort] ?? 1;
      }
    }

    // Product keywords (includes plurals and common typos)
    const produktKeywords: Record<string, { beschreibung: string; kategorie: string }> = {
      laptop: { beschreibung: 'Laptop', kategorie: 'IT-Hardware' },
      laptops: { beschreibung: 'Laptop', kategorie: 'IT-Hardware' },
      laptos: { beschreibung: 'Laptop', kategorie: 'IT-Hardware' },
      lapto: { beschreibung: 'Laptop', kategorie: 'IT-Hardware' },
      notebook: { beschreibung: 'Notebook', kategorie: 'IT-Hardware' },
      notebooks: { beschreibung: 'Notebook', kategorie: 'IT-Hardware' },
      computer: { beschreibung: 'Computer', kategorie: 'IT-Hardware' },
      pc: { beschreibung: 'Desktop PC', kategorie: 'IT-Hardware' },
      monitor: { beschreibung: 'Monitor', kategorie: 'IT-Hardware' },
      monitore: { beschreibung: 'Monitor', kategorie: 'IT-Hardware' },
      bildschirm: { beschreibung: 'Bildschirm', kategorie: 'IT-Hardware' },
      bildschirme: { beschreibung: 'Bildschirm', kategorie: 'IT-Hardware' },
      drucker: { beschreibung: 'Drucker', kategorie: 'IT-Hardware' },
      printer: { beschreibung: 'Drucker', kategorie: 'IT-Hardware' },
      tastatur: { beschreibung: 'Tastatur', kategorie: 'IT-Hardware' },
      tastaturen: { beschreibung: 'Tastatur', kategorie: 'IT-Hardware' },
      keyboard: { beschreibung: 'Tastatur', kategorie: 'IT-Hardware' },
      maus: { beschreibung: 'Maus', kategorie: 'IT-Hardware' },
      'mäuse': { beschreibung: 'Maus', kategorie: 'IT-Hardware' },
      headset: { beschreibung: 'Headset', kategorie: 'IT-Hardware' },
      headsets: { beschreibung: 'Headset', kategorie: 'IT-Hardware' },
      webcam: { beschreibung: 'Webcam', kategorie: 'IT-Hardware' },
      webcams: { beschreibung: 'Webcam', kategorie: 'IT-Hardware' },
      dockingstation: { beschreibung: 'Dockingstation', kategorie: 'IT-Hardware' },
      docking: { beschreibung: 'Dockingstation', kategorie: 'IT-Hardware' },
      server: { beschreibung: 'Server', kategorie: 'IT-Hardware' },
      switch: { beschreibung: 'Netzwerk-Switch', kategorie: 'IT-Hardware' },
      router: { beschreibung: 'Router', kategorie: 'IT-Hardware' },
      gpu: { beschreibung: 'Grafikkarte', kategorie: 'IT-Hardware' },
      stuhl: { beschreibung: 'Bürostuhl', kategorie: 'Büromöbel' },
      'stühle': { beschreibung: 'Bürostuhl', kategorie: 'Büromöbel' },
      schreibtisch: { beschreibung: 'Schreibtisch', kategorie: 'Büromöbel' },
      schreibtische: { beschreibung: 'Schreibtisch', kategorie: 'Büromöbel' },
      regal: { beschreibung: 'Regal', kategorie: 'Büromöbel' },
      regale: { beschreibung: 'Regal', kategorie: 'Büromöbel' },
      schrank: { beschreibung: 'Schrank', kategorie: 'Büromöbel' },
      'schränke': { beschreibung: 'Schrank', kategorie: 'Büromöbel' },
      papier: { beschreibung: 'Kopierpapier', kategorie: 'Bürobedarf' },
      kopierpapier: { beschreibung: 'Kopierpapier', kategorie: 'Bürobedarf' },
      ordner: { beschreibung: 'Ordner', kategorie: 'Bürobedarf' },
      kugelschreiber: { beschreibung: 'Kugelschreiber', kategorie: 'Bürobedarf' },
      stift: { beschreibung: 'Stift', kategorie: 'Bürobedarf' },
      stifte: { beschreibung: 'Stift', kategorie: 'Bürobedarf' },
      toner: { beschreibung: 'Toner', kategorie: 'Bürobedarf' },
      pipette: { beschreibung: 'Pipette', kategorie: 'Laborbedarf' },
      pipetten: { beschreibung: 'Pipette', kategorie: 'Laborbedarf' },
      schutzbrille: { beschreibung: 'Schutzbrille', kategorie: 'Laborbedarf' },
      schutzbrillen: { beschreibung: 'Schutzbrille', kategorie: 'Laborbedarf' },
      handschuh: { beschreibung: 'Handschuhe', kategorie: 'Laborbedarf' },
      handschuhe: { beschreibung: 'Handschuhe', kategorie: 'Laborbedarf' },
      waage: { beschreibung: 'Waage', kategorie: 'Laborbedarf' },
      waagen: { beschreibung: 'Waage', kategorie: 'Laborbedarf' },
    };

    // Brand names
    const markenNamen: Record<string, string> = {
      dell: 'Dell', lenovo: 'Lenovo', hp: 'HP', samsung: 'Samsung',
      lg: 'LG', logitech: 'Logitech', apple: 'Apple', eppendorf: 'Eppendorf',
      sartorius: 'Sartorius', brother: 'Brother', jabra: 'Jabra',
      microsoft: 'Microsoft', steelcase: 'Steelcase', sedus: 'Sedus',
      canon: 'Canon', epson: 'Epson', asus: 'ASUS', acer: 'Acer',
    };

    // Find matching product — split into words for matching
    const words = lower.split(/\s+/);
    let beschreibung: string | null = null;
    let kategorie = 'Sonstiges';

    for (const [keyword, info] of Object.entries(produktKeywords)) {
      if (words.some((w) => w === keyword || w.includes(keyword))) {
        beschreibung = info.beschreibung;
        kategorie = info.kategorie;
        break;
      }
    }

    if (!beschreibung) {
      return null;
    }

    // Find brand
    let lieferantHinweis = '';
    for (const [marke, name] of Object.entries(markenNamen)) {
      if (words.some((w) => w === marke || w.includes(marke))) {
        lieferantHinweis = name;
        beschreibung = `${name} ${beschreibung}`;
        break;
      }
    }

    // Enrich description with extra context (e.g. "mit 16gb arbeitsspeicher")
    const mitMatch = normalized.match(/\bmit\s+(.+)/i);
    if (mitMatch) {
      beschreibung = `${beschreibung} (${mitMatch[1].trim()})`;
    }

    // Extract price
    let geschaetzterPreis: number | null = null;
    const preisMatch = normalized.match(/(\d+[.,]?\d*)\s*(?:€|EUR|Euro)/i);
    if (preisMatch) {
      geschaetzterPreis = parseFloat(preisMatch[1].replace(',', '.'));
    }

    // Extract article number hints
    let artikelnummerHinweis = '';
    const artNrMatch = normalized.match(/(?:Art\.?\s*-?\s*Nr\.?|Artikelnummer|Bestellnummer)\s*:?\s*(\S+)/i);
    if (artNrMatch) {
      artikelnummerHinweis = artNrMatch[1];
    }

    // Determine unit
    let einheit = 'Stück';
    if (lower.includes('packung') || lower.includes('paket') || lower.includes('pack')) {
      einheit = 'Packung';
    } else if (lower.includes('karton')) {
      einheit = 'Karton';
    } else if (lower.includes('set')) {
      einheit = 'Set';
    } else if (lower.includes('paar')) {
      einheit = 'Paar';
    }

    return {
      beschreibung,
      menge,
      einheit,
      geschaetzterPreis,
      waehrung: 'EUR',
      lieferantHinweis,
      artikelnummerHinweis,
      kategorie,
      konfidenz: 0.4,
    };
  }
}
