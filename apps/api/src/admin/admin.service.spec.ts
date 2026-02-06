import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { AdminService } from './admin.service';
import { RahmenvertragEntity } from '../embedding/entities/rahmenvertrag.entity';
import { FrameworkContractEntity } from '../search/entities/framework-contract.entity';
import { ShopConfigEntity } from './entities/shop-config.entity';
import { Marktplatz } from '@procurement/shared';

const mockRvRepo = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn((dto) => dto),
  save: jest.fn((entity) => ({ ...entity, erstelltAm: new Date() })),
  remove: jest.fn(),
  count: jest.fn(),
  createQueryBuilder: jest.fn(() => ({
    where: jest.fn().mockReturnThis(),
    getCount: jest.fn().mockResolvedValue(4),
  })),
});

const mockFcRepo = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn((dto) => dto),
  save: jest.fn((entity) => ({ ...entity, erstelltAm: new Date() })),
  remove: jest.fn(),
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

describe('AdminService', () => {
  let service: AdminService;
  let rvRepo: ReturnType<typeof mockRvRepo>;
  let fcRepo: ReturnType<typeof mockFcRepo>;
  let scRepo: ReturnType<typeof mockScRepo>;

  beforeEach(async () => {
    rvRepo = mockRvRepo();
    fcRepo = mockFcRepo();
    scRepo = mockScRepo();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        { provide: getRepositoryToken(RahmenvertragEntity), useValue: rvRepo },
        { provide: getRepositoryToken(FrameworkContractEntity), useValue: fcRepo },
        { provide: getRepositoryToken(ShopConfigEntity), useValue: scRepo },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
  });

  // ─── Dashboard Stats ───────────────────────────────────────────

  describe('getStats', () => {
    it('should return correct aggregated stats', async () => {
      rvRepo.count.mockResolvedValue(6);
      fcRepo.count.mockResolvedValue(10);
      scRepo.count.mockResolvedValueOnce(3).mockResolvedValueOnce(2);

      const stats = await service.getStats();

      expect(stats.rahmenvertraegeGesamt).toBe(6);
      expect(stats.rahmenvertraegeAktiv).toBe(4); // from createQueryBuilder mock
      expect(stats.katalogArtikelGesamt).toBe(10);
      expect(stats.shopKonfigurationen).toBe(3);
      expect(stats.shopKonfigurationenAktiv).toBe(2);
    });
  });

  // ─── Rahmenverträge ─────────────────────────────────────────────

  describe('findAllRahmenvertraege', () => {
    it('should return all Rahmenverträge sorted by erstelltAm DESC', async () => {
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
          erstelltAm: new Date(),
        },
      ];
      rvRepo.find.mockResolvedValue(mockEntities);

      const result = await service.findAllRahmenvertraege();

      expect(rvRepo.find).toHaveBeenCalledWith({ order: { erstelltAm: 'DESC' } });
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
});
