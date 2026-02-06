import { DataSource } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { RahmenvertragEntity } from '../embedding/entities/rahmenvertrag.entity';
import { ClassificationEntity } from '../classification/entities/classification.entity';
import { FrameworkContractEntity } from '../search/entities/framework-contract.entity';
import { ShopConfigEntity } from '../admin/entities/shop-config.entity';
import { Kanal, Konfidenz, Marktplatz } from '@procurement/shared';

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5450'),
  username: process.env.DATABASE_USERNAME || 'procurement',
  password: process.env.DATABASE_PASSWORD || 'procurement_secret',
  database: process.env.DATABASE_NAME || 'procurement_ai',
  entities: [RahmenvertragEntity, ClassificationEntity, FrameworkContractEntity, ShopConfigEntity],
  synchronize: true,
});

async function seed() {
  await dataSource.initialize();
  console.log('Datenbank verbunden. Starte Seed...');

  const rvRepo = dataSource.getRepository(RahmenvertragEntity);

  const rahmenvertraege = [
    {
      id: uuidv4(),
      bezeichnung: 'IT-Endgeräte (Laptops, Desktops, Monitore)',
      beschreibung:
        'Rahmenvertrag für die Beschaffung von IT-Endgeräten inkl. Laptops, Desktop-PCs, Monitore und Zubehör. Hersteller: Dell, Lenovo, HP.',
      lieferant: 'Bechtle AG',
      vertragsnummer: 'RV-2024-IT-001',
      gueltigBis: new Date('2026-12-31'),
      cpvCodes: '30213100,30213300,30231000',
      maxVolumen: 500000,
    },
    {
      id: uuidv4(),
      bezeichnung: 'Büromöbel und Ergonomie',
      beschreibung:
        'Rahmenvertrag für Büromöbel inkl. Schreibtische, Bürostühle, Regale und ergonomisches Zubehör.',
      lieferant: 'Steelcase Deutschland GmbH',
      vertragsnummer: 'RV-2024-MOE-002',
      gueltigBis: new Date('2025-06-30'),
      cpvCodes: '39130000,39110000',
      maxVolumen: 200000,
    },
    {
      id: uuidv4(),
      bezeichnung: 'Bürobedarf und Verbrauchsmaterial',
      beschreibung:
        'Rahmenvertrag für Bürobedarf: Papier, Stifte, Ordner, Druckerpatronen, Toner und allgemeines Verbrauchsmaterial.',
      lieferant: 'Lyreco Deutschland GmbH',
      vertragsnummer: 'RV-2024-BUE-003',
      gueltigBis: new Date('2025-12-31'),
      cpvCodes: '30192000,22800000,30190000',
      maxVolumen: 100000,
    },
    {
      id: uuidv4(),
      bezeichnung: 'Drucker und Multifunktionsgeräte',
      beschreibung:
        'Rahmenvertrag für Drucker, Scanner, Multifunktionsgeräte und zugehöriges Verbrauchsmaterial.',
      lieferant: 'Ricoh Deutschland GmbH',
      vertragsnummer: 'RV-2024-DRU-004',
      gueltigBis: new Date('2026-03-31'),
      cpvCodes: '30232000',
      maxVolumen: 150000,
    },
    {
      id: uuidv4(),
      bezeichnung: 'Laborchemikalien und Verbrauchsmaterial',
      beschreibung:
        'Rahmenvertrag für Laborchemikalien (Säuren, Lösungsmittel, Reagenzien), Einwegmaterial (Handschuhe, Pipettenspitzen) und Laborglas. Gefahrstofflagerung inklusive.',
      lieferant: 'Carl Roth GmbH + Co. KG',
      vertragsnummer: 'RV-2024-LAB-005',
      gueltigBis: new Date('2026-06-30'),
      cpvCodes: '24300000,33140000,38437000',
      maxVolumen: 250000,
    },
    {
      id: uuidv4(),
      bezeichnung: 'Konferenztechnik und AV-Systeme',
      beschreibung:
        'Rahmenvertrag für Videokonferenzsysteme, Beamer, interaktive Displays und Audio-/Videozubehör für Besprechungsräume.',
      lieferant: 'Logitech Europe S.A.',
      vertragsnummer: 'RV-2024-AV-006',
      gueltigBis: new Date('2026-09-30'),
      cpvCodes: '32232000,32321200,38652000',
      maxVolumen: 180000,
    },
  ];

  for (const rv of rahmenvertraege) {
    const exists = await rvRepo.findOne({
      where: { vertragsnummer: rv.vertragsnummer },
    });
    if (!exists) {
      await rvRepo.save(rvRepo.create(rv));
      console.log(`Rahmenvertrag angelegt: ${rv.bezeichnung}`);
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // Framework Contract Artikel (Rahmenvertrags-Katalog)
  // ═══════════════════════════════════════════════════════════════
  const fcRepo = dataSource.getRepository(FrameworkContractEntity);

  const frameworkContractItems = [
    // RV-2024-IT-001: IT-Endgeräte (3 Artikel)
    {
      id: uuidv4(),
      titel: 'Dell Latitude 5550 Business Laptop (Rahmenvertrag)',
      beschreibung: '15.6 Zoll, Intel Core i7-1365U, 16GB RAM, 512GB SSD, Windows 11 Pro, 3 Jahre ProSupport. Abruf aus Rahmenvertrag IT-Endgeräte.',
      lieferant: 'Bechtle AG',
      cpvCodes: '30213100',
      preis: 1049.00,
      waehrung: 'EUR',
      rahmenvertragsNummer: 'RV-2024-IT-001',
      artikelnummer: 'RV-DELL-5550',
      nachhaltigkeitslabel: 'Energy Star,EPEAT Gold',
      lieferzeit: '5-7 Werktage',
      bildUrl: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400&h=300&fit=crop',
      verfuegbar: true,
    },
    {
      id: uuidv4(),
      titel: 'Lenovo ThinkPad T14s Gen 4 (Rahmenvertrag)',
      beschreibung: '14 Zoll, AMD Ryzen 7 PRO 7840U, 16GB RAM, 512GB SSD, Windows 11 Pro. Abruf aus Rahmenvertrag IT-Endgeräte.',
      lieferant: 'Bechtle AG',
      cpvCodes: '30213100',
      preis: 1099.00,
      waehrung: 'EUR',
      rahmenvertragsNummer: 'RV-2024-IT-001',
      artikelnummer: 'RV-LEN-T14S',
      nachhaltigkeitslabel: 'TCO Certified,Energy Star',
      lieferzeit: '5-7 Werktage',
      bildUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=300&fit=crop',
      verfuegbar: true,
    },
    {
      id: uuidv4(),
      titel: 'Dell UltraSharp U2723QE Monitor (Rahmenvertrag)',
      beschreibung: '27 Zoll 4K UHD IPS, USB-C Hub, 90W Power Delivery. Abruf aus Rahmenvertrag IT-Endgeräte.',
      lieferant: 'Bechtle AG',
      cpvCodes: '30231000',
      preis: 429.00,
      waehrung: 'EUR',
      rahmenvertragsNummer: 'RV-2024-IT-001',
      artikelnummer: 'RV-DELL-U2723',
      nachhaltigkeitslabel: 'Energy Star,TCO Certified',
      lieferzeit: '3-5 Werktage',
      bildUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400&h=300&fit=crop',
      verfuegbar: true,
    },

    // RV-2024-MOE-002: Büromöbel (2 Artikel)
    {
      id: uuidv4(),
      titel: 'Steelcase Leap V2 Bürostuhl (Rahmenvertrag)',
      beschreibung: 'Ergonomischer Bürostuhl, LiveBack-Technologie, 4D-Armlehnen, Lordosenstütze, schwarz. Abruf aus Rahmenvertrag Büromöbel.',
      lieferant: 'Steelcase Deutschland GmbH',
      cpvCodes: '39110000',
      preis: 749.00,
      waehrung: 'EUR',
      rahmenvertragsNummer: 'RV-2024-MOE-002',
      artikelnummer: 'RV-SC-LEAP-V2',
      nachhaltigkeitslabel: 'Blauer Engel',
      lieferzeit: '10-14 Werktage',
      bildUrl: 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=400&h=300&fit=crop',
      verfuegbar: true,
    },
    {
      id: uuidv4(),
      titel: 'Steelcase Ology Schreibtisch 160x80 (Rahmenvertrag)',
      beschreibung: 'Höhenverstellbarer Schreibtisch, elektrisch, Memory-Funktion, Kabelmanagement. Abruf aus Rahmenvertrag Büromöbel.',
      lieferant: 'Steelcase Deutschland GmbH',
      cpvCodes: '39130000',
      preis: 489.00,
      waehrung: 'EUR',
      rahmenvertragsNummer: 'RV-2024-MOE-002',
      artikelnummer: 'RV-SC-OLOGY-160',
      nachhaltigkeitslabel: 'Blauer Engel',
      lieferzeit: '14-21 Werktage',
      bildUrl: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=400&h=300&fit=crop',
      verfuegbar: true,
    },

    // RV-2024-BUE-003: Bürobedarf (1 Artikel)
    {
      id: uuidv4(),
      titel: 'Kopierpapier Premium A4 80g (Rahmenvertrag)',
      beschreibung: '2500 Blatt (5×500), weiß, FSC-zertifiziert. Abruf aus Rahmenvertrag Bürobedarf.',
      lieferant: 'Lyreco Deutschland GmbH',
      cpvCodes: '30192000',
      preis: 24.90,
      waehrung: 'EUR',
      rahmenvertragsNummer: 'RV-2024-BUE-003',
      artikelnummer: 'RV-LYR-PAPIER-A4',
      nachhaltigkeitslabel: 'FSC,EU Ecolabel',
      lieferzeit: '1-2 Werktage',
      bildUrl: 'https://images.unsplash.com/photo-1568205612837-017257d2310a?w=400&h=300&fit=crop',
      verfuegbar: true,
    },

    // RV-2024-DRU-004: Drucker (1 Artikel)
    {
      id: uuidv4(),
      titel: 'Ricoh IM C3010 Farblaser-MFP (Rahmenvertrag)',
      beschreibung: 'A3/A4 Farblaser-Multifunktionsdrucker, 30 Seiten/Min, Duplex, Netzwerk, WLAN. Abruf aus Rahmenvertrag Drucker.',
      lieferant: 'Ricoh Deutschland GmbH',
      cpvCodes: '30232000',
      preis: 2890.00,
      waehrung: 'EUR',
      rahmenvertragsNummer: 'RV-2024-DRU-004',
      artikelnummer: 'RV-RICOH-C3010',
      nachhaltigkeitslabel: 'Blauer Engel,Energy Star',
      lieferzeit: '7-10 Werktage',
      bildUrl: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=400&h=300&fit=crop',
      verfuegbar: true,
    },

    // RV-2024-LAB-005: Laborchemikalien (2 Artikel)
    {
      id: uuidv4(),
      titel: 'Salzsäure 37% p.a. 2,5L (Rahmenvertrag)',
      beschreibung: 'HCl, ACS Reagenzienqualität, Gefahrstoffklasse 8. Abruf aus Rahmenvertrag Laborchemikalien. Gefahrstofflagerung inklusive.',
      lieferant: 'Carl Roth GmbH + Co. KG',
      cpvCodes: '24300000',
      preis: 22.50,
      waehrung: 'EUR',
      rahmenvertragsNummer: 'RV-2024-LAB-005',
      artikelnummer: 'RV-ROTH-HCL37',
      nachhaltigkeitslabel: '',
      lieferzeit: '2-3 Werktage',
      bildUrl: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=400&h=300&fit=crop',
      verfuegbar: true,
    },
    {
      id: uuidv4(),
      titel: 'Nitrilhandschuhe puderfrei Gr. M, 200 Stück (Rahmenvertrag)',
      beschreibung: 'Einweghandschuhe blau, EN 374, latexfrei. Abruf aus Rahmenvertrag Laborchemikalien.',
      lieferant: 'Carl Roth GmbH + Co. KG',
      cpvCodes: '33140000',
      preis: 11.90,
      waehrung: 'EUR',
      rahmenvertragsNummer: 'RV-2024-LAB-005',
      artikelnummer: 'RV-ROTH-NITRIL-M',
      nachhaltigkeitslabel: '',
      lieferzeit: '1-2 Werktage',
      bildUrl: 'https://images.unsplash.com/photo-1584483766114-2cea6facdf57?w=400&h=300&fit=crop',
      verfuegbar: true,
    },

    // RV-2024-AV-006: Konferenztechnik (1 Artikel)
    {
      id: uuidv4(),
      titel: 'Logitech Rally Bar Videokonferenz (Rahmenvertrag)',
      beschreibung: 'All-in-One Videobar, 4K Kamera, AI Framing, Beamforming-Mikrofone. Abruf aus Rahmenvertrag Konferenztechnik.',
      lieferant: 'Logitech Europe S.A.',
      cpvCodes: '32232000',
      preis: 2590.00,
      waehrung: 'EUR',
      rahmenvertragsNummer: 'RV-2024-AV-006',
      artikelnummer: 'RV-LOG-RALLY',
      nachhaltigkeitslabel: '',
      lieferzeit: '5-7 Werktage',
      bildUrl: 'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=400&h=300&fit=crop',
      verfuegbar: true,
    },
  ];

  for (const fc of frameworkContractItems) {
    const exists = await fcRepo.findOne({
      where: { artikelnummer: fc.artikelnummer },
    });
    if (!exists) {
      await fcRepo.save(fcRepo.create(fc));
      console.log(`Framework-Contract-Artikel angelegt: ${fc.titel}`);
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // Shop-Konfigurationen (Marktplatz-Verbindungen)
  // ═══════════════════════════════════════════════════════════════
  const scRepo = dataSource.getRepository(ShopConfigEntity);

  const shopConfigs = [
    {
      id: uuidv4(),
      name: 'Amazon Business',
      typ: Marktplatz.AMAZON_BUSINESS,
      aktiv: true,
      baseUrl: 'https://business.amazon.de/api/v1',
      letzteSynchronisation: new Date('2026-02-01T10:30:00Z'),
    },
    {
      id: uuidv4(),
      name: 'Mercateo',
      typ: Marktplatz.MERCATEO,
      aktiv: true,
      baseUrl: 'https://api.mercateo.com/v2',
      letzteSynchronisation: new Date('2026-02-01T09:15:00Z'),
    },
    {
      id: uuidv4(),
      name: 'Conrad Electronic',
      typ: Marktplatz.CONRAD,
      aktiv: false,
      baseUrl: 'https://api.conrad.de/v1',
      letzteSynchronisation: null,
    },
  ];

  for (const sc of shopConfigs) {
    const exists = await scRepo.findOne({ where: { typ: sc.typ } });
    if (!exists) {
      await scRepo.save(scRepo.create(sc));
      console.log(`Shop-Konfiguration angelegt: ${sc.name}`);
    }
  }

  console.log('Seed abgeschlossen.');
  await dataSource.destroy();
}

seed().catch((err) => {
  console.error('Seed fehlgeschlagen:', err);
  process.exit(1);
});
