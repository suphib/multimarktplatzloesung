import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ClassificationService } from './classification.service';
import { ClassificationEntity } from './entities/classification.entity';
import { ClassificationAiService } from '../ai/classification-ai.service';
import { EmbeddingService } from '../embedding/embedding.service';
import { Kanal, Konfidenz, ComplianceStatus } from '@procurement/shared';

describe('ClassificationService', () => {
  let service: ClassificationService;
  let aiService: jest.Mocked<ClassificationAiService>;
  let embeddingService: jest.Mocked<EmbeddingService>;

  const mockRepo = {
    create: jest.fn((entity) => entity),
    save: jest.fn((entity) => Promise.resolve(entity)),
  };

  const mockAiResult = {
    cpvCode: '30213100',
    cpvBezeichnung: 'Tragbare Computer',
    konfidenz: Konfidenz.HOCH,
    konfidenzWert: 0.92,
    begruendung: 'Business-Laptop mit typischen Merkmalen',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClassificationService,
        {
          provide: getRepositoryToken(ClassificationEntity),
          useValue: mockRepo,
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

  it('sollte auf regelbasierte Klassifizierung zurückfallen', async () => {
    aiService.classify.mockRejectedValue(new Error('API nicht erreichbar'));

    const result = await service.classify({
      artikelBezeichnung: 'Laptop Dell',
      geschaetzterPreis: 1000,
      menge: 1,
    });

    expect(result.konfidenz).toBe(Konfidenz.NIEDRIG);
    expect(result.begruendung).toContain('Regelbasierte');
  });
});
