import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { KatalogAdminController } from './controllers/katalog-admin.controller';
import { AdminService } from './admin.service';
import { RahmenvertragEntity } from '../embedding/entities/rahmenvertrag.entity';
import { FrameworkContractEntity } from '../search/entities/framework-contract.entity';
import { ShopConfigEntity } from './entities/shop-config.entity';
import { BestellungEntity } from './entities/bestellung.entity';
import { SystemSettingsEntity } from './entities/system-settings.entity';

describe('KatalogAdminController - CSV Import', () => {
  let controller: KatalogAdminController;
  let service: AdminService;

  beforeEach(async () => {
    const mockRepo = {
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
        where: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(0),
      })),
    };

    const mockSettingsRepo = {
      findOne: jest.fn().mockResolvedValue({ id: 'global', aktuellerModus: 'SANDBOX' }),
      create: jest.fn((dto) => dto),
      save: jest.fn((entity) => entity),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [KatalogAdminController],
      providers: [
        AdminService,
        { provide: getRepositoryToken(RahmenvertragEntity), useValue: mockRepo },
        { provide: getRepositoryToken(FrameworkContractEntity), useValue: mockRepo },
        { provide: getRepositoryToken(ShopConfigEntity), useValue: mockRepo },
        { provide: getRepositoryToken(BestellungEntity), useValue: mockRepo },
        { provide: getRepositoryToken(SystemSettingsEntity), useValue: mockSettingsRepo },
      ],
    }).compile();

    controller = module.get<KatalogAdminController>(KatalogAdminController);
    service = module.get<AdminService>(AdminService);
  });

  describe('POST /admin/katalog/import', () => {
    it('sollte CSV-Datei akzeptieren', async () => {
      const mockFile = {
        buffer: Buffer.from(
          'titel;lieferant;artikelnummer;preis\n' +
          'Laptop;Dell;DELL-001;1200\n',
        ),
        originalname: 'katalog.csv',
        mimetype: 'text/csv',
        size: 100,
      } as any;

      jest.spyOn(service, 'importKatalogCsv').mockResolvedValue({
        importiert: 1,
        aktualisiert: 0,
        uebersprungen: 0,
        fehler: [],
        gesamt: 1,
      });

      const result = await controller.importKatalog(mockFile, 'RV-2024-IT-001');

      expect(result.importiert).toBe(1);
      expect(result.gesamt).toBe(1);
    });

    it('sollte ohne Datei 400 zurueckgeben', async () => {
      await expect(
        controller.importKatalog(undefined as any, 'RV-2024-IT-001'),
      ).rejects.toThrow(BadRequestException);
    });

    it('sollte ohne rahmenvertragsNummer 400 zurueckgeben', async () => {
      const mockFile = {
        buffer: Buffer.from('titel;lieferant;artikelnummer;preis\n'),
        originalname: 'katalog.csv',
        mimetype: 'text/csv',
        size: 100,
      } as any;

      await expect(
        controller.importKatalog(mockFile, ''),
      ).rejects.toThrow(BadRequestException);
    });

    it('sollte Import-Ergebnis zurueckgeben', async () => {
      const mockFile = {
        buffer: Buffer.from(
          'titel;lieferant;artikelnummer;preis\n' +
          'Laptop;Dell;DELL-001;1200\n' +
          'Monitor;Dell;DELL-002;450\n',
        ),
        originalname: 'katalog.csv',
        mimetype: 'text/csv',
        size: 200,
      } as any;

      jest.spyOn(service, 'importKatalogCsv').mockResolvedValue({
        importiert: 2,
        aktualisiert: 0,
        uebersprungen: 0,
        fehler: [],
        gesamt: 2,
      });

      const result = await controller.importKatalog(mockFile, 'RV-2024-IT-001');

      expect(result).toHaveProperty('importiert');
      expect(result).toHaveProperty('aktualisiert');
      expect(result).toHaveProperty('fehler');
      expect(result).toHaveProperty('gesamt');
      expect(result.importiert).toBe(2);
    });
  });
});
