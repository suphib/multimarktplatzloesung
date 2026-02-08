import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DocumentationService } from './documentation.service';
import { DocumentationEntity } from './entities/documentation.entity';

describe('DocumentationService', () => {
  let service: DocumentationService;

  const mockRepo = {
    create: jest.fn((entity) => entity),
    save: jest.fn((entity) => Promise.resolve({ ...entity, erstelltAm: new Date('2026-01-15T10:00:00Z') })),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentationService,
        {
          provide: getRepositoryToken(DocumentationEntity),
          useValue: mockRepo,
        },
      ],
    }).compile();

    service = module.get(DocumentationService);
  });

  it('sollte Dokumentation erstellen und persistieren', async () => {
    const data = {
      klassifizierungId: '550e8400-e29b-41d4-a716-446655440000',
      benutzer: 'max.mustermann@behoerde.de',
      artikelBezeichnung: 'Dell Latitude 5540 Laptop',
      klassifizierung: { cpvCode: '30213100', begruendung: 'Business-Laptop' } as any,
      begruendung: 'Automatische Klassifizierung',
      compliancePruefung: { status: 'PRUEFUNG_ERFORDERLICH', pruefpunkte: [] } as any,
    };

    const result = await service.erstelleDokumentation(data);

    expect(mockRepo.create).toHaveBeenCalled();
    expect(mockRepo.save).toHaveBeenCalled();
    expect(result.id).toBeDefined();
    expect(result.klassifizierungId).toBe(data.klassifizierungId);
    expect(result.integritaetsHash).toBeDefined();
    expect(result.integritaetsHash).toHaveLength(64);
    expect(result.artikelBezeichnung).toBe('Dell Latitude 5540 Laptop');
  });

  it('sollte SHA-256 Hash korrekt berechnen', () => {
    const data = { id: 'test', klassifizierung: { cpvCode: '30213100' } };
    const hash1 = service.berechneHash(data);
    const hash2 = service.berechneHash(data);

    expect(hash1).toBe(hash2);
    expect(hash1).toHaveLength(64);
    expect(hash1).toMatch(/^[0-9a-f]{64}$/);
  });

  it('sollte unterschiedliche Hashes fuer unterschiedliche Eingaben berechnen', () => {
    const hash1 = service.berechneHash({ id: 'a' });
    const hash2 = service.berechneHash({ id: 'b' });

    expect(hash1).not.toBe(hash2);
  });

  it('sollte bestehende Dokumentation finden', async () => {
    const mockEntity = {
      id: 'doc-1',
      klassifizierungId: '550e8400-e29b-41d4-a716-446655440000',
      erstelltAm: new Date('2026-01-15T10:00:00Z'),
      benutzer: 'max.mustermann@behoerde.de',
      artikelBezeichnung: 'Dell Latitude 5540 Laptop',
      klassifizierung: { cpvCode: '30213100' },
      suchergebnisse: null,
      ausgewaehlterArtikel: null,
      begruendung: 'Test',
      compliancePruefung: { status: 'KONFORM', pruefpunkte: [] },
      integritaetsHash: 'abc123',
    };

    mockRepo.findOne.mockResolvedValue(mockEntity);

    const result = await service.getDokumentation('550e8400-e29b-41d4-a716-446655440000');

    expect(result).not.toBeNull();
    expect(result!.klassifizierungId).toBe('550e8400-e29b-41d4-a716-446655440000');
    expect(result!.integritaetsHash).toBe('abc123');
  });

  it('sollte null zurueckgeben bei unbekannter ID', async () => {
    mockRepo.findOne.mockResolvedValue(null);

    const result = await service.getDokumentation('550e8400-e29b-41d4-a716-446655440001');

    expect(result).toBeNull();
  });

  it('sollte ungueltige UUIDs ablehnen', async () => {
    const result = await service.getDokumentation('nicht-eine-uuid');

    expect(result).toBeNull();
    expect(mockRepo.findOne).not.toHaveBeenCalled();
  });
});
