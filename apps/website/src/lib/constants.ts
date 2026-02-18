export const FIRMA = {
  name: 'procurement-ai',
  betreiber: 'WP Workers GmbH',
  strasse: 'Eichendorffstr. 13',
  plz: '82223',
  ort: 'Eichenau',
  land: 'Deutschland',
  email: 'anfrage@procurement-ai.de',
  emailInfo: 'info@procurement-ai.de',
  emailSupport: 'support@procurement-ai.de',
  emailNoreply: 'noreply@procurement-ai.de',
  telefon: '+49 (0) 1575 5575928',
  geschaeftsfuehrer: 'Suphi Basdemir',
  handelsregister: 'HRB 269498',
  registergericht: 'Amtsgericht München',
  ustIdNr: 'DE349280799',
  website: 'https://procurement-ai.de',
  betreiberWebsite: 'https://wp-workers.de',
} as const;

export const MATOMO = {
  url: 'https://analytics.procurement-ai.de',
  siteId: '1',
} as const;

export const NAV_ITEMS = [
  { label: 'Features', href: '/features' },
  { label: 'Integrationen', href: '/integrationen' },
  { label: 'Preise', href: '/preise' },
  { label: 'Blog', href: '/blog' },
  { label: 'Über uns', href: '/ueber-uns' },
  { label: 'Kontakt', href: '/kontakt' },
] as const;

export const FEATURES = [
  {
    titel: 'KI-Bedarfserfassung',
    beschreibung: 'Automatische Klassifizierung nach CPV-Codes mit KI-Unterstützung. Artikelanforderungen in natürlicher Sprache eingeben und sofort passende Kategorien erhalten.',
    icon: 'Brain',
    screenshot: 'search',
  },
  {
    titel: 'Klassifizierungs-Übersteuerung & Audit-Trail',
    beschreibung: 'CPV-Codes manuell übersteuern mit durchsuchbarem Code-Picker und Begründungspflicht. Jede Änderung wird in einer lückenlosen Änderungshistorie mit Zeitstempel, Benutzer und Vorher-/Nachher-Vergleich protokolliert.',
    icon: 'ShieldCheck',
    screenshot: 'classification-override',
  },
  {
    titel: 'Multi-Marktplatz-Suche',
    beschreibung: 'Gleichzeitige Suche über Amazon Business, Mercateo, Conrad und weitere Marktplätze. Preisvergleich und Lieferantenauswahl auf einen Blick.',
    icon: 'Search',
    screenshot: 'results',
  },
  {
    titel: 'OCI 5.0 & cXML',
    beschreibung: 'Nahtlose Integration in Ihr ERP-System über OCI 5.0 und cXML Punchout. Direkte Warenkorb-Übernahme ohne Medienbruch.',
    icon: 'Link',
    screenshot: 'admin-oci-config',
  },
  {
    titel: 'Rahmenvertrags-Management',
    beschreibung: 'Zentrale Verwaltung aller Rahmenverträge mit automatischem Abgleich. Skonto-Konditionen und Mindestbestellwerte immer im Blick.',
    icon: 'FileCheck',
    screenshot: 'admin-rahmenvertraege',
  },
  {
    titel: 'Revisionssichere Dokumentation',
    beschreibung: 'Lückenlose Vergabedokumentation mit SHA-256 Integritätsprüfung. Jeder Beschaffungsvorgang wird automatisch protokolliert.',
    icon: 'Shield',
    screenshot: 'admin-bestellungen',
  },
  {
    titel: 'Bestellungsmanagement & Genehmigungen',
    beschreibung: 'Detailansicht jeder Bestellung mit Status-Timeline und Genehmigungsworkflow. Genehmigungs­anforderungen, Skonto-Berechnung und revisionssichere Protokollierung — alles auf einen Blick.',
    icon: 'LayoutDashboard',
    screenshot: 'admin-bestellung-detail',
  },
  {
    titel: 'Marktplatz-Verbindungen',
    beschreibung: 'Zentrale Übersicht aller angebundenen Marktplätze und Lieferanten. Status, Verbindungsdetails und Konfiguration auf einen Blick verwalten.',
    icon: 'Globe',
    screenshot: 'admin-verbindungen',
  },
] as const;

