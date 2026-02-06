import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SearchLayout } from '../components/templates/SearchLayout';
import { Button, Badge, PriceTag, Spinner } from '../components/atoms';
import { useSearchStore } from '../store/useSearchStore';
import { useClassify } from '../hooks/useClassify';
import { useExport } from '../hooks/useExport';
import type { Artikel } from '@procurement/shared';
import {
  ArrowLeft, X, Truck, Leaf, Star, Shield, TrendingDown, Package,
  ChevronDown, ChevronUp, Info, FileDown, FileSpreadsheet, Save, FolderOpen, Trash2, Clock, AlertTriangle,
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

const DEMO_ARTICLES: Artikel[] = [
  {
    id: 'cmp-1',
    bezeichnung: 'Dell Latitude 5540 Business Laptop',
    beschreibung: '15.6" FHD, Intel Core i7-1365U, 16GB RAM, 512GB SSD, Windows 11 Pro, 3 Jahre ProSupport',
    preis: 1289.0,
    waehrung: 'EUR',
    marktplatz: 'AMAZON_BUSINESS' as any,
    lieferant: 'Dell Technologies',
    lieferzeit: '2-3 Werktage',
    bildUrl: 'https://images.unsplash.com/photo-1593642702749-b7d2a804fbcf?w=300&h=300&fit=crop',
    nachhaltigkeitslabel: ['EPEAT Gold', 'Energy Star'],
    verfuegbar: true,
    artikelnummer: 'DELL-LAT5540-I7',
  },
  {
    id: 'cmp-2',
    bezeichnung: 'Lenovo ThinkPad T14s Gen 4',
    beschreibung: '14" WUXGA, AMD Ryzen 7 PRO 7840U, 16GB RAM, 512GB SSD, Windows 11 Pro, 3 Jahre Vor-Ort',
    preis: 1149.0,
    waehrung: 'EUR',
    marktplatz: 'MERCATEO' as any,
    lieferant: 'Lenovo GmbH',
    lieferzeit: '3-5 Werktage',
    bildUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300&h=300&fit=crop',
    nachhaltigkeitslabel: ['EPEAT Gold', 'TCO Certified'],
    verfuegbar: true,
    artikelnummer: 'LEN-T14S-G4-R7',
  },
  {
    id: 'cmp-3',
    bezeichnung: 'HP EliteBook 840 G10',
    beschreibung: '14" WUXGA, Intel Core i7-1355U, 16GB RAM, 512GB SSD, Windows 11 Pro, 3 Jahre NBD',
    preis: 1349.0,
    waehrung: 'EUR',
    marktplatz: 'CONRAD' as any,
    lieferant: 'HP Deutschland',
    lieferzeit: '1-2 Werktage',
    bildUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=300&h=300&fit=crop',
    nachhaltigkeitslabel: ['EPEAT Gold', 'Energy Star', 'TCO Certified'],
    verfuegbar: true,
    artikelnummer: 'HP-EB840-G10-I7',
  },
];

const MAX_COMPARE_ARTICLES = 3;

const mpColors: Record<string, string> = {
  AMAZON_BUSINESS: 'bg-orange-100 text-orange-800',
  MERCATEO: 'bg-blue-100 text-blue-800',
  CONRAD: 'bg-purple-100 text-purple-800',
  RAHMENVERTRAG: 'bg-green-100 text-green-800',
};

// Universal spec keys - same for all products
const UNIVERSAL_SPEC_KEYS = ['type', 'size', 'features', 'connectivity', 'material', 'compatibility'] as const;

// Detect product category for comparison warning
function getProductCategory(artikel: Artikel): string {
  const text = (artikel.bezeichnung + ' ' + artikel.beschreibung).toLowerCase();

  // Laptops / Notebooks
  if (text.includes('laptop') || text.includes('notebook') || text.includes('macbook') ||
      text.includes('surface laptop') || text.includes('thinkpad') || text.includes('latitude') ||
      text.includes('elitebook') || text.includes('probook')) return 'Laptops';

  // Desktop PCs
  if (text.includes('desktop') || text.includes('optiplex') || text.includes('thinkcentre') ||
      text.includes('prodesk') || text.includes('elitedesk')) return 'Desktop PCs';

  // Monitor Arms (check before monitors!)
  if (text.includes('monitorarm') || text.includes('monitor arm') ||
      (text.includes('arm') && text.includes('vesa'))) return 'Monitorarme';

  // Monitors - comprehensive detection
  if (text.includes('monitor') || text.includes('bildschirm') || text.includes('display') ||
      text.includes('ultrasharp') || text.includes('thinkvision') || text.includes('odyssey') ||
      text.includes('viewsonic') || text.includes('benq') || text.includes('asus proart') ||
      (text.includes('zoll') && (text.includes('4k') || text.includes('wqhd') || text.includes('fhd') ||
       text.includes('uhd') || text.includes('curved') || text.includes('ips') || text.includes('va') ||
       text.includes('hz') || text.includes('hdr')))) return 'Monitore';

  // Office Chairs
  if (text.includes('bürostuhl') || text.includes('drehstuhl') || text.includes('schreibtischstuhl') ||
      text.includes('aeron') || text.includes('leap') || text.includes('gesture') ||
      text.includes('steelcase') || text.includes('herman miller') || text.includes('interstuhl') ||
      (text.includes('stuhl') && (text.includes('ergonomisch') || text.includes('armlehnen') ||
       text.includes('rollen') || text.includes('synchron')))) return 'Bürostühle';

  // Desks
  if (text.includes('schreibtisch') || text.includes('stehschreibtisch') || text.includes('bekant') ||
      text.includes('flexispot') || text.includes('höhenverstellbar')) return 'Schreibtische';

  // Printers
  if (text.includes('drucker') || text.includes('printer') || text.includes('laserjet') ||
      text.includes('laser') || text.includes('mfc-') || text.includes('multifunktion')) return 'Drucker';

  // Mice
  if (text.includes('maus') || text.includes('mouse') || text.includes('mx master') ||
      text.includes('mx anywhere')) return 'Mäuse';

  // Keyboards
  if (text.includes('tastatur') || text.includes('keyboard') || text.includes('mx keys')) return 'Tastaturen';

  // Headsets
  if (text.includes('headset') || text.includes('kopfhörer') || text.includes('jabra evolve') ||
      text.includes('poly') || text.includes('plantronics')) return 'Headsets';

  // Webcams
  if (text.includes('webcam') || text.includes('web cam') || text.includes('brio') ||
      text.includes('streamcam')) return 'Webcams';

  // Video Conferencing
  if (text.includes('videobar') || text.includes('rally bar') || text.includes('rally') ||
      text.includes('meetup') || text.includes('videokonferenz')) return 'Videokonferenz';

  // Docking Stations
  if (text.includes('docking') || text.includes('dock') || text.includes('caldigit') ||
      text.includes('thunderbolt dock')) return 'Docking Stations';

  // GPUs
  if (text.includes('gpu') || text.includes('grafikkarte') || text.includes('nvidia') ||
      text.includes('geforce') || text.includes('radeon') || text.includes('a100') ||
      text.includes('rtx') || text.includes('quadro')) return 'Grafikkarten';

  // NAS
  if (text.includes('nas') || text.includes('diskstation') || text.includes('synology') ||
      text.includes('qnap')) return 'NAS-Systeme';

  // Single Board Computers
  if (text.includes('raspberry') || text.includes('arduino') || text.includes('einplatinencomputer')) return 'Einplatinencomputer';

  // Lab Equipment - Pipettes
  if (text.includes('pipette') || text.includes('eppendorf')) return 'Pipetten';

  // Lab Equipment - Scales
  if (text.includes('waage') || text.includes('analysenwaage') || text.includes('sartorius') ||
      text.includes('quintix')) return 'Waagen';

  // Safety Equipment - Goggles
  if (text.includes('schutzbrille') || text.includes('uvex')) return 'Schutzbrillen';

  // Safety Equipment - Gloves
  if (text.includes('handschuh') || text.includes('nitril')) return 'Handschuhe';

  // Chemicals
  if (text.includes('säure') || text.includes('isopropanol') || text.includes('chemikalie') ||
      text.includes('hcl') || text.includes('laborqualität')) return 'Chemikalien';

  // Measurement Equipment
  if (text.includes('multimeter') || text.includes('keysight') || text.includes('oszilloskop') ||
      text.includes('messgerät')) return 'Messgeräte';

  // Office Supplies - Paper
  if (text.includes('papier') || text.includes('kopierpapier') || text.includes('druckerpapier') ||
      text.includes('navigator')) return 'Papier';

  // Office Supplies - Binders
  if (text.includes('ordner') || text.includes('leitz') || text.includes('aktenordner')) return 'Ordner';

  // Office Supplies - Notes
  if (text.includes('post-it') || text.includes('haftnotiz') || text.includes('klebezettel')) return 'Haftnotizen';

  return 'Sonstige';
}

// Check if articles are of mixed categories
function getMixedCategoryInfo(articles: Artikel[]): { isMixed: boolean; categories: string[] } {
  const categories = [...new Set(articles.map(a => getProductCategory(a)))];
  return {
    isMixed: categories.length > 1,
    categories,
  };
}

// Extract comprehensive specs from any article
function extractUniversalSpecs(artikel: Artikel): Record<string, string> {
  const desc = artikel.beschreibung;
  const name = artikel.bezeichnung;
  const text = name + ' ' + desc;
  const textLower = text.toLowerCase();
  const specs: Record<string, string> = {};

  // === TYPE ===
  // Detect product type from name/description - order matters!

  // Laptops
  if (textLower.includes('laptop') || textLower.includes('notebook') ||
      textLower.includes('thinkpad') || textLower.includes('latitude') ||
      textLower.includes('elitebook') || textLower.includes('probook')) specs.type = 'Laptop';
  else if (textLower.includes('macbook')) specs.type = 'MacBook';
  else if (textLower.includes('surface laptop') || textLower.includes('surface pro')) specs.type = 'Surface';

  // Desktop PCs
  else if (textLower.includes('desktop') || textLower.includes('optiplex') ||
           textLower.includes('thinkcentre') || textLower.includes('prodesk')) specs.type = 'Desktop PC';

  // Monitor Arms (before monitors!)
  else if (textLower.includes('monitorarm') || textLower.includes('monitor arm') ||
           (textLower.includes('arm') && textLower.includes('vesa'))) specs.type = 'Monitorarm';

  // Monitors - comprehensive detection
  else if (textLower.includes('monitor') || textLower.includes('bildschirm') ||
           textLower.includes('ultrasharp') || textLower.includes('thinkvision') ||
           textLower.includes('odyssey') || textLower.includes('viewsonic') ||
           (textLower.includes('zoll') && (textLower.includes('4k') || textLower.includes('wqhd') ||
            textLower.includes('fhd') || textLower.includes('uhd') || textLower.includes('curved') ||
            textLower.includes('ips') || textLower.includes('va') || textLower.includes('hz')))) specs.type = 'Monitor';

  // Office Chairs
  else if (textLower.includes('bürostuhl') || textLower.includes('drehstuhl') ||
           textLower.includes('aeron') || textLower.includes('leap') || textLower.includes('gesture') ||
           (textLower.includes('stuhl') && (textLower.includes('ergonomisch') || textLower.includes('armlehnen')))) specs.type = 'Bürostuhl';

  // Desks
  else if (textLower.includes('schreibtisch') || textLower.includes('stehschreibtisch') ||
           textLower.includes('bekant') || textLower.includes('flexispot')) specs.type = 'Schreibtisch';

  // Printers
  else if (textLower.includes('drucker') || textLower.includes('laserjet') ||
           textLower.includes('mfc-') || textLower.includes('multifunktion')) {
    specs.type = textLower.includes('farblaser') ? 'Farblaser' : textLower.includes('laser') ? 'Laserdrucker' : 'Drucker';
  }

  // Peripherals
  else if (textLower.includes('maus') || textLower.includes('mx master')) specs.type = 'Maus';
  else if (textLower.includes('tastatur') || textLower.includes('mx keys')) specs.type = 'Tastatur';
  else if (textLower.includes('headset') || textLower.includes('jabra evolve')) specs.type = 'Headset';
  else if (textLower.includes('webcam') || textLower.includes('brio')) specs.type = 'Webcam';
  else if (textLower.includes('videobar') || textLower.includes('rally bar') ||
           textLower.includes('rally')) specs.type = 'Videokonferenz-System';
  else if (textLower.includes('docking') || textLower.includes('dock') ||
           textLower.includes('caldigit')) specs.type = 'Docking Station';

  // IT Hardware
  else if (textLower.includes('gpu') || textLower.includes('grafikkarte') ||
           textLower.includes('nvidia') || textLower.includes('a100') || textLower.includes('rtx')) specs.type = 'GPU';
  else if (textLower.includes('nas') || textLower.includes('diskstation') ||
           textLower.includes('synology')) specs.type = 'NAS';
  else if (textLower.includes('raspberry')) specs.type = 'Einplatinencomputer';

  // Lab Equipment
  else if (textLower.includes('pipette') || textLower.includes('eppendorf')) specs.type = 'Pipette';
  else if (textLower.includes('waage') || textLower.includes('analysenwaage') ||
           textLower.includes('sartorius')) specs.type = 'Analysenwaage';
  else if (textLower.includes('schutzbrille') || textLower.includes('uvex')) specs.type = 'Schutzbrille';
  else if (textLower.includes('handschuh') || textLower.includes('nitril')) specs.type = 'Schutzhandschuhe';
  else if (textLower.includes('säure') || textLower.includes('isopropanol') ||
           textLower.includes('hcl')) specs.type = 'Chemikalie';
  else if (textLower.includes('multimeter') || textLower.includes('keysight')) specs.type = 'Messgerät';

  // Office Supplies
  else if (textLower.includes('papier') || textLower.includes('kopierpapier')) specs.type = 'Kopierpapier';
  else if (textLower.includes('ordner') || textLower.includes('leitz')) specs.type = 'Ordner';
  else if (textLower.includes('post-it') || textLower.includes('haftnotiz')) specs.type = 'Haftnotizen';

  // Fallback
  else {
    const firstPart = desc.split(',')[0]?.trim();
    if (firstPart && firstPart.length < 30) specs.type = firstPart;
  }

  // === SIZE / DIMENSIONS ===
  const sizeSpecs: string[] = [];
  // Display/screen size
  const displayMatch = text.match(/(\d+(?:[.,]\d+)?)\s*(?:Zoll|")/i);
  if (displayMatch) sizeSpecs.push(`${displayMatch[1].replace('.', ',')} Zoll`);
  // Resolution
  const resMatch = text.match(/(4K|WQHD|FHD|UHD|WUXGA|1080p|1440p)/i);
  if (resMatch) sizeSpecs.push(resMatch[1].toUpperCase());
  // Panel type
  const panelMatch = text.match(/\b(IPS|VA|TN|OLED)\b/i);
  if (panelMatch) sizeSpecs.push(panelMatch[1].toUpperCase());
  // Physical dimensions
  const dimMatch = text.match(/(\d+)\s*x\s*(\d+)\s*(?:cm|mm)/i);
  if (dimMatch) sizeSpecs.push(`${dimMatch[1]}×${dimMatch[2]} cm`);
  // Height range
  const heightMatch = text.match(/(\d+)-(\d+)\s*cm/i);
  if (heightMatch) sizeSpecs.push(`Höhe: ${heightMatch[1]}–${heightMatch[2]} cm`);
  // Weight
  const weightMatch = text.match(/(\d+[.,]\d+)\s*kg/i);
  if (weightMatch) sizeSpecs.push(`${weightMatch[1].replace('.', ',')} kg`);
  // Capacity/Volume
  const volMatch = text.match(/(\d+(?:[.,]\d+)?)\s*(L|ml|µL|GB|TB)\b/i);
  if (volMatch && !sizeSpecs.some(s => s.includes('Zoll'))) {
    sizeSpecs.push(`${volMatch[1]} ${volMatch[2]}`);
  }
  // Quantity
  const qtyMatch = text.match(/(\d+)\s*(Blatt|Stück|Blöcke|Bay)/i);
  if (qtyMatch) sizeSpecs.push(`${qtyMatch[1]} ${qtyMatch[2]}`);
  // Range for pipettes
  const rangeMatch = text.match(/(\d+)-(\d+)\s*µL/i);
  if (rangeMatch) sizeSpecs.push(`${rangeMatch[1]}–${rangeMatch[2]} µL`);

  if (sizeSpecs.length > 0) specs.size = sizeSpecs.join(', ');

  // === FEATURES ===
  const features: string[] = [];
  // CPU/Processor
  const cpuMatch = text.match(/(Intel Core [^,]+|AMD Ryzen [^,]+|M\d+ (?:Pro|Max|Ultra)?|BCM\d+)/i);
  if (cpuMatch) features.push(cpuMatch[1].trim());
  // RAM
  const ramMatch = text.match(/(\d+)\s*GB\s*(RAM|LPDDR\d*x?|DDR\d*|ECC|HBM\d*e?)?/i);
  if (ramMatch) features.push(`${ramMatch[1]} GB${ramMatch[2] && !['RAM'].includes(ramMatch[2].toUpperCase()) ? ' ' + ramMatch[2] : ' RAM'}`);
  // Storage
  const storageMatch = text.match(/(\d+)\s*(GB|TB)\s*(SSD|NVMe|HDD|microSD)?/i);
  if (storageMatch && !features.some(f => f.includes('RAM'))) {
    features.push(`${storageMatch[1]} ${storageMatch[2]}${storageMatch[3] ? ' ' + storageMatch[3] : ''}`);
  }
  // OS
  const osMatch = text.match(/(Windows \d+ Pro|Windows \d+|macOS [^,]+)/i);
  if (osMatch) features.push(osMatch[1].trim());
  // HDR
  if (text.match(/HDR\s*\d*/i)) features.push(text.match(/HDR\s*\d*/i)![0]);
  // Refresh rate
  if (text.match(/\d+Hz/i)) features.push(text.match(/\d+Hz/i)![0]);
  // Power delivery
  const pdMatch = text.match(/(\d+)\s*W\s*Power Delivery/i);
  if (pdMatch) features.push(`${pdMatch[1]}W Power Delivery`);
  // Chair features
  if (textLower.includes('liveback')) features.push('LiveBack-Technologie');
  if (textLower.includes('4d-armlehnen') || textLower.includes('4d armlehnen')) features.push('4D-Armlehnen');
  if (textLower.includes('lordosenstütze')) features.push('Lordosenstütze');
  if (textLower.includes('synchronmechanik')) features.push('Synchronmechanik');
  if (textLower.includes('netzrücken')) features.push('Netzrücken');
  if (textLower.includes('pellicle')) features.push('Pellicle-Membran');
  if (textLower.includes('posturefit')) features.push('PostureFit SL');
  // Desk features
  if (textLower.includes('höhenverstellbar') || textLower.includes('elektrisch')) features.push('Elektrisch höhenverstellbar');
  if (textLower.includes('memory-funktion') || textLower.includes('memory funktion')) features.push('Memory-Funktion');
  if (textLower.includes('kollisionsschutz')) features.push('Kollisionsschutz');
  // Printer features
  if (textLower.includes('duplex')) features.push('Duplex');
  const speedMatch = text.match(/(\d+)\s*Seiten\/Min/i);
  if (speedMatch) features.push(`${speedMatch[1]} Seiten/Min`);
  // Peripheral features
  if (textLower.includes('anc')) features.push('ANC');
  if (textLower.includes('beleuchtet')) features.push('Beleuchtet');
  const batteryMatch = text.match(/(\d+)h\s*Akku/i);
  if (batteryMatch) features.push(`${batteryMatch[1]}h Akku`);
  // Lab features
  if (textLower.includes('autoklavierbar')) features.push('Autoklavierbar');
  if (textLower.includes('kalibrierschein')) features.push('Mit Kalibrierschein');
  const accuracyMatch = text.match(/(\d+[.,]\d+)\s*mg/i);
  if (accuracyMatch) features.push(`Genauigkeit: ${accuracyMatch[1]} mg`);
  // Curved display
  if (textLower.includes('curved')) features.push('Curved');
  // FreeSync/G-Sync
  if (textLower.includes('freesync')) features.push('FreeSync');
  if (textLower.includes('g-sync')) features.push('G-Sync');
  // sRGB
  const srgbMatch = text.match(/(\d+)%\s*sRGB/i);
  if (srgbMatch) features.push(`${srgbMatch[1]}% sRGB`);

  if (features.length > 0) specs.features = features.slice(0, 5).join(', ');

  // === CONNECTIVITY ===
  const connectivity: string[] = [];
  if (text.match(/Thunderbolt \d+/i)) connectivity.push(text.match(/Thunderbolt \d+/i)![0]);
  if (textLower.includes('usb-c')) connectivity.push('USB-C');
  if (text.match(/WiFi \d+E?/i)) connectivity.push(text.match(/WiFi \d+E?/i)![0]);
  if (textLower.includes('wlan') && !connectivity.some(c => c.includes('WiFi'))) connectivity.push('WLAN');
  if (textLower.includes('bluetooth')) connectivity.push('Bluetooth');
  if (textLower.includes('hdmi')) connectivity.push('HDMI');
  if (textLower.includes('displayport')) connectivity.push('DisplayPort');
  if (textLower.includes('nfc')) connectivity.push('NFC');
  if (textLower.includes('kabellos') || textLower.includes('wireless')) connectivity.push('Kabellos');
  if (textLower.includes('lan') && !connectivity.some(c => c.includes('WLAN'))) connectivity.push('LAN');
  if (textLower.includes('nvlink')) connectivity.push('NVLink');
  if (textLower.includes('pcie')) connectivity.push('PCIe');

  if (connectivity.length > 0) specs.connectivity = [...new Set(connectivity)].join(', ');

  // === MATERIAL / CONSTRUCTION ===
  const materials: string[] = [];
  if (textLower.includes('aluminium')) materials.push('Aluminium');
  if (textLower.includes('schwarz')) materials.push('Schwarz');
  if (textLower.includes('weiß')) materials.push('Weiß');
  if (textLower.includes('glas')) materials.push('Glas');
  if (textLower.includes('nitril')) materials.push('Nitril');
  if (textLower.includes('fsc')) materials.push('FSC-zertifiziert');
  if (textLower.includes('wolkenmarmor')) materials.push('Wolkenmarmor');
  if (text.match(/Größe [A-Z]/i)) materials.push(text.match(/Größe [A-Z]/i)![0]);

  if (materials.length > 0) specs.material = materials.join(', ');

  // === COMPATIBILITY / STANDARDS ===
  const standards: string[] = [];
  if (textLower.includes('vesa')) standards.push('VESA');
  if (text.match(/EN \d+/i)) standards.push(text.match(/EN \d+/i)![0]);
  if (textLower.includes('uc-zertifiziert')) standards.push('UC-zertifiziert');
  if (textLower.includes('glp')) standards.push('GLP-konform');
  if (text.match(/UN \d+/i)) standards.push(text.match(/UN \d+/i)![0]);
  if (textLower.includes('gefahrstoff')) standards.push('Gefahrstoff');
  if (textLower.includes('energy star')) standards.push('Energy Star');
  if (textLower.includes('epeat')) standards.push(text.match(/EPEAT (Gold|Silver|Bronze)?/i)?.[0] || 'EPEAT');
  // Max monitor size for arms
  const maxSizeMatch = text.match(/bis (\d+) Zoll/i);
  if (maxSizeMatch) standards.push(`Bis ${maxSizeMatch[1]} Zoll`);

  if (standards.length > 0) specs.compatibility = standards.join(', ');

  return specs;
}

// Build spec values for all articles using universal keys
function buildSpecValues(articles: Artikel[]): { keys: string[]; values: Record<string, Record<string, string>> } {
  const keys = [...UNIVERSAL_SPEC_KEYS];
  const values: Record<string, Record<string, string>> = {};

  for (const key of keys) {
    values[key] = {};
  }

  for (const article of articles) {
    const specs = extractUniversalSpecs(article);
    for (const key of keys) {
      if (specs[key]) {
        values[key][article.id] = specs[key];
      }
    }
  }

  return { keys, values };
}

export function ComparePage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const {
    selectedArticles,
    toggleArticle,
    setClassifyResult,
    suchbegriff,
    savedComparisons,
    saveComparison,
    loadComparison,
    deleteComparison,
  } = useSearchStore();
  const classifyMutation = useClassify();
  const { exportToPDF, exportToExcel } = useExport();
  const [showSpecs, setShowSpecs] = useState(true);
  const [removedDemo, setRemovedDemo] = useState<string[]>([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showLoadMenu, setShowLoadMenu] = useState(false);
  const [saveName, setSaveName] = useState('');
  const loadMenuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (loadMenuRef.current && !loadMenuRef.current.contains(event.target as Node)) {
        setShowLoadMenu(false);
      }
    }
    if (showLoadMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showLoadMenu]);

  const storeArticles = selectedArticles.length > 0 ? selectedArticles : [];
  const demoArticles = DEMO_ARTICLES.filter((a) => !removedDemo.includes(a.id));
  const articles = storeArticles.length > 0 ? storeArticles : demoArticles;
  const isDemo = storeArticles.length === 0;

  // Build specs dynamically from article descriptions
  const { keys: specKeys, values: specValues } = buildSpecValues(articles);

  // Check for mixed product categories
  const { isMixed, categories } = getMixedCategoryInfo(articles);

  // Check for supplier concentration (all same supplier)
  const uniqueSuppliers = [...new Set(articles.map(a => a.lieferant))];
  const allSameSupplier = articles.length >= 2 && uniqueSuppliers.length === 1;

  const minPreis = articles.length > 0 ? Math.min(...articles.map((a) => a.preis)) : 0;
  const maxPreis = articles.length > 0 ? Math.max(...articles.map((a) => a.preis)) : 0;
  const ersparnis = maxPreis - minPreis;

  const handleClassify = async (artikel: Artikel) => {
    const result = await classifyMutation.mutateAsync({
      artikelBezeichnung: artikel.bezeichnung,
      artikelBeschreibung: artikel.beschreibung,
      geschaetzterPreis: artikel.preis,
      menge: 1,
    });
    setClassifyResult(result);
    navigate(`/article/${artikel.id}`, { state: { artikel } });
  };

  const handleRemove = (id: string) => {
    if (isDemo) {
      setRemovedDemo((prev) => [...prev, id]);
    } else {
      const article = selectedArticles.find((a) => a.id === id);
      if (article) toggleArticle(article);
    }
  };

  return (
    <SearchLayout title={t('compare.title')}>
      <div className="space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">{t('compare.title')}</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {t('compare.articlesInComparison', { count: articles.length })}
              {isDemo && (
                <span className="ml-2 text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                  {t('compare.demoData')}
                </span>
              )}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {/* Save comparison */}
            {!isDemo && articles.length > 0 && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setSaveName(suchbegriff ? `${suchbegriff} - ${new Date().toLocaleDateString('de-DE')}` : '');
                  setShowSaveModal(true);
                }}
              >
                <Save className="h-4 w-4 mr-1" />
                {t('compare.save')}
              </Button>
            )}
            {/* Load comparison */}
            {savedComparisons.length > 0 && (
              <div className="relative" ref={loadMenuRef}>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowLoadMenu(!showLoadMenu)}
                >
                  <FolderOpen className="h-4 w-4 mr-1" />
                  {t('compare.load')}
                  <ChevronDown className="h-3 w-3 ml-1" />
                </Button>
                {showLoadMenu && (
                  <div className="absolute right-0 mt-1 w-72 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <div className="px-3 py-2 border-b border-gray-100">
                      <span className="text-xs font-medium text-gray-500">{t('compare.savedComparisons')}</span>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {savedComparisons.map((comparison) => (
                        <div
                          key={comparison.id}
                          className="px-3 py-2 hover:bg-gray-50 flex items-center justify-between group"
                        >
                          <button
                            className="flex-1 text-left"
                            onClick={() => {
                              loadComparison(comparison.id);
                              setShowLoadMenu(false);
                            }}
                          >
                            <div className="text-sm font-medium text-gray-900 truncate">{comparison.name}</div>
                            <div className="text-xs text-gray-500 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(comparison.createdAt).toLocaleDateString('de-DE')}
                              <span className="mx-1">·</span>
                              {comparison.articles.length} {t('compare.articles')}
                            </div>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteComparison(comparison.id);
                            }}
                            className="p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            <Button
              variant="secondary"
              size="sm"
              onClick={() => exportToPDF({
                title: t('compare.title'),
                date: new Date().toLocaleDateString('de-DE'),
                articles,
                specs: Object.fromEntries(
                  articles.map(a => [a.id, Object.fromEntries(
                    specKeys.map(key => [t(`compare.specLabels.${key}`, { defaultValue: key }), specValues[key]?.[a.id] || '-'])
                  )])
                ),
              })}
            >
              <FileDown className="h-4 w-4 mr-1" />
              PDF
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => exportToExcel({
                title: t('compare.title'),
                date: new Date().toLocaleDateString('de-DE').replace(/\./g, '-'),
                articles,
                specs: Object.fromEntries(
                  articles.map(a => [a.id, Object.fromEntries(
                    specKeys.map(key => [t(`compare.specLabels.${key}`, { defaultValue: key }), specValues[key]?.[a.id] || '-'])
                  )])
                ),
              })}
            >
              <FileSpreadsheet className="h-4 w-4 mr-1" />
              Excel
            </Button>
            <Button variant="secondary" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              {t('compare.backToResults')}
            </Button>
          </div>
        </div>

        {/* Mixed Categories Warning */}
        {isMixed && articles.length >= 2 && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 rounded-xl p-4 flex items-start gap-3">
            <div className="bg-amber-100 rounded-full p-2 flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-amber-700" />
            </div>
            <div>
              <p className="text-sm font-semibold text-amber-800">
                {t('compare.mixedCategoriesWarning')}
              </p>
              <p className="text-xs text-amber-700 mt-0.5">
                {t('compare.mixedCategoriesHint', { categories: categories.join(', ') })}
              </p>
            </div>
          </div>
        )}

        {/* Supplier Concentration Warning */}
        {allSameSupplier && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-amber-800">{t('compare.supplierConcentration.title')}</p>
              <p className="text-sm text-amber-700 mt-0.5">
                {t('compare.supplierConcentration.message', { supplier: uniqueSuppliers[0] })}
              </p>
            </div>
          </div>
        )}

        {/* Ersparnis-Banner */}
        {articles.length >= 2 && !isMixed && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
            <div className="bg-green-100 rounded-full p-2">
              <TrendingDown className="h-5 w-5 text-green-700" />
            </div>
            <div>
              <p className="text-sm font-semibold text-green-800">
                {t('compare.possibleSavings', { amount: ersparnis.toFixed(2) })}
              </p>
              <p className="text-xs text-green-600">
                {t('compare.cheapestVsExpensive', { min: minPreis.toFixed(2), max: maxPreis.toFixed(2) })}
              </p>
            </div>
          </div>
        )}

        {classifyMutation.isPending && (
          <div className="flex items-center gap-2 text-sm text-gray-600 bg-blue-50 rounded-lg p-3">
            <Spinner size="sm" />
            {t('compare.classifyingArticle')}
          </div>
        )}

        {articles.length === 0 ? (
          <div className="text-center py-16">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-900">{t('compare.noArticles')}</p>
            <p className="text-sm text-gray-500 mt-1">
              {t('compare.noArticlesHint')}
            </p>
            <Button className="mt-4" onClick={() => navigate('/search')}>
              {t('common.toSearch')}
            </Button>
          </div>
        ) : (
          <>
            {/* Mobile: Karten-Ansicht */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 md:p-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
              {articles.map((a) => {
                const isCheapest = a.preis === minPreis && articles.length >= 2;
                const mpLabel = t(`common.marketplace.${a.marktplatz}`, { defaultValue: a.marktplatz });
                return (
                  <div
                    key={a.id}
                    className={`bg-white rounded-xl border-2 shadow-sm overflow-hidden transition-all flex flex-col ${
                      isCheapest ? 'border-green-400 ring-1 ring-green-200' : 'border-gray-100'
                    }`}
                  >
                    <div className="relative">
                      <div className="h-40 bg-gray-50 flex items-center justify-center">
                        {a.bildUrl ? (
                          <img src={a.bildUrl} alt={a.bezeichnung} className="h-full w-full object-cover" />
                        ) : (
                          <Package className="h-12 w-12 text-gray-300" />
                        )}
                      </div>
                      <button
                        onClick={() => handleRemove(a.id)}
                        className="absolute top-2 right-2 bg-white/90 backdrop-blur rounded-full p-1.5 shadow hover:bg-red-50 transition-colors"
                      >
                        <X className="h-4 w-4 text-gray-500 hover:text-red-500" />
                      </button>
                      <div className="absolute top-2 left-2">
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${mpColors[a.marktplatz] ?? 'bg-gray-100 text-gray-700'}`}>
                          {mpLabel}
                        </span>
                      </div>
                      {isCheapest && (
                        <div className="absolute bottom-0 inset-x-0 bg-green-500/90 backdrop-blur-sm text-white text-xs font-semibold text-center py-1.5 flex items-center justify-center gap-1">
                          <Star className="h-3.5 w-3.5" />
                          {t('compare.cheapestOffer')}
                        </div>
                      )}
                    </div>

                    <div className="p-4 flex flex-col flex-1">
                      <h3 className="font-semibold text-sm text-gray-900 line-clamp-2 min-h-[2.5rem]">
                        {a.bezeichnung}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2 min-h-[2rem]">{a.beschreibung}</p>

                      <div className="mt-3 flex items-baseline gap-2">
                        <PriceTag
                          preis={a.preis}
                          waehrung={a.waehrung}
                          className={`text-2xl font-bold ${isCheapest ? 'text-green-600' : 'text-gray-900'}`}
                        />
                      </div>

                      <div className="mt-3 space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Truck className="h-4 w-4 text-gray-400 flex-shrink-0" />
                          <span>{a.lieferzeit}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Shield className="h-4 w-4 text-gray-400 flex-shrink-0" />
                          <span>{a.lieferant}</span>
                        </div>
                        <div className="flex flex-wrap gap-1 min-h-[1.5rem]">
                          {a.nachhaltigkeitslabel.map((label) => (
                            <span
                              key={label}
                              className="inline-flex items-center gap-1 text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full"
                            >
                              <Leaf className="h-3 w-3" />
                              {label}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Mobile: Specs inline */}
                      {showSpecs && articles.length >= 2 && (
                        <div className="mt-3 border-t border-gray-100 pt-3 lg:hidden">
                          <div className="space-y-0">
                            {specKeys.map((key, i) => (
                              specValues[key]?.[a.id] ? (
                                <div key={key} className={`flex justify-between py-1.5 px-2 rounded ${i % 2 === 0 ? 'bg-gray-50' : ''}`}>
                                  <span className="text-xs text-gray-400">{t(`compare.specLabels.${key}`, { defaultValue: key })}</span>
                                  <span className="text-xs text-gray-700 text-right ml-2">{specValues[key][a.id]}</span>
                                </div>
                              ) : null
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="mt-auto pt-4 flex gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          className="flex-1 text-xs"
                          onClick={() => navigate(`/article/${a.id}`, { state: { artikel: a } })}
                        >
                          {t('common.details')}
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1 text-xs"
                          onClick={() => handleClassify(a)}
                          disabled={classifyMutation.isPending}
                        >
                          {t('common.classify')}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Spezifikations-Toggle */}
            {articles.length >= 2 && (
              <div>
                <button
                  onClick={() => setShowSpecs(!showSpecs)}
                  className="w-full flex items-center justify-between py-2 text-left"
                >
                  <span className="font-semibold text-gray-900 flex items-center gap-2 text-sm">
                    <Info className="h-4 w-4 text-gray-400" />
                    {t('compare.technicalSpecs')}
                  </span>
                  {showSpecs ? (
                    <ChevronUp className="h-4 w-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  )}
                </button>
                {/* Desktop: Specs side-by-side (hidden on mobile, shown inline in cards instead) */}
                {showSpecs && (
                  <div className="hidden lg:grid grid-cols-3 gap-4">
                    {articles.map((a) => {
                      const isCheapest = a.preis === minPreis;
                      return (
                        <div
                          key={a.id}
                          className={`border-t-4 pt-3 ${isCheapest ? 'border-green-400' : 'border-gray-200'}`}
                        >
                          <h4 className="font-semibold text-sm text-gray-900 mb-3 truncate">
                            {a.bezeichnung.split(' ').slice(0, 3).join(' ')}
                          </h4>
                          <div className="space-y-0">
                            {specKeys.map((key, i) => (
                              <div key={key} className={`flex flex-col py-2 px-2.5 rounded ${i % 2 === 0 ? 'bg-gray-50' : ''}`}>
                                <span className="text-xs font-medium text-gray-400">{t(`compare.specLabels.${key}`, { defaultValue: key })}</span>
                                <span className="text-sm text-gray-700">{specValues[key]?.[a.id] ?? '–'}</span>
                              </div>
                            ))}
                            <div className={`flex flex-col py-2 px-2.5 rounded ${specKeys.length % 2 === 0 ? 'bg-gray-50' : ''}`}>
                              <span className="text-xs font-medium text-gray-400">{t('compare.specLabels.sustainability')}</span>
                              <div className="flex flex-wrap gap-1 mt-0.5">
                                {a.nachhaltigkeitslabel.map((label) => (
                                  <span
                                    key={label}
                                    className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full"
                                  >
                                    {label}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div className={`flex flex-col py-2 px-2.5 rounded ${(specKeys.length + 1) % 2 === 0 ? 'bg-gray-50' : ''}`}>
                              <span className="text-xs font-medium text-gray-400">{t('compare.specLabels.deliveryTime')}</span>
                              <span className="text-sm text-gray-700 inline-flex items-center gap-1">
                                <Truck className="h-3.5 w-3.5 text-gray-400" />
                                {a.lieferzeit}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
            </div>

            {/* Info-Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
              <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">{t('compare.procurementNotice')}</p>
                <p className="mt-1 text-blue-600">
                  {t('compare.procurementNoticeText')}
                </p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Save Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('compare.saveComparison')}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('compare.comparisonName')}</label>
                <input
                  type="text"
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  placeholder={t('compare.namePlaceholder')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  autoFocus
                />
              </div>
              <div className="text-sm text-gray-500">
                <p>{t('compare.willSave')}:</p>
                <ul className="mt-1 list-disc list-inside">
                  <li>{articles.length} {t('compare.articles')}</li>
                  {suchbegriff && <li>{t('compare.searchTerm')}: "{suchbegriff}"</li>}
                </ul>
              </div>
              <div className="flex gap-3 justify-end">
                <Button variant="secondary" onClick={() => setShowSaveModal(false)}>
                  {t('compare.cancel')}
                </Button>
                <Button
                  onClick={() => {
                    saveComparison(saveName || `Vergleich ${new Date().toLocaleDateString('de-DE')}`);
                    setShowSaveModal(false);
                    setSaveName('');
                  }}
                >
                  <Save className="h-4 w-4 mr-1" />
                  {t('compare.saveButton')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </SearchLayout>
  );
}
