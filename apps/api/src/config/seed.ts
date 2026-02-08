import { DataSource } from 'typeorm';
import { RahmenvertragEntity } from '../embedding/entities/rahmenvertrag.entity';
import { ClassificationEntity } from '../classification/entities/classification.entity';
import { FrameworkContractEntity } from '../search/entities/framework-contract.entity';
import { ShopConfigEntity } from '../admin/entities/shop-config.entity';
import { BestellungEntity } from '../admin/entities/bestellung.entity';
import { SystemSettingsEntity } from '../admin/entities/system-settings.entity';
import { Marktplatz } from '@procurement/shared';
import { v4 as uuidv4 } from 'uuid';
import { getSandboxRahmenvertraege, getSandboxFrameworkContractItems } from './sandbox-data';

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5450'),
  username: process.env.DATABASE_USERNAME || 'procurement',
  password: process.env.DATABASE_PASSWORD || 'procurement_secret',
  database: process.env.DATABASE_NAME || 'procurement_ai',
  entities: [RahmenvertragEntity, ClassificationEntity, FrameworkContractEntity, ShopConfigEntity, BestellungEntity, SystemSettingsEntity],
  synchronize: true,
});

async function seed() {
  await dataSource.initialize();
  console.log('Datenbank verbunden. Starte Seed...');

  const rvRepo = dataSource.getRepository(RahmenvertragEntity);
  const rahmenvertraege = getSandboxRahmenvertraege();

  for (const rv of rahmenvertraege) {
    const existing = await rvRepo.findOne({
      where: { vertragsnummer: rv.vertragsnummer },
    });
    if (existing) {
      const { id, ...updateData } = rv;
      Object.assign(existing, updateData);
      await rvRepo.save(existing);
      console.log(`Rahmenvertrag aktualisiert: ${rv.bezeichnung}`);
    } else {
      await rvRepo.save(rvRepo.create(rv));
      console.log(`Rahmenvertrag angelegt: ${rv.bezeichnung}`);
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // Framework Contract Artikel (Rahmenvertrags-Katalog)
  // ═══════════════════════════════════════════════════════════════
  const fcRepo = dataSource.getRepository(FrameworkContractEntity);
  const frameworkContractItems = getSandboxFrameworkContractItems();

  for (const fc of frameworkContractItems) {
    const existing = await fcRepo.findOne({
      where: { artikelnummer: fc.artikelnummer },
    });
    if (existing) {
      const { id, ...updateData } = fc;
      Object.assign(existing, updateData);
      await fcRepo.save(existing);
      console.log(`Framework-Contract-Artikel aktualisiert: ${fc.titel}`);
    } else {
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

  // ═══════════════════════════════════════════════════════════════
  // System Settings
  // ═══════════════════════════════════════════════════════════════
  const settingsRepo = dataSource.getRepository(SystemSettingsEntity);
  const existingSettings = await settingsRepo.findOne({ where: { id: 'global' } });
  if (!existingSettings) {
    await settingsRepo.save(settingsRepo.create({ id: 'global', aktuellerModus: 'SANDBOX' }));
    console.log('System-Settings angelegt (Modus: SANDBOX)');
  }

  console.log('Seed abgeschlossen.');
  await dataSource.destroy();
}

seed().catch((err) => {
  console.error('Seed fehlgeschlagen:', err);
  process.exit(1);
});