export const PRICING = [
  {
    name: 'Starter',
    preis: '499',
    zeitraum: '/Monat',
    nutzer: 'bis 10 Nutzer',
    beschreibung: 'Ideal für kleinere Verwaltungseinheiten',
    features: [
      'KI-Bedarfserfassung',
      'Multi-Marktplatz-Suche',
      'Rahmenvertrag-Matching',
      'Vergabedokumentation',
      '1 Marktplatz-Anbindung',
      'E-Mail-Support',
    ],
    cta: 'Starter wählen',
    hervorgehoben: false,
  },
  {
    name: 'Professional',
    preis: '1.299',
    zeitraum: '/Monat',
    nutzer: 'bis 50 Nutzer',
    beschreibung: 'Für mittlere bis große Verwaltungen',
    features: [
      'Alles aus Starter',
      'OCI 5.0 & cXML Integration',
      'Genehmigungsworkflows',
      'Alle Marktplätze',
      'Admin-Dashboard',
      'Prioritäts-Support',
    ],
    cta: 'Professional wählen',
    hervorgehoben: true,
  },
  {
    name: 'Enterprise',
    preis: 'Auf Anfrage',
    zeitraum: '',
    nutzer: 'unbegrenzte Nutzer',
    beschreibung: 'Maßgeschneiderte Lösung für Großverwaltungen',
    features: [
      'Alles aus Professional',
      'Dedizierter Server',
      'On-Premise Option',
      'Custom Integrationen',
      '24/7 SLA',
      'Schulung & Onboarding',
    ],
    cta: 'Kontakt aufnehmen',
    hervorgehoben: false,
  },
] as const;

export const TRUST_METRICS = [
  { wert: 3, suffix: '+', label: 'Marktplätze angebunden', prefix: '' },
  { wert: 99.9, suffix: '%', label: 'SLA-Verfügbarkeit', prefix: '' },
  { wert: 3, suffix: 's', label: 'KI-Klassifizierung', prefix: '<' },
  { wert: 100, suffix: '%', label: 'DSGVO-konform', prefix: '' },
] as const;

export const ERP_LOGOS = [
  { name: 'SAP S/4HANA', datei: 'sap-s4hana.svg', beschreibung: 'ERP-Suite für Großunternehmen mit integrierter Beschaffung und Materialwirtschaft.' },
  { name: 'SAP Ariba', datei: 'sap-ariba.webp', beschreibung: 'Cloud-basiertes Beschaffungsnetzwerk mit über 5 Mio. Lieferanten weltweit.' },
  { name: 'SAP Business One', datei: 'sap-business-one.svg', beschreibung: 'ERP-Lösung für kleine und mittelständische Unternehmen.' },
  { name: 'Microsoft Dynamics', datei: 'microsoft-dynamics.svg', beschreibung: 'Business-Plattform mit Finance, Supply Chain und Procurement-Modulen.' },
  { name: 'Oracle', datei: 'oracle.svg', beschreibung: 'Cloud ERP mit Procurement- und Supplier-Management.' },
  { name: 'Coupa', datei: 'coupa.svg', beschreibung: 'Business Spend Management Plattform für Einkauf und Finanzen.' },
  { name: 'JAGGAER', datei: 'jaggaer.webp', beschreibung: 'Source-to-Pay-Plattform spezialisiert auf den öffentlichen Sektor.' },
  { name: 'Sage', datei: 'sage.svg', beschreibung: 'Buchhaltungs- und ERP-Software für KMU und den Mittelstand.' },
  { name: 'DATEV', datei: 'datev.svg', beschreibung: 'IT-Dienstleister für Steuerberater, Wirtschaftsprüfer und Unternehmen.' },
  { name: 'Infor', datei: 'infor.svg', beschreibung: 'Branchenspezifische Cloud-ERP-Lösungen für Fertigung und Handel.' },
] as const;

export const FAQ_ITEMS = [
  {
    frage: 'Wie lange dauert die Implementierung?',
    antwort: 'Die Standardimplementierung dauert in der Regel 2-4 Wochen. Für Enterprise-Kunden mit individuellen Anpassungen planen wir 6-8 Wochen ein.',
  },
  {
    frage: 'Ist die Lösung DSGVO-konform?',
    antwort: 'Ja, vollständig. Alle Daten werden ausschließlich auf deutschen Servern bei unserem Partner 24fire gehostet. Wir verarbeiten keine personenbezogenen Daten ohne ausdrückliche Einwilligung.',
  },
  {
    frage: 'Welche ERP-Systeme werden unterstützt?',
    antwort: 'Wir unterstützen alle gängigen ERP-Systeme über OCI 5.0 und cXML, darunter SAP S/4HANA, SAP Ariba, SAP Business One, Microsoft Dynamics, Oracle und viele weitere.',
  },
  {
    frage: 'Gibt es eine Testphase?',
    antwort: 'Ja, wir bieten allen Neukunden eine kostenlose 30-Tage-Testphase mit vollem Funktionsumfang. Keine Kreditkarte erforderlich.',
  },
  {
    frage: 'Wie funktioniert die KI-Klassifizierung?',
    antwort: 'Unsere KI analysiert Ihre Artikelbeschreibungen und ordnet automatisch die passenden CPV-Codes zu. Bei Unsicherheit wird ein regelbasiertes Fallback-System aktiviert. Jede Klassifizierung kann manuell übersteuert werden — mit Begründungspflicht und vollständiger Änderungshistorie für maximale Transparenz.',
  },
] as const;
