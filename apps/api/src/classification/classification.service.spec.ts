import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { ClassificationService } from './classification.service';
import { ClassificationEntity } from './entities/classification.entity';
import { ClassificationAuditEntity } from './entities/classification-audit.entity';
import { ClassificationAiService } from '../ai/classification-ai.service';
import { EmbeddingService } from '../embedding/embedding.service';
import { Kanal, Konfidenz, ComplianceStatus, KlassifizierungsQuelle } from '@procurement/shared';

describe('ClassificationService', () => {
  let service: ClassificationService;
  let aiService: jest.Mocked<ClassificationAiService>;
  let embeddingService: jest.Mocked<EmbeddingService>;

  const mockRepo = {
    create: jest.fn((entity) => entity),
    save: jest.fn((entity) => Promise.resolve(entity)),
    findOne: jest.fn(),
  };

  const mockAuditRepo = {
    create: jest.fn((entity) => entity),
    save: jest.fn((entity) => Promise.resolve(entity)),
    find: jest.fn().mockResolvedValue([]),
  };

  const mockAiResult = {
    cpvCode: '30213100',
    cpvBezeichnung: 'Tragbare Computer',
    konfidenz: Konfidenz.HOCH,
    konfidenzWert: 0.92,
    begruendung: 'Business-Laptop mit typischen Merkmalen',
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClassificationService,
        {
          provide: getRepositoryToken(ClassificationEntity),
          useValue: mockRepo,
        },
        {
          provide: getRepositoryToken(ClassificationAuditEntity),
          useValue: mockAuditRepo,
        },
        {
          provide: ClassificationAiService,
          useValue: { classify: jest.fn().mockResolvedValue(mockAiResult) },
        },
        {
          provide: EmbeddingService,
          useValue: { findeAehnlichenRahmenvertrag: jest.fn().mockResolvedValue(null) },
        },
      ],
    }).compile();

    service = module.get(ClassificationService);
    aiService = module.get(ClassificationAiService);
    embeddingService = module.get(EmbeddingService);
  });

  it('sollte einen Artikel klassifizieren', async () => {
    const result = await service.classify({
      artikelBezeichnung: 'Dell Latitude 5540 Laptop',
      geschaetzterPreis: 1200,
      menge: 1,
    });

    expect(result.artikelBezeichnung).toBe('Dell Latitude 5540 Laptop');
    expect(result.cpvCode).toBe('30213100');
    expect(result.konfidenz).toBe(Konfidenz.HOCH);
    expect(result.empfohlenerKanal).toBeDefined();
    expect(result.compliance).toBeDefined();
  });

  it('sollte Quelle=KI bei erfolgreicher KI-Klassifizierung setzen', async () => {
    const result = await service.classify({
      artikelBezeichnung: 'Dell Latitude 5540 Laptop',
      geschaetzterPreis: 1200,
      menge: 1,
    });

    expect(result.quelle).toBe(KlassifizierungsQuelle.KI);
  });

  it('sollte Quelle=REGELBASIERT bei Fallback setzen', async () => {
    aiService.classify.mockRejectedValue(new Error('API nicht erreichbar'));

    const result = await service.classify({
      artikelBezeichnung: 'Laptop Dell',
      geschaetzterPreis: 1000,
      menge: 1,
    });

    expect(result.quelle).toBe(KlassifizierungsQuelle.REGELBASIERT);
    expect(result.konfidenz).toBe(Konfidenz.NIEDRIG);
    expect(result.begruendung).toContain('Regelbasierte');
  });

  it('sollte einen initialen Audit-Eintrag bei Klassifizierung schreiben', async () => {
    await service.classify({
      artikelBezeichnung: 'Dell Latitude 5540 Laptop',
      geschaetzterPreis: 1200,
      menge: 1,
    });

    expect(mockAuditRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        aktion: 'ERSTELLT',
        benutzer: 'System',
        nachher: expect.objectContaining({
          cpvCode: '30213100',
          quelle: KlassifizierungsQuelle.KI,
        }),
      }),
    );
    expect(mockAuditRepo.save).toHaveBeenCalled();
  });

  it('sollte Direktauftrag für günstige Artikel empfehlen', () => {
    const kanal = service.bestimmeKanal(500, undefined);
    expect(kanal).toBe(Kanal.KATALOG);
  });

  it('sollte Freie Vergabe für mittlere Preise empfehlen', () => {
    const kanal = service.bestimmeKanal(15000, undefined);
    expect(kanal).toBe(Kanal.FREIE_VERGABE);
  });

  it('sollte Öffentliche Ausschreibung für hohe Preise empfehlen', () => {
    const kanal = service.bestimmeKanal(200000, undefined);
    expect(kanal).toBe(Kanal.OEFFENTLICHE_AUSSCHREIBUNG);
  });

  it('sollte Rahmenvertrag bei hoher Ähnlichkeit empfehlen', () => {
    const kanal = service.bestimmeKanal(5000, { aehnlichkeit: 0.9 });
    expect(kanal).toBe(Kanal.RAHMENVERTRAG);
  });

  it('sollte Compliance korrekt prüfen für Direktauftrag', () => {
    const compliance = service.pruefeCompliance(500, Kanal.KATALOG);
    expect(compliance.schwellenwertKategorie).toContain('Direktauftrag');
    expect(compliance.dokumentationspflicht).toBe(false);
  });

  it('sollte Compliance korrekt prüfen für Freie Vergabe', () => {
    const compliance = service.pruefeCompliance(15000, Kanal.FREIE_VERGABE);
    expect(compliance.status).toBe(ComplianceStatus.PRUEFUNG_ERFORDERLICH);
    expect(compliance.dokumentationspflicht).toBe(true);
  });

  it('sollte Klassifizierung manuell übersteuern und Audit schreiben', async () => {
    const existingEntity = {
      id: 'test-id',
      cpvCode: '30213100',
      cpvBezeichnung: 'Tragbare Computer',
      quelle: KlassifizierungsQuelle.KI,
      ergebnis: {
        id: 'test-id',
        cpvCode: '30213100',
        cpvBezeichnung: 'Tragbare Computer',
        quelle: KlassifizierungsQuelle.KI,
        artikelBezeichnung: 'Test Laptop',
        empfohlenerKanal: Kanal.FREIE_VERGABE,
        konfidenz: Konfidenz.HOCH,
        konfidenzWert: 0.92,
        begruendung: 'Test',
        compliance: {},
        alternativeKanaele: [],
        erstelltAm: '2026-01-01T00:00:00.000Z',
      },
    };

    mockRepo.findOne.mockResolvedValue(existingEntity);
    mockAuditRepo.find.mockResolvedValue([
      {
        id: 'audit-1',
        aktion: 'ERSTELLT',
        benutzer: 'System',
        zeitpunkt: new Date('2026-01-01'),
        vorher: null,
        nachher: { cpvCode: '30213100', cpvBezeichnung: 'Tragbare Computer', quelle: KlassifizierungsQuelle.KI },
        begruendung: 'KI-Klassifizierung',
      },
      {
        id: 'audit-2',
        aktion: 'UEBERSCHRIEBEN',
        benutzer: 'Max Mustermann',
        zeitpunkt: new Date('2026-01-02'),
        vorher: { cpvCode: '30213100', cpvBezeichnung: 'Tragbare Computer', quelle: KlassifizierungsQuelle.KI },
        nachher: { cpvCode: '30231000', cpvBezeichnung: 'Computerbildschirme und Konsolen', quelle: KlassifizierungsQuelle.MANUELL },
        begruendung: 'Falsche Zuordnung, es handelt sich um einen Monitor',
      },
    ]);

    const result = await service.overrideClassification('test-id', {
      cpvCode: '30231000',
      cpvBezeichnung: 'Computerbildschirme und Konsolen',
      begruendung: 'Falsche Zuordnung, es handelt sich um einen Monitor',
      benutzer: 'Max Mustermann',
    });

    expect(result.cpvCode).toBe('30231000');
    expect(result.quelle).toBe(KlassifizierungsQuelle.MANUELL);
    expect(result.aenderungsHistorie).toHaveLength(2);
    expect(mockAuditRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        aktion: 'UEBERSCHRIEBEN',
        benutzer: 'Max Mustermann',
        vorher: expect.objectContaining({ cpvCode: '30213100' }),
        nachher: expect.objectContaining({ cpvCode: '30231000', quelle: KlassifizierungsQuelle.MANUELL }),
      }),
    );
  });

  it('sollte NotFoundException werfen bei unbekannter ID (override)', async () => {
    mockRepo.findOne.mockResolvedValue(null);

    await expect(
      service.overrideClassification('unknown-id', {
        cpvCode: '30231000',
        cpvBezeichnung: 'Test',
        begruendung: 'Mindestens zehn Zeichen',
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('sollte NotFoundException werfen bei unbekannter ID (audit)', async () => {
    mockRepo.findOne.mockResolvedValue(null);

    await expect(service.getAuditTrail('unknown-id')).rejects.toThrow(NotFoundException);
  });
});
