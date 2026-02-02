import { DataSource } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { RahmenvertragEntity } from '../embedding/entities/rahmenvertrag.entity';
import { ClassificationEntity } from '../classification/entities/classification.entity';
import { Kanal, Konfidenz } from '@procurement/shared';

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5450'),
  username: process.env.DATABASE_USERNAME || 'procurement',
  password: process.env.DATABASE_PASSWORD || 'procurement_secret',
  database: process.env.DATABASE_NAME || 'procurement_ai',
  entities: [RahmenvertragEntity, ClassificationEntity],
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

  console.log('Seed abgeschlossen.');
  await dataSource.destroy();
}

seed().catch((err) => {
  console.error('Seed fehlgeschlagen:', err);
  process.exit(1);
});
