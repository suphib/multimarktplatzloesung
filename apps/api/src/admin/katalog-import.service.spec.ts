import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AdminService } from './admin.service';
import { RahmenvertragEntity } from '../embedding/entities/rahmenvertrag.entity';
import { FrameworkContractEntity } from '../search/entities/framework-contract.entity';
import { ShopConfigEntity } from './entities/shop-config.entity';
import { BestellungEntity } from './entities/bestellung.entity';
import { SystemSettingsEntity } from './entities/system-settings.entity';

const mockRvRepo = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn((dto) => dto),
  save: jest.fn((entity) => ({ ...entity, erstelltAm: new Date() })),
  remove: jest.fn(),
  delete: jest.fn(),
  count: jest.fn(),
  createQueryBuilder: jest.fn(() => ({
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getCount: jest.fn().mockResolvedValue(0),
  })),
});

const mockFcRepo = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn((dto) => dto),
  save: jest.fn((entity) => ({ ...entity, erstelltAm: new Date() })),
  remove: jest.fn(),
  delete: jest.fn(),
  count: jest.fn(),
  createQueryBuilder: jest.fn(() => ({
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
  })),
});

const mockScRepo = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn((dto) => dto),
  save: jest.fn((entity) => ({ ...entity, erstelltAm: new Date() })),
  count: jest.fn(),
});

const mockBestellungRepo = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn((dto) => dto),
  save: jest.fn((entity) => ({ ...entity, erstelltAm: new Date() })),
  delete: jest.fn(),
  count: jest.fn(),
});

const mockSettingsRepo = () => ({
  findOne: jest.fn().mockResolvedValue({ id: 'global', aktuellerModus: 'SANDBOX' }),
  create: jest.fn((dto) => dto),
  save: jest.fn((entity) => entity),
});

