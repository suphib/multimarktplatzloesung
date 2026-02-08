import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { AdminService } from './admin.service';
import { RahmenvertragEntity } from '../embedding/entities/rahmenvertrag.entity';
import { FrameworkContractEntity } from '../search/entities/framework-contract.entity';
import { ShopConfigEntity } from './entities/shop-config.entity';
import { BestellungEntity } from './entities/bestellung.entity';
import { SystemSettingsEntity } from './entities/system-settings.entity';
import { Marktplatz } from '@procurement/shared';

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
    getCount: jest.fn().mockResolvedValue(4),
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

describe('AdminService', () => {
  let service: AdminService;
  let rvRepo: ReturnType<typeof mockRvRepo>;
  let fcRepo: ReturnType<typeof mockFcRepo>;
  let scRepo: ReturnType<typeof mockScRepo>;
  let bestellungRepo: ReturnType<typeof mockBestellungRepo>;
  let settingsRepo: ReturnType<typeof mockSettingsRepo>;

  beforeEach(async () => {
    rvRepo = mockRvRepo();
    fcRepo = mockFcRepo();
    scRepo = mockScRepo();
    bestellungRepo = mockBestellungRepo();
    settingsRepo = mockSettingsRepo();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        { provide: getRepositoryToken(RahmenvertragEntity), useValue: rvRepo },
        { provide: getRepositoryToken(FrameworkContractEntity), useValue: fcRepo },
        { provide: getRepositoryToken(ShopConfigEntity), useValue: scRepo },
        { provide: getRepositoryToken(BestellungEntity), useValue: bestellungRepo },
        { provide: getRepositoryToken(SystemSettingsEntity), useValue: settingsRepo },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
  });

  // ─── Dashboard Stats ───────────────────────────────────────────

  describe('getStats', () => {
    it('should return correct aggregated stats with aktuellerModus', async () => {
      rvRepo.count.mockResolvedValue(6);
      fcRepo.count.mockResolvedValue(10);
      scRepo.count.mockResolvedValueOnce(3).mockResolvedValueOnce(2);

      const stats = await service.getStats();

      expect(stats.rahmenvertraegeGesamt).toBe(6);
      expect(stats.rahmenvertraegeAktiv).toBe(4); // from createQueryBuilder mock
      expect(stats.katalogArtikelGesamt).toBe(10);
      expect(stats.shopKonfigurationen).toBe(3);
      expect(stats.shopKonfigurationenAktiv).toBe(2);
      expect(stats.aktuellerModus).toBe('SANDBOX');
    });

    it('should filter counts by istSandbox based on current modus', async () => {
      rvRepo.count.mockResolvedValue(3);
      fcRepo.count.mockResolvedValue(5);
      scRepo.count.mockResolvedValueOnce(2).mockResolvedValueOnce(1);

      await service.getStats();

      expect(rvRepo.count).toHaveBeenCalledWith({ where: { istSandbox: true } });
      expect(fcRepo.count).toHaveBeenCalledWith({ where: { istSandbox: true } });
    });
  });

  // ─── Rahmenverträge ─────────────────────────────────────────────

  describe('findAllRahmenvertraege', () => {
    it('should return Rahmenverträge filtered by istSandbox and sorted by erstelltAm DESC', async () => {
      const mockEntities = [
        {
          id: 'rv-1',
          bezeichnung: 'IT-Endgeräte',
          beschreibung: 'Laptops etc.',
          lieferant: 'Bechtle AG',
          vertragsnummer: 'RV-001',
          gueltigBis: new Date('2026-12-31'),
          cpvCodes: '30213100',
          maxVolumen: 500000,
          istSandbox: true,
          erstelltAm: new Date(),
        },
      ];
      rvRepo.find.mockResolvedValue(mockEntities);

      const result = await service.findAllRahmenvertraege();

      expect(rvRepo.find).toHaveBeenCalledWith({ where: { istSandbox: true }, order: { erstelltAm: 'DESC' } });
      expect(result).toHaveLength(1);
      expect(result[0].bezeichnung).toBe('IT-Endgeräte');
      expect(result[0].lieferant).toBe('Bechtle AG');
    });
  });

  describe('findOneRahmenvertrag', () => {
    it('should return a single Rahmenvertrag', async () => {
      rvRepo.findOne.mockResolvedValue({
        id: 'rv-1',
        bezeichnung: 'Test',
        beschreibung: '',
        lieferant: 'Test GmbH',
        vertragsnummer: 'RV-001',
        gueltigBis: new Date('2026-12-31'),
        cpvCodes: '',
        maxVolumen: 0,
        erstelltAm: new Date(),
      });

      const result = await service.findOneRahmenvertrag('rv-1');
      expect(result.id).toBe('rv-1');
    });

    it('should throw NotFoundException for invalid ID', async () => {
      rvRepo.findOne.mockResolvedValue(null);
      await expect(service.findOneRahmenvertrag('invalid')).rejects.toThrow(NotFoundException);
    });
  });

  describe('createRahmenvertrag', () => {
    it('should create and return a new Rahmenvertrag', async () => {
      const dto = {
        bezeichnung: 'Neue RV',
        beschreibung: 'Beschreibung',
        lieferant: 'Lieferant GmbH',
        vertragsnummer: 'RV-NEW',
        gueltigBis: '2027-01-01',
        cpvCodes: '30213100',
        maxVolumen: 100000,
      };

      const result = await service.createRahmenvertrag(dto);

      expect(rvRepo.create).toHaveBeenCalled();
      expect(rvRepo.save).toHaveBeenCalled();
      expect(result.bezeichnung).toBe('Neue RV');
    });
  });

  describe('updateRahmenvertrag', () => {
    it('should update and return the Rahmenvertrag', async () => {
      rvRepo.findOne.mockResolvedValue({
        id: 'rv-1',
        bezeichnung: 'Alt',
        beschreibung: '',
        lieferant: 'Alt GmbH',
        vertragsnummer: 'RV-001',
        gueltigBis: new Date('2026-12-31'),
        cpvCodes: '',
        maxVolumen: 0,
        erstelltAm: new Date(),
      });

      const result = await service.updateRahmenvertrag('rv-1', { bezeichnung: 'Neu' });
      expect(result.bezeichnung).toBe('Neu');
    });

    it('should throw NotFoundException for invalid ID', async () => {
      rvRepo.findOne.mockResolvedValue(null);
      await expect(service.updateRahmenvertrag('invalid', {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteRahmenvertrag', () => {
    it('should delete the Rahmenvertrag', async () => {
      rvRepo.findOne.mockResolvedValue({ id: 'rv-1' });
      await service.deleteRahmenvertrag('rv-1');
      expect(rvRepo.remove).toHaveBeenCalled();
    });

    it('should throw NotFoundException for invalid ID', async () => {
      rvRepo.findOne.mockResolvedValue(null);
      await expect(service.deleteRahmenvertrag('invalid')).rejects.toThrow(NotFoundException);
    });
  });

  // ─── Katalog ────────────────────────────────────────────────────

  describe('findKatalogArtikel', () => {
    it('should return paginated results with defaults', async () => {
      fcRepo.createQueryBuilder.mockReturnValue({
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([
          [
            {
              id: 'fc-1',
              titel: 'Laptop',
              beschreibung: '',
              lieferant: 'Bechtle',
              cpvCodes: '',
              preis: 1000,
              waehrung: 'EUR',
              rahmenvertragsNummer: 'RV-001',
              artikelnummer: 'A1',
              nachhaltigkeitslabel: '',
              lieferzeit: '5 Tage',
              bildUrl: '',
              verfuegbar: true,
              erstelltAm: new Date(),
            },
          ],
          1,
        ]),
      });

      const result = await service.findKatalogArtikel({});
      expect(result.daten).toHaveLength(1);
      expect(result.gesamt).toBe(1);
      expect(result.seite).toBe(1);
      expect(result.proSeite).toBe(10);
    });

    it('should apply search filter', async () => {
      const qb = {
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      };
      fcRepo.createQueryBuilder.mockReturnValue(qb);

      await service.findKatalogArtikel({ suchbegriff: 'laptop' });
      expect(qb.andWhere).toHaveBeenCalledWith(
        expect.stringContaining('LOWER(fc.titel)'),
        expect.objectContaining({ s: '%laptop%' }),
      );
    });
  });

  describe('createKatalogArtikel', () => {
    it('should create a new catalog article', async () => {
      const dto = {
        titel: 'Neuer Laptop',
        lieferant: 'Bechtle',
        preis: 999,
        rahmenvertragsNummer: 'RV-001',
      };

      const result = await service.createKatalogArtikel(dto);
      expect(fcRepo.create).toHaveBeenCalled();
      expect(fcRepo.save).toHaveBeenCalled();
      expect(result.titel).toBe('Neuer Laptop');
    });
  });

  describe('updateKatalogArtikel', () => {
    it('should update an existing catalog article', async () => {
      fcRepo.findOne.mockResolvedValue({
        id: 'fc-1',
        titel: 'Alt',
        beschreibung: '',
        lieferant: 'Bechtle',
        cpvCodes: '',
        preis: 1000,
        waehrung: 'EUR',
        rahmenvertragsNummer: 'RV-001',
        artikelnummer: '',
        nachhaltigkeitslabel: '',
        lieferzeit: '',
        bildUrl: '',
        verfuegbar: true,
        erstelltAm: new Date(),
      });

      const result = await service.updateKatalogArtikel('fc-1', { titel: 'Neu' });
      expect(result.titel).toBe('Neu');
    });

    it('should throw NotFoundException for invalid ID', async () => {
      fcRepo.findOne.mockResolvedValue(null);
      await expect(service.updateKatalogArtikel('invalid', {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteKatalogArtikel', () => {
    it('should delete a catalog article', async () => {
      fcRepo.findOne.mockResolvedValue({ id: 'fc-1' });
      await service.deleteKatalogArtikel('fc-1');
      expect(fcRepo.remove).toHaveBeenCalled();
    });

    it('should throw NotFoundException for invalid ID', async () => {
      fcRepo.findOne.mockResolvedValue(null);
      await expect(service.deleteKatalogArtikel('invalid')).rejects.toThrow(NotFoundException);
    });
  });

  // ─── ShopConfig ─────────────────────────────────────────────────

  describe('findAllShopConfigs', () => {
    it('should return all shop configs', async () => {
      scRepo.find.mockResolvedValue([
        {
          id: 'sc-1',
          name: 'Amazon Business',
          typ: Marktplatz.AMAZON_BUSINESS,
          aktiv: true,
          apiKeyHash: 'abc123',
          baseUrl: 'https://api.amazon.de',
          letzteSynchronisation: new Date(),
          erstelltAm: new Date(),
        },
      ]);

      const result = await service.findAllShopConfigs();
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Amazon Business');
      expect(result[0].apiKeyGesetzt).toBe(true);
    });
  });

  describe('updateShopConfig', () => {
    it('should toggle aktiv state', async () => {
      scRepo.findOne.mockResolvedValue({
        id: 'sc-1',
        name: 'Test',
        typ: Marktplatz.AMAZON_BUSINESS,
        aktiv: false,
        apiKeyHash: null,
        baseUrl: '',
        letzteSynchronisation: null,
        erstelltAm: new Date(),
      });

      const result = await service.updateShopConfig('sc-1', { aktiv: true });
      expect(result.aktiv).toBe(true);
    });

    it('should hash API key with SHA-256', async () => {
      const entity = {
        id: 'sc-1',
        name: 'Test',
        typ: Marktplatz.AMAZON_BUSINESS,
        aktiv: true,
        apiKeyHash: null as string | null,
        baseUrl: '',
        letzteSynchronisation: null,
        erstelltAm: new Date(),
      };
      scRepo.findOne.mockResolvedValue(entity);

      await service.updateShopConfig('sc-1', { apiKey: 'secret-key' });

      expect(entity.apiKeyHash).toBeDefined();
      expect(entity.apiKeyHash).not.toBe('secret-key');
      expect(entity.apiKeyHash!.length).toBe(64); // SHA-256 hex length
    });

    it('should throw NotFoundException for invalid ID', async () => {
      scRepo.findOne.mockResolvedValue(null);
      await expect(service.updateShopConfig('invalid', {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('triggerSync', () => {
    it('should set letzteSynchronisation to now', async () => {
      const entity = {
        id: 'sc-1',
        name: 'Test',
        typ: Marktplatz.AMAZON_BUSINESS,
        aktiv: true,
        apiKeyHash: null,
        baseUrl: '',
        letzteSynchronisation: null as Date | null,
        erstelltAm: new Date(),
      };
      scRepo.findOne.mockResolvedValue(entity);

      await service.triggerSync('sc-1');
      expect(entity.letzteSynchronisation).toBeInstanceOf(Date);
    });

    it('should throw NotFoundException for invalid ID', async () => {
      scRepo.findOne.mockResolvedValue(null);
      await expect(service.triggerSync('invalid')).rejects.toThrow(NotFoundException);
    });
  });

  // ─── Modus Management ──────────────────────────────────────────

  describe('getModus', () => {
    it('should return the current modus', async () => {
      const result = await service.getModus();
      expect(result.aktuellerModus).toBe('SANDBOX');
    });

    it('should default to SANDBOX if no settings exist', async () => {
      settingsRepo.findOne.mockResolvedValue(null);
      const result = await service.getModus();
      expect(result.aktuellerModus).toBe('SANDBOX');
    });
  });

  describe('setModus', () => {
    it('should switch modus to ECHTDATEN', async () => {
      const result = await service.setModus('ECHTDATEN');
      expect(result.aktuellerModus).toBe('ECHTDATEN');
      expect(settingsRepo.save).toHaveBeenCalled();
    });

    it('should switch modus to SANDBOX', async () => {
      settingsRepo.findOne.mockResolvedValue({ id: 'global', aktuellerModus: 'ECHTDATEN' });
      const result = await service.setModus('SANDBOX');
      expect(result.aktuellerModus).toBe('SANDBOX');
    });

    it('should create settings row if none exists', async () => {
      settingsRepo.findOne.mockResolvedValue(null);
      await service.setModus('ECHTDATEN');
      expect(settingsRepo.create).toHaveBeenCalledWith({ id: 'global', aktuellerModus: 'ECHTDATEN' });
      expect(settingsRepo.save).toHaveBeenCalled();
    });

    it('should reject invalid modus values', async () => {
      await expect(service.setModus('INVALID')).rejects.toThrow(BadRequestException);
    });
  });

  describe('importSandboxDaten', () => {
    it('should import sandbox data additively', async () => {
      rvRepo.findOne.mockResolvedValue(null);
      fcRepo.findOne.mockResolvedValue(null);

      const result = await service.importSandboxDaten('ADDITIV');

      expect(result.modus).toBe('ADDITIV');
      expect(result.rahmenvertraegeImportiert).toBeGreaterThan(0);
      expect(result.katalogArtikelImportiert).toBeGreaterThan(0);
      expect(rvRepo.delete).not.toHaveBeenCalled();
      expect(fcRepo.delete).not.toHaveBeenCalled();
    });

    it('should delete existing sandbox data in ERSETZEND mode', async () => {
      rvRepo.findOne.mockResolvedValue(null);
      fcRepo.findOne.mockResolvedValue(null);

      const result = await service.importSandboxDaten('ERSETZEND');

      expect(result.modus).toBe('ERSETZEND');
      expect(rvRepo.delete).toHaveBeenCalledWith({ istSandbox: true });
      expect(fcRepo.delete).toHaveBeenCalledWith({ istSandbox: true });
      expect(bestellungRepo.delete).toHaveBeenCalledWith({ istSandbox: true });
    });
  });

  // ─── Modus-aware queries ───────────────────────────────────────

  describe('createRahmenvertrag with modus', () => {
    it('should set istSandbox based on current modus', async () => {
      const dto = {
        bezeichnung: 'Test RV',
        beschreibung: 'Test',
        lieferant: 'Test GmbH',
        vertragsnummer: 'RV-TEST',
        gueltigBis: '2027-01-01',
        cpvCodes: '30213100',
        maxVolumen: 100000,
      };

      await service.createRahmenvertrag(dto);

      const createCall = rvRepo.create.mock.calls[0][0];
      expect(createCall.istSandbox).toBe(true);
    });

    it('should set istSandbox=false in ECHTDATEN modus', async () => {
      settingsRepo.findOne.mockResolvedValue({ id: 'global', aktuellerModus: 'ECHTDATEN' });

      const dto = {
        bezeichnung: 'Test RV',
        beschreibung: 'Test',
        lieferant: 'Test GmbH',
        vertragsnummer: 'RV-TEST',
        gueltigBis: '2027-01-01',
        cpvCodes: '30213100',
        maxVolumen: 100000,
      };

      await service.createRahmenvertrag(dto);

      const createCall = rvRepo.create.mock.calls[0][0];
      expect(createCall.istSandbox).toBe(false);
    });
  });

  describe('getBestellungen with modus', () => {
    it('should filter bestellungen by istSandbox', async () => {
      bestellungRepo.find.mockResolvedValue([]);

      await service.getBestellungen();

      expect(bestellungRepo.find).toHaveBeenCalledWith({
        where: { istSandbox: true },
        order: { erstelltAm: 'DESC' },
      });
    });
  });
});
