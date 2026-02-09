import { Kanal, Marktplatz, ComplianceStatus, Konfidenz, KlassifizierungsQuelle } from './constants';

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
  quelle: KlassifizierungsQuelle;
  aenderungsHistorie?: AenderungsEintrag[];
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

export interface OverrideClassificationRequest {
  cpvCode: string;
  cpvBezeichnung: string;
  begruendung: string;
  benutzer?: string;
}

export interface AenderungsEintrag {
  id: string;
  aktion: 'ERSTELLT' | 'UEBERSCHRIEBEN';
  benutzer: string;
  zeitpunkt: string;
  begruendung?: string;
  vorher?: { cpvCode: string; cpvBezeichnung: string; quelle: KlassifizierungsQuelle };
  nachher: { cpvCode: string; cpvBezeichnung: string; quelle: KlassifizierungsQuelle };
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

export interface RahmenvertragInfo {
  vertragsnummer: string;
  bezeichnung: string;
  zahlungsbedingungen: string;
  skonto: string;
  mindestBestellwert: number;
  maxVolumen: number;
  abrufVolumen: number;
  status: RahmenvertragStatus;
  gueltigBis: string;
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
  rahmenvertragInfo?: RahmenvertragInfo;
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

// ─── Admin ───────────────────────────────────────────────────────

export type RahmenvertragStatus = 'ENTWURF' | 'AKTIV' | 'GEKUENDIGT' | 'ABGELAUFEN';

export interface RahmenvertragVerlaengerung {
  datum: string;
  bisNeuesDatum: string;
  bemerkung?: string;
}

export interface RahmenvertragDokument {
  id: string;
  dateiname: string;
  dateityp: string;
  groesse: number;
  hochgeladenAm: string;
}

export interface Rahmenvertrag {
  id: string;
  bezeichnung: string;
  beschreibung: string;
  lieferant: string;
  vertragsnummer: string;
  gueltigAb: string;
  gueltigBis: string;
  cpvCodes: string;
  maxVolumen: number;
  status: RahmenvertragStatus;
  ansprechpartner: string;
  ansprechpartnerEmail: string;
  ansprechpartnerTelefon: string;
  zahlungsbedingungen: string;
  skonto: string;
  kuendigungsfrist: string;
  produktkategorien: string;
  abrufVolumen: number;
  mindestBestellwert: number;
  dokumente: RahmenvertragDokument[];
  verlaengerungen: RahmenvertragVerlaengerung[];
  notizen: string;
  erstelltAm: string;
}

export interface RahmenvertragCreateRequest {
  bezeichnung: string;
  beschreibung: string;
  lieferant: string;
  vertragsnummer: string;
  gueltigAb?: string;
  gueltigBis: string;
  cpvCodes?: string;
  maxVolumen?: number;
  status?: RahmenvertragStatus;
  ansprechpartner?: string;
  ansprechpartnerEmail?: string;
  ansprechpartnerTelefon?: string;
  zahlungsbedingungen?: string;
  skonto?: string;
  kuendigungsfrist?: string;
  produktkategorien?: string;
  abrufVolumen?: number;
  mindestBestellwert?: number;
  notizen?: string;
}

export interface FrameworkContractItem {
  id: string;
  titel: string;
  beschreibung: string;
  lieferant: string;
  cpvCodes: string;
  preis: number;
  waehrung: string;
  rahmenvertragsNummer: string;
  artikelnummer: string;
  nachhaltigkeitslabel: string;
  lieferzeit: string;
  bildUrl: string;
  verfuegbar: boolean;
  erstelltAm: string;
}

export interface ShopConfig {
  id: string;
  name: string;
  typ: Marktplatz;
  aktiv: boolean;
  apiKeyGesetzt: boolean;
  baseUrl: string;
  letzteSynchronisation: string | null;
  artikelAnzahl: number;
  erstelltAm: string;
}

export interface ShopConfigUpdateRequest {
  aktiv?: boolean;
  apiKey?: string;
  baseUrl?: string;
}

export interface PaginatedResponse<T> {
  daten: T[];
  gesamt: number;
  seite: number;
  proSeite: number;
}

// ─── System-Modus (Sandbox / Echtdaten) ────────────────────────

export type SystemModus = 'SANDBOX' | 'ECHTDATEN';

/** @deprecated Use SystemModus instead */
export type DemoModus = SystemModus;

export interface SandboxImportResult {
  rahmenvertraegeImportiert: number;
  katalogArtikelImportiert: number;
  bestellungenImportiert: number;
  modus: 'ADDITIV' | 'ERSETZEND';
}

/** @deprecated Use SandboxImportResult instead */
export type DemoImportResult = SandboxImportResult;

export interface AdminDashboardStats {
  rahmenvertraegeGesamt: number;
  rahmenvertraegeAktiv: number;
  katalogArtikelGesamt: number;
  shopKonfigurationen: number;
  shopKonfigurationenAktiv: number;
  aktuellerModus: SystemModus;
}

// ─── Bestellung ─────────────────────────────────────────────────

export type BestellStatus = 'ENTWURF' | 'GENEHMIGUNG_ANGEFORDERT' | 'GENEHMIGT' | 'BESTELLT' | 'ABGELEHNT';

export interface Bestellung {
  id: string;
  artikelId: string;
  artikelBezeichnung: string;
  marktplatz: Marktplatz;
  lieferant: string;
  einzelpreis: number;
  menge: number;
  gesamtpreis: number;
  skontoAbzug: number;
  endpreis: number;
  waehrung: string;
  status: BestellStatus;
  rahmenvertragNr?: string;
  genehmigungErforderlich: boolean;
  genehmigungVon?: string;
  genehmigungAm?: string;
  ablehnungsgrund?: string;
  begruendung?: string;
  bestelltAm: string;
  erstelltAm: string;
}

export interface BestellungCreateRequest {
  artikelId: string;
  artikelBezeichnung: string;
  marktplatz: Marktplatz;
  lieferant: string;
  einzelpreis: number;
  menge: number;
  waehrung?: string;
  rahmenvertragNr?: string;
  begruendung?: string;
}

// ─── OCI / cXML ─────────────────────────────────────────────────

export interface OciSession {
  token: string;
  hookUrl: string;
  username?: string;
  createdAt: string;
  expiresAt: string;
}

export interface OciCartItem {
  description: string;
  quantity: number;
  unit: string;
  price: number;
  currency: string;
  vendorMat: string;
  vendor: string;
  contract?: string;
  matgroup?: string;
  leadtime?: number;
  longtext?: string;
}

export interface CxmlCredential {
  domain: string;
  identity: string;
  sharedSecret: string;
}

export interface OciSetupRequest {
  HOOK_URL: string;
  USERNAME?: string;
  PASSWORD?: string;
  CALLER?: string;
}

export interface CxmlOrderItem {
  quantity: number;
  description: string;
  unitPrice: number;
  currency: string;
  supplierPartId: string;
  uom: string;
}

// ─── Magic Request ──────────────────────────────────────────

export interface MagicRequestInput {
  freitext: string;
}

export interface MagicRequestItem {
  beschreibung: string;
  menge: number;
  einheit: string;
  geschaetzterPreis: number | null;
  waehrung: string;
  lieferantHinweis: string;
  artikelnummerHinweis: string;
  kategorie: string;
  konfidenz: number; // 0.0–1.0
}

export interface MagicRequestResponse {
  positionen: MagicRequestItem[];
  zusammenfassung: string;
  verarbeitungszeit: number;
  methode: 'ki' | 'regelbasiert';
}

// ─── Katalog Import ─────────────────────────────────────────────

export interface KatalogImportResult {
  importiert: number;
  aktualisiert: number;
  uebersprungen: number;
  fehler: KatalogImportError[];
  gesamt: number;
}

export interface KatalogImportError {
  zeile: number;
  feld: string;
  nachricht: string;
}

// ─── API Error ───────────────────────────────────────────────────

export interface ApiError {
  statusCode: number;
  fehler: string;
  nachricht: string;
  zeitstempel: string;
}
