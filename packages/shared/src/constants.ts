/** Beschaffungskanal-Typen */
export enum Kanal {
  RAHMENVERTRAG = 'RAHMENVERTRAG',
  KATALOG = 'KATALOG',
  FREIE_VERGABE = 'FREIE_VERGABE',
  OEFFENTLICHE_AUSSCHREIBUNG = 'OEFFENTLICHE_AUSSCHREIBUNG',
}

/** Marktplatz-Anbieter */
export enum Marktplatz {
  AMAZON_BUSINESS = 'AMAZON_BUSINESS',
  MERCATEO = 'MERCATEO',
  CONRAD = 'CONRAD',
  RAHMENVERTRAG = 'RAHMENVERTRAG',
}

/** Compliance-Status */
export enum ComplianceStatus {
  KONFORM = 'KONFORM',
  PRUEFUNG_ERFORDERLICH = 'PRUEFUNG_ERFORDERLICH',
  NICHT_KONFORM = 'NICHT_KONFORM',
}

/** Klassifizierungs-Konfidenz */
export enum Konfidenz {
  HOCH = 'HOCH',
  MITTEL = 'MITTEL',
  NIEDRIG = 'NIEDRIG',
}

/** Vergaberechtliche Schwellenwerte in EUR */
export const SCHWELLENWERTE = {
  DIREKTAUFTRAG: 1000,
  FREIE_VERGABE: 25000,
  UNTERSCHWELLENVERGABE: 143000,
  OBERSCHWELLENVERGABE: Infinity,
} as const;

/** CPV-Kategorien (Common Procurement Vocabulary) - Auswahl */
export const CPV_KATEGORIEN = {
  '30200000': 'Computeranlagen und Zubehör',
  '30230000': 'Computerbezogene Geräte',
  '30213000': 'Personalcomputer',
  '30213100': 'Tragbare Computer',
  '30213300': 'Tischcomputer',
  '30231000': 'Computerbildschirme und Konsolen',
  '30232000': 'Peripheriegeräte',
  '30237000': 'Teile und Zubehör für Computer',
  '39000000': 'Möbel, Einrichtungsgegenstände',
  '39100000': 'Möbel',
  '39110000': 'Sitzmöbel, Stühle und Zubehör',
  '39130000': 'Büromöbel',
  '22000000': 'Druckerzeugnisse und zugehörige Erzeugnisse',
  '22800000': 'Register, Geschäftsbücher, Ordner',
  '30190000': 'Verschiedene Bürogeräte und -materialien',
  '30192000': 'Bürobedarf',
} as const;

/** Klassifizierungs-Quelle */
export enum KlassifizierungsQuelle {
  KI = 'KI',
  REGELBASIERT = 'REGELBASIERT',
  MANUELL = 'MANUELL',
}

/** Shop-Verbindungsstatus */
export enum ShopStatus {
  VERBUNDEN = 'VERBUNDEN',
  GETRENNT = 'GETRENNT',
  FEHLER = 'FEHLER',
}

/** Nachhaltigkeitslabel */
export const NACHHALTIGKEITSLABEL = [
  'Blauer Engel',
  'EU Ecolabel',
  'FSC',
  'PEFC',
  'Energy Star',
  'TCO Certified',
  'EPEAT',
] as const;