describe('AdminService - Katalog CSV Import', () => {
  let service: AdminService;
  let fcRepo: ReturnType<typeof mockFcRepo>;

  beforeEach(async () => {
    fcRepo = mockFcRepo();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        { provide: getRepositoryToken(RahmenvertragEntity), useValue: mockRvRepo() },
        { provide: getRepositoryToken(FrameworkContractEntity), useValue: fcRepo },
        { provide: getRepositoryToken(ShopConfigEntity), useValue: mockScRepo() },
        { provide: getRepositoryToken(BestellungEntity), useValue: mockBestellungRepo() },
        { provide: getRepositoryToken(SystemSettingsEntity), useValue: mockSettingsRepo() },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
  });

  // ─── CSV Import Tests ─────────────────────────────────────────

  describe('importKatalogCsv', () => {
    it('sollte CSV mit gueltigem Inhalt importieren', async () => {
      const csv = Buffer.from(
        'titel;beschreibung;lieferant;artikelnummer;preis;waehrung\n' +
        'Laptop X;Business Laptop;Dell;DELL-001;1200;EUR\n' +
        'Monitor Y;27 Zoll;Dell;DELL-002;450;EUR\n' +
        'Maus Z;Kabellos;Logitech;LOG-001;79.99;EUR\n',
      );

      fcRepo.findOne.mockResolvedValue(null); // No existing articles

      const result = await service.importKatalogCsv(csv, 'RV-2024-IT-001');

      expect(result.importiert).toBe(3);
      expect(result.aktualisiert).toBe(0);
      expect(result.fehler).toHaveLength(0);
      expect(result.gesamt).toBe(3);
      expect(fcRepo.save).toHaveBeenCalledTimes(3);
    });

    it('sollte bestehende Artikel aktualisieren (Upsert)', async () => {
      const csv = Buffer.from(
        'titel;lieferant;artikelnummer;preis\n' +
        'Laptop X Updated;Dell;DELL-001;1100\n',
      );

      const existingEntity = {
        id: 'existing-id',
        titel: 'Laptop X',
        lieferant: 'Dell',
        artikelnummer: 'DELL-001',
        preis: 1200,
        waehrung: 'EUR',
        rahmenvertragsNummer: 'RV-2024-IT-001',
        erstelltAm: new Date(),
      };

      fcRepo.findOne.mockResolvedValue(existingEntity);

      const result = await service.importKatalogCsv(csv, 'RV-2024-IT-001');

      expect(result.importiert).toBe(0);
      expect(result.aktualisiert).toBe(1);
      expect(result.fehler).toHaveLength(0);
    });

    it('sollte Pflichtfelder validieren', async () => {
      const csv = Buffer.from(
        'titel;lieferant;artikelnummer;preis\n' +
        ';Dell;DELL-001;1200\n',
      );

      const result = await service.importKatalogCsv(csv, 'RV-2024-IT-001');

      expect(result.fehler).toHaveLength(1);
      expect(result.fehler[0].zeile).toBe(2);
      expect(result.fehler[0].feld).toBe('titel');
      expect(result.importiert).toBe(0);
    });

    it('sollte ungueltige Preise ablehnen', async () => {
      const csv = Buffer.from(
        'titel;lieferant;artikelnummer;preis\n' +
        'Laptop X;Dell;DELL-001;abc\n',
      );

      const result = await service.importKatalogCsv(csv, 'RV-2024-IT-001');

      expect(result.fehler).toHaveLength(1);
      expect(result.fehler[0].feld).toBe('preis');
      expect(result.importiert).toBe(0);
    });

    it('sollte Semikolon-getrennte CSV verarbeiten', async () => {
      const csv = Buffer.from(
        'titel;lieferant;artikelnummer;preis\n' +
        'Laptop;Dell;DELL-001;999\n',
      );

      fcRepo.findOne.mockResolvedValue(null);

      const result = await service.importKatalogCsv(csv, 'RV-2024-IT-001');

      expect(result.importiert).toBe(1);
      expect(result.fehler).toHaveLength(0);
    });

    it('sollte leere Zeilen ueberspringen', async () => {
      const csv = Buffer.from(
        'titel;lieferant;artikelnummer;preis\n' +
        'Laptop X;Dell;DELL-001;1200\n' +
        '\n' +
        '\n' +
        'Monitor Y;Dell;DELL-002;450\n',
      );

      fcRepo.findOne.mockResolvedValue(null);

      const result = await service.importKatalogCsv(csv, 'RV-2024-IT-001');

      expect(result.importiert).toBe(2);
      expect(result.fehler).toHaveLength(0);
      expect(result.uebersprungen).toBe(0);
    });

    it('sollte Ergebnis-Zusammenfassung zurueckgeben', async () => {
      const csv = Buffer.from(
        'titel;lieferant;artikelnummer;preis\n' +
        'Laptop X;Dell;DELL-001;1200\n' +
        'Monitor Y;Dell;DELL-002;450\n' +
        ';Dell;DELL-003;300\n',
      );

      // First two: new, third: validation error
      fcRepo.findOne.mockResolvedValue(null);

      const result = await service.importKatalogCsv(csv, 'RV-2024-IT-001');

      expect(result.gesamt).toBe(3);
      expect(result.importiert).toBe(2);
      expect(result.aktualisiert).toBe(0);
      expect(result.fehler).toHaveLength(1);
      expect(result.fehler[0].zeile).toBe(4);
    });

    it('sollte immer istSandbox=false setzen (CSV = Echtdaten)', async () => {
      const csv = Buffer.from(
        'titel;lieferant;artikelnummer;preis\n' +
        'Laptop X;Dell;DELL-001;1200\n',
      );

      fcRepo.findOne.mockResolvedValue(null);

      await service.importKatalogCsv(csv, 'RV-2024-IT-001');

      const createCall = fcRepo.create.mock.calls[0][0];
      expect(createCall.istSandbox).toBe(false);
    });
  });
});
