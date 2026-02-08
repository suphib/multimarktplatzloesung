import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { DocumentationController } from './documentation.controller';
import { DocumentationService } from './documentation.service';
import { ClassificationEntity } from '../classification/entities/classification.entity';
import { ComplianceStatus } from '@procurement/shared';

describe('DocumentationController', () => {
  let controller: DocumentationController;
  let documentationService: jest.Mocked<DocumentationService>;

  const mockClassificationRepo = {
    findOne: jest.fn(),
  };

  const mockDocumentation = {
    id: 'doc-1',
    klassifizierungId: '550e8400-e29b-41d4-a716-446655440000',
    zeitstempel: '2026-01-15T10:00:00.000Z',
    benutzer: 'max.mustermann@behoerde.de',
    artikelBezeichnung: 'Dell Latitude 5540 Laptop',
    klassifizierung: { cpvCode: '30213100', empfohlenerKanal: 'KATALOG', konfidenz: 'HOCH', konfidenzWert: 0.92 },
    begruendung: 'Business-Laptop',
    compliancePruefung: {
      status: ComplianceStatus.PRUEFUNG_ERFORDERLICH,
      pruefpunkte: [],
      schwellenwertKategorie: 'Direktauftrag',
      dokumentationspflicht: false,
    },
    integritaetsHash: 'a'.repeat(64),
  };

  const mockClassification = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    artikelBezeichnung: 'Dell Latitude 5540 Laptop',
    empfohlenerKanal: 'KATALOG',
    geschaetzterPreis: 1200,
    ergebnis: {
      cpvCode: '30213100',
      empfohlenerKanal: 'KATALOG',
      konfidenz: 'HOCH',
      konfidenzWert: 0.92,
      begruendung: 'Business-Laptop',
      compliance: {
        status: ComplianceStatus.PRUEFUNG_ERFORDERLICH,
        pruefpunkte: [],
        schwellenwertKategorie: 'Direktauftrag',
        dokumentationspflicht: false,
      },
    },
    erstelltAm: new Date('2026-01-15T10:00:00Z'),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DocumentationController],
      providers: [
        {
          provide: DocumentationService,
          useValue: {
            getDokumentation: jest.fn(),
            erstelleDokumentation: jest.fn(),
            berechneHash: jest.fn().mockReturnValue('a'.repeat(64)),
          },
        },
        {
          provide: getRepositoryToken(ClassificationEntity),
          useValue: mockClassificationRepo,
        },
      ],
    }).compile();

    controller = module.get(DocumentationController);
    documentationService = module.get(DocumentationService);
  });

  describe('POST /documentation', () => {
    it('sollte Dokumentation erstellen', async () => {
      documentationService.getDokumentation.mockResolvedValue(null);
      mockClassificationRepo.findOne.mockResolvedValue(mockClassification);
      documentationService.erstelleDokumentation.mockResolvedValue(mockDocumentation as any);

      const result = await controller.createDocumentation({
        klassifizierungId: '550e8400-e29b-41d4-a716-446655440000',
      });

      expect(result.id).toBe('doc-1');
      expect(result.integritaetsHash).toHaveLength(64);
      expect(documentationService.erstelleDokumentation).toHaveBeenCalled();
    });

    it('sollte bestehende Doku zurueckgeben (idempotent)', async () => {
      documentationService.getDokumentation.mockResolvedValue(mockDocumentation as any);

      const result = await controller.createDocumentation({
        klassifizierungId: '550e8400-e29b-41d4-a716-446655440000',
      });

      expect(result.id).toBe('doc-1');
      expect(documentationService.erstelleDokumentation).not.toHaveBeenCalled();
      expect(mockClassificationRepo.findOne).not.toHaveBeenCalled();
    });

    it('sollte 404 bei unbekannter Klassifizierung', async () => {
      documentationService.getDokumentation.mockResolvedValue(null);
      mockClassificationRepo.findOne.mockResolvedValue(null);

      await expect(
        controller.createDocumentation({
          klassifizierungId: '550e8400-e29b-41d4-a716-446655440099',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('GET /documentation/:id', () => {
    it('sollte persistierte Dokumentation zurueckgeben', async () => {
      documentationService.getDokumentation.mockResolvedValue(mockDocumentation as any);

      const result = await controller.getDocumentation('550e8400-e29b-41d4-a716-446655440000');

      expect(result).toBeDefined();
      expect((result as any).id).toBe('doc-1');
      expect((result as any).integritaetsHash).toHaveLength(64);
    });
  });
});
