import { Kanal, Marktplatz, ComplianceStatus, Konfidenz } from './constants';

// ─── Classification ──────────────────────────────────────────────

export interface ClassifyRequest {
  artikelBezeichnung: string;
  artikelBeschreibung?: string;
  geschaetzterPreis?: number;
  menge?: number;
  kategorie?: string;
}

export interface ClassifyResponse {
  id: string;
  artikelBezeichnung: string;
  empfohlenerKanal: Kanal;
  konfidenz: Konfidenz;
  konfidenzWert: number;
  cpvCode: string;
  cpvBezeichnung: string;
  begruendung: string;
  compliance: ComplianceInfo;
  rahmenvertrag?: RahmenvertragMatch;
  alternativeKanaele: KanalEmpfehlung[];
  erstelltAm: string;
}

export interface ComplianceInfo {
  status: ComplianceStatus;
  pruefpunkte: Pruefpunkt[];
  schwellenwertKategorie: string;
  dokumentationspflicht: boolean;
}

export interface Pruefpunkt {
  bezeichnung: string;
  erfuellt: boolean;
  hinweis?: string;
}

export interface RahmenvertragMatch {
  id: string;
  bezeichnung: string;
  lieferant: string;
  vertragsnummer: string;
  gueltigBis: string;
  aehnlichkeit: number;
}

export interface KanalEmpfehlung {
  kanal: Kanal;
  begruendung: string;
  prioritaet: number;
}

// ─── Search ──────────────────────────────────────────────────────

export interface SearchRequest {
  suchbegriff: string;
  marktplaetze?: Marktplatz[];
  preisVon?: number;
  preisBis?: number;
  kategorie?: string;
  nurNachhaltig?: boolean;
  seite?: number;
  proSeite?: number;
}

export interface SearchResponse {
  ergebnisse: Artikel[];
  gesamt: number;
  seite: number;
  proSeite: number;
  aggregationen: Aggregationen;
}

export interface Artikel {
  id: string;
  bezeichnung: string;
  beschreibung: string;
  preis: number;
  waehrung: string;
  marktplatz: Marktplatz;
  lieferant: string;
  lieferzeit: string;
  bildUrl?: string;
  nachhaltigkeitslabel: string[];
  verfuegbar: boolean;
  artikelnummer: string;
}

export interface Aggregationen {
  marktplaetze: { marktplatz: Marktplatz; anzahl: number }[];
  preisbereiche: { von: number; bis: number; anzahl: number }[];
  kategorien: { bezeichnung: string; anzahl: number }[];
  lieferanten?: { name: string; count: number }[];
}

// ─── Documentation ───────────────────────────────────────────────

export interface Dokumentation {
  id: string;
  klassifizierungId: string;
  zeitstempel: string;
  benutzer: string;
  artikelBezeichnung: string;
  klassifizierung: ClassifyResponse;
  suchergebnisse?: SearchResponse;
  ausgewaehlterArtikel?: Artikel;
  begruendung: string;
  compliancePruefung: ComplianceInfo;
  integritaetsHash: string;
}

// ─── Health ──────────────────────────────────────────────────────

export interface HealthResponse {
  status: 'ok' | 'degraded' | 'error';
  version: string;
  services: {
    database: ServiceStatus;
    redis: ServiceStatus;
    azureOpenAI: ServiceStatus;
  };
}

export interface ServiceStatus {
  status: 'up' | 'down';
  latenzMs?: number;
}

// ─── API Error ───────────────────────────────────────────────────

export interface ApiError {
  statusCode: number;
  fehler: string;
  nachricht: string;
  zeitstempel: string;
}
